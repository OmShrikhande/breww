export const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getRandomFloat = (min, max, decimals = 2) => {
  const num = Math.random() * (max - min) + min;
  return Number(num.toFixed(decimals));
};
