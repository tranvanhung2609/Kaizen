'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut } from '@/app/actions/auth';
import ProfileModal from './profile/ProfileModal';

interface NavbarProps {
  user: {
    id?: string;
    email?: string;
    fullName?: string;
    nickname?: string;
    avatarUrl?: string;
    age?: number;
    role?: string;
  };
  department?: string;
  /** compact=true: dùng cho trang game — navbar mỏng, không có nav links */
  compact?: boolean;
}

export default function Navbar({ user, department = '', compact = false }: NavbarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const displayName = user.fullName || user.email?.split('@')[0] || 'VTI Programmer';
  const avatar = user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${displayName}`;

  return (
    <>
      <header
        className={`w-full glass-panel border-b border-slate-800/60 flex items-center justify-between z-20 ${
          compact ? 'px-4 py-2' : 'px-6 py-4'
        }`}
      >
        {/* Brand Logo */}
        <Link href="/game" className="flex items-center gap-2 group shrink-0">
          <div
            className={`rounded-lg bg-gradient-to-tr from-brand-red to-brand-cyan p-0.5 shadow-md transition-all ${
              compact ? 'w-7 h-7' : 'w-9 h-9'
            }`}
          >
            <div className="w-full h-full bg-navy-dark rounded-[6px] flex items-center justify-center font-bold text-xs tracking-tighter text-white">
              VJ
            </div>
          </div>
          {!compact && (
            <span className="font-extrabold tracking-wider font-display text-white text-base md:text-lg transition-colors group-hover:text-brand-cyan hidden sm:block">
              KAIZEN<span className="text-brand-cyan"> JOURNEY</span>
            </span>
          )}
        </Link>

        {/* Nav Links — chỉ hiện khi không compact */}
        {!compact && (
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/game"
              className="text-sm font-semibold tracking-wide text-slate-300 hover:text-brand-cyan hover:text-glow-cyan transition-all duration-200"
            >
              🎮 CHIẾN GAME
            </Link>
            <Link
              href="/leaderboard"
              className="text-sm font-semibold tracking-wide text-slate-300 hover:text-brand-cyan hover:text-glow-cyan transition-all duration-200"
            >
              🏆 BẢNG XẾP HẠNG
            </Link>
            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="text-sm font-semibold tracking-wide text-slate-300 hover:text-brand-cyan hover:text-glow-cyan transition-all duration-200"
              >
                ⚙️ CẤU HÌNH CMS
              </Link>
            )}
          </nav>
        )}

        {/* Compact center — hiện tên game nhỏ */}
        {compact && (
          <span className="font-display font-extrabold tracking-widest text-white text-sm uppercase hidden sm:block">
            KAIZEN<span className="text-brand-cyan"> JOURNEY</span>
          </span>
        )}

        {/* Right: User actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 text-right hover:opacity-85 transition-opacity group cursor-pointer"
            title="Chỉnh sửa hồ sơ"
          >
            {!compact && (
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-slate-100 font-display group-hover:text-brand-cyan transition-colors leading-tight">
                  {displayName}
                </span>
                <span className="text-[10px] text-brand-cyan uppercase tracking-widest font-mono">
                  {department}
                </span>
              </div>
            )}
            <div className="relative">
              <img
                src={avatar}
                alt={displayName}
                className={`rounded-lg border border-slate-700 object-cover group-hover:border-brand-cyan transition-colors ${
                  compact ? 'w-7 h-7' : 'w-9 h-9'
                }`}
              />
              <div className="absolute -bottom-1 -right-1 bg-navy-medium border border-slate-700 w-3.5 h-3.5 rounded-md flex items-center justify-center text-[8px] text-slate-400 group-hover:text-brand-cyan group-hover:border-brand-cyan transition-colors">
                ⚙
              </div>
            </div>
          </button>

          <form action={signOut}>
            <button
              type="submit"
              className="p-1.5 text-slate-500 hover:text-brand-red rounded-lg transition-colors cursor-pointer"
              title="Đăng xuất"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 01-3-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </form>
        </div>
      </header>

      <ProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialProfile={{
          fullName: user.fullName,
          age: user.age,
          department: department,
          email: user.email,
        }}
      />
    </>
  );
}
