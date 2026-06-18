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

interface PersonalBest {
  totalScore: number;
  hanoiBestScore: number;
  tokyoBestScore: number;
  danangBestScore: number;
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
  personalBest: PersonalBest | null;
  isLoadingLeaderboard: boolean;
  onRefreshLeaderboard: () => void;
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
  personalBest,
  isLoadingLeaderboard,
  onRefreshLeaderboard,
}: SidePanelRightProps) {
  return (
    <aside className="flex flex-col gap-4 w-full h-full text-xs">

      {/* ── SECTION 0: KỶ LỤC CÁ NHÂN ─────────────────── */}
      <div className="game-container rounded-xl p-4 flex flex-col gap-3.5 border border-slate-800/60 bg-navy-medium/30 backdrop-blur-md">
        <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Kỷ Lục Cá Nhân</span>
          <span className="text-[9px] text-amber-500 font-bold font-mono">My Best</span>
        </div>

        <div className="flex flex-col gap-2.5">
          {/* Tổng Điểm Hành Trình */}
          <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent p-2.5 shadow-[0_0_12px_rgba(245,158,11,0.05)]">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🏆</span>
                <span className="font-bold text-slate-300 font-mono text-[9px] tracking-wide">TỔNG ĐIỂM</span>
              </div>
              <span className="font-mono font-black text-amber-400 text-[13px] tracking-wider" style={{ textShadow: '0 0 8px rgba(245,158,11,0.6)' }}>
                {personalBest ? personalBest.totalScore.toLocaleString() : '0'}
              </span>
            </div>
          </div>

          {/* Chi tiết từng màn chơi */}
          <div className="grid grid-cols-3 gap-1.5">
            {/* Hà Nội */}
            <div className="flex flex-col gap-0.5 items-center p-1.5 rounded-lg border border-red-500/15 bg-red-950/20">
              <span className="text-[8px] font-black text-red-400 font-mono tracking-wider">HÀ NỘI</span>
              <span className="font-mono font-extrabold text-slate-200 text-[10px]">
                {personalBest ? personalBest.hanoiBestScore.toLocaleString() : '0'}
              </span>
            </div>

            {/* Tokyo */}
            <div className="flex flex-col gap-0.5 items-center p-1.5 rounded-lg border border-pink-500/15 bg-pink-950/20">
              <span className="text-[8px] font-black text-pink-400 font-mono tracking-wider">TOKYO</span>
              <span className="font-mono font-extrabold text-slate-200 text-[10px]">
                {personalBest ? personalBest.tokyoBestScore.toLocaleString() : '0'}
              </span>
            </div>

            {/* Đà Nẵng */}
            <div className="flex flex-col gap-0.5 items-center p-1.5 rounded-lg border border-cyan-500/15 bg-cyan-950/20">
              <span className="text-[8px] font-black text-cyan-400 font-mono tracking-wider">ĐÀ NẴNG</span>
              <span className="font-mono font-extrabold text-slate-200 text-[10px]">
                {personalBest ? personalBest.danangBestScore.toLocaleString() : '0'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 1: MINI LEADERBOARD ─────────────────── */}
      <div className="game-container rounded-xl p-4 flex flex-col gap-2 border border-slate-800/60 bg-navy-medium/30 backdrop-blur-md relative">
        <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Bảng Xếp Hạng Nhanh</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onRefreshLeaderboard}
              disabled={isLoadingLeaderboard}
              className="p-1 rounded text-slate-400 hover:text-brand-cyan hover:bg-slate-800/50 active:scale-90 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center border border-transparent hover:border-slate-700/50"
              title="Làm mới"
            >
              <svg 
                className={`w-3 h-3 ${isLoadingLeaderboard ? 'animate-spin' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
              </svg>
            </button>
            <span className="text-[9px] text-brand-cyan font-bold font-mono">VTI Live</span>
          </div>
        </div>

        <div className={`flex flex-col gap-1.5 transition-all duration-300 ${isLoadingLeaderboard ? 'opacity-50 scale-[0.99]' : 'opacity-100'}`}>
          {topPlayers.length === 0 ? (
            <div className="text-center py-4 text-slate-500 font-mono text-[10px]">
              Chưa có lượt chơi nào
            </div>
          ) : (
            topPlayers.map((player) => (
              <div key={player.rank} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-2">
                  <span className={`w-4 text-center font-mono font-black text-[10px] ${
                    player.rank === 1 ? 'text-amber-400' : player.rank === 2 ? 'text-slate-300' : player.rank === 3 ? 'text-amber-600' : 'text-slate-500'
                  }`} style={player.rank <= 3 ? { textShadow: player.rank === 1 ? '0 0 6px rgba(251,191,36,0.6)' : '0 0 6px rgba(203,213,225,0.4)' } : undefined}>
                    #{player.rank}
                  </span>
                  <img src={player.avatar} alt={player.name} className="w-5 h-5 rounded bg-slate-800 border border-slate-700" />
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-200 truncate max-w-[80px]">{player.name}</span>
                    <span className="text-[8px] text-slate-500 leading-none">{player.dept}</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-brand-cyan text-[10px]" style={{ textShadow: '0 0 6px rgba(0,210,255,0.5)' }}>
                  {player.score.toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>


      {/* ── SECTION 2: SETTINGS ─────────────────────────── */}
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
