import { evaluateBets } from '../engines/predictionEngine';

export const processBets = (bets, result) => {
  return evaluateBets(bets, result);
};
