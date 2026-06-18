'use client';

import React from 'react';

interface MapInfo {
  key: string;
  label: string;
  subtitle: string;
  icon: string;
  color: string;
  borderClass: string;
  textClass: string;
  glowClass: string;
  bgClass: string;
  flavor: string;
  boss: string;
  difficulty: string;
  difficultyCls: string;
}

interface MapSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMapKey: string;
  onSelectMap: (mapKey: string) => void;
}

const MAPS: MapInfo[] = [
  {
    key: 'hanoi',
    label: 'Hà Nội',
    subtitle: 'Chặng 1: Khởi nguồn Tôn trọng',
    icon: '🏯',
    color: 'brand-cyan',
    borderClass: 'border-brand-cyan/50 hover:border-brand-cyan',
    textClass: 'text-brand-cyan',
    glowClass: 'text-glow-cyan',
    bgClass: 'bg-brand-cyan/5',
    flavor: 'VTI khởi nguồn từ Hà Nội với tinh thần Tôn trọng đồng nghiệp, khách hàng và đối tác.',
    boss: 'Boss Deadline Cổ Phố',
    difficulty: 'Dễ (5.5x)',
    difficultyCls: 'text-green-400 bg-green-500/10 border-green-500/20'
  },
  {
    key: 'tokyo',
    label: 'Tokyo',
    subtitle: 'Chặng 2: Kaizen liên tục',
    icon: '🗼',
    color: 'gold',
    borderClass: 'border-gold/50 hover:border-gold',
    textClass: 'text-gold',
    glowClass: 'text-glow-gold',
    bgClass: 'bg-gold/5',
    flavor: 'Chinh phục thị trường Nhật Bản bằng sự Kaizen - học hỏi và cải tiến không ngừng nghỉ.',
    boss: 'Boss Kaizen Breaker',
    difficulty: 'Vừa (6.5x)',
    difficultyCls: 'text-gold bg-gold/10 border-gold/20'
  },
  {
    key: 'danang',
    label: 'Đà Nẵng',
    subtitle: 'Chặng 3: Trách nhiệm bứt phá',
    icon: '🌉',
    color: 'brand-red',
    borderClass: 'border-brand-red/50 hover:border-brand-red',
    textClass: 'text-brand-red',
    glowClass: 'text-glow-red',
    bgClass: 'bg-brand-red/5',
    flavor: 'Nhận trách nhiệm chủ động bứt phá công nghệ toàn cầu, mang giá trị tốt nhất đến khách hàng.',
    boss: 'Boss Rồng Sông Hàn Data Storm',
    difficulty: 'Khó (7.5x)',
    difficultyCls: 'text-brand-red bg-brand-red/10 border-brand-red/20'
  },
];

export default function MapSelectionModal({
  isOpen,
  onClose,
  currentMapKey,
  onSelectMap,
}: MapSelectionModalProps) {
  if (!isOpen) return null;

  const currentIdx = MAPS.findIndex((m) => m.key === currentMapKey);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-navy-medium border border-slate-700/60 rounded-3xl overflow-hidden shadow-2xl p-6 flex flex-col gap-6 border-glow-cycle scanlines">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-brand-cyan-glow blur-[100px] pointer-events-none opacity-20" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-brand-red-glow blur-[100px] pointer-events-none opacity-20" />

        {/* Modal Header */}
        <div className="flex justify-between items-start z-10">
          <div className="flex flex-col">
            <h2 className="text-xl font-extrabold font-display text-white uppercase tracking-wider flex items-center gap-2">
              🗺️ HỆ THỐNG BẢN ĐỒ CHẠY DEADLINE
            </h2>
            <p className="text-xs text-slate-400">
              Chọn chặng chạy của bạn. Các chặng tiếp theo sẽ mở khóa sau khi vượt qua thử thách hiện tại.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-navy-dark text-slate-400 hover:text-white border border-slate-800 transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            ✕
          </button>
        </div>

        {/* Maps Journey Selection */}
        <div className="grid md:grid-cols-3 gap-5 z-10">
          {MAPS.map((map, idx) => {
            const isCleared = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            const isLocked  = idx > currentIdx;
            const isSelected = map.key === currentMapKey;

            return (
              <button
                key={map.key}
                disabled={isLocked}
                onClick={() => {
                  onSelectMap(map.key);
                  onClose();
                }}
                className={`p-5 rounded-2xl border flex flex-col gap-4 text-left transition-all relative ${
                  isSelected
                    ? `${map.bgClass} border-brand-cyan shadow-[0_0_15px_rgba(0,229,255,0.25)]`
                    : isLocked
                    ? 'bg-navy-dark/10 border-slate-800/80 opacity-40 cursor-not-allowed'
                    : 'bg-navy-dark/40 border-slate-800/80 hover:bg-navy-dark/60 cursor-pointer hover:scale-[1.02]'
                }`}
              >
                {/* Header Icon & Status */}
                <div className="flex justify-between items-center">
                  <div className="w-12 h-12 rounded-xl bg-navy-dark border border-slate-700/60 flex items-center justify-center text-3xl shadow-inner">
                    {isLocked ? '🔒' : map.icon}
                  </div>
                  {isCurrent && (
                    <span className="text-[9px] font-black font-mono tracking-widest text-brand-cyan bg-brand-cyan/15 px-2 py-0.5 rounded border border-brand-cyan/30 animate-pulse">
                      HIỆN TẠI
                    </span>
                  )}
                  {isCleared && (
                    <span className="text-[9px] font-black font-mono tracking-widest text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                      ĐÃ QUA
                    </span>
                  )}
                  {isLocked && (
                    <span className="text-[9px] font-black font-mono tracking-widest text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700/20">
                      KHÓA
                    </span>
                  )}
                </div>

                {/* Title & Info */}
                <div className="flex flex-col gap-1">
                  <span className={`font-display font-extrabold text-sm ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {map.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold leading-tight font-mono uppercase tracking-wider">
                    {map.subtitle}
                  </span>
                </div>

                {/* Description */}
                <p className="text-[10px] text-slate-400 leading-relaxed min-h-[48px]">
                  {map.flavor}
                </p>

                {/* Technical stats */}
                <div className="mt-2 pt-3 border-t border-slate-800/60 flex flex-col gap-2 text-[10px]">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500">Độ khó:</span>
                    <span className={`px-1.5 py-0.2 rounded border font-bold ${map.difficultyCls}`}>
                      {map.difficulty}
                    </span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500">Bảo vệ Cổng:</span>
                    <span className="text-slate-300 font-bold truncate max-w-[120px]" title={map.boss}>
                      ⚔️ {map.boss.split(' ')[1] || map.boss}
                    </span>
                  </div>
                </div>

                {/* Selected Ring glow */}
                {isSelected && (
                  <div className="absolute -inset-px rounded-2xl border-2 border-brand-cyan pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>

        {/* Visual Info Alert */}
        <div className="p-3.5 rounded-2xl bg-brand-cyan/5 border border-brand-cyan/20 text-[10px] text-brand-cyan leading-relaxed flex items-center gap-2.5 z-10 font-mono">
          <span>💡</span>
          <span>
            Bạn có thể <strong>chọn lại bất kỳ chặng nào đã mở khóa</strong> để cải thiện điểm số và thu thập thêm bình nước nhằm mở khóa vật phẩm trong Cửa Hàng.
          </span>
        </div>

      </div>
    </div>
  );
}
