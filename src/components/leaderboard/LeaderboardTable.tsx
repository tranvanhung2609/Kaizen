'use client';

import React from 'react';
import type { PlayerRow, DeptRow, RunRow } from '@/app/leaderboard/page';

const MAP_META: Record<string, { label: string; icon: string; color: string; border: string; bg: string }> = {
  hanoi: { label: 'Hà Nội', icon: '⛩️', color: 'text-brand-cyan', border: 'border-brand-cyan/40', bg: 'bg-brand-cyan/10' },
  tokyo: { label: 'Tokyo', icon: '🗼', color: 'text-gold', border: 'border-gold/40', bg: 'bg-gold/10' },
  danang: { label: 'Đà Nẵng', icon: '🌉', color: 'text-brand-red', border: 'border-brand-red/40', bg: 'bg-brand-red/10' },
};

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m > 0 ? `${m}p ${sec}s` : `${sec}s`;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
         ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function RankBadge({ rank, hasPlayed, score }: { rank: number; hasPlayed: boolean; score: number }) {
  const showIcon = hasPlayed && score > 0;
  if (rank === 1 && showIcon) return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-600 via-yellow-400 to-yellow-200 flex items-center justify-center border border-yellow-300 shadow-[0_0_12px_rgba(255,215,0,0.6)] mx-auto animate-pulse-slow font-black">
      👑
    </div>
  );
  if (rank === 2 && showIcon) return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-500 via-slate-300 to-slate-100 flex items-center justify-center border border-slate-400 shadow-[0_0_8px_rgba(200,200,200,0.4)] mx-auto font-black">
      🥈
    </div>
  );
  if (rank === 3 && showIcon) return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-700 via-orange-500 to-orange-300 flex items-center justify-center border border-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.4)] mx-auto font-black">
      🥉
    </div>
  );
  return (
    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border mx-auto font-mono
      ${rank <= 3 && showIcon ? 'border-gold/30 text-gold bg-gold/5' : 'border-slate-800/80 bg-slate-900/60 text-slate-500'}`}>
      {rank}
    </div>
  );
}

// ─── Esports 3D Podium ─────────────────────────────────────────────────────────
function Podium({ top3, scoreKey }: {
  top3: PlayerRow[];
  scoreKey: keyof Pick<PlayerRow, 'totalScore' | 'hanoiScore' | 'tokyoScore' | 'danangScore'>;
}) {
  const played = top3.filter((p) => p.hasPlayed && p[scoreKey] > 0);
  if (played.length === 0) return null;

  // Re-order top3 to display: [Silver (2), Gold (1), Bronze (3)]
  const displayOrder: (PlayerRow | null)[] = [null, null, null];
  
  played.forEach((p) => {
    if (p.rank === 1) displayOrder[1] = p;
    else if (p.rank === 2) displayOrder[0] = p;
    else if (p.rank === 3) displayOrder[2] = p;
  });

  const validOrder = displayOrder.filter((p): p is PlayerRow => p !== null);

  return (
    <div className="w-full flex items-end justify-center gap-4 md:gap-8 pt-8 pb-4 px-4 bg-navy-dark/40 border-b border-slate-800/60 rounded-t-2xl">
      {validOrder.map((player, vi) => {
        const isGold = player.rank === 1;
        const isSilver = player.rank === 2;
        const isBronze = player.rank === 3;

        // Visual properties mapping
        const heightCls = isGold ? 'h-52' : isSilver ? 'h-44' : 'h-36';
        const pedestalCls = isGold ? 'pedestal-1' : isSilver ? 'pedestal-2' : 'pedestal-3';
        const borderGlow = isGold 
          ? 'border-gold shadow-[0_0_24px_rgba(255,215,0,0.45)]' 
          : isSilver 
          ? 'border-slate-400 shadow-[0_0_16px_rgba(148,163,184,0.25)]' 
          : 'border-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.25)]';
        const scoreColor = isGold 
          ? 'text-gold text-glow-gold' 
          : isSilver 
          ? 'text-slate-300 font-semibold' 
          : 'text-orange-400';

        return (
          <div
            key={player.userId}
            className={`flex flex-col items-center gap-2 flex-1 max-w-[170px] ${heightCls} justify-end animate-slide-up`}
            style={{ animationDelay: `${vi * 100}ms` }}
          >
            {/* Crown / Badge */}
            {isGold ? (
              <div className="text-3xl animate-bounce duration-1000 select-none">👑</div>
            ) : isSilver ? (
              <div className="text-2xl select-none">🥈</div>
            ) : (
              <div className="text-2xl select-none">🥉</div>
            )}

            {/* Avatar display */}
            <div className="relative">
              <img
                src={player.avatar}
                alt={player.name}
                className={`rounded-full border-2 object-cover ${isGold ? 'w-16 h-16' : 'w-14 h-14'} ${borderGlow} bg-navy-dark`}
              />
              {player.isCurrentUser && (
                <div className="absolute -top-1 -right-1 bg-brand-cyan border border-navy-dark text-navy-dark text-[8px] font-black px-1 rounded-full shadow-md">
                  BẠN
                </div>
              )}
            </div>

            {/* Pedestal */}
            <div className={`podium-pedestal ${pedestalCls} w-full text-center`}>
              <div className="flex flex-col items-center w-full min-w-0">
                <span className="text-white font-display font-extrabold text-[11px] md:text-xs leading-tight truncate w-full px-1">
                  {player.name}
                </span>
                <span className="text-[9px] text-slate-500 font-mono truncate w-full px-1.5 uppercase mt-0.5">
                  {player.department || 'VTI'}
                </span>
                <span className={`font-display font-black text-sm md:text-base mt-1.5 leading-none ${scoreColor}`}>
                  {player[scoreKey].toLocaleString()}
                </span>
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
}

// ─── Individual Run History Table ─────────────────────────────────────────────
function RunTable({ data }: { data: RunRow[] }) {
  if (data.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="text-5xl">🎮</div>
      <p className="font-display font-bold text-white text-lg">Chưa có lịch sử chơi</p>
      <p className="text-slate-400 text-sm">Hãy bắt đầu chạy deadline và tạo dấu ấn đầu tiên!</p>
      <a href="/game"
         className="mt-2 px-6 py-3 rounded-xl bg-brand-cyan hover:bg-cyan-400 text-navy-dark font-extrabold text-sm transition-all shadow-lg">
        🎮 CHIẾN GAME NGAY
      </a>
    </div>
  );

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-navy-medium/60 border-b border-slate-800 text-[10px] uppercase font-mono font-bold tracking-widest text-slate-500">
            <th className="py-4 px-6">Lượt</th>
            <th className="py-4 px-6">Chặng Chạy</th>
            <th className="py-4 px-6 text-right">Điểm Số</th>
            <th className="py-4 px-6 text-center hidden md:table-cell">Thời Gian</th>
            <th className="py-4 px-6 text-center hidden md:table-cell">Hạ Boss</th>
            <th className="py-4 px-6 text-right hidden lg:table-cell">Thời Gian Chạy</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/40 text-xs">
          {data.map((run, idx) => {
            const meta = MAP_META[run.mapKey] || { label: run.mapKey, icon: '🗺', color: 'text-slate-300', border: 'border-slate-800', bg: 'bg-slate-900' };
            
            // Xếp hạng run: S, A, B, C
            let rankBadge = { label: 'C', bg: 'bg-slate-800/50', border: 'border-slate-700', text: 'text-slate-400' };
            if (run.score >= 5000) rankBadge = { label: 'S', bg: 'bg-gold/10', border: 'border-gold/30', text: 'text-gold' };
            else if (run.score >= 3000) rankBadge = { label: 'A', bg: 'bg-brand-cyan/10', border: 'border-brand-cyan/30', text: 'text-brand-cyan' };
            else if (run.score >= 1500) rankBadge = { label: 'B', bg: 'bg-navy-light/60', border: 'border-slate-700', text: 'text-slate-300' };

            return (
              <tr key={run.id} className="hover:bg-slate-800/20 transition-colors">
                <td className="py-3.5 px-6 text-slate-500 font-mono">#{data.length - idx}</td>
                <td className="py-3.5 px-6">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{meta.icon}</span>
                    <span className={`font-bold font-display ${meta.color}`}>{meta.label}</span>
                  </div>
                </td>
                <td className="py-3.5 px-6 text-right">
                  <div className="inline-flex items-center gap-2.5">
                    <span className="font-display font-extrabold text-brand-cyan text-glow-cyan text-sm">
                      {run.score.toLocaleString()}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black border font-mono ${rankBadge.bg} ${rankBadge.border} ${rankBadge.text}`}>
                      {rankBadge.label}
                    </span>
                  </div>
                </td>
                <td className="py-3.5 px-6 text-center font-mono text-slate-400 hidden md:table-cell">
                  {fmtTime(run.completionTime)}
                </td>
                <td className="py-3.5 px-6 text-center hidden md:table-cell">
                  {run.bossCleared ? (
                    <span className="px-2 py-0.5 rounded bg-brand-cyan/15 text-brand-cyan font-bold text-[9px] uppercase border border-brand-cyan/20">
                      SUCCESS
                    </span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td className="py-3.5 px-6 text-right text-slate-500 font-mono hidden lg:table-cell">
                  {fmtDate(run.playedAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Department Leaderboard Table ──────────────────────────────────────────────
function PlayerTable({ data, activeTab, highlightUserId }: { data: PlayerRow[]; activeTab: string; highlightUserId?: string }) {
  const scoreKey = activeTab === 'hanoi' ? 'hanoiScore' :
                   activeTab === 'tokyo' ? 'tokyoScore' :
                   activeTab === 'danang' ? 'danangScore' : 'totalScore';

  const top3 = data.slice(0, 3);

  if (data.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="text-5xl">🏢</div>
      <p className="text-slate-400 text-sm">Chưa có thành viên nào của bộ phận này ghi nhận thành tích.</p>
    </div>
  );

  return (
    <div className="flex flex-col">
      <Podium top3={top3} scoreKey={scoreKey as any} />
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-navy-medium/60 border-b border-slate-800 text-[10px] uppercase font-mono font-bold tracking-widest text-slate-500">
              <th className="py-4 px-6 text-center w-16">Hạng</th>
              <th className="py-4 px-6">Chiến Binh</th>
              <th className="py-4 px-6 hidden md:table-cell">Bộ Phận</th>
              <th className={`py-4 px-6 text-center hidden sm:table-cell ${activeTab === 'hanoi' ? 'text-brand-cyan' : ''}`}>⛩️ Hà Nội</th>
              <th className={`py-4 px-6 text-center hidden sm:table-cell ${activeTab === 'tokyo' ? 'text-gold' : ''}`}>🗼 Tokyo</th>
              <th className={`py-4 px-6 text-center hidden sm:table-cell ${activeTab === 'danang' ? 'text-brand-red' : ''}`}>🌉 Đà Nẵng</th>
              <th className={`py-4 px-6 text-right ${activeTab === 'overall' ? 'text-brand-cyan' : ''}`}>Tổng Điểm</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40 text-xs">
            {data.map((row) => {
              const displayScore = row[scoreKey as keyof PlayerRow] as number;
              
              // Custom current user highlighting
              const isCurrentUser = row.isCurrentUser;
              const isHighlighted = !!highlightUserId && row.userId === highlightUserId;
              let rowStyle = 'hover:bg-slate-800/20';
              if (isHighlighted) {
                // Winner highlight — golden glow khi redirect từ game victory
                rowStyle = 'bg-gradient-to-r from-yellow-500/10 to-brand-cyan/10 border-y-2 border-gold/60 shadow-[0_0_30px_rgba(255,215,0,0.25)]';
              } else if (isCurrentUser) {
                rowStyle = 'bg-brand-cyan/10 border-y border-brand-cyan/35 text-glow-cyan shadow-[0_0_15px_rgba(0,229,255,0.1)]';
              } else if (!row.hasPlayed) {
                rowStyle = 'opacity-55 hover:bg-slate-800/10';
              }

              return (
                <tr key={row.userId} className={`transition-colors ${rowStyle}`}>
                  <td className="py-3.5 px-6 text-center">
                    <RankBadge rank={row.rank} hasPlayed={row.hasPlayed} score={displayScore} />
                  </td>
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={row.avatar}
                          alt={playerDisplayName(row)}
                          className={`w-9 h-9 rounded-xl object-cover bg-slate-800 shrink-0 ${
                            isCurrentUser ? 'border-2 border-brand-cyan' : 'border border-slate-700'
                          }`}
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          {isCurrentUser && (
                            <span className="led-indicator led-green animate-pulse inline-block w-2.5 h-2.5 shrink-0" />
                          )}
                          <span className={`font-bold text-xs ${isCurrentUser ? 'text-brand-cyan font-black' : 'text-slate-200'}`}>
                            {playerDisplayName(row)}
                          </span>
                          {isCurrentUser && (
                            <span className="bg-brand-cyan text-navy-dark text-[8px] font-black px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                              YOU
                            </span>
                          )}
                        </div>
                        {/* Map completion badge line */}
                        <div className="flex gap-2.5 mt-1 text-[9px] font-mono text-slate-500">
                          {row.hanoiScore > 0 && <span>HN ⛩️</span>}
                          {row.tokyoScore > 0 && <span>TK 🗼</span>}
                          {row.danangScore > 0 && <span>ĐN 🌉</span>}
                          {!row.hasPlayed && <span className="text-slate-600">Chưa bắt đầu hành trình</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 hidden md:table-cell">
                    <span className="font-mono bg-slate-800/50 px-2.5 py-1 rounded-lg border border-slate-700/40 text-slate-400">
                      {row.department || 'VTI'}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-center font-mono text-slate-400 hidden sm:table-cell">
                    <span className={row.hanoiScore > 0 ? activeTab === 'hanoi' ? 'text-brand-cyan font-bold text-glow-cyan' : 'text-slate-300' : 'text-slate-700'}>
                      {row.hanoiScore > 0 ? row.hanoiScore.toLocaleString() : '—'}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-center font-mono text-slate-400 hidden sm:table-cell">
                    <span className={row.tokyoScore > 0 ? activeTab === 'tokyo' ? 'text-gold font-bold text-glow-gold' : 'text-slate-300' : 'text-slate-700'}>
                      {row.tokyoScore > 0 ? row.tokyoScore.toLocaleString() : '—'}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-center font-mono text-slate-400 hidden sm:table-cell">
                    <span className={row.danangScore > 0 ? activeTab === 'danang' ? 'text-brand-red font-bold text-glow-red' : 'text-slate-300' : 'text-slate-700'}>
                      {row.danangScore > 0 ? row.danangScore.toLocaleString() : '—'}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <span className={`font-display font-black text-sm ${
                      row.totalScore > 0
                        ? isCurrentUser ? 'text-brand-cyan text-glow-cyan' : 'text-slate-200'
                        : 'text-slate-600'
                    }`}>
                      {row.totalScore > 0 ? row.totalScore.toLocaleString() : '0'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Department Group-wise Leaderboard Table ──────────────────────────────────
function DeptTable({ data, activeTab }: { data: DeptRow[]; activeTab: string }) {
  if (data.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="text-5xl">🏭</div>
      <p className="text-slate-400 text-sm">Chưa có dữ liệu phòng ban nào được thống kê.</p>
    </div>
  );

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-navy-medium/60 border-b border-slate-800 text-[10px] uppercase font-mono font-bold tracking-widest text-slate-500">
            <th className="py-4 px-6 text-center w-16">Hạng</th>
            <th className="py-4 px-6">Phòng Ban / Bộ Phận</th>
            <th className="py-4 px-6 text-center">Số Chiến Binh</th>
            <th className={`py-4 px-6 text-center hidden sm:table-cell ${activeTab === 'hanoi' ? 'text-brand-cyan' : ''}`}>HN Kỷ Lục</th>
            <th className={`py-4 px-6 text-center hidden sm:table-cell ${activeTab === 'tokyo' ? 'text-gold' : ''}`}>TK Kỷ Lục</th>
            <th className={`py-4 px-6 text-center hidden sm:table-cell ${activeTab === 'danang' ? 'text-brand-red' : ''}`}>ĐN Kỷ Lục</th>
            <th className="py-4 px-6 text-center hidden md:table-cell">Điểm Kỷ Lục Tổng</th>
            <th className="py-4 px-6 text-right">Avg Điểm Nhóm</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/40 text-xs">
          {data.map((row) => {
            const sortScore = activeTab === 'hanoi' ? row.hanoiBest :
                              activeTab === 'tokyo' ? row.tokyoBest :
                              activeTab === 'danang' ? row.danangBest : row.avgTotal;
                              
            const isCurrentDept = row.isCurrentDept;
            let rowStyle = 'hover:bg-slate-800/20';
            if (isCurrentDept) {
              rowStyle = 'bg-brand-cyan/10 border-y border-brand-cyan/35 text-glow-cyan shadow-[0_0_15px_rgba(0,229,255,0.1)]';
            } else if (!row.hasPlayed) {
              rowStyle = 'opacity-55 hover:bg-slate-800/10';
            }

            return (
              <tr key={row.deptName} className={`transition-colors ${rowStyle}`}>
                <td className="py-4 px-6 text-center">
                  <RankBadge rank={row.rank} hasPlayed={row.hasPlayed} score={sortScore} />
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black font-mono border shrink-0 ${
                      isCurrentDept ? 'bg-brand-cyan/15 border-brand-cyan text-brand-cyan' :
                      row.rank === 1 && row.hasPlayed ? 'bg-gold/15 border-gold text-gold shadow-[0_0_10px_rgba(255,215,0,0.2)]' :
                      'bg-slate-800/60 border-slate-700/60 text-slate-400'
                    }`}>
                      {row.deptName.slice(0, 3).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold ${isCurrentDept ? 'text-brand-cyan font-black' : 'text-slate-200'}`}>
                          {row.deptName}
                        </span>
                        {isCurrentDept && (
                          <span className="bg-brand-cyan text-navy-dark text-[8px] font-black px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                            TEAM
                          </span>
                        )}
                      </div>
                      {!row.hasPlayed && <span className="text-[9px] text-slate-600 font-mono mt-0.5">Chưa ghi nhận điểm số</span>}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className="font-mono bg-slate-800/50 px-2.5 py-1 rounded-lg border border-slate-700/40 text-slate-400">
                    {row.memberCount} thành viên
                  </span>
                </td>
                <td className="py-4 px-6 text-center font-mono text-slate-400 hidden sm:table-cell">
                  <span className={row.hanoiBest > 0 ? activeTab === 'hanoi' ? 'text-brand-cyan font-bold' : 'text-slate-300' : 'text-slate-700'}>
                    {row.hanoiBest > 0 ? row.hanoiBest.toLocaleString() : '—'}
                  </span>
                </td>
                <td className="py-4 px-6 text-center font-mono text-slate-400 hidden sm:table-cell">
                  <span className={row.tokyoBest > 0 ? activeTab === 'tokyo' ? 'text-gold font-bold' : 'text-slate-300' : 'text-slate-700'}>
                    {row.tokyoBest > 0 ? row.tokyoBest.toLocaleString() : '—'}
                  </span>
                </td>
                <td className="py-4 px-6 text-center font-mono text-slate-400 hidden sm:table-cell">
                  <span className={row.danangBest > 0 ? activeTab === 'danang' ? 'text-brand-red font-bold' : 'text-slate-300' : 'text-slate-700'}>
                    {row.danangBest > 0 ? row.danangBest.toLocaleString() : '—'}
                  </span>
                </td>
                <td className="py-4 px-6 text-center font-mono text-slate-200 hidden md:table-cell">
                  <strong>{row.maxTotal > 0 ? row.maxTotal.toLocaleString() : '—'}</strong>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className={`font-display font-black text-sm md:text-base ${
                    row.avgTotal > 0 ? isCurrentDept ? 'text-brand-cyan text-glow-cyan' : 'text-brand-red text-glow-red' : 'text-slate-600'
                  }`}>
                    {row.avgTotal > 0 ? row.avgTotal.toLocaleString() : '0'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Auxiliary Helper ────────────────────────────────────────────────────────
function playerDisplayName(row: PlayerRow): string {
  return row.name || 'Chiến binh VTI';
}

// ─── Main Component Router ───────────────────────────────────────────────────
export interface LeaderboardTableProps {
  scope: 'personal' | 'department' | 'vti';
  activeTab: string;
  runData?: RunRow[];
  playerData?: PlayerRow[];
  deptData?: DeptRow[];
  highlightUserId?: string;
}

export default function LeaderboardTable({ scope, activeTab, runData, playerData, deptData, highlightUserId }: LeaderboardTableProps) {
  if (scope === 'personal') return <RunTable data={runData ?? []} />;
  if (scope === 'vti')      return <DeptTable data={deptData ?? []} activeTab={activeTab} />;
  return <PlayerTable data={playerData ?? []} activeTab={activeTab} highlightUserId={highlightUserId} />;
}
