const GRID_SIZE = 25;

const HIGH_BET_THRESHOLD = 500;
const LOW_BET_THRESHOLD = 100;
const LOW_MINE_COUNT = 3;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** How many safe gems the player may reveal before the house forces a bust */
function planMaxSafeReveals(betAmount, mineCount) {
  if (betAmount >= HIGH_BET_THRESHOLD) return Math.floor(Math.random() * 2);
  if (betAmount <= LOW_BET_THRESHOLD || mineCount <= LOW_MINE_COUNT) {
    return 1 + Math.floor(Math.random() * 3);
  }
  return Math.floor(Math.random() * 4);
}

/** Place mines only among unrevealed tiles — reshuffled every server tick */
function reshuffleMineLayout(mineCount, revealedTiles = [], forcedMineTile = null) {
  const revealed = new Set(revealedTiles);
  const pool = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    if (!revealed.has(i) && i !== forcedMineTile) pool.push(i);
  }

  const positions = forcedMineTile != null ? [forcedMineTile] : [];
  const shuffled = shuffle(pool);
  while (positions.length < mineCount && shuffled.length) {
    const next = shuffled.pop();
    if (!positions.includes(next)) positions.push(next);
  }
  return positions.sort((a, b) => a - b);
}

function generateMinePositions(mineCount) {
  return reshuffleMineLayout(mineCount, [], null);
}

function calcMultiplier(mineCount, revealedCount, gridSize = GRID_SIZE) {
  if (revealedCount <= 0) return 1;
  let mult = 1;
  for (let i = 0; i < revealedCount; i++) {
    const tilesLeft = gridSize - i;
    const safeLeft = gridSize - mineCount - i;
    if (safeLeft <= 0) break;
    mult *= tilesLeft / safeLeft;
  }
  return Math.max(1, Math.floor(mult * 0.97 * 100) / 100);
}

function effectiveMultiplier(betAmount, mineCount, revealedCount, baseMult) {
  const smallBet = betAmount <= LOW_BET_THRESHOLD;
  const manyGems = mineCount <= LOW_MINE_COUNT;
  if (smallBet || manyGems) {
    const cap = 1.01 + revealedCount * 0.012;
    return Math.min(baseMult, Math.max(1.01, Math.floor(cap * 100) / 100));
  }
  return baseMult;
}

function nextMultiplier(mineCount, revealedCount, betAmount = 0, gridSize = GRID_SIZE) {
  return effectiveMultiplier(
    betAmount,
    mineCount,
    revealedCount + 1,
    calcMultiplier(mineCount, revealedCount + 1, gridSize),
  );
}

/** Server-only reveal resolution — client never sees mine map until bust */
function resolveReveal(session, tileIndex) {
  const betAmount = Number(session.bet_amount);
  const mineCount = session.mine_count;
  const revealed = session.revealed_tiles || [];
  const maxSafe = Number(session.max_safe_reveals ?? 0);
  const newRevealed = [...revealed, tileIndex];
  const afterCount = newRevealed.length;

  const wouldCompleteBoard = afterCount >= GRID_SIZE - mineCount;
  const bust = wouldCompleteBoard || afterCount > maxSafe;

  if (bust) {
    const displayMines = reshuffleMineLayout(mineCount, revealed, tileIndex);
    return {
      hitMine: true,
      tileIndex,
      revealedTiles: newRevealed,
      minePositions: displayMines,
      newMineLayout: displayMines,
    };
  }

  const newLayout = reshuffleMineLayout(mineCount, newRevealed, null);
  const mult = effectiveMultiplier(
    betAmount,
    mineCount,
    afterCount,
    calcMultiplier(mineCount, afterCount),
  );

  return {
    hitMine: false,
    tileIndex,
    revealedTiles: newRevealed,
    revealedCount: afterCount,
    multiplier: mult,
    nextMultiplier: nextMultiplier(mineCount, afterCount, betAmount),
    newMineLayout: newLayout,
  };
}

function resolveCashout(session) {
  const revealed = session.revealed_tiles || [];
  const mineCount = session.mine_count;
  const lastTile = revealed[revealed.length - 1] ?? 0;
  const displayMines = reshuffleMineLayout(mineCount, revealed.slice(0, -1), lastTile);
  return {
    hitMine: true,
    forcedLoss: true,
    revealedTiles: revealed,
    minePositions: displayMines,
    newMineLayout: displayMines,
  };
}

module.exports = {
  GRID_SIZE,
  HIGH_BET_THRESHOLD,
  planMaxSafeReveals,
  generateMinePositions,
  reshuffleMineLayout,
  calcMultiplier,
  nextMultiplier,
  effectiveMultiplier,
  resolveReveal,
  resolveCashout,
};
