export const chamberSteps = [
  { round: 1, multiplier: 1.2 },
  { round: 2, multiplier: 1.5 },
  { round: 3, multiplier: 2.0 },
  { round: 4, multiplier: 3.0 },
  { round: 5, multiplier: 5.0 },
  { round: 6, multiplier: 7.5 },
];

export const getMultiplierForRound = (round) => {
  const matchedStep = chamberSteps.find((step) => step.round === round);
  if (matchedStep) return matchedStep.multiplier;

  const lastStep = chamberSteps[chamberSteps.length - 1];
  const overflowRounds = Math.max(0, round - lastStep.round);
  return Number((lastStep.multiplier + overflowRounds * 2.5).toFixed(2));
};

export const createChamberResult = (selectedChamber, chamberCount = 6) => {
  const losingChamber = Math.floor(Math.random() * chamberCount);
  const isSafe = selectedChamber !== losingChamber;

  return {
    selectedChamber,
    losingChamber,
    isSafe,
  };
};

