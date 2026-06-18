'use client';

interface MapJourneyPanelProps {
  currentMapKey: string; // 'hanoi' | 'tokyo' | 'danang'
  score: number;
  energy: number;
  onSelectMap?: (mapKey: string) => void;
}

const MAPS = [
  {
    key: 'hanoi',
    label: 'Hà Nội',
    icon: '🏯',
    color: 'brand-cyan',
    borderClass: 'border-brand-cyan',
    textClass: 'text-brand-cyan',
    glowClass: 'text-glow-cyan',
    bgClass: 'bg-brand-cyan/10',
    flavor: 'Khởi đầu hành trình tại thủ đô ngàn năm văn hiến.',
  },
  {
    key: 'tokyo',
    label: 'Tokyo',
    icon: '🗼',
    color: 'gold',
    borderClass: 'border-gold',
    textClass: 'text-gold',
    glowClass: 'text-glow-gold',
    bgClass: 'bg-gold/10',
    flavor: 'Chinh phục đất nước Mặt Trời Mọc công nghệ cao.',
  },
  {
    key: 'danang',
    label: 'Đà Nẵng',
    icon: '🌉',
    color: 'brand-red',
    borderClass: 'border-brand-red',
    textClass: 'text-brand-red',
    glowClass: 'text-glow-red',
    bgClass: 'bg-brand-red/10',
    flavor: 'Chặng cuối — thành phố đáng sống nhất Việt Nam.',
  },
];

const CONTROLS = [
  { keys: ['W', '↑'], action: 'Nhảy / Bay lên' },
  { keys: ['S', '↓'], action: 'Cúi / Hạ độ cao' },
  { keys: ['A', 'D', '←', '→'], action: 'Di chuyển Trái/Phải' },
  { keys: ['SPACE'], action: 'Kích hoạt Kaizen / Bắn' },
];

function getRankLabel(score: number) {
  if (score >= 5000) return { label: 'S', cls: 'text-gold text-glow-gold' };
  if (score >= 3000) return { label: 'A', cls: 'text-brand-cyan text-glow-cyan' };
  if (score >= 1500) return { label: 'B', cls: 'text-slate-300' };
  if (score >= 500)  return { label: 'C', cls: 'text-slate-500' };
  return { label: '-', cls: 'text-slate-600' };
}

export default function MapJourneyPanel({ currentMapKey, score, energy, onSelectMap }: MapJourneyPanelProps) {
  const currentIdx = MAPS.findIndex((m) => m.key === currentMapKey);
  const rank = getRankLabel(score);

  return (
    <aside className="flex flex-col gap-4 w-full h-full overflow-y-auto pr-0.5 text-xs">

      {/* ── Current Score Card ─────────────────────────── */}
      <div className="game-container rounded-xl p-4 flex flex-col gap-1 border border-slate-800/60">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Điểm hiện tại</span>
        <div className="flex items-end gap-2">
          <span className="font-display text-2xl font-extrabold text-brand-cyan text-glow-cyan leading-none">
            {score.toLocaleString()}
          </span>
          <span className={`font-display text-lg font-extrabold leading-none mb-0.5 ${rank.cls}`}>
            {rank.label}
          </span>
        </div>
        {/* Energy mini-bar */}
        <div className="mt-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider">Kaizen Energy</span>
            <span className={`text-[9px] font-mono font-bold ${energy >= 100 ? 'text-brand-red animate-pulse' : 'text-brand-cyan'}`}>
              {Math.floor(energy)}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-navy-dark rounded-full overflow-hidden border border-slate-700/40">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                energy >= 100
                  ? 'bg-gradient-to-r from-brand-red to-orange-500 shadow-[0_0_8px_rgba(255,59,48,0.6)] animate-pulse'
                  : 'bg-gradient-to-r from-brand-cyan to-blue-400 shadow-[0_0_8px_rgba(0,229,255,0.4)]'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, energy))}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Map Journey ────────────────────────────────── */}
      <div className="game-container rounded-xl p-4 flex flex-col gap-1 border border-slate-800/60">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mb-2">Lộ trình</span>

        <div className="flex flex-col gap-0">
          {MAPS.map((map, idx) => {
            const isCleared = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            const isLocked  = idx > currentIdx;

            return (
              <div key={map.key} className="flex flex-col">
                {/* Map node */}
                <button
                  disabled={isLocked}
                  onClick={() => onSelectMap?.(map.key)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left ${
                    isCurrent
                      ? `${map.bgClass} border ${map.borderClass} shadow-sm`
                      : isCleared
                      ? 'bg-slate-800/30 border border-slate-700/40 hover:bg-slate-800/50 cursor-pointer'
                      : 'opacity-40 cursor-not-allowed'
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-xl shrink-0 ${
                      isCurrent ? map.bgClass : isCleared ? 'bg-slate-800' : 'bg-slate-900'
                    } border ${isCurrent ? map.borderClass : 'border-slate-700/40'}`}
                  >
                    {isCleared ? '✅' : isLocked ? '🔒' : map.icon}
                  </div>

                  {/* Info */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span
                      className={`font-display font-bold leading-tight truncate ${
                        isCurrent ? map.textClass + ' ' + map.glowClass : isCleared ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {map.label}
                    </span>
                    <span className="text-[9px] text-slate-500 leading-tight truncate">
                      {isCurrent ? map.flavor : isCleared ? 'Hoàn thành ✓' : 'Chưa mở khóa'}
                    </span>
                  </div>

                  {/* Status badge */}
                  {isCurrent && (
                    <span
                      className={`ml-auto text-[9px] font-bold font-mono uppercase px-1.5 py-0.5 rounded ${map.bgClass} ${map.textClass} border ${map.borderClass} shrink-0`}
                    >
                      NOW
                    </span>
                  )}
                </button>

                {/* Connector line between nodes */}
                {idx < MAPS.length - 1 && (
                  <div className="flex items-center justify-center my-0.5 ml-[22px]">
                    <div className="journey-connector h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Controls Guide ─────────────────────────────── */}
      <div className="game-container rounded-xl p-4 flex flex-col gap-3 border border-slate-800/60">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Điều khiển</span>
        <div className="flex flex-col gap-2">
          {CONTROLS.map((ctrl) => (
            <div key={ctrl.action} className="flex items-center justify-between gap-2">
              <div className="flex gap-1">
                {ctrl.keys.map((k) => (
                  <kbd
                    key={k}
                    className="px-1.5 py-0.5 rounded bg-navy-dark border border-slate-700 text-[10px] font-mono font-bold text-slate-300 shadow-sm"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
              <span className="text-slate-400 text-[10px] font-sans">{ctrl.action}</span>
            </div>
          ))}
        </div>
        <div className="mt-1 p-2 rounded-lg bg-brand-red/5 border border-brand-red/20 text-[9px] text-brand-red font-mono leading-relaxed">
          ⚡ SPACE khi Energy = 100% → <strong>Kaizen Mode!</strong>
        </div>
      </div>

      {/* ── VTI Badge ──────────────────────────────────── */}
      <div className="flex items-center justify-center gap-2 py-2 opacity-50">
        <div className="w-4 h-4 rounded bg-gradient-to-tr from-brand-red to-brand-cyan flex items-center justify-center text-[8px] font-bold text-white">
          VJ
        </div>
        <span className="text-[9px] text-slate-600 font-mono uppercase tracking-widest">
          Kaizen Journey © VTI
        </span>
      </div>
    </aside>
  );
}
