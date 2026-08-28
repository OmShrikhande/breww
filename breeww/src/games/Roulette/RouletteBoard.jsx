import React from 'react';
import { motion as Motion } from 'framer-motion';
import BetCell from './BetCell';
import Chip from './Chip';

const redNumbers = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

const outsideBets = [
  { key: 'outside:1-18', label: '1-18', value: '1-18' },
  { key: 'outside:even', label: 'EVEN', value: 'even' },
  { key: 'outside:red', label: 'RED', value: 'red', tone: 'red', swatch: true },
  { key: 'outside:black', label: 'BLACK', value: 'black', tone: 'black', swatch: true },
  { key: 'outside:odd', label: 'ODD', value: 'odd' },
  { key: 'outside:19-36', label: '19-36', value: '19-36' },
];

const dozenBets = [
  { key: 'dozen:1st12', label: '1st 12', value: '1st12' },
  { key: 'dozen:2nd12', label: '2nd 12', value: '2nd12' },
  { key: 'dozen:3rd12', label: '3rd 12', value: '3rd12' },
];

const columnBets = [
  { key: 'column:1', label: '2 to 1', value: 1 },
  { key: 'column:2', label: '2 to 1', value: 2 },
  { key: 'column:3', label: '2 to 1', value: 3 },
];

const numberRows = Array.from({ length: 12 }, (_, rowIndex) =>
  Array.from({ length: 3 }, (_, columnIndex) => rowIndex * 3 + columnIndex + 1)
);

