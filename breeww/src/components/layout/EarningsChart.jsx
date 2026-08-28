import React from 'react';

const EarningsChart = () => {
  const topThree = [
    { rank: 2, name: 'Jo***oy', amount: '1,607,864.50', avatar: 'https://i.pravatar.cc/150?u=6', color: '#B0C4DE', crown: '👑' },
    { rank: 1, name: 'Mem***MN4', amount: '4,719,285.00', avatar: 'https://i.pravatar.cc/150?u=7', color: '#FF7F50', crown: '👑' },
    { rank: 3, name: 'Mem***GOM', amount: '1,253,806.12', avatar: 'https://i.pravatar.cc/150?u=8', color: '#FFA07A', crown: '👑' },
  ];

  const otherTopList = [
    { rank: 4, name: 'Mem***JMR', amount: '1,006,355.60', avatar: 'https://i.pravatar.cc/150?u=9' },
    { rank: 5, name: 'Shi***ai', amount: '993,720.00', avatar: 'https://i.pravatar.cc/150?u=10' },
    { rank: 6, name: 'Mem***BHF', amount: '917,280.00', avatar: 'https://i.pravatar.cc/150?u=11' },
    { rank: 7, name: 'Mem***UZ6', amount: '850,607.60', avatar: 'https://i.pravatar.cc/150?u=12' },
    { rank: 8, name: 'Mem***KLO', amount: '780,210.00', avatar: 'https://i.pravatar.cc/150?u=13' },
    { rank: 9, name: 'Mem***POW', amount: '720,150.00', avatar: 'https://i.pravatar.cc/150?u=14' },
    { rank: 10, name: 'Mem***QWE', amount: '680,000.00', avatar: 'https://i.pravatar.cc/150?u=15' },
  ];

  return (
    <div className="px-4 mb-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1.5 h-6 bg-[#5D87E6] rounded-full"></div>
        <h2 className="text-xl font-black text-white tracking-tight">Today's earnings chart</h2>
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-2 mb-10 mt-12">
        {/* NO 2 */}
        <div className="flex flex-col items-center flex-1">
          <div className="relative mb-2">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xl drop-shadow-md">👑</div>
            <img src={topThree[0].avatar} className="w-14 h-14 rounded-full border-2 border-white/20" alt="rank 2" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#B0C4DE] text-white text-[8px] font-black px-3 py-0.5 rounded-full uppercase italic tracking-tighter shadow-md">
              NO2
            </div>
          </div>
          <div className="w-full h-24 bg-[#B0C4DE]/60 rounded-t-lg flex flex-col items-center justify-center p-2 shadow-inner border-t border-white/10">
            <span className="text-[10px] font-black text-white mb-1">{topThree[0].name}</span>
            <div className="bg-white/20 px-2 py-0.5 rounded-full">
              <span className="text-[10px] font-black text-white">₹{topThree[0].amount}</span>
            </div>
          </div>
        </div>

        {/* NO 1 */}
        <div className="flex flex-col items-center flex-1 z-10 scale-110">
          <div className="relative mb-2">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-3xl drop-shadow-lg animate-bounce duration-1000">👑</div>
            <img src={topThree[1].avatar} className="w-18 h-18 rounded-full border-2 border-yellow-400 shadow-[0_0_15px_rgba(255,215,0,0.5)]" alt="rank 1" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-[#1B233D] text-[10px] font-black px-4 py-0.5 rounded-full uppercase italic tracking-tighter shadow-lg">
              NO1
            </div>
          </div>
          <div className="w-full h-32 bg-gradient-to-t from-red-500 to-orange-400 rounded-t-lg flex flex-col items-center justify-center p-2 shadow-2xl border-t border-white/20">
            <span className="text-[11px] font-black text-white mb-1">{topThree[1].name}</span>
            <div className="bg-[#1B233D]/30 px-3 py-1 rounded-full border border-white/10">
              <span className="text-[11px] font-black text-white">₹{topThree[1].amount}</span>
            </div>
          </div>
        </div>

        {/* NO 3 */}
        <div className="flex flex-col items-center flex-1">
          <div className="relative mb-2">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xl drop-shadow-md">👑</div>
            <img src={topThree[2].avatar} className="w-14 h-14 rounded-full border-2 border-white/20" alt="rank 3" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#FFA07A] text-white text-[8px] font-black px-3 py-0.5 rounded-full uppercase italic tracking-tighter shadow-md">
              NO3
            </div>
          </div>
          <div className="w-full h-20 bg-[#FFA07A]/60 rounded-t-lg flex flex-col items-center justify-center p-2 shadow-inner border-t border-white/10">
            <span className="text-[10px] font-black text-white mb-1">{topThree[2].name}</span>
            <div className="bg-white/20 px-2 py-0.5 rounded-full">
              <span className="text-[10px] font-black text-white">₹{topThree[2].amount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Other Top List */}
      <div className="flex flex-col gap-3">
        {otherTopList.map((item) => (
          <div key={item.rank} className="bg-[#242E4D] rounded-xl p-3 flex items-center justify-between border border-white/5 shadow-md">
            <div className="flex items-center gap-4">
              <span className="text-xl font-black text-gray-500 italic w-6">{item.rank}</span>
              <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full border border-white/10" />
              <span className="text-sm font-bold text-gray-300">{item.name}</span>
            </div>
            <div className="bg-[#1B233D] px-4 py-1.5 rounded-full border border-[#5D87E6]/30 shadow-inner">
              <span className="text-sm font-black text-[#5D87E6]">₹{item.amount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EarningsChart;
