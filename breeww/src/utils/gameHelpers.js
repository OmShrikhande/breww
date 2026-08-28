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
    0: 'border-purple-500 text-purple-500',
    1: 'border-green-500 text-green-500',
    2: 'border-red-500 text-red-500',
    3: 'border-green-500 text-green-500',
    4: 'border-red-500 text-red-500',
    5: 'border-purple-500 text-purple-500',
    6: 'border-red-500 text-red-500',
    7: 'border-green-500 text-green-500',
    8: 'border-red-500 text-red-500',
    9: 'border-green-500 text-green-500'
  };
  return colors[num] || 'border-gray-500 text-gray-500';
};
