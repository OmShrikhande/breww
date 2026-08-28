import { Bell } from 'lucide-react';
import { navigateTo } from '../../lib/navigation';

const Header = () => {
  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-12 bg-[#1B233D] flex items-center justify-between px-4 shrink-0 z-[100] border-b border-white/5">
      <div className="flex items-center">
        <span className="text-xl font-black text-white italic tracking-tighter">
          Breeww
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigateTo('/notifications')}
          className="text-gray-400 hover:text-white transition-colors relative"
        >
          <Bell size={24} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1B233D]"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
