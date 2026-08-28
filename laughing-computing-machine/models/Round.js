const pool = require('../config/database');

class Round {
  static async getCurrent(gameId) {
    const { rows } = await pool.query(
      `SELECT id AS "roundId", status, total_pot AS "totalPot", winners_count AS "playersCount",
              started_at AS "startedAt", EXTRACT(EPOCH FROM (started_at + INTERVAL '60 seconds' - NOW()))::INT AS "timerLeft"
       FROM game_rounds WHERE game_id = $1 AND status = 'open' ORDER BY started_at DESC LIMIT 1`,
      [gameId]
    );
    return rows[0] || null;
  }

  static async getBetDistribution(gameId) {
    const round = await pool.query(
      `SELECT id FROM game_rounds WHERE game_id = $1 AND status = 'open' ORDER BY started_at DESC LIMIT 1`,
      [gameId]
    );
    if (!round.rows[0]) return null;
    const roundId = round.rows[0].id;
    const { rows } = await pool.query(
      `SELECT option_id, SUM(amount) AS total FROM round_bets WHERE round_id = $1 GROUP BY option_id`,
      [roundId]
    );
    const distribution = {};
    rows.forEach(r => { distribution[r.option_id] = parseFloat(r.total); });
    return { roundId, distribution, updatedAt: new Date() };
  }

  static async declare(gameId, result, roundId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let rId = roundId;
      if (!rId) {
        const r = await client.query(
          `SELECT id FROM game_rounds WHERE game_id = $1 AND status = 'open' ORDER BY started_at DESC LIMIT 1`,
          [gameId]
        );
        if (!r.rows[0]) throw new Error('No open round found');
        rId = r.rows[0].id;
      }

      const bets = await client.query(
        `SELECT id, user_id, option_id, amount FROM round_bets WHERE round_id = $1`,
        [rId]
      );

      const winBets = bets.rows.filter(b => b.option_id === result);
      const totalPot = bets.rows.reduce((s, b) => s + parseFloat(b.amount), 0);
      const totalWinBets = winBets.reduce((s, b) => s + parseFloat(b.amount), 0);

      let payoutTotal = 0;
      for (const bet of bets.rows) {
        const won = bet.option_id === result;
        let payout = 0;
        if (won && totalWinBets > 0) {
          payout = (parseFloat(bet.amount) / totalWinBets) * totalPot * 0.95;
        }
        payoutTotal += payout;
        await client.query(
          `UPDATE round_bets SET won = $1, payout = $2 WHERE id = $3`,
          [won, payout, bet.id]
        );
        if (won) {
          await client.query(`UPDATE users SET balance = balance + $1, total_win = total_win + $1 WHERE id = $2`, [payout, bet.user_id]);
        }
      }

      const { rows } = await client.query(
        `UPDATE game_rounds SET status='declared', result=$1, admin_set=TRUE, total_pot=$2, winners_count=$3, payout_total=$4, declared_at=NOW()
         WHERE id=$5 RETURNING id AS "roundId", result, payout_total AS "payoutTotal", winners_count AS "winnersCount"`,
        [result, totalPot, winBets.length, payoutTotal, rId]
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
      `SELECT id AS "roundId", result, total_pot AS "totalPot", admin_set AS "adminSet", created_at AS "createdAt"
       FROM game_rounds WHERE game_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [gameId, limit, offset]
    );
    return rows;
  }

  static async getRoundDetail(gameId, roundId) {
    const { rows } = await pool.query(
      `SELECT id AS "roundId", result, total_pot AS "totalPot", payout_total AS "payoutTotal"
       FROM game_rounds WHERE id = $1 AND game_id = $2`,
      [roundId, gameId]
    );
    if (!rows[0]) return null;
    const bets = await pool.query(
      `SELECT rb.id, rb.user_id, u.username, rb.option_id, rb.amount, rb.payout, rb.won
       FROM round_bets rb JOIN users u ON u.id = rb.user_id WHERE rb.round_id = $1`,
      [roundId]
    );
    return { ...rows[0], bets: bets.rows, payouts: bets.rows.filter(b => b.won) };
  }

  static async startNew(gameId) {
    const last = await pool.query(
      `SELECT round_number FROM game_rounds WHERE game_id = $1 ORDER BY round_number DESC LIMIT 1`,
      [gameId]
    );
    const nextNum = last.rows[0] ? last.rows[0].round_number + 1 : 1;
    const { rows } = await pool.query(
      `INSERT INTO game_rounds (game_id, round_number, status, started_at) VALUES ($1,$2,'open',NOW()) RETURNING id AS "roundId", started_at AS "startsAt"`,
      [gameId, nextNum]
    );
    return rows[0];
  }
}

module.exports = Round;
