import React from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';

const burstParticles = Array.from({ length: 12 }, (_, index) => ({
  id: `burst-${index}`,
  angle: (index / 12) * Math.PI * 2,
  distance: 18 + (index % 3) * 12,
}));

const sideLabels = [
  { id: 'label-a', title: 'Safe', subtitle: 'Reveal' },
  { id: 'label-b', title: 'Risk', subtitle: 'Core' },
  { id: 'label-c', title: 'Cash', subtitle: 'Out' },
];

const ChamberBoard = ({
  selectedChamber,
  revealedChamber,
  safeChambers,
  phase,
  cycle,
  onSelectChamber,
  disabled,
}) => {
  const chamberCells = Array.from({ length: 6 }, (_, index) => index + 1);
  const boardRotation =
    phase === 'rotating' || phase === 'reveal'
      ? [0, cycle % 2 === 0 ? 12 : -12, cycle % 2 === 0 ? -4 : 4, 0]
      : 0;

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-[#c8a86a]/18 bg-[linear-gradient(180deg,#101010_0%,#060606_100%)] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.45)] sm:p-5">
      <div className="absolute inset-x-0 bottom-0 h-32 bg-[radial-gradient(circle_at_bottom,_rgba(249,115,22,0.18),transparent_70%)]" />
      <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),transparent_70%)]" />

      <div className="relative rounded-[28px] border border-white/6 bg-[linear-gradient(180deg,#0b0b0c_0%,#090909_100%)] p-3 sm:p-4">
        <div className="rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,#141414_0%,#0b0b0b_100%)] px-4 py-3 text-center">
          <div className="text-sm font-black uppercase tracking-[0.28em] text-white">Place Your Bets</div>
          <div className="mt-1 text-[10px] font-black uppercase tracking-[0.28em] text-[#c8a86a]/75">
            {phase === 'rotating'
              ? 'Rotating chambers'
              : phase === 'reveal'
                ? 'Reveal in progress'
                : 'Choose a chamber'}
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[78px_minmax(0,1fr)]">
          <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
            {sideLabels.map((item) => (
              <div
                key={item.id}
                className="flex min-h-[74px] items-center justify-center rounded-[18px] border border-white/8 bg-[linear-gradient(180deg,rgba(45,45,46,0.96),rgba(24,24,24,0.96))] px-2 text-center"
              >
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#c8a86a]/80">{item.title}</div>
                  <div className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-white/80">{item.subtitle}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="rounded-[18px] border border-emerald-400/25 bg-[linear-gradient(180deg,rgba(76,132,47,0.92),rgba(52,94,32,0.92))] px-4 py-3 text-center">
              <div className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-50/80">Survival Lane</div>
              <div className="mt-1 text-sm font-black uppercase tracking-[0.18em] text-white">
                {phase === 'reveal' ? 'Safe chambers glowing' : 'Advance to reveal the dead chamber'}
              </div>
            </div>

            <Motion.div
              animate={{ rotate: boardRotation, scale: phase === 'rotating' ? [1, 1.01, 1] : 1 }}
              transition={{ duration: phase === 'rotating' ? 1.15 : 0.45, ease: 'easeInOut' }}
              className="grid grid-cols-3 gap-2 sm:gap-3"
            >
              {chamberCells.map((chamberNumber) => {
                const isSelected = selectedChamber === chamberNumber;
                const isLosingChamber = revealedChamber === chamberNumber;
                const isSafeChamber = safeChambers.includes(chamberNumber);
                const baseTone =
                  chamberNumber % 2 === 1
                    ? 'bg-[linear-gradient(180deg,#b11d34_0%,#8e1527_100%)]'
                    : 'bg-[linear-gradient(180deg,#242427_0%,#171719_100%)]';

                return (
                  <Motion.button
                    key={chamberNumber}
                    type="button"
                    onClick={() => onSelectChamber(chamberNumber)}
                    disabled={disabled}
                    animate={
                      isLosingChamber
                        ? {
                            scale: [1, 1.05, 0.98, 1],
                            x: [0, -7, 7, -5, 5, 0],
                            boxShadow: [
                              '0 0 0 rgba(248,113,113,0)',
                              '0 0 34px rgba(248,113,113,0.55)',
                              '0 0 12px rgba(127,29,29,0.45)',
                            ],
                          }
                        : isSafeChamber
                          ? {
                              scale: [1, 1.04, 1],
                              boxShadow: [
                                '0 0 0 rgba(52,211,153,0)',
                                '0 0 34px rgba(52,211,153,0.45)',
                                '0 0 12px rgba(22,163,74,0.25)',
                              ],
                            }
                          : phase === 'rotating'
                            ? {
                                scale: [1, 1.03, 1],
                                boxShadow: [
                                  '0 0 0 rgba(200,168,106,0)',
                                  '0 0 24px rgba(200,168,106,0.28)',
                                  '0 0 0 rgba(200,168,106,0)',
                                ],
                              }
                            : isSelected
                              ? {
                                  scale: [1, 1.02, 1],
                                  boxShadow: [
                                    '0 0 0 rgba(200,168,106,0.16)',
                                    '0 0 22px rgba(200,168,106,0.32)',
                                    '0 0 0 rgba(200,168,106,0.16)',
                                  ],
                                }
                              : { scale: 1 }
                    }
                    transition={{
                      duration: isLosingChamber ? 0.68 : isSafeChamber ? 0.72 : 1.5,
                      repeat: isSelected && !isLosingChamber && !isSafeChamber && phase === 'selection' ? Infinity : 0,
                      ease: 'easeInOut',
                    }}
                    whileHover={!disabled ? { y: -2, scale: 1.02 } : undefined}
                    whileTap={!disabled ? { scale: 0.98 } : undefined}
                    className={`relative min-h-[118px] overflow-hidden rounded-[18px] border text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#d5b06b]/70 focus:ring-offset-2 focus:ring-offset-black sm:min-h-[132px] ${
                      isLosingChamber
                        ? 'border-rose-300/70 bg-[linear-gradient(180deg,#ce3048_0%,#731321_100%)]'
                        : isSafeChamber
                          ? 'border-emerald-300/60 bg-[linear-gradient(180deg,#3a7b30_0%,#234c1e_100%)]'
                          : isSelected
                            ? 'border-[#d5b06b]/70'
                            : 'border-white/10'
                    } ${!isLosingChamber && !isSafeChamber ? baseTone : ''}`}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),transparent_55%)]" />
                    <div className="absolute inset-x-0 bottom-0 h-12 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.32))]" />
                    <div className="absolute inset-0 border border-white/10" />
                    {isSelected && !isLosingChamber && (
                      <div className="absolute inset-0 border-2 border-[#d5b06b]/70 shadow-[inset_0_0_0_1px_rgba(213,176,107,0.28)]" />
                    )}

                    <div className="relative flex h-full flex-col items-center justify-center px-3 text-center">
                      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/65">
                        {isLosingChamber ? 'Lose' : isSafeChamber ? 'Safe' : 'Chamber'}
                      </div>
                      <div className="mt-2 text-4xl font-black sm:text-5xl">{chamberNumber}</div>
                      <div className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
                        {isSelected ? 'Selected' : 'Tap to arm'}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isLosingChamber &&
                        burstParticles.map((particle) => (
                          <Motion.span
                            key={particle.id}
                            initial={{ opacity: 0, x: 0, y: 0, scale: 0.35 }}
                            animate={{
                              opacity: [0, 1, 0],
                              x: Math.cos(particle.angle) * particle.distance,
                              y: Math.sin(particle.angle) * particle.distance,
                              scale: [0.35, 1, 0.45],
                            }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.65, ease: 'easeOut' }}
                            className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-[#ffd38a]"
                          />
                        ))}
                    </AnimatePresence>
                  </Motion.button>
                );
              })}
            </Motion.div>

            <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-black uppercase tracking-[0.18em] text-white/60">
              <div className="rounded-[16px] border border-white/8 bg-[#2a2a2c] px-2 py-3">High alert</div>
              <div className="rounded-[16px] border border-white/8 bg-[#2a2a2c] px-2 py-3">Reveal sync</div>
              <div className="rounded-[16px] border border-white/8 bg-[#2a2a2c] px-2 py-3">Cashout lane</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChamberBoard;
