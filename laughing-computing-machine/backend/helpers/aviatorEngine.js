const MIN_CRASH = 1.5;
const MAX_CRASH = 13;
const HIGH_CRASH_THRESHOLD = 5;
const HIGH_CRASH_CHANCE = 0.01; // 1 in 100 rounds above 5x

/** Multiplier curve: matches frontend animation (e^(0.08 * t)) */
function multiplierAtElapsed(elapsedSec) {
  if (elapsedSec <= 0) return 1;
  return Math.floor(Math.pow(Math.E, 0.08 * elapsedSec) * 100) / 100;
}

function elapsedForMultiplier(mult) {
  const m = Math.max(1, Number(mult) || 1);
  return Math.log(m) / 0.08;
}

function isValidCrash(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= MIN_CRASH && n <= MAX_CRASH;
}

function clampCrash(crash) {
  return Math.min(MAX_CRASH, Math.max(MIN_CRASH, Math.floor(crash * 100) / 100));
}

/** 99% rounds: 1.5x–5x · 1% rounds: 5x–13x · big bets trend lower */
function generateCrashPoint({ totalPot = 0, betCount = 0, avgBet = 0 } = {}) {
  const jackpotRoll = Math.random();

  if (avgBet >= 500 || totalPot >= 50000) {
    return clampCrash(1.5 + Math.random() * 2);
  }
  if (avgBet >= 200 || totalPot >= 15000) {
    return clampCrash(1.5 + Math.random() * 2.5);
  }

  if (jackpotRoll < HIGH_CRASH_CHANCE) {
    return clampCrash(HIGH_CRASH_THRESHOLD + Math.random() * (MAX_CRASH - HIGH_CRASH_THRESHOLD));
  }

  return clampCrash(MIN_CRASH + Math.random() * (HIGH_CRASH_THRESHOLD - MIN_CRASH));
}

/** Reject legacy non-numeric values like "crash" from old round engine */
function normalizeCrashPoint(value, betStats = {}) {
  if (isValidCrash(value)) return clampCrash(Number(value));
  return generateCrashPoint(betStats);
}

function effectiveCashoutMultiplier(betAmount, requestedMult, crashPoint) {
  const crash = normalizeCrashPoint(crashPoint);
  let mult = Math.min(requestedMult, crash - 0.01);
  if (betAmount >= 500) {
    mult = Math.min(mult, 1.15 + Math.random() * 0.35);
  } else if (betAmount <= 100) {
    mult = Math.min(mult, 1.2 + Math.random() * 0.5);
  }
  return Math.max(1.01, Math.floor(mult * 100) / 100);
}

module.exports = {
  MIN_CRASH,
  MAX_CRASH,
  HIGH_CRASH_THRESHOLD,
  HIGH_CRASH_CHANCE,
  multiplierAtElapsed,
  elapsedForMultiplier,
  isValidCrash,
  generateCrashPoint,
  normalizeCrashPoint,
  effectiveCashoutMultiplier,
};
