import React from 'react';
import { motion } from 'framer-motion';
import CommunityCards from './CommunityCards';
import ChipStack from './ChipStack';
import PlayerSeat from './PlayerSeat';

const PokerTable = ({ players, communityCards, pot }) => {
  return (
    <div className="relative overflow-hidden rounded-[38px] border border-emerald-200/10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),transparent_30%),linear-gradient(180deg,rgba(10,21,17,0.96),rgba(5,10,10,1))] p-4 shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08),transparent_56%)] opacity-60" />
      <div className="absolute inset-x-10 top-6 h-20 rounded-full bg-emerald-200/5 blur-3xl" />

      <div className="relative mx-auto flex min-h-[520px] max-w-6xl items-center justify-center sm:min-h-[620px] xl:min-h-[700px]">
        <div className="absolute inset-3 rounded-[45%] border border-amber-200/10 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.24),rgba(4,47,46,0.95)_63%,rgba(1,10,9,1)_100%)] shadow-[inset_0_0_0_18px_rgba(89,52,22,0.42),inset_0_0_80px_rgba(0,0,0,0.25),0_30px_80px_rgba(0,0,0,0.4)] sm:inset-8">
          <div className="absolute inset-[18px] rounded-[44%] border border-white/10 shadow-[inset_0_0_50px_rgba(255,255,255,0.08)] sm:inset-[28px]" />
          <div className="absolute inset-[32px] rounded-[42%] border border-black/25 sm:inset-[48px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative z-10 flex flex-col items-center gap-4"
        >
          <ChipStack amount={pot} label="Total Pot" />
          <CommunityCards cards={communityCards} />
        </motion.div>

        {players.map((player) => (
          <PlayerSeat key={player.id} player={player} className={player.positionClass} />
        ))}
      </div>
    </div>
  );
};

export default PokerTable;
