import React from 'react';

const CategoryGrid = ({ categories }) => {
  return (
    <div className="flex overflow-x-auto gap-4 py-4 mb-6 no-scrollbar -mx-4 px-4">
      {categories.map((cat) => (
        <button
          key={cat.id}
          className="flex flex-col items-center justify-center p-4 bg-casino-card rounded-xl min-w-[80px] shadow-sm hover:bg-casino-accent/20 transition-all focus:ring-2 focus:ring-casino-accent ring-inset"
        >
          <span className="text-2xl mb-1">{cat.icon}</span>
          <span className="text-xs font-semibold whitespace-nowrap text-gray-400">{cat.label}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryGrid;
