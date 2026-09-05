const pool = require('../config/database');

class Round {
  static async getCurrent(gameId) {
    const { rows } = await pool.query(
      `SELECT r.id AS "roundId", r.status, r.total_pot AS "totalPot", r.winners_count AS "playersCount",
              r.started_at AS "startedAt", r.closes_at AS "closesAt",
              r.scheduled_result AS "scheduledResult", r.preview_at AS "previewAt", r.result,
              GREATEST(0, EXTRACT(EPOCH FROM (r.closes_at - NOW()))::INT) AS "timerLeft",
              gs.manual_result_mode AS "manualResultMode"
       FROM game_rounds r
       JOIN game_settings gs ON gs.game_id = r.game_id
       WHERE r.game_id = $1 AND r.status IN ('open', 'closed', 'declared')
       ORDER BY CASE r.status WHEN 'open' THEN 0 WHEN 'closed' THEN 1 ELSE 2 END, r.started_at DESC LIMIT 1`,
      [gameId]
    );
    return rows[0] || null;
  }

  static async getUpcoming(gameId) {
    const round = await this.getCurrent(gameId);
    if (!round) return null;
    const showPreview = round.scheduledResult && round.previewAt;
    return {
      roundId: round.roundId,
      status: round.status,
      timerLeft: round.timerLeft,
      manualResultMode: round.manualResultMode,
      upcomingResult: showPreview ? round.scheduledResult : null,
      previewIn: showPreview ? Math.max(0, round.timerLeft) : null,
      declaredResult: round.result || null,
    };
  }

  static async getBetDistribution(gameId) {
    const round = await pool.query(
      `SELECT id FROM game_rounds WHERE game_id = $1 ORDER BY started_at DESC LIMIT 1`,
      [gameId]
    );
    if (!round.rows[0]) {
      return {
        roundId: null,
        distribution: {},
        totalPot: 0,
        playersCount: 0,
        betCount: 0,
        avgBet: 0,
        updatedAt: new Date(),
      };
    }
    const roundId = round.rows[0].id;

    if (gameId === 'aviator') {
      const stats = await pool.query(
        `SELECT 
           COALESCE(SUM(amount), 0)::NUMERIC AS total,
           COUNT(*)::INT AS bet_count,
           COUNT(DISTINCT user_id)::INT AS players_count,
           COALESCE(AVG(amount), 0)::NUMERIC AS avg_bet
         FROM aviator_bets
         WHERE round_id = $1`,
        [roundId]
      );
      const row = stats.rows[0] || {};
      const totalPot = parseFloat(row.total || 0);
      const playersCount = parseInt(row.players_count || 0, 10);
      const betCount = parseInt(row.bet_count || 0, 10);
      const avgBet = parseFloat(row.avg_bet || 0);

      await pool.query(
        `UPDATE game_rounds SET total_pot = $1, winners_count = $2 WHERE id = $3`,
        [totalPot, playersCount, roundId]
      );

      return {
        roundId,
        distribution: { aviator: totalPot },
        totalPot,
        playersCount,
        betCount,
        avgBet,
        updatedAt: new Date(),
      };
    }

    const { rows } = await pool.query(
      `SELECT option_id, SUM(amount) AS total, COUNT(*) AS bet_count FROM round_bets WHERE round_id = $1 GROUP BY option_id`,
      [roundId]
    );
    const distribution = {};
    let totalPot = 0;
    let betCount = 0;
    rows.forEach((r) => {
      distribution[r.option_id] = parseFloat(r.total);
      totalPot += parseFloat(r.total);
      betCount += parseInt(r.bet_count, 10);
    });
    await pool.query(`UPDATE game_rounds SET total_pot = $1 WHERE id = $2`, [totalPot, roundId]);
    return { roundId, distribution, totalPot, betCount, updatedAt: new Date() };
  }

  static async placeBet(gameId, userId, optionId, amount) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const settings = await client.query(
        `SELECT gs.min_bet, gs.max_bet, gs.enabled, gs.maintenance_mode, g.status
         FROM game_settings gs JOIN platform_games g ON g.id = gs.game_id WHERE gs.game_id = $1`,
        [gameId]
      );
      if (!settings.rows[0] || settings.rows[0].status !== 'active' || !settings.rows[0].enabled) {
        throw new Error('Game is not available');
      }
      if (settings.rows[0].maintenance_mode) throw new Error('Game is under maintenance');

