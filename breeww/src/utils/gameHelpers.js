export const getColorClass = (color) => {
  switch (color) {
    case 'Green': return 'bg-green-500';
    case 'Red': return 'bg-red-500';
    case 'Violet': return 'bg-purple-500';
    case 'Big': return 'bg-orange-500';
    case 'Small': return 'bg-blue-500';
    default: return 'bg-gray-500';
  }
};

export const getNumberColorClass = (num) => {
  const colors = {
    0: 'border-purple-500 text-purple-500 bg-purple-500/10',
    1: 'border-green-500 text-green-500 bg-green-500/10',
    2: 'border-red-500 text-red-500 bg-red-500/10',
    3: 'border-green-500 text-green-500 bg-green-500/10',
    4: 'border-red-500 text-red-500 bg-red-500/10',
    5: 'border-purple-500 text-purple-500 bg-purple-500/10',
    6: 'border-red-500 text-red-500 bg-red-500/10',
    7: 'border-green-500 text-green-500 bg-green-500/10',
    8: 'border-red-500 text-red-500 bg-red-500/10',
    9: 'border-green-500 text-green-500 bg-green-500/10',
  };
  return colors[num] || 'border-gray-500 text-gray-500 bg-gray-500/10';
};

const numberToColor = (n) => {
  if (n === 0 || n === 5) return 'Violet';
  if ([1, 3, 7, 9].includes(n)) return 'Green';
  return 'Red';
};

export const parseColourResult = (result) => {
  const r = String(result || '').toLowerCase();
  if (['red', 'green', 'violet'].includes(r)) {
    return { number: '—', color: r.charAt(0).toUpperCase() + r.slice(1), size: '—', raw: r };
  }
  if (r === 'big') return { number: '—', color: '—', size: 'Big', raw: r };
  if (r === 'small') return { number: '—', color: '—', size: 'Small', raw: r };
  if (/^\d$/.test(r)) {
    const n = Number(r);
    return { number: n, color: numberToColor(n), size: n >= 5 ? 'Big' : 'Small', raw: r };
  }
  return { number: '—', color: result, size: '—', raw: r };
};

export const formatBetLabel = (bet) => {
  if (!bet) return '';
  if (bet.type === 'color') return bet.value;
  if (bet.type === 'size') return bet.value;
  if (bet.type === 'number') return `Number ${bet.value}`;
  if (bet.type === 'side') return bet.value;
  if (bet.type === 'sum') return `Sum ${bet.value}`;
  if (bet.type === 'parity') return bet.value;
  return String(bet.value);
};
