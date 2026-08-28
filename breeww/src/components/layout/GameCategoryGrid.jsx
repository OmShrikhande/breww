import React from 'react';

const GameCategoryGrid = () => {
  const categories = [
    { id: 'popular', label: 'Popular', image: 'https://placehold.co/150x80/5482FF/ffffff?text=Popular', size: 'large' },
    { id: 'lottery', label: 'Lottery', image: 'https://placehold.co/150x80/9C27B0/ffffff?text=Lottery', size: 'large' },
    { id: 'casino', label: 'Casino', image: 'https://placehold.co/80x80/FF5722/ffffff?text=Casino', size: 'small' },
    { id: 'slots', label: 'Slots', image: 'https://placehold.co/80x80/673AB7/ffffff?text=Slots', size: 'small' },
    { id: 'sports', label: 'Sports', image: 'https://placehold.co/80x80/FF9800/ffffff?text=Sports', size: 'small' },
    { id: 'rummy', label: 'Rummy', image: 'https://placehold.co/80x80/4CAF50/ffffff?text=Rummy', size: 'small' },
    { id: 'fishing', label: 'Fishing', image: 'https://placehold.co/80x80/03A9F4/ffffff?text=Fishing', size: 'small' },
    { id: 'original', label: 'Original', image: 'https://placehold.co/80x80/F44336/ffffff?text=Original', size: 'small' },
  ];

  const largeCategories = categories.filter(c => c.size === 'large');
  const smallCategories = categories.filter(c => c.size === 'small');

  return (
    <div className="px-4 mb-6">
      <div className="grid grid-cols-2 gap-3 mb-3">
        {largeCategories.map((cat) => (
          <div key={cat.id} className="relative rounded-xl overflow-hidden aspect-[1.8/1] shadow-lg border border-white/5">
            <img src={cat.image} alt={cat.label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent flex items-end p-2">
              <span className="text-white text-xs font-bold">{cat.label}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {smallCategories.map((cat) => (
          <div key={cat.id} className="relative rounded-xl overflow-hidden aspect-square shadow-lg border border-white/5">
            <img src={cat.image} alt={cat.label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end items-center pb-2">
              <span className="text-white text-[10px] font-bold">{cat.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameCategoryGrid;
