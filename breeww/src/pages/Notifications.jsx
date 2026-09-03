import React, { useState } from 'react';
import { ChevronLeft, Mail, Trash2, Bell } from 'lucide-react';
import { goBackOr } from '../lib/navigation';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: 'LOGIN NOTIFICATION',
    time: '2026-08-31 15:10:43',
    message: 'Your account was logged in successfully from India (IP: 103.21.244.10)',
    read: false,
  },
  {
    id: 2,
    type: 'PROMOTION REWARD',
    time: '2026-08-31 14:00:15',
    message: 'Deposit bonus available! Get up to ₹10,000 extra on your next recharge.',
    read: false,
  },
  {
    id: 3,
    type: 'RECHARGE ARRIVAL NOTIFICATION',
    time: '2026-08-30 20:46:02',
    message: 'Your wallet recharge of ₹500.00 has been credited and approved.',
    read: true,
  },
  {
    id: 4,
    type: 'CASHOUT APPROVED',
    time: '2026-08-30 18:59:26',
    message: 'Your withdrawal request of ₹1,250.00 has been approved and processed.',
    read: true,
  },
];

const Notifications = () => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const handleDelete = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-[#070b19] flex justify-center selection:bg-amber-500 selection:text-black">
      <div className="w-full max-w-md bg-gradient-to-b from-[#8B0000] via-[#450505] to-[#180202] text-white relative shadow-2xl border-x border-amber-500/20 flex flex-col min-h-screen">
        {/* Fixed Header */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-14 bg-[#140202]/95 backdrop-blur-md flex items-center justify-between px-4 z-[110] border-b border-amber-500/30 shadow-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => goBackOr('/')}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-amber-300"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-base font-black uppercase tracking-tight flex items-center gap-2 gold-text-gradient">
              <Bell size={18} className="text-amber-400" /> Notifications
            </h1>
          </div>
          {notifications.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-bold text-amber-300 hover:text-white px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 transition-colors cursor-pointer"
                title="Mark all as read"
              >
                Mark Read
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] font-bold text-red-300 hover:text-red-100 px-2.5 py-1 rounded-lg bg-red-500/20 border border-red-500/30 transition-colors cursor-pointer"
                title="Clear all"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <main className="flex-1 pt-16 pb-8 px-4 overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-white/40">
              <Mail size={48} className="mb-3 opacity-30 text-amber-400" />
              <p className="font-bold text-base text-white/70">No notifications</p>
              <p className="text-xs text-white/40 mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`rounded-2xl p-4 shadow-md border transition-all ${
                    notif.read
                      ? 'bg-[#1C0202]/80 border-amber-500/15 opacity-80'
                      : 'bg-[#220202] border-amber-500/40 ring-1 ring-amber-500/30 shadow-[0_0_15px_rgba(255,215,0,0.15)]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl border ${notif.read ? 'bg-black/40 border-white/5 text-white/40' : 'bg-amber-500/20 border-amber-400/40 text-amber-400'}`}>
                        <Mail size={16} />
                      </div>
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-tight text-white">{notif.type}</h3>
                        <p className="text-[10px] text-amber-200/50">{notif.time}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(notif.id)}
                      className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                      title="Delete notification"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed font-medium pl-10">
                    {notif.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Notifications;
