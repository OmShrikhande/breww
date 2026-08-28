import React from 'react';
import { ChevronLeft, Mail, Trash2 } from 'lucide-react';
import { goBackOr } from '../lib/navigation';

const Notifications = () => {
  const notificationList = [
    {
      id: 1,
      type: 'LOGIN NOTIFICATION',
      time: '2026-03-14 11:33:43',
      message: 'Your account is logged in 2026-03-14 11:33:43'
    },
    {
      id: 2,
      type: 'LOGIN NOTIFICATION',
      time: '2026-03-10 10:15:55',
      message: 'Your account is logged in 2026-03-10 10:15:55'
    },
    {
      id: 3,
      type: 'Recharge Arrival Not...',
      time: '2026-03-10 01:46:02',
      message: 'Your account has arrived 100.00 Rs'
    },
    {
      id: 4,
      type: 'LOGIN NOTIFICATION',
      time: '2026-03-10 01:39:40',
      message: 'Your account is logged in 2026-03-10 01:39:40'
    },
    {
      id: 5,
      type: 'Notification of cash...',
      time: '2026-03-09 17:59:26',
      message: 'Your withdrawal has been approved and the funds have been transferred. Please check this. The arrival of funds will be delayed on public holidays'
    },
    {
      id: 6,
      type: 'APPLY FOR WITHDRAWAL',
      time: '2026-03-09 17:20:20',
      message: 'Your withdrawal request has been sent'
    }
  ];

  return (
    <div className="min-h-screen bg-[#8c919e] flex justify-center">
      <div className="w-full max-w-md bg-[#1B233D] text-white relative shadow-2xl border-x border-white/5 flex flex-col min-h-screen">
        {/* Header */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-12 bg-[#2D4594] flex items-center px-4 z-[110]">
          <button onClick={() => goBackOr('/')} className="mr-4">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold uppercase tracking-tight">Notification</h1>
        </div>

        <main className="flex-1 pt-12 pb-6 px-4 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col gap-4 mt-4">
            {notificationList.map((notif) => (
              <div key={notif.id} className="bg-[#242E4D] rounded-lg p-4 shadow-md border border-white/5">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#313C5E] p-1.5 rounded-md">
                      <Mail size={16} className="text-gray-300" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-tight">{notif.type}</h3>
                  </div>
                  <button className="text-gray-500 hover:text-red-400">
                    <Trash2 size={18} />
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 mb-2">{notif.time}</p>
                <p className="text-[11px] text-gray-300 leading-relaxed font-medium">
                  {notif.message}
                </p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Notifications;
