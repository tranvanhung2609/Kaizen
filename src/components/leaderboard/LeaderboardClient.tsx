'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition, useEffect, useRef } from 'react';
import LeaderboardTable from './LeaderboardTable';
import type { PlayerRow, DeptRow, RunRow } from '@/app/leaderboard/page';

interface LeaderboardClientProps {
  currentTab: 'overall' | 'hanoi' | 'tokyo' | 'danang';
  currentScope: 'personal' | 'department' | 'vti';
  myDept: string;
  myRank: number;
  myRunCount: number;
  userId?: string;
  runRows: RunRow[];
  playerRows: PlayerRow[];
  deptRows: DeptRow[];
  highlightUserId?: string;
}

const TABS = [
  { id: 'overall', label: '🏆 TỔNG HÀNH TRÌNH' },
  { id: 'hanoi', label: '⛩️ HÀ NỘI' },
  { id: 'tokyo', label: '🗼 TOKYO' },
  { id: 'danang', label: '🌉 ĐÀ NẴNG' },
] as const;

const SCOPES = [
  { id: 'personal', label: 'Cá Nhân', icon: '🧑', desc: 'Lịch sử lượt chơi cá nhân' },
  { id: 'department', label: 'Phòng Ban', icon: '🏢', desc: 'Thành viên cùng phòng ban' },
  { id: 'vti', label: 'VTI Tổng', icon: '🏭', desc: 'Xếp hạng toàn công ty' },
] as const;

