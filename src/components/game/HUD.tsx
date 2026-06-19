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
  cooldownRemaining?: number;
  shieldRemaining?: number;
  wingsRemaining?: number;
  onPauseToggle?: () => void;
  groundBugsDefeated?: number;
  flyingBugsDefeated?: number;
  bossTriggerDelaySec?: number; // Tổng thời gian đếm ngược đến boss
}

const ENERGY_SEGMENTS = 10;
const BOSS_DELAY_SEC = 60; // Fallback nếu prop không được truyền

function getRankLabel(score: number) {
  if (score >= 5000) return { label: 'S', cls: 'text-gold text-glow-gold' };
  if (score >= 3000) return { label: 'A', cls: 'text-brand-cyan text-glow-cyan' };
  if (score >= 1500) return { label: 'B', cls: 'text-slate-300' };
  if (score >= 500)  return { label: 'C', cls: 'text-slate-400' };
  return { label: 'D', cls: 'text-slate-600' };
}

// ─── Item Tooltip Data ────────────────────────────────────────────────────────
const ITEM_INFO = {
  flask: {
    icon: '🧪',
    label: 'XP Flask',
    color: '#00e5ff',
    glowColor: 'rgba(0,229,255,0.5)',
    borderColor: 'rgba(0,229,255,0.3)',
    bgColor: 'rgba(0,229,255,0.08)',
    desc: 'Bình kinh nghiệm. Thu thập để cộng +50 điểm và tích nạp Kaizen Energy.',
    effect: '+50 điểm • +5% Kaizen',
  },
  shield: {
    icon: '🛡️',
    label: 'Khiên Tôn Trọng',
    color: '#22c55e',
    glowColor: 'rgba(34,197,94,0.5)',
    borderColor: 'rgba(34,197,94,0.3)',
    bgColor: 'rgba(34,197,94,0.08)',
    desc: 'Lá chắn Tôn trọng (Respect). Miễn nhiễm toàn bộ damage trong thời gian kích hoạt.',
    effect: '10 giây bất tử',
  },
  wings: {
    icon: '🪶',
    label: 'Cánh Trách Nhiệm',
    color: '#00e5ff',
    glowColor: 'rgba(0,229,255,0.5)',
    borderColor: 'rgba(0,229,255,0.3)',
    bgColor: 'rgba(0,229,255,0.08)',
    desc: 'Đôi cánh Trách nhiệm (Responsibility). Bay tự do và vượt qua mọi hố sâu.',
    effect: '8 giây bay tự do',
  },
  keyboard: {
    icon: '⌨️',
    label: 'Kaizen Keyboard',
    color: '#ff3b30',
    glowColor: 'rgba(255,59,48,0.5)',
    borderColor: 'rgba(255,59,48,0.3)',
    bgColor: 'rgba(255,59,48,0.08)',
    desc: 'Bàn phím Kaizen. Kích hoạt Kaizen Mode: bắn đạn phím, nhảy cao hơn, tốc độ tăng.',
    effect: 'SPACE để bắn • 10 đạn',
  },
};

