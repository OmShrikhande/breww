export const generateResult = () => {
  const resultNumber = Math.floor(Math.random() * 10);
  
  const colors = {
    0: 'Violet',
    1: 'Green',
    2: 'Red',
    3: 'Green',
    4: 'Red',
    5: 'Violet',
    6: 'Red',
    7: 'Green',
    8: 'Red',
    9: 'Green'
  };

  return {
    number: resultNumber,
    color: colors[resultNumber],
    size: resultNumber >= 5 ? 'Big' : 'Small'
  };
};

export const evaluateBets = (bets, result) => {
  let totalWon = 0;
  
  const results = bets.map(bet => {
    let isWin = false;
    let multiplier = 0;

    if (bet.type === 'color') {
      if (bet.value === result.color) {
        isWin = true;
        multiplier = result.color === 'Violet' ? 4.5 : 2;
      }
    } else if (bet.type === 'size') {
      if (bet.value === result.size) {
        isWin = true;
        multiplier = 2;
      }
    } else if (bet.type === 'number') {
      if (Number(bet.value) === result.number) {
        isWin = true;
        multiplier = 9;
      }
    }

    const wonAmount = isWin ? bet.amount * multiplier : 0;
    totalWon += wonAmount;

    return {
      ...bet,
      isWin,
      wonAmount
    };
  });

  return {
    results,
    totalWon
  };
};
