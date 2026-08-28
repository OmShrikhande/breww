import React from 'react';

const Button = ({ children, onClick, disabled, className = '', variant = 'primary', size = 'md' }) => {
  const variants = {
    primary: 'bg-casino-accent hover:bg-indigo-500 text-white shadow-lg active:scale-95',
    secondary: 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700',
    success: 'bg-green-600 hover:bg-green-500 text-white shadow-lg active:scale-95',
    danger: 'bg-red-600 hover:bg-red-500 text-white shadow-lg active:scale-95',
    ghost: 'bg-transparent hover:bg-white/5 text-gray-400 hover:text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg font-black uppercase tracking-widest',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
