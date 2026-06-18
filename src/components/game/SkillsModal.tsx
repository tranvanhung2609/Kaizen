'use client';

import React from 'react';

interface Skill {
  name: string;
  category: 'core' | 'powerup' | 'special';
  control: string[];
  description: string;
  effect: string;
  icon: string;
  colorCls: string;
  glowCls: string;
  bgCls: string;
}

interface SkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SKILLS: Skill[] = [
  {
    name: 'Tab/Enter Projectiles',
    category: 'special',
    control: ['SPACE', 'Z'],
    description: 'Bắn ra các phím cơ khí Tab và Enter với tốc độ cao để tiêu diệt các Bug và tấn công Boss.',
    effect: 'Phá hủy Staging/Prod Bugs từ xa, trừ máu của Boss.',
    icon: '⌨️',
    colorCls: 'text-brand-red',
    glowCls: 'text-glow-red',
    bgCls: 'bg-brand-red/10 border-brand-red/20'
  },
  {
    name: 'Respect Shield',
    category: 'powerup',
    control: ['Nhặt 🌸'],
    description: 'Kích hoạt khiên bảo vệ hoa sen Tôn Trọng giúp bất tử trước mọi va chạm từ Bug Staging/Prod.',
    effect: 'Bất tử trong 5 giây, đâm thẳng tiêu diệt Bug.',
    icon: '🌸',
    colorCls: 'text-green-400',
    glowCls: 'text-glow-green',
    bgCls: 'bg-green-500/10 border-green-500/20'
  },
  {
    name: 'Responsibility Wings',
    category: 'powerup',
    control: ['Nhặt 🪶'],
    description: 'Kích hoạt đôi cánh Trách Nhiệm cho phép nhân vật bay tự do lơ lửng trên không trung.',
    effect: 'Bay tự do trong 8 giây để nhặt bình nước trên cao.',
    icon: '🪶',
    colorCls: 'text-brand-cyan',
    glowCls: 'text-glow-cyan',
    bgCls: 'bg-brand-cyan/10 border-brand-cyan/20'
  },
  {
    name: 'Kaizen Mode Keyboard',
    category: 'special',
    control: ['SPACE khi Energy = 100%'],
    description: 'Bàn phím cơ Kaizen tối thượng được kích hoạt thủ công bằng phím SPACE khi tích lũy đủ 100% năng lượng Kaizen (nhặt nước hoặc tiêu diệt Bug).',
    effect: 'Gia tăng tốc độ chạy gấp 1.2 lần, nhảy cực cao, cho phép bắn đạn liên tục.',
    icon: '⚡',
    colorCls: 'text-gold',
    glowCls: 'text-glow-gold',
    bgCls: 'bg-gold/10 border-gold/20'
  },
  {
    name: 'Nhảy Tránh Né',
    category: 'core',
    control: ['W', '↑'],
    description: 'Cú nhảy nhanh nhẹn giúp mascot bay qua các hố dữ liệu (Pits) sâu và các chướng ngại vật.',
    effect: 'Nhảy cao tránh hố sâu rơi tự do (gây Game Over tức thì).',
    icon: '👟',
    colorCls: 'text-slate-200',
    glowCls: '',
    bgCls: 'bg-slate-800/60 border-slate-700/40'
  },
  {
    name: 'Cúi Đầu Trách Né',
    category: 'core',
    control: ['S', '↓'],
    description: 'Cúi thấp người để luồn qua các quả bom Tech Debt treo lơ lửng ở tầm trung.',
    effect: 'Thu nhỏ hộp va chạm (hitbox) giúp né sát thương bom.',
    icon: '🛡️',
    colorCls: 'text-slate-300',
    glowCls: '',
    bgCls: 'bg-slate-800/60 border-slate-700/40'
  }
];

export default function SkillsModal({ isOpen, onClose }: SkillsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-navy-medium border border-slate-700/60 rounded-3xl overflow-hidden shadow-2xl p-6 flex flex-col gap-5 border-glow-cycle scanlines">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 right-1/4 w-85 h-85 rounded-full bg-brand-cyan-glow blur-[110px] pointer-events-none opacity-20" />
        <div className="absolute bottom-0 left-1/4 w-85 h-85 rounded-full bg-brand-red-glow blur-[110px] pointer-events-none opacity-20" />

        {/* Modal Header */}
        <div className="flex justify-between items-start z-10">
          <div className="flex flex-col">
            <h2 className="text-xl font-extrabold font-display text-white uppercase tracking-wider flex items-center gap-2">
              ⚡ HỆ THỐNG KỸ NĂNG & POWER-UPS
            </h2>
            <p className="text-xs text-slate-400">
              Tìm hiểu các kỹ năng cốt lõi và vật phẩm hỗ trợ giúp bạn chạy deadline hiệu quả, vượt qua các Bug Staging/Prod.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-navy-dark text-slate-400 hover:text-white border border-slate-800 transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            ✕
          </button>
        </div>

        {/* Skills Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[350px] overflow-y-auto pr-1 z-10">
          {SKILLS.map((skill) => (
            <div
              key={skill.name}
              className={`p-4 rounded-xl border flex flex-col gap-2.5 transition-all bg-navy-dark/40 border-slate-800/80 hover:border-slate-700/50`}
            >
              {/* Icon, Name & Type */}
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-navy-medium border border-slate-750 flex items-center justify-center text-xl shadow-inner">
                  {skill.icon}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`font-display font-extrabold text-[11px] truncate leading-tight text-white`}>
                    {skill.name}
                  </span>
                  <span className="text-[8px] font-mono text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                    {skill.category === 'core' ? '🕹️ Di chuyển' : skill.category === 'powerup' ? '🌸 Hỗ trợ' : '⚡ Đặc biệt'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-[10px] text-slate-455 leading-relaxed min-h-[44px]">
                {skill.description}
              </p>

              {/* Key bindings & Effects */}
              <div className="mt-auto pt-2 border-t border-slate-800/60 flex flex-col gap-1.5 text-[9px] font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Phím bấm:</span>
                  <div className="flex gap-1">
                    {skill.control.map((ctrl) => (
                      <kbd key={ctrl} className="px-1.5 py-0.5 rounded bg-navy-dark border border-slate-800 text-[8px] font-bold text-brand-cyan shadow-sm">
                        {ctrl}
                      </kbd>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-500">Hiệu quả:</span>
                  <span className="text-slate-350 leading-relaxed font-sans">{skill.effect}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-3 rounded-2xl bg-navy-dark/60 border border-slate-800 flex items-center justify-between z-10 font-mono text-[9px] text-slate-500">
          <span>* Nhấn SPACE khi ở trong Kaizen Mode để bắn các phím cơ Tab/Enter.</span>
          <span>VJ RUNNER v4.0</span>
        </div>

      </div>
    </div>
  );
}
