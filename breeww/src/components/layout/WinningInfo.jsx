import React from 'react';

const WinningInfo = () => {
  const winners = [
    { id: 1, name: 'Mem***AQJ', amount: '50.00', avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: 2, name: 'Mem***PNH', amount: '25.00', avatar: 'https://i.pravatar.cc/150?u=2' },
    { id: 3, name: 'Mem***ASZ', amount: '625.00', avatar: 'https://i.pravatar.cc/150?u=3' },
    { id: 4, name: 'Mem***XJR', amount: '750.00', avatar: 'https://i.pravatar.cc/150?u=4' },
    { id: 5, name: 'Mem***CKR', amount: '40.00', avatar: 'https://i.pravatar.cc/150?u=5' },
  ];

  return (
    <div className="px-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-6 bg-[#5D87E6] rounded-full"></div>
        <h2 className="text-xl font-black text-white tracking-tight">Winning information</h2>
      </div>

      <div className="flex flex-col gap-3">
        {winners.map((winner) => (
          <div key={winner.id} className="bg-[#242E4D] rounded-xl p-3 flex items-center justify-between border border-white/5 shadow-lg">
            <div className="flex items-center gap-3">
              <img src={winner.avatar} alt={winner.name} className="w-12 h-12 rounded-full border-2 border-white/10" />
              <span className="text-sm font-bold text-gray-300">{winner.name}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-[#1B233D] p-1 rounded-lg">
                <img 
                  src="https://placehold.co/100x100/2D4594/ffffff?text=W" 
                  alt="Game" 
                  className="w-12 h-10 object-cover rounded-md" 
                />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-black text-white">Receive ₹{winner.amount}</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase">Winning amount</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WinningInfo;
