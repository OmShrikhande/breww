import React from 'react';
import { Volume2 } from 'lucide-react';

const Announcement = () => {
  return (
    <div className="flex items-center gap-2 bg-[#2D4594]/30 px-3 py-2 rounded-full mb-4 mx-4">
      <Volume2 size={16} className="text-[#5D87E6]" />
      <div className="flex-1 overflow-hidden">
        <div className="whitespace-nowrap animate-scroll text-[10px] text-white">
          Welcome to the Breeww Games! Greetings, Gamers and Enthusiasts! The Breeww Games is a popular online game platform in India.
        </div>
      </div>
      <button className="bg-[#5D87E6] text-white text-[10px] px-3 py-1 rounded-full flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></span>
        Detail
      </button>
    </div>
  );
};

export default Announcement;
