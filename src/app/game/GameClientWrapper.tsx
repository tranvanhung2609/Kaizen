'use client';

import dynamic from 'next/dynamic';

// Phaser truy cập `window` ngay khi import — phải dùng dynamic với ssr:false
// trong một Client Component (không được dùng trong Server Component)
const GameDashboard = dynamic(() => import('./GameDashboard'), {
  ssr: false,
  loading: () => (
    <div className="w-full flex items-center justify-center" style={{ minHeight: '540px' }}>
      <div className="flex flex-col items-center gap-4 text-slate-400">
        <div className="w-10 h-10 rounded-full border-2 border-brand-cyan/30 border-t-brand-cyan animate-spin" />
        <span className="font-mono text-xs uppercase tracking-widest animate-pulse">
          Đang tải Kaizen Journey...
        </span>
      </div>
    </div>
  ),
});

interface GameClientWrapperProps {
  userDetails: {
    id: string;
    email?: string;
  };
  topPlayers: any[];
}

export default function GameClientWrapper({ userDetails, topPlayers }: GameClientWrapperProps) {
  return <GameDashboard userDetails={userDetails} topPlayers={topPlayers} />;
}