// ─── Tooltip Component ─────────────────────────────────────────────────────────
function ItemTooltip({ info, visible }: { info: typeof ITEM_INFO.flask; visible: boolean }) {
  return (
    <div
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none z-50 transition-all duration-200"
      style={{
        opacity: visible ? 1 : 0,
        transform: `translateX(-50%) translateY(${visible ? 0 : 6}px)`,
        width: 180,
      }}
    >
      {/* Arrow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0"
        style={{
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: `5px solid ${info.borderColor}`,
        }}
      />
      <div
        className="rounded-xl p-2.5 backdrop-blur-md text-left"
        style={{
          background: 'rgba(7,9,19,0.95)',
          border: `1px solid ${info.borderColor}`,
          boxShadow: `0 4px 20px ${info.glowColor}`,
        }}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-sm">{info.icon}</span>
          <span className="font-display font-bold text-[10px] uppercase tracking-wider" style={{ color: info.color }}>
            {info.label}
          </span>
        </div>
        <p className="text-[9px] text-slate-400 leading-relaxed mb-1.5">{info.desc}</p>
        <div
          className="text-[8px] font-bold font-mono tracking-wider px-1.5 py-0.5 rounded"
          style={{ color: info.color, background: info.bgColor, border: `1px solid ${info.borderColor}` }}
        >
          {info.effect}
        </div>
      </div>
    </div>
  );
}

// ─── Single Item Slot ─────────────────────────────────────────────────────────
function ItemSlot({
  info,
  count,
  active,
  timeRemaining,
  maxTime,
}: {
  info: typeof ITEM_INFO.flask;
  count?: number;
  active: boolean;
  timeRemaining?: number;
  maxTime?: number;
}) {
  const [hovered, setHovered] = useState(false);

  // Tính % còn lại cho circular countdown
  const progressPct = (timeRemaining && maxTime && timeRemaining > 0)
    ? Math.min(1, timeRemaining / maxTime)
    : 0;

  const size = 44;
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = circumference * progressPct;

  return (
    <div className="relative flex flex-col items-center" style={{ minWidth: 52 }}>
      <div
        className="relative flex flex-col items-center cursor-help"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Circular progress ring (chỉ hiện khi có timer) */}
        {timeRemaining !== undefined && timeRemaining > 0 && (
          <svg
            width={size + 8}
            height={size + 8}
            className="absolute -top-1 -left-1 -rotate-90"
            style={{ pointerEvents: 'none' }}
          >
            {/* Background ring */}
            <circle
              cx={(size + 8) / 2}
              cy={(size + 8) / 2}
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={3}
            />
            {/* Progress arc */}
            <circle
              cx={(size + 8) / 2}
              cy={(size + 8) / 2}
              r={radius}
              fill="none"
              stroke={info.color}
              strokeWidth={3}
              strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 4px ${info.glowColor})`, transition: 'stroke-dasharray 0.5s linear' }}
            />
          </svg>
        )}

        {/* Icon box */}
        <div
          className="flex items-center justify-center rounded-xl transition-all duration-300"
          style={{
            width: size,
            height: size,
            background: active ? info.bgColor : 'rgba(255,255,255,0.03)',
            border: `1px solid ${active ? info.borderColor : 'rgba(255,255,255,0.08)'}`,
            boxShadow: active ? `0 0 12px ${info.glowColor}` : 'none',
            opacity: active ? 1 : 0.45,
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
          }}
        >
          <span style={{ fontSize: 20 }}>{info.icon}</span>
        </div>

        {/* Count badge (chỉ cho flask) */}
        {count !== undefined && (
          <div
            className="absolute -bottom-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-mono font-black text-[9px] transition-all duration-300"
            style={{
              background: count > 0 ? info.color : 'rgba(100,116,139,0.8)',
              color: count > 0 ? '#07091388' : '#94a3b8',
              boxShadow: count > 0 ? `0 0 8px ${info.glowColor}` : 'none',
              border: '1px solid rgba(0,0,0,0.3)',
              padding: '0 3px',
            }}
          >
            x{count}
          </div>
        )}

        {/* Timer text (giây còn lại) */}
        {timeRemaining !== undefined && timeRemaining > 0 && (
          <div
            className="absolute -bottom-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-mono font-black text-[9px]"
            style={{
              background: info.color,
              color: '#07091388',
              boxShadow: `0 0 8px ${info.glowColor}`,
              border: '1px solid rgba(0,0,0,0.3)',
              padding: '0 3px',
            }}
          >
            {timeRemaining}s
          </div>
        )}
      </div>

      {/* Label */}
      <span
        className="font-mono text-[8px] font-bold uppercase tracking-wider mt-1"
        style={{ color: active ? info.color : '#475569' }}
      >
        {info.label.split(' ')[0]}
      </span>

      {/* Tooltip */}
      <ItemTooltip info={info} visible={hovered} />
    </div>
  );
}

// ─── Items Quick Bar ────────────────────────────────────────────────────────────
function ItemsQuickBar({
  flasks,
  shieldRemaining,
  wingsRemaining,
  isKaizenMode,
}: {
  flasks: number;
  shieldRemaining: number;
  wingsRemaining: number;
  isKaizenMode: boolean;
}) {
  return (
    <div
      className="flex items-end gap-2 px-3 py-2 rounded-2xl backdrop-blur-md"
      style={{
        background: 'rgba(11,14,38,0.80)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
      }}
    >
      <ItemSlot
        info={ITEM_INFO.flask}
        count={flasks}
        active={flasks > 0}
      />
      <div className="w-px h-8 bg-white/8 self-center" />
      <ItemSlot
        info={ITEM_INFO.shield}
        active={shieldRemaining > 0}
        timeRemaining={shieldRemaining}
        maxTime={10}
      />
      <ItemSlot
        info={ITEM_INFO.wings}
        active={wingsRemaining > 0}
        timeRemaining={wingsRemaining}
        maxTime={8}
      />
      <ItemSlot
        info={ITEM_INFO.keyboard}
        active={isKaizenMode}
      />
    </div>
  );
}

// ─── Boss Timer Bar ────────────────────────────────────────────────────────────
function BossTimerBar({
  timeElapsed,
  bossTriggerDelaySec,
}: {
  timeElapsed: number;
  bossTriggerDelaySec: number;
}) {
  const timeLeft = Math.max(0, bossTriggerDelaySec - timeElapsed);
  const ratio = Math.max(0, 1 - timeElapsed / bossTriggerDelaySec);
  const isWarning = timeLeft <= 10 && timeLeft > 0;
  const isPulsing = timeLeft <= 5 && timeLeft > 0;

  const barColor = isWarning ? '#ff3b30' : '#00e5ff';
  const glowColor = isWarning ? 'rgba(255,59,48,0.4)' : 'rgba(0,229,255,0.25)';

  const mm = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const ss = Math.floor(timeLeft % 60).toString().padStart(2, '0');

  return (
    <div
      className="w-full px-3 pt-1 pb-1.5"
      style={{
        background: 'rgba(7,9,19,0.75)',
        borderBottom: `1px solid ${isWarning ? 'rgba(255,59,48,0.3)' : 'rgba(0,229,255,0.15)'}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rotate-45"
            style={{
              background: barColor,
              boxShadow: `0 0 4px ${barColor}`,
              animation: isPulsing ? 'pulse 0.4s ease-in-out infinite' : 'none',
            }}
          />
          <span
            className="font-display text-[9px] font-bold uppercase tracking-widest"
            style={{
              color: barColor,
              animation: isWarning ? 'pulse 0.8s ease-in-out infinite' : 'none',
            }}
          >
            {isWarning ? '⚠️ BOSS SẮP XUẤT HIỆN' : '⏳ THỜI GIAN ĐẾN BOSS'}
          </span>
        </div>
        <span
          className="font-mono text-[10px] font-black tabular-nums"
          style={{
            color: barColor,
            textShadow: `0 0 8px ${barColor}`,
            animation: isPulsing ? 'pulse 0.4s ease-in-out infinite' : 'none',
          }}
        >
          {mm}:{ss}
        </span>
      </div>

      {/* Progress track */}
      <div
        className="relative h-2.5 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        {/* Fill */}
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
          style={{
            width: `${ratio * 100}%`,
            background: isWarning
              ? 'linear-gradient(90deg, #ff3b30, #ff6b00)'
              : 'linear-gradient(90deg, #00e5ff, #0054a6)',
            boxShadow: `0 0 8px ${glowColor}`,
          }}
        />
        {/* Shimmer overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s linear infinite',
          }}
        />
        {/* Segment ticks */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 h-full w-px"
            style={{ left: `${(i + 1) * 20}%`, background: 'rgba(0,0,0,0.3)' }}
          />
        ))}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
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
  cooldownRemaining = 0,
  shieldRemaining = 0,
  wingsRemaining = 0,
  onPauseToggle,
  groundBugsDefeated = 0,
  flyingBugsDefeated = 0,
  bossTriggerDelaySec = BOSS_DELAY_SEC,
}: HUDProps) {
  const isKaizenMode = isKaizenModeProp !== undefined ? isKaizenModeProp : (energy >= 100 || phase === 'map_clear');
  const isBossPhase  = phase === 'boss';
  const isRunnerPhase = phase === 'runner';
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
        <div className="flex flex-col">
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
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-[11px] text-slate-400 tracking-widest font-bold tabular-nums bg-navy-medium/50 px-2 py-0.5 rounded border border-slate-700/30">
                  ⏱ {formatTime(timeElapsed)}
                </span>
                {onPauseToggle && (
                  <button
                    onClick={onPauseToggle}
                    className="bg-navy-medium/85 hover:bg-brand-cyan hover:text-navy-dark px-2 py-0.5 rounded border border-brand-cyan/40 text-[9px] font-bold text-slate-300 pointer-events-auto active:scale-95 transition-all cursor-pointer"
                  >
                    ⏸️ TẠM DỪNG
                  </button>
                )}
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

          {/* Boss Timer Bar — chỉ hiện trong phase runner */}
          {isRunnerPhase && (
            <BossTimerBar
              timeElapsed={timeElapsed}
              bossTriggerDelaySec={bossTriggerDelaySec}
            />
          )}
        </div>

        {/* Defeated Bugs Counter Panel */}
        {(groundBugsDefeated > 0 || flyingBugsDefeated > 0) && (
          <div className="absolute right-3 top-16 flex flex-col gap-1.5 pointer-events-auto">
            {groundBugsDefeated > 0 && (
              <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 px-2.5 py-1 rounded-xl shadow-[0_0_12px_rgba(148,163,184,0.15)] backdrop-blur-sm">
                <span className="text-xs">🐛</span>
                <span className="text-[9px] font-bold text-slate-300 font-mono tracking-wider uppercase">
                  STAGING BUG: x{groundBugsDefeated}
                </span>
              </div>
            )}
            {flyingBugsDefeated > 0 && (
              <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 px-2.5 py-1 rounded-xl shadow-[0_0_12px_rgba(148,163,184,0.15)] backdrop-blur-sm">
                <span className="text-xs">🐝</span>
                <span className="text-[9px] font-bold text-slate-300 font-mono tracking-wider uppercase">
                  PROD BUG: x{flyingBugsDefeated}
                </span>
              </div>
            )}
          </div>
        )}

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
        <footer className="w-full flex items-end justify-between gap-3 px-3 py-2 bg-navy-dark/80 backdrop-blur-md border-t border-slate-800/60 pointer-events-auto">

          {/* LEFT — Items Quick Bar */}
          <ItemsQuickBar
            flasks={flasks}
            shieldRemaining={shieldRemaining}
            wingsRemaining={wingsRemaining}
            isKaizenMode={isKaizenMode}
          />

          {/* CENTER — Kaizen Energy segments */}
          <div
            className={`flex-1 max-w-sm bg-navy-medium/60 px-4 py-2.5 rounded-2xl border-2 backdrop-blur-md relative ${
              cooldownRemaining > 0 ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.25)]' :
              isKaizenMode ? 'border-brand-red shadow-[0_0_20px_rgba(255,59,48,0.3)]' : 'border-slate-700/60'
            }`}
          >
            {/* Label row */}
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-1.5 h-1.5 rotate-45 ${
                    cooldownRemaining > 0 ? 'bg-orange-500 animate-pulse' :
                    isKaizenMode ? 'bg-brand-red animate-pulse' : 'bg-brand-cyan'
                  }`}
                />
                <span
                  className={`font-display text-[10px] font-bold uppercase tracking-wider ${
                    cooldownRemaining > 0 ? 'text-orange-500 animate-pulse' :
                    isKaizenMode ? 'text-brand-red text-glow-red animate-pulse' : 'text-slate-300'
                  }`}
                >
                  {cooldownRemaining > 0 ? '⏳ KAIZEN COOLDOWN ⏳' :
                   isKaizenMode ? '⚡ KAIZEN AMMO ⚡' : 'KAIZEN ENERGY'}
                </span>
              </div>
              <span
                className={`font-mono text-[10px] font-bold ${
                  cooldownRemaining > 0 ? 'text-orange-500 animate-pulse' :
                  isKaizenMode ? 'text-brand-red animate-pulse' : 'text-brand-cyan'
                }`}
              >
                {cooldownRemaining > 0 ? `${cooldownRemaining}s` :
                 isKaizenMode ? `${filledSegments}/10` : `${Math.floor(energy)}%`}
              </span>
            </div>

            {/* Segment bar */}
            <div className="flex gap-0.5">
              {[...Array(ENERGY_SEGMENTS)].map((_, i) => {
                const filled = cooldownRemaining > 0 ? false : (i < filledSegments);
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
            {cooldownRemaining > 0 ? (
              <div className="text-[9px] text-center text-orange-500 font-bold animate-pulse mt-1.5 tracking-wider font-mono">
                HỆ THỐNG ĐANG RE-COMPILE... VUI LÒNG ĐỢI!
              </div>
            ) : isKaizenMode ? (
              <div className="text-[9px] text-center text-brand-red font-bold animate-pulse mt-1.5 tracking-wider font-mono">
                ẤN SPACE → KAIZEN KEYBOARD!
              </div>
            ) : null}

            {/* Corner accents */}
            <div className={`absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 rounded-tl-sm ${
              cooldownRemaining > 0 ? 'border-orange-500' :
              isKaizenMode ? 'border-brand-red' : 'border-brand-cyan'
            }`} />
            <div className={`absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 rounded-tr-sm ${
              cooldownRemaining > 0 ? 'border-orange-500' :
              isKaizenMode ? 'border-brand-red' : 'border-brand-cyan'
            }`} />
          </div>

          {/* RIGHT — Spacer */}
          <div className="w-[84px] shrink-0" />
        </footer>
      </div>
    </>
  );
}
