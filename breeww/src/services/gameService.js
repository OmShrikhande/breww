import { generateResult } from '../engines/predictionEngine';

export const getNextResult = () => {
  return generateResult();
};

export const fetchHistory = async () => {
  // Simulated history fetch
  return [];
};