export default function LeaderboardClient({
  currentTab,
  currentScope,
  myDept,
  myRank,
  myRunCount,
  runRows,
  playerRows,
  deptRows,
  highlightUserId,
}: LeaderboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const highlightRef = useRef<HTMLDivElement>(null);

  const highlightFromUrl = searchParams.get('highlight') || highlightUserId;
  const isJustSaved = !!searchParams.get('highlight');

  useEffect(() => {
    if (highlightFromUrl && highlightRef.current) {
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 600);
    }
  }, [highlightFromUrl]);

  const navigate = (tab: string, scope: string) => {
    const hParam = highlightFromUrl ? `&highlight=${highlightFromUrl}` : '';
    startTransition(() => router.push(`/leaderboard?tab=${tab}&scope=${scope}${hParam}`));
  };

  const totalCount = currentScope === 'personal' ? myRunCount : playerRows.length;

  const scopeDesc =
    currentScope === 'personal'
      ? `${myRunCount} lượt chơi của bạn`
      : currentScope === 'department'
        ? `${playerRows.length} thành viên ${myDept ? `(${myDept})` : ''}`
        : `${playerRows.length} người chơi toàn hệ thống`;

  const tabLabel =
    currentTab === 'hanoi'
      ? 'Hà Nội'
      : currentTab === 'tokyo'
        ? 'Tokyo'
        : currentTab === 'danang'
          ? 'Đà Nẵng'
          : 'Tổng hành trình';

  return (
    <div className="flex flex-col gap-6 z-10 relative">
      {isJustSaved && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '14px 20px',
            borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(0,255,135,0.12) 0%, rgba(0,84,166,0.08) 100%)',
            border: '1px solid rgba(0,255,135,0.35)',
            animation: 'slideDown 0.5s ease-out',
          }}
        >
          <span style={{ fontSize: 28 }}>🏆</span>
          <div>
            <div style={{ color: '#00ff87', fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
              Điểm đã được lưu thành công!
            </div>
            <div style={{ color: '#64748b', fontSize: 11, fontFamily: 'monospace' }}>
              Kết quả của bạn đã được cập nhật vào bảng xếp hạng VTI. Cuộn xuống để xem vị trí của bạn.
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-white tracking-wide uppercase flex items-center gap-2">
            ĐẤU TRƯỜNG KAIZEN LEADERBOARD
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Xếp hạng cá nhân, phòng ban và tổng user trong hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center">
          {myRank > 0 && currentScope !== 'personal' && (
            <div className="flex items-center gap-2.5 bg-navy-medium/80 border border-brand-cyan/40 px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(0,229,255,0.1)] shrink-0">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Hạng hiện tại</span>
              <span className="font-display font-extrabold text-2xl text-brand-cyan text-glow-cyan leading-none">
                #{myRank}
              </span>
              <span className="text-xs text-slate-500 font-mono">/ {totalCount}</span>
            </div>
          )}
          {currentScope === 'personal' && (
            <div className="flex items-center gap-2.5 bg-navy-medium/80 border border-brand-red/35 px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(255,59,48,0.1)] shrink-0">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Lượt đã chơi</span>
              <span className="font-display font-extrabold text-2xl text-brand-red leading-none animate-pulse">
                {myRunCount}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {SCOPES.map((scope) => {
          const active = currentScope === scope.id;
          const disabled = scope.id === 'department' && !myDept;

          let cardBorder = 'border-slate-800/80 hover:border-slate-700';
          let cardGlow = '';

          if (active) {
            if (scope.id === 'vti') {
              cardBorder = 'border-brand-red shadow-[0_0_15px_rgba(255,59,48,0.15)]';
              cardGlow = 'bg-brand-red/5';
            } else if (scope.id === 'department') {
              cardBorder = 'border-gold shadow-[0_0_15px_rgba(255,215,0,0.15)]';
              cardGlow = 'bg-gold/5';
            } else {
              cardBorder = 'border-brand-cyan shadow-[0_0_15px_rgba(0,229,255,0.15)]';
              cardGlow = 'bg-brand-cyan/5';
            }
          }

          return (
            <button
              key={scope.id}
              onClick={() => !disabled && navigate(currentTab, scope.id)}
              disabled={disabled || isPending}
              title={disabled ? 'Cập nhật phòng ban trong hồ sơ' : scope.desc}
              className={`text-left p-4 rounded-2xl border transition-all duration-300 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${cardBorder} ${cardGlow} bg-navy-medium/30 flex items-start gap-3 relative overflow-hidden`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border ${
                  active
                    ? scope.id === 'vti'
                      ? 'border-brand-red bg-brand-red/10'
                      : scope.id === 'department'
                        ? 'border-gold bg-gold/10'
                        : 'border-brand-cyan bg-brand-cyan/10'
                    : 'border-slate-700 bg-slate-800/40'
                }`}
              >
                {scope.icon}
              </div>
              <div className="flex flex-col min-w-0">
                <span
                  className={`font-display font-bold text-sm ${
                    active
                      ? scope.id === 'vti'
                        ? 'text-brand-red'
                        : scope.id === 'department'
                          ? 'text-gold'
                          : 'text-brand-cyan text-glow-cyan'
                      : 'text-slate-200'
                  }`}
                >
                  {scope.id === 'department' && myDept ? `${scope.label} (${myDept})` : scope.label}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 leading-relaxed font-sans">{scope.desc}</span>
              </div>
            </button>
          );
        })}
      </div>

      {currentScope !== 'personal' && (
        <div className="flex border-b border-slate-800/80 gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const isTabActive = currentTab === tab.id;
            let tabColor = 'border-transparent text-slate-400 hover:text-slate-200';
            if (isTabActive) {
              if (tab.id === 'hanoi') tabColor = 'border-brand-cyan text-brand-cyan text-glow-cyan font-bold';
              else if (tab.id === 'tokyo') tabColor = 'border-gold text-gold text-glow-gold font-bold';
              else if (tab.id === 'danang') tabColor = 'border-brand-red text-brand-red text-glow-red font-bold';
              else tabColor = 'border-brand-cyan text-brand-cyan text-glow-cyan font-bold';
            }

            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.id, currentScope)}
                disabled={isPending}
                className={`px-5 py-3.5 text-xs font-bold tracking-widest transition-all border-b-2 -mb-[2px] whitespace-nowrap cursor-pointer ${tabColor}`}
              >
                {tab.label}
              </button>
            );
          })}
          {isPending && (
            <div className="ml-auto self-center pr-2 flex items-center gap-1.5 text-slate-500 font-mono text-[10px]">
              <span>Đang cập nhật...</span>
              <div className="w-3 h-3 rounded-full border-2 border-brand-cyan/20 border-t-brand-cyan animate-spin" />
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-6 px-2 flex-wrap text-[10px] font-mono text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
          <span>Bản ghi: <strong className="text-slate-300">{scopeDesc}</strong></span>
        </div>
        {currentScope !== 'personal' && (
          <div>
            Chặng đường: <strong className="text-slate-300 uppercase">{tabLabel}</strong>
          </div>
        )}
        {currentScope === 'personal' && (
          <div className="italic text-slate-600">
            * Lịch sử chạy được sắp xếp theo thời gian mới nhất lên trên
          </div>
        )}
      </div>

      {currentScope === 'department' && !myDept ? (
        <div className="w-full game-container rounded-3xl border border-slate-800/80 p-16 flex flex-col items-center gap-4 text-center">
          <div className="text-6xl animate-bounce">🏢</div>
          <h2 className="font-display font-extrabold text-white text-lg uppercase tracking-wide">
            Chưa cập nhật bộ phận
          </h2>
          <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
            Bạn cần cập nhật phòng ban trong hồ sơ để xem bảng xếp hạng cùng đồng nghiệp trực tiếp.
          </p>
          <a
            href="/game"
            className="mt-2 px-5 py-2.5 rounded-xl bg-brand-cyan text-navy-dark font-extrabold text-xs uppercase hover:bg-cyan-400 transition-all shadow-lg"
          >
            Vào game cấu hình hồ sơ
          </a>
        </div>
      ) : (
        <div
          ref={highlightRef}
          className={`w-full game-container rounded-3xl overflow-hidden border border-slate-800/80 transition-opacity duration-300 ${
            isPending ? 'opacity-40 pointer-events-none' : 'opacity-100'
          }`}
        >
          <LeaderboardTable
            scope={currentScope}
            activeTab={currentTab}
            runData={runRows}
            playerData={playerRows}
            deptData={deptRows}
            highlightUserId={highlightFromUrl || ''}
          />
        </div>
      )}

      <div className="flex justify-center gap-4 pt-2 pb-6 flex-wrap">
        <a
          href="/game"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-bold hover:bg-brand-cyan hover:text-navy-dark transition-all shadow-md"
        >
          🎮 CHIẾN GAME NGAY
        </a>
        <a
          href="/leaderboard?tab=overall&scope=personal"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 text-slate-300 text-xs font-bold hover:border-slate-600 transition-all shadow-md"
        >
          📋 LỊCH SỬ CHẠY CỦA TÔI
        </a>
        <a
          href="/leaderboard?tab=overall&scope=vti"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-bold hover:bg-brand-red hover:text-white transition-all shadow-md"
        >
          🏭 BẢNG XẾP HẠNG VTI TỔNG
        </a>
      </div>
    </div>
  );
}
