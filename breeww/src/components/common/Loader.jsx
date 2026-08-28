import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${sizes[size]} rounded-full border-casino-accent border-t-transparent shadow-[0_0_15px_rgba(99,102,241,0.5)]`}
      />
    </div>
  );
};

export default Loader;
