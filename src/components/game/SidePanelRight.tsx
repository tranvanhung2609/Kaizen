'use client';

import React from 'react';

interface Quest {
  id: string;
  label: string;
  target: number;
  current: number;
  reward: number; // Flasks
  completed: boolean;
}

interface SidePanelRightProps {
  flasksCount: number;
  onOpenShop: () => void;
  quests: Quest[];
  isCrtActive: boolean;
  setIsCrtActive: (val: boolean) => void;
  isScanlinesActive: boolean;
  setIsScanlinesActive: (val: boolean) => void;
  isSoundMuted: boolean;
  setIsSoundMuted: (val: boolean) => void;
  activeGender: string;
  onChangeGender: (val: string) => void;
  topPlayers: { rank: number; name: string; dept: string; score: number; avatar: string }[];
}

export default function SidePanelRight({
  flasksCount,
  onOpenShop,
  quests,
  isCrtActive,
  setIsCrtActive,
  isScanlinesActive,
  setIsScanlinesActive,
  isSoundMuted,
  setIsSoundMuted,
  activeGender,
  onChangeGender,
  topPlayers,
}: SidePanelRightProps) {
  return (
    <aside className="flex flex-col gap-4 w-full h-full text-xs">
      
      {/* ── SECTION 1: KAIZEN STORE TRIGGER ──────────────── */}
      <div className="game-container rounded-xl p-4 flex items-center justify-between border border-slate-800/60 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-brand-cyan/20 blur-xl pointer-events-none" />
        
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Bình nước tích lũy</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xl">💧</span>
            <span className="font-display text-lg font-black text-brand-cyan text-glow-cyan">
              {flasksCount}
            </span>
          </div>
        </div>

        <button
          onClick={onOpenShop}
          className="px-3 py-1.5 rounded-lg bg-brand-cyan/15 hover:bg-brand-cyan text-brand-cyan hover:text-navy-dark border border-brand-cyan/35 text-[10px] font-extrabold uppercase transition-all tracking-wider shadow-sm"
        >
          Cửa hàng
        </button>
      </div>

      {/* ── SECTION 2: MINI LEADERBOARD ─────────────────── */}
      <div className="game-container rounded-xl p-4 flex flex-col gap-2 border border-slate-800/60">
        <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Bảng Xếp Hạng Nhanh</span>
          <span className="text-[9px] text-brand-cyan font-bold">VTI Live</span>
        </div>

        <div className="flex flex-col gap-1.5">
          {topPlayers.length === 0 ? (
            <div className="text-center py-4 text-slate-500 font-mono text-[10px]">
              Chưa có lượt chơi nào
            </div>
          ) : (
            topPlayers.map((player) => (
              <div key={player.rank} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-2">
                  <span className={`w-4 text-center font-mono font-black text-[10px] ${
                    player.rank === 1 ? 'text-gold' : player.rank === 2 ? 'text-slate-400' : 'text-orange-500'
                  }`}>
                    #{player.rank}
                  </span>
                  <img src={player.avatar} alt={player.name} className="w-5 h-5 rounded bg-slate-800 border border-slate-700" />
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-200 truncate max-w-[80px]">{player.name}</span>
                    <span className="text-[8px] text-slate-500 leading-none">{player.dept}</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-brand-cyan text-glow-cyan text-[10px]">
                  {player.score.toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>


      {/* ── SECTION 3: DAILY QUESTS ─────────────────────── */}
      <div className="game-container rounded-xl p-4 flex flex-col gap-2.5 border border-slate-800/60">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono border-b border-slate-800/80 pb-1.5">
          Nhiệm Vụ Hàng Ngày
        </span>

        <div className="flex flex-col gap-2.5">
          {quests.map((quest) => {
            const pct = Math.min(100, Math.floor((quest.current / quest.target) * 100));
            return (
              <div key={quest.id} className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className={`font-semibold ${quest.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                    {quest.label}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">
                    {quest.current}/{quest.target}
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="h-1 bg-navy-dark rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      quest.completed ? 'bg-slate-700' : 'bg-brand-cyan'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[8px] text-slate-500 font-mono">
                  <span>{quest.completed ? 'Hoàn thành ✓' : 'Đang thực hiện...'}</span>
                  <span className="text-brand-cyan font-bold">+{quest.reward} 💧</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 4: SETTINGS ─────────────────────────── */}
      <div className="game-container rounded-xl p-4 flex flex-col gap-3 border border-slate-800/60">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono border-b border-slate-800/80 pb-1.5">
          Tùy Chỉnh Cabinet
        </span>

        <div className="flex flex-col gap-2.5">
          {/* CRT Toggle */}
          <div className="flex justify-between items-center">
            <span className="text-slate-300 font-semibold">Giả lập màn hình CRT</span>
            <label className="premium-switch">
              <input
                type="checkbox"
                checked={isCrtActive}
                onChange={(e) => setIsCrtActive(e.target.checked)}
              />
              <span className="premium-slider" />
            </label>
          </div>

          {/* Scanline Toggle */}
          <div className="flex justify-between items-center">
            <span className="text-slate-300 font-semibold">Đường kẻ quét (Scanlines)</span>
            <label className="premium-switch">
              <input
                type="checkbox"
                checked={isScanlinesActive}
                onChange={(e) => setIsScanlinesActive(e.target.checked)}
              />
              <span className="premium-slider" />
            </label>
          </div>

          {/* Sound Toggle */}
          <div className="flex justify-between items-center">
            <span className="text-slate-300 font-semibold">Tắt âm thanh game</span>
            <label className="premium-switch">
              <input
                type="checkbox"
                checked={isSoundMuted}
                onChange={(e) => setIsSoundMuted(e.target.checked)}
              />
              <span className="premium-slider" />
            </label>
          </div>

          {/* Gender Selector */}
          <div className="flex justify-between items-center border-t border-slate-800/60 pt-2.5 mt-1.5">
            <span className="text-slate-300 font-semibold">Nhân vật đại diện</span>
            <div className="flex bg-navy-dark p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => onChangeGender('male')}
                className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase transition-all duration-200 cursor-pointer ${
                  activeGender === 'male'
                    ? 'bg-brand-cyan text-navy-dark font-black shadow-[0_0_8px_rgba(0,229,255,0.4)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
                }`}
              >
                Nam
              </button>
              <button
                type="button"
                onClick={() => onChangeGender('female')}
                className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase transition-all duration-200 cursor-pointer ${
                  activeGender === 'female'
                    ? 'bg-brand-cyan text-navy-dark font-black shadow-[0_0_8px_rgba(0,229,255,0.4)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
                }`}
              >
                Nữ
              </button>
            </div>
          </div>
        </div>
      </div>

    </aside>
  );
}
