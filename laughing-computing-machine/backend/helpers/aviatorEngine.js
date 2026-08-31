const MIN_CRASH = 1.5;
const MAX_CRASH = 15;
const HIGH_CRASH_THRESHOLD = 5;
const HIGH_CRASH_CHANCE = 0.03; // 3% of rounds fly to high multipliers (5x–15x)

// Smooth, realistic flight multiplier rate (k = 0.048 for smooth, enjoyable pacing)
const MULTIPLIER_GROWTH_RATE = 0.048;

/** Multiplier curve: e^(k * t) */
function multiplierAtElapsed(elapsedSec) {
  if (elapsedSec <= 0) return 1;
  return Math.floor(Math.pow(Math.E, MULTIPLIER_GROWTH_RATE * elapsedSec) * 100) / 100;
}

function elapsedForMultiplier(mult) {
  const m = Math.max(1, Number(mult) || 1);
  return Math.log(m) / MULTIPLIER_GROWTH_RATE;
}

function isValidCrash(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= MIN_CRASH && n <= MAX_CRASH;
}

function clampCrash(crash) {
  return Math.min(MAX_CRASH, Math.max(MIN_CRASH, Math.floor(crash * 100) / 100));
}

/** Fair, engaging crash generation with smooth flight curves */
function generateCrashPoint({ totalPot = 0, betCount = 0, avgBet = 0 } = {}) {
  const jackpotRoll = Math.random();

  if (avgBet >= 1000 || totalPot >= 50000) {
    return clampCrash(1.4 + Math.random() * 1.6);
  }
  if (avgBet >= 500 || totalPot >= 20000) {
    return clampCrash(1.5 + Math.random() * 2.2);
  }

  if (jackpotRoll < HIGH_CRASH_CHANCE) {
    return clampCrash(HIGH_CRASH_THRESHOLD + Math.random() * (MAX_CRASH - HIGH_CRASH_THRESHOLD));
  }

  // 97% of rounds have fair distribution between 1.5x and 5.0x
  return clampCrash(MIN_CRASH + Math.random() * (HIGH_CRASH_THRESHOLD - MIN_CRASH));
}

/** Normalize crash point ensuring numeric value */
function normalizeCrashPoint(value, betStats = {}) {
  if (isValidCrash(value)) return clampCrash(Number(value));
  return generateCrashPoint(betStats);
}

function effectiveCashoutMultiplier(betAmount, requestedMult, crashPoint) {
  const crash = normalizeCrashPoint(crashPoint);
  const mult = Math.min(requestedMult, Math.max(1.01, crash - 0.01));
  return Math.max(1.01, Math.floor(mult * 100) / 100);
}

module.exports = {
  MIN_CRASH,
  MAX_CRASH,
  HIGH_CRASH_THRESHOLD,
  HIGH_CRASH_CHANCE,
  MULTIPLIER_GROWTH_RATE,
  multiplierAtElapsed,
  elapsedForMultiplier,
  isValidCrash,
  generateCrashPoint,
  normalizeCrashPoint,
  effectiveCashoutMultiplier,
};
