'use client';

import { useEffect, useRef, useState } from 'react';

interface HUDProps {
  score: number;
  hearts: number;
  energy: number;
  bossHp: number;
  maxBossHp: number;
  phase: string;
  timeElapsed: number;
  mapName?: string;
  bossName?: string;
  flasks?: number;
  onOpenMap?: () => void;
  onOpenSkills?: () => void;
  playerName?: string;
  isKaizenMode?: boolean;
}

const ENERGY_SEGMENTS = 10;

function getRankLabel(score: number) {
  if (score >= 5000) return { label: 'S', cls: 'text-gold text-glow-gold' };
  if (score >= 3000) return { label: 'A', cls: 'text-brand-cyan text-glow-cyan' };
  if (score >= 1500) return { label: 'B', cls: 'text-slate-300' };
  if (score >= 500)  return { label: 'C', cls: 'text-slate-400' };
  return { label: 'D', cls: 'text-slate-600' };
}

export default function HUD({
  score,
  hearts,
  energy,
  bossHp,
  maxBossHp,
  phase,
  timeElapsed,
  mapName = 'Hà Nội',
  bossName = 'Deadline Cổ Phố',
  flasks = 0,
  onOpenMap,
  onOpenSkills,
  playerName,
  isKaizenMode: isKaizenModeProp,
}: HUDProps) {
  const isKaizenMode = isKaizenModeProp !== undefined ? isKaizenModeProp : (energy >= 100 || phase === 'map_clear');
  const isBossPhase  = phase === 'boss';
  const prevHearts   = useRef(hearts);
  const [shaking, setShaking]   = useState(false);
  const [prevScore, setPrevScore] = useState(score);
  const [scoreFlash, setScoreFlash] = useState(false);
  const rank = getRankLabel(score);

  // Shake on HP loss
  useEffect(() => {
    if (hearts < prevHearts.current) {
      setShaking(true);
      setTimeout(() => setShaking(false), 460);
    }
    prevHearts.current = hearts;
  }, [hearts]);

  // Flash score on gain
  useEffect(() => {
    if (score > prevScore) {
      setScoreFlash(true);
      setTimeout(() => setScoreFlash(false), 500);
    }
    setPrevScore(score);
  }, [score]);

  // Format mm:ss
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const filledSegments = Math.round((Math.min(100, Math.max(0, energy)) / 100) * ENERGY_SEGMENTS);

  return (
    <>
      {/* pointer-events-none wrapper so game canvas still receives all clicks */}
      <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between select-none">

        {/* ════════════════════ TOP BAR ════════════════════ */}
        <header className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-navy-dark/80 backdrop-blur-md border-b border-slate-800/60 pointer-events-auto">

          {/* LEFT — HP Hearts */}
          <div className="flex flex-col gap-1 items-start">
            {playerName && (
              <div className="font-display text-[9px] text-brand-cyan text-glow-cyan font-extrabold tracking-widest uppercase truncate max-w-[120px] bg-navy-medium/50 px-2 py-0.5 rounded border border-slate-700/30">
                👤 {playerName}
              </div>
            )}
            <div
              className={`flex items-center gap-2 bg-navy-medium/70 px-3 py-1.5 rounded-xl border border-slate-700/50 ${
                shaking ? 'animate-shake' : ''
              }`}
            >
              <div className="flex items-center gap-1">
                {[...Array(3)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-5 w-5 transition-all duration-300 ${
                      i < Math.ceil(hearts)
                        ? 'text-brand-red drop-shadow-[0_0_6px_rgba(255,59,48,0.8)] animate-pulse-slow'
                        : 'text-slate-700 scale-90 opacity-40'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                ))}
              </div>
              <span className="font-mono text-[10px] text-brand-red font-bold tracking-wider">
                HP {Math.round((Math.max(0, Math.min(3, hearts)) / 3) * 100)}%
              </span>
            </div>
          </div>

          {/* CENTER — Location + Time */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="bg-brand-red/10 px-5 py-1 rounded-full border border-brand-red/40 shadow-[0_0_12px_rgba(255,59,48,0.25)] flex items-center gap-2 backdrop-blur-sm">
              <span className="text-brand-red text-xs animate-pulse">📍</span>
              <h1 className="font-display text-xs text-white uppercase font-extrabold tracking-widest italic">
                {mapName.toUpperCase()}
              </h1>
            </div>
            <div className="font-mono text-[10px] text-slate-500 tracking-widest">
              ⏱ {formatTime(timeElapsed)}
            </div>
          </div>

          {/* RIGHT — Score + Rank */}
          <div className="flex items-center gap-2 bg-navy-medium/70 px-3 py-1.5 rounded-xl border border-brand-cyan/30">
            <div className="flex flex-col items-end">
              <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">Score</span>
              <span
                className={`font-display font-extrabold text-sm leading-tight transition-all ${
                  scoreFlash ? 'text-white scale-110' : 'text-brand-cyan text-glow-cyan'
                }`}
              >
                {score.toLocaleString()}
              </span>
            </div>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-display font-black text-base border ${
                rank.label === 'S' ? 'border-gold/50 bg-gold/10' :
                rank.label === 'A' ? 'border-brand-cyan/50 bg-brand-cyan/10' :
                'border-slate-700 bg-slate-800/60'
              } ${rank.cls}`}
            >
              {rank.label}
            </div>
          </div>
        </header>

        {/* ════════════════════ MIDDLE — Boss HP ═══════════ */}
        <main className="flex-grow flex items-center justify-end relative">
          {isBossPhase && (
            <aside className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 bg-navy-dark/85 p-3 rounded-2xl border border-brand-red/50 shadow-[0_0_20px_rgba(255,59,48,0.2)] animate-slide-up backdrop-blur-md pointer-events-auto">
              {/* Boss name vertical */}
              <div className="[writing-mode:vertical-lr] font-display text-brand-red text-glow-red text-xs font-extrabold tracking-[0.3em] rotate-180 uppercase animate-glitch">
                {bossName.slice(0, 16)}
              </div>

              {/* Boss HP segments */}
              <div className="flex flex-col-reverse gap-1 w-4">
                {[...Array(maxBossHp || 10)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-4 rounded-sm transition-all duration-200 ${
                      i < bossHp
                        ? 'bg-brand-red shadow-[0_0_6px_rgba(255,59,48,0.8)]'
                        : 'bg-slate-800 border border-slate-700/30'
                    } ${i === bossHp - 1 && bossHp > 0 ? 'animate-segment-flash' : ''}`}
                  />
                ))}
              </div>

              {/* HP percent */}
              <span className="font-mono text-[9px] text-brand-red font-bold">
                {maxBossHp > 0 ? Math.round((bossHp / maxBossHp) * 100) : 0}%
              </span>
              <span className="text-xs text-brand-red animate-pulse">⚠️</span>
            </aside>
          )}
        </main>

        {/* ════════════════════ BOTTOM BAR ═════════════════ */}
        <footer className="w-full flex items-end justify-between gap-2 px-3 py-2 bg-navy-dark/80 backdrop-blur-md border-t border-slate-800/60 pointer-events-auto">

          {/* LEFT — Flask counter */}
          <div className="flex items-center gap-2 bg-navy-medium/70 px-3 py-1.5 rounded-xl border border-brand-cyan/30 shrink-0">
            <div className="relative w-6 h-6">
              <div className="absolute inset-0 bg-brand-cyan/20 rounded-full blur-sm animate-pulse" />
              <img
                alt="XP Flask"
                className="w-6 h-6 object-contain relative z-10 drop-shadow-[0_0_6px_rgba(0,229,255,0.5)]"
                src="/assets/items/xp_flask.png"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-mono text-[8px] text-brand-cyan uppercase font-bold tracking-wider">Flasks</span>
              <span className="font-display text-base text-white font-extrabold leading-none">x{flasks}</span>
            </div>
          </div>

          {/* CENTER — Kaizen Energy segments */}
          <div
            className={`flex-1 max-w-sm bg-navy-medium/60 px-4 py-2.5 rounded-2xl border-2 backdrop-blur-md relative ${
              isKaizenMode ? 'border-brand-red shadow-[0_0_20px_rgba(255,59,48,0.3)]' : 'border-slate-700/60'
            }`}
          >
            {/* Label row */}
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-1.5 h-1.5 rotate-45 ${
                    isKaizenMode ? 'bg-brand-red animate-pulse' : 'bg-brand-cyan'
                  }`}
                />
                <span
                  className={`font-display text-[10px] font-bold uppercase tracking-wider ${
                    isKaizenMode ? 'text-brand-red text-glow-red animate-pulse' : 'text-slate-300'
                  }`}
                >
                  {isKaizenMode ? '⚡ KAIZEN AMMO ⚡' : 'KAIZEN ENERGY'}
                </span>
              </div>
              <span
                className={`font-mono text-[10px] font-bold ${
                  isKaizenMode ? 'text-brand-red animate-pulse' : 'text-brand-cyan'
                }`}
              >
                {isKaizenMode ? `${filledSegments}/10` : `${Math.floor(energy)}%`}
              </span>
            </div>

            {/* Segment bar */}
            <div className="flex gap-0.5">
              {[...Array(ENERGY_SEGMENTS)].map((_, i) => {
                const filled = i < filledSegments;
                const isLast = filled && i === filledSegments - 1;
                return (
                  <div
                    key={i}
                    className={`flex-1 h-3 rounded-sm transition-all duration-200 ${
                      filled
                        ? isKaizenMode
                          ? `bg-brand-red shadow-[0_0_6px_rgba(255,59,48,0.7)] ${isLast ? 'animate-segment-flash' : ''}`
                          : `bg-brand-cyan shadow-[0_0_4px_rgba(0,229,255,0.5)] ${isLast ? 'animate-segment-flash' : ''}`
                        : 'bg-navy-dark border border-slate-700/40'
                    }`}
                  />
                );
              })}
            </div>

            {/* Kaizen hint */}
            {isKaizenMode && (
              <div className="text-[9px] text-center text-brand-red font-bold animate-pulse mt-1.5 tracking-wider font-mono">
                ẤN SPACE → KAIZEN KEYBOARD!
              </div>
            )}

            {/* Corner accents */}
            <div className={`absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 rounded-tl-sm ${isKaizenMode ? 'border-brand-red' : 'border-brand-cyan'}`} />
            <div className={`absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 rounded-tr-sm ${isKaizenMode ? 'border-brand-red' : 'border-brand-cyan'}`} />
          </div>

          {/* RIGHT — Quick actions */}
          <div className="flex flex-col gap-1 shrink-0">
            <button
              onClick={onOpenMap}
              className="bg-navy-medium/80 hover:bg-brand-cyan hover:text-navy-dark px-2.5 py-1 rounded-lg border border-brand-cyan/30 flex items-center gap-1 transition-all cursor-pointer text-slate-300 font-bold font-mono text-[10px] active:scale-95 pointer-events-auto"
            >
              🗺 BẢN ĐỒ
            </button>
            <button
              onClick={onOpenSkills}
              className="bg-navy-medium/80 hover:bg-brand-cyan hover:text-navy-dark px-2.5 py-1 rounded-lg border border-brand-cyan/30 flex items-center gap-1 transition-all cursor-pointer text-slate-300 font-bold font-mono text-[10px] active:scale-95 pointer-events-auto"
            >
              ⚡ KỸ NĂNG
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}