const RouletteBoard = React.memo(
  ({ betStacksByKey, betAmountsByKey, selectedChip, onPlaceBet, winningNumber, isSpinning, totalBet, balance }) => {
    const getAmount = (key) => betAmountsByKey[key] ?? 0;
    const getChips = (key) => betStacksByKey[key] ?? [];

    return (
      <Motion.div
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,17,18,0.98),rgba(8,8,9,0.96))] p-2 shadow-[0_24px_80px_rgba(0,0,0,0.38)] sm:rounded-[32px] sm:p-4"
      >
        <div className="rounded-[18px] border border-white/8 bg-[linear-gradient(180deg,rgba(0,0,0,0.58),rgba(11,11,12,0.82),rgba(70,28,16,0.36))] p-2.5 sm:rounded-[24px] sm:p-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] sm:h-10 sm:w-10">
              <Chip value={selectedChip} size="sm" compact />
            </div>
            <Motion.div
              animate={!isSpinning ? { boxShadow: ['0 0 0 rgba(46,125,50,0.16)', '0 0 22px rgba(46,125,50,0.28)', '0 0 0 rgba(46,125,50,0.16)'] } : { boxShadow: '0 0 0 rgba(0,0,0,0)' }}
              transition={{ duration: 2.2, repeat: !isSpinning ? Infinity : 0, ease: 'easeInOut' }}
              className="flex-1 rounded-[14px] border border-emerald-400/25 bg-[linear-gradient(180deg,#2E7D32_0%,#1B5E20_100%)] px-3 py-2.5 text-center sm:rounded-[16px] sm:px-4 sm:py-3"
            >
              <div className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-50/75">Place Your Bets</div>
              <div className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-white sm:text-sm sm:tracking-[0.18em]">
                {isSpinning ? 'Betting Closed' : 'Tap table cells to stack chips'}
              </div>
            </Motion.div>
          </div>

          <div className="mt-4 overflow-visible">
            <div className="w-full">
              <div className="grid grid-cols-[46px_32px_minmax(0,1fr)] gap-1 sm:grid-cols-[58px_42px_minmax(0,1fr)] sm:gap-1.5 lg:grid-cols-[78px_58px_minmax(0,1fr)] lg:gap-2">
                <div className="grid gap-1 sm:gap-1.5 lg:gap-2" style={{ gridTemplateRows: 'repeat(6, 1fr)', minHeight: 400 }}>
                  {outsideBets.map((bet) => (
                    <BetCell
                      key={bet.key}
                      label={bet.label}
                      tone={bet.tone ?? 'slate'}
                      onClick={() => onPlaceBet({ key: bet.key, type: 'outside', value: bet.value, label: bet.label })}
                      chips={getChips(bet.key)}
                      amount={getAmount(bet.key)}
                      isDisabled={isSpinning}
                      className="min-h-[60px] rounded-[10px] sm:min-h-[70px] sm:rounded-[14px] lg:min-h-[100px] lg:rounded-[18px]"
                      title={`Bet on ${bet.label}`}
                      labelClassName="text-lg tracking-[0.16em]"
                    >
                      <div className="relative flex h-full flex-col items-center justify-center gap-2 px-2">
                        {bet.swatch ? (
                          <div className="h-5 w-5 rotate-45 border border-white/70 bg-transparent" />
                        ) : (
                          <span className="text-lg font-black tracking-[0.18em]">{bet.label}</span>
                        )}
                      </div>
                    </BetCell>
                  ))}
                </div>

                <div className="grid gap-1 sm:gap-1.5 lg:gap-2" style={{ gridTemplateRows: 'repeat(12, minmax(0, 1fr))', minHeight: 400 }}>
                  {dozenBets.map((bet, index) => (
                    <BetCell
                      key={bet.key}
                      label={bet.label}
                      tone="slate"
                      onClick={() => onPlaceBet({ key: bet.key, type: 'dozen', value: bet.value, label: bet.label })}
                      chips={getChips(bet.key)}
                      amount={getAmount(bet.key)}
                      isDisabled={isSpinning}
                      className="rounded-[10px] sm:rounded-[14px] lg:rounded-[18px]"
                      title={`Bet on ${bet.label}`}
                      style={{ gridRow: `${index * 4 + 1} / span 4` }}
                    >
                      <div className="relative flex h-full items-center justify-center px-1 text-center">
                        <span className="text-[9px] font-black uppercase tracking-[0.08em] [writing-mode:vertical-rl] [text-orientation:mixed] sm:text-[11px] sm:tracking-[0.12em] lg:text-sm lg:tracking-[0.16em]">
                          {bet.label}
                        </span>
                      </div>
                    </BetCell>
                  ))}
                </div>

                <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
                  <div className="grid grid-cols-3 gap-1 sm:gap-1.5 lg:gap-2">
                    {numberRows.map((row) =>
                      row.map((number) => (
                        <BetCell
                          key={`number:${number}`}
                          label={number}
                          tone={redNumbers.has(number) ? 'red' : 'black'}
                          onClick={() =>
                            onPlaceBet({
                              key: `number:${number}`,
                              type: 'number',
                              value: number,
                              label: `Number ${number}`,
                            })
                          }
                          chips={getChips(`number:${number}`)}
                          amount={getAmount(`number:${number}`)}
                          isWinning={winningNumber === number}
                          isDisabled={isSpinning}
                          className="h-[28px] rounded-[8px] sm:h-[34px] sm:rounded-[10px] lg:h-[52px] lg:rounded-[14px]"
                          title={`Bet on number ${number}`}
                          labelClassName="text-lg sm:text-xl lg:text-3xl"
                        />
                      ))
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-1 sm:gap-1.5 lg:gap-2">
                    {columnBets.map((bet) => (
                      <BetCell
                        key={bet.key}
                        label={bet.label}
                        tone="slate"
                        onClick={() => onPlaceBet({ key: bet.key, type: 'column', value: bet.value, label: `${bet.label} ${bet.value}` })}
                        chips={getChips(bet.key)}
                        amount={getAmount(bet.key)}
                        isDisabled={isSpinning}
                        className="h-6 rounded-[8px] sm:h-8 sm:rounded-[10px] lg:h-12 lg:rounded-[14px]"
                        title={`Bet on column ${bet.value}`}
                        labelClassName="text-[8px] uppercase tracking-[0.04em] sm:text-[10px] sm:tracking-[0.08em] lg:text-sm lg:tracking-[0.14em]"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Motion.div
            initial={false}
            animate={{
              opacity: winningNumber ? 1 : 0.85,
              scale: winningNumber ? [1, 1.02, 1] : 1,
            }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="mt-3 rounded-[14px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-3 py-2 text-[11px] font-semibold text-white/70 sm:mt-4 sm:rounded-[18px] sm:px-4 sm:py-3 sm:text-sm"
          >
            {winningNumber ? (
              <span>
                Backend result received. Winning number <span className="font-black text-[#ffd54f]">{winningNumber}</span> is highlighted.
              </span>
            ) : (
              <span>Winning cell highlight and payout animation will activate after the backend responds.</span>
            )}
          </Motion.div>

          <div className="mt-3 flex items-end justify-between gap-3 text-white/90">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.08em] text-white/55">Total Bet</div>
              <div className="mt-1 text-sm font-black sm:text-base">₹{totalBet.toFixed(2)}</div>
              <div className="mt-2 text-[10px] font-black uppercase tracking-[0.08em] text-white/55">Balance</div>
              <div className="mt-1 text-sm font-black sm:text-base">₹{balance.toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black text-white/55">0.25 - 1,000.00</div>
              <div className="mt-2 text-[10px] font-semibold text-white/55">Turbo Multifiire Roulette Live</div>
            </div>
          </div>
        </div>
      </Motion.div>
    );
  }
);

RouletteBoard.displayName = 'RouletteBoard';

export default RouletteBoard;