      const minBet = Number(settings.rows[0].min_bet) || 1;
      const maxBet = Number(settings.rows[0].max_bet) || 10000;
      if (amount < minBet || amount > maxBet) {
        throw new Error(`Bet must be between ${minBet} and ${maxBet}`);
      }

      const roundRes = await client.query(
        `SELECT id, closes_at FROM game_rounds WHERE game_id = $1 AND status = 'open' ORDER BY started_at DESC LIMIT 1`,
        [gameId]
      );
      if (!roundRes.rows[0]) throw new Error('No open round');
      const roundId = roundRes.rows[0].id;
      const secondsLeft = await client.query(
        `SELECT EXTRACT(EPOCH FROM (closes_at - NOW()))::INT AS left FROM game_rounds WHERE id = $1`,
        [roundId]
      );
      if ((secondsLeft.rows[0]?.left ?? 0) <= 5) throw new Error('Betting closed for this round');

      const locked = await client.query('SELECT balance FROM users WHERE id = $1 FOR UPDATE', [userId]);
      const balance = Number(locked.rows[0]?.balance || 0);
      if (balance < amount) throw new Error('Insufficient balance');

      const nextBalance = balance - amount;
      await client.query('UPDATE users SET balance = $1, total_bets = total_bets + 1, updated_at = NOW() WHERE id = $2', [
        nextBalance,
        userId,
      ]);
      await client.query(
        `INSERT INTO user_balance_ledger (user_id, type, amount, balance_after, ref_id, note)
         VALUES ($1, 'bet', $2, $3, $4, $5)`,
        [userId, -amount, nextBalance, String(roundId), `${gameId} round bet`]
      );

      await client.query(
        `INSERT INTO round_bets (round_id, user_id, option_id, amount) VALUES ($1, $2, $3, $4)`,
        [roundId, userId, optionId, amount]
      );

