const GRID_SIZE = 25;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateMinePositions(mineCount) {
  const pool = Array.from({ length: GRID_SIZE }, (_, i) => i);
  const shuffled = shuffle(pool);
  return shuffled.slice(0, mineCount).sort((a, b) => a - b);
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
  return Math.max(1.02, Math.floor(mult * 0.98 * 100) / 100);
}

function effectiveMultiplier(betAmount, mineCount, revealedCount, baseMult) {
  return baseMult;
}

function nextMultiplier(mineCount, revealedCount, betAmount = 0, gridSize = GRID_SIZE) {
  return calcMultiplier(mineCount, revealedCount + 1, gridSize);
}

function planMaxSafeReveals(betAmount, mineCount) {
  return GRID_SIZE - mineCount;
}

function resolveReveal(session, tileIndex) {
  const betAmount = Number(session.bet_amount);
  const mineCount = session.mine_count;
  const revealed = session.revealed_tiles || [];
  const minePositions = session.mine_positions || [];

  const isMine = minePositions.includes(tileIndex);
  const newRevealed = [...revealed, tileIndex];
  const afterCount = newRevealed.length;

  if (isMine) {
    return {
      hitMine: true,
      tileIndex,
      revealedTiles: newRevealed,
      minePositions,
      newMineLayout: minePositions,
    };
  }

  const mult = calcMultiplier(mineCount, afterCount);

  return {
    hitMine: false,
    tileIndex,
    revealedTiles: newRevealed,
    revealedCount: afterCount,
    multiplier: mult,
    nextMultiplier: nextMultiplier(mineCount, afterCount, betAmount),
    newMineLayout: minePositions,
  };
}

module.exports = {
  GRID_SIZE,
  generateMinePositions,
  calcMultiplier,
  nextMultiplier,
  effectiveMultiplier,
  planMaxSafeReveals,
  resolveReveal,
};
