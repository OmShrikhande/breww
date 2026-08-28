import React from 'react';
import { History, TrendingUp, IndianRupee, Activity as ActivityIcon } from 'lucide-react';

const Activity = () => {
  const activities = [
    { id: 1, type: 'Bet', game: 'Aviator', amount: '₹10', result: 'Win', payout: '₹25', time: '2 mins ago' },
    { id: 2, type: 'Bet', game: 'Mines', amount: '₹5', result: 'Loss', payout: '₹0', time: '5 mins ago' },
    { id: 3, type: 'Bet', game: 'Dice', amount: '₹20', result: 'Win', payout: '₹38', time: '10 mins ago' },
  ];

  return (
    <div className="animate-in slide-in-from-right duration-500">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <ActivityIcon size={24} /> My Activity
      </h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-casino-card p-4 rounded-xl text-center shadow-lg border border-gray-800">
          <TrendingUp className="mx-auto mb-2 text-green-500" size={24} />
          <span className="text-xs text-gray-400 block">Total Win</span>
          <span className="text-lg font-bold">₹1,250</span>
        </div>
        <div className="bg-casino-card p-4 rounded-xl text-center shadow-lg border border-gray-800">
          <History className="mx-auto mb-2 text-casino-accent" size={24} />
          <span className="text-xs text-gray-400 block">Bets</span>
          <span className="text-lg font-bold">142</span>
        </div>
        <div className="bg-casino-card p-4 rounded-xl text-center shadow-lg border border-gray-800">
          <IndianRupee className="mx-auto mb-2 text-yellow-500" size={24} />
          <span className="text-xs text-gray-400 block">Profit</span>
          <span className="text-lg font-bold text-green-500">+₹245</span>
        </div>
      </div>

      <div className="bg-casino-card rounded-xl overflow-hidden shadow-xl border border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <h2 className="font-bold uppercase tracking-widest text-sm text-gray-300">Recent Bets</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-gray-800">
                <th className="px-4 py-3 font-semibold uppercase tracking-tighter">Game</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-tighter text-right">Bet</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-tighter text-right">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {activities.map((item) => (
                <tr key={item.id} className="hover:bg-casino-accent/5 transition-colors">
                  <td className="px-4 py-4 font-medium flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-900/40 flex items-center justify-center text-indigo-400">
                      {item.game[0]}
                    </div>
                    <span>{item.game}</span>
                  </td>
                  <td className="px-4 py-4 text-right font-mono">{item.amount}</td>
                  <td className={`px-4 py-4 text-right font-bold font-mono ${item.result === 'Win' ? 'text-green-500' : 'text-red-400'}`}>
                    {item.result === 'Win' ? `+${item.payout}` : '-₹5'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Activity;