      await client.query('COMMIT');
      return { roundId, optionId, amount, balance: nextBalance };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  static async finalizeAviatorRound(roundId, crashPoint, adminSet = false) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE aviator_bets SET status = 'lost' WHERE round_id = $1 AND status = 'active'`,
        [roundId]
      );

      const stats = await client.query(
        `SELECT COALESCE(SUM(amount), 0) AS pot, COALESCE(SUM(payout), 0) AS paid,
                COUNT(*) FILTER (WHERE status = 'cashed_out') AS winners
         FROM aviator_bets WHERE round_id = $1`,
        [roundId]
      );
      const totalPot = Number(stats.rows[0]?.pot || 0);
      const payoutTotal = Number(stats.rows[0]?.paid || 0);
      const winnersCount = Number(stats.rows[0]?.winners || 0);

      const { rows } = await client.query(
        `UPDATE game_rounds SET status='declared', result=$1, admin_set=$2, total_pot=$3,
         winners_count=$4, payout_total=$5, declared_at=NOW(), closed_at=COALESCE(closed_at, NOW())
         WHERE id=$6 AND status = 'closed' RETURNING id AS "roundId", result, payout_total AS "payoutTotal"`,
        [String(crashPoint), adminSet, totalPot, winnersCount, payoutTotal, roundId]
      );
      if (!rows[0]) throw new Error('No flying round to finalize');

      await client.query('COMMIT');
      return rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  static async declareAviator(gameId, crashPoint, roundId, adminSet = true) {
    return this.finalizeAviatorRound(roundId, crashPoint, adminSet);
  }

  static async getLastDeclared(gameId) {
    const { rows } = await pool.query(
      `SELECT id AS "roundId", result, total_pot AS "totalPot", declared_at AS "declaredAt"
       FROM game_rounds WHERE game_id = $1 AND status = 'declared' ORDER BY declared_at DESC NULLS LAST LIMIT 1`,
      [gameId]
    );
    return rows[0] || null;
  }

  static evaluateBetWin(gameId, optionId, result) {
    const opt = String(optionId || '').toLowerCase().trim();
    const res = String(result || '').toLowerCase().trim();

    if (opt === res) return { won: true, mult: 2.0 };

    if (gameId === 'colour' || gameId === 'color-prediction') {
      const num = parseInt(res, 10);
      if (!Number.isNaN(num)) {
        // Number bet exact match
        if (opt === String(num)) return { won: true, mult: 9.0 };

        // Color evaluations
        const isVioletGreen = num === 5;
        const isVioletRed = num === 0;
        const isGreen = num % 2 !== 0;
        const isRed = num % 2 === 0;

        if (opt === 'violet' && (isVioletGreen || isVioletRed)) return { won: true, mult: 4.5 };
        if (opt === 'green' && (isGreen || isVioletGreen)) return { won: true, mult: 2.0 };
        if (opt === 'red' && (isRed || isVioletRed)) return { won: true, mult: 2.0 };

        // Size evaluations
        if (opt === 'big' && num >= 5) return { won: true, mult: 2.0 };
        if (opt === 'small' && num <= 4) return { won: true, mult: 2.0 };
      } else {
        if (res.includes(opt)) return { won: true, mult: opt === 'violet' ? 4.5 : 2.0 };
      }
    }

    if (gameId === 'dragon-tiger' || gameId === 'dragon') {
      if (res.includes('dragon') && opt === 'dragon') return { won: true, mult: 1.95 };
      if (res.includes('tiger') && opt === 'tiger') return { won: true, mult: 1.95 };
      if (res.includes('tie') && opt === 'tie') return { won: true, mult: 8.0 };
      const parts = res.split(':');
      if (parts.length >= 2) {
        const d = parseInt(parts[0], 10) || 10;
        const t = parseInt(parts[1], 10) || 7;
        const w = d > t ? 'dragon' : t > d ? 'tiger' : 'tie';
        if (opt === w) return { won: true, mult: w === 'tie' ? 8.0 : 1.95 };
      }
    }

    if (gameId === 'andar-bahar') {
      if (res.includes('andar') && opt === 'andar') return { won: true, mult: 1.95 };
      if (res.includes('bahar') && opt === 'bahar') return { won: true, mult: 1.95 };
    }

    if (gameId === 'dice') {
      const parts = res.split(',').map((x) => parseInt(x.trim(), 10)).filter((n) => !Number.isNaN(n));
      if (parts.length >= 3) {
        const sum = parts.slice(0, 3).reduce((a, b) => a + b, 0);
        const size = sum >= 11 ? 'big' : 'small';
        const parity = sum % 2 === 0 ? 'even' : 'odd';
        const sumMultMap = {
          3: 207, 4: 69, 5: 34, 6: 20, 7: 14, 8: 10, 9: 8, 10: 8,
          11: 8, 12: 8, 13: 10, 14: 14, 15: 20, 16: 34, 17: 69, 18: 207,
        };

        if (opt === String(sum)) return { won: true, mult: sumMultMap[sum] || 8.0 };
        if (opt === size) return { won: true, mult: 2.0 };
        if (opt === parity) return { won: true, mult: 2.0 };
      }
    }

    return { won: false, mult: 0 };
  }

  static async declare(gameId, result, roundId, adminSet = true) {
    if (gameId === 'aviator') {
      const client = await pool.connect();
      try {
        let rId = roundId;
        if (!rId) {
          const r = await client.query(
            `SELECT id FROM game_rounds WHERE game_id = $1 AND status IN ('open', 'closed') ORDER BY started_at DESC LIMIT 1`,
            [gameId]
          );
          if (!r.rows[0]) throw new Error('No open round found');
          rId = r.rows[0].id;
        }
        const { rows } = await client.query(
          `UPDATE game_rounds SET status = 'closed', scheduled_result = $1, flying_started_at = NOW(),
           closed_at = COALESCE(closed_at, NOW())
           WHERE id = $2 AND status IN ('open', 'closed') RETURNING id AS "roundId", scheduled_result AS result`,
          [String(result), rId]
        );
        if (!rows[0]) throw new Error('Could not start aviator flight');
        return { ...rows[0], flying: true };
      } finally {
        client.release();
      }
    }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let rId = roundId;
      if (!rId) {
        const r = await client.query(
          `SELECT id FROM game_rounds WHERE game_id = $1 AND status IN ('open', 'closed') ORDER BY started_at DESC LIMIT 1`,
          [gameId]
        );
        if (!r.rows[0]) throw new Error('No open round found');
        rId = r.rows[0].id;
      }

      const bets = await client.query(
        `SELECT id, user_id, option_id, amount FROM round_bets WHERE round_id = $1`,
        [rId]
      );

      const totalPot = bets.rows.reduce((s, b) => s + parseFloat(b.amount), 0);
      let payoutTotal = 0;
      let winningBetsCount = 0;

      for (const bet of bets.rows) {
        const evalRes = Round.evaluateBetWin(gameId, bet.option_id, result);
        const won = evalRes.won;
        let payout = 0;
        if (won) {
          winningBetsCount += 1;
          payout = parseFloat(bet.amount) * evalRes.mult;
        }
        payoutTotal += payout;

        await client.query(`UPDATE round_bets SET won = $1, payout = $2 WHERE id = $3`, [won, payout, bet.id]);
        if (won && payout > 0) {
          const bal = await client.query('SELECT balance FROM users WHERE id = $1 FOR UPDATE', [bet.user_id]);
          const next = Number(bal.rows[0].balance) + payout;
          await client.query(
            `UPDATE users SET balance = $1, total_win = total_win + $2 WHERE id = $3`,
            [next, payout, bet.user_id]
          );
          await client.query(
            `INSERT INTO user_balance_ledger (user_id, type, amount, balance_after, ref_id, note)
             VALUES ($1, 'win', $2, $3, $4, $5)`,
            [bet.user_id, payout, next, String(rId), `${gameId} round win`]
          );
        }
      }

      const { rows } = await client.query(
        `UPDATE game_rounds SET status='declared', result=$1, admin_set=$2, total_pot=$3, winners_count=$4,
         payout_total=$5, declared_at=NOW(), closed_at=COALESCE(closed_at, NOW())
         WHERE id=$6 AND status IN ('open', 'closed') RETURNING id AS "roundId", result, payout_total AS "payoutTotal", winners_count AS "winnersCount"`,
        [String(result), adminSet, totalPot, winningBetsCount, payoutTotal, rId]
      );

      await client.query('COMMIT');
      return rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  static async getHistory(gameId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { rows } = await pool.query(
      `SELECT id AS "roundId", result, total_pot AS "totalPot", admin_set AS "adminSet", declared_at AS "declaredAt", created_at AS "createdAt"
       FROM game_rounds WHERE game_id = $1 AND status = 'declared' ORDER BY declared_at DESC NULLS LAST LIMIT $2 OFFSET $3`,
      [gameId, limit, offset]
    );
    return rows;
  }

  static async getRoundDetail(gameId, roundId) {
    const { rows } = await pool.query(
      `SELECT id AS "roundId", result, total_pot AS "totalPot", payout_total AS "payoutTotal", scheduled_result AS "scheduledResult"
       FROM game_rounds WHERE id = $1 AND game_id = $2`,
      [roundId, gameId]
    );
    if (!rows[0]) return null;
    const bets = await pool.query(
      `SELECT rb.id, rb.user_id, u.username, rb.option_id, rb.amount, rb.payout, rb.won
       FROM round_bets rb JOIN users u ON u.id = rb.user_id WHERE rb.round_id = $1`,
      [roundId]
    );
    return { ...rows[0], bets: bets.rows, payouts: bets.rows.filter((b) => b.won) };
  }

  static async startNew(gameId) {
    const settings = await pool.query(
      `SELECT auto_result_interval FROM game_settings WHERE game_id = $1`,
      [gameId]
    );
    const interval = gameId === 'aviator'
      ? 15
      : Math.max(15, Number(settings.rows[0]?.auto_result_interval) || 60);

    const open = await pool.query(
      `SELECT id FROM game_rounds WHERE game_id = $1 AND status = 'open' LIMIT 1`,
      [gameId]
    );
    if (open.rows[0]) return { roundId: open.rows[0].id, alreadyOpen: true };

    const last = await pool.query(
      `SELECT round_number FROM game_rounds WHERE game_id = $1 ORDER BY round_number DESC LIMIT 1`,
      [gameId]
    );
    const nextNum = last.rows[0] ? last.rows[0].round_number + 1 : 1;
    const { rows } = await pool.query(
      `INSERT INTO game_rounds (game_id, round_number, status, started_at, closes_at)
       VALUES ($1,$2,'open',NOW(), NOW() + ($3 || ' seconds')::interval)
       RETURNING id AS "roundId", started_at AS "startsAt", closes_at AS "closesAt"`,
      [gameId, nextNum, interval]
    );
    return rows[0];
  }
}

module.exports = Round;
