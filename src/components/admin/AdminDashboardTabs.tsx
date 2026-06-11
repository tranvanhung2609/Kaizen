'use client';

import { useState } from 'react';
import MapConfigEditor from './MapConfigEditor';

interface UserScore {
  id: string;
  email: string;
  fullName: string | null;
  department: string;
  age: number | null;
  role: string;
  totalScore: number | null;
  hanoiBestScore: number | null;
  tokyoBestScore: number | null;
  danangBestScore: number | null;
}

interface AdminDashboardTabsProps {
  initialConfigs: any[];
  userScores: UserScore[];
}

export default function AdminDashboardTabs({
  initialConfigs,
  userScores,
}: AdminDashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<'config' | 'users' | 'departments'>('config');

  // Compute department statistics
  const computeDeptStats = () => {
    const stats: Record<
      string,
      { totalScore: number; count: number; maxScore: number; hanoiMax: number; tokyoMax: number; danangMax: number }
    > = {};

    userScores.forEach((user) => {
      const dept = user.department || 'Chưa cập nhật';
      if (!stats[dept]) {
        stats[dept] = { totalScore: 0, count: 0, maxScore: 0, hanoiMax: 0, tokyoMax: 0, danangMax: 0 };
      }

      const total = user.totalScore || 0;
      stats[dept].totalScore += total;
      stats[dept].count += 1;
      stats[dept].maxScore = Math.max(stats[dept].maxScore, total);
      stats[dept].hanoiMax = Math.max(stats[dept].hanoiMax, user.hanoiBestScore || 0);
      stats[dept].tokyoMax = Math.max(stats[dept].tokyoMax, user.tokyoBestScore || 0);
      stats[dept].danangMax = Math.max(stats[dept].danangMax, user.danangBestScore || 0);
    });

    const totalCount = userScores.length;
    const overallTotalScore = userScores.reduce((sum, u) => sum + (u.totalScore || 0), 0);
    const overallMaxScore = userScores.reduce((max, u) => Math.max(max, u.totalScore || 0), 0);
    const overallHanoiMax = userScores.reduce((max, u) => Math.max(max, u.hanoiBestScore || 0), 0);
    const overallTokyoMax = userScores.reduce((max, u) => Math.max(max, u.tokyoBestScore || 0), 0);
    const overallDanangMax = userScores.reduce((max, u) => Math.max(max, u.danangBestScore || 0), 0);

    const list = Object.entries(stats).map(([name, data]) => ({
      name,
      count: data.count,
      avgScore: Math.round(data.totalScore / data.count),
      maxScore: data.maxScore,
      hanoiMax: data.hanoiMax,
      tokyoMax: data.tokyoMax,
      danangMax: data.danangMax,
    }));

    // Sort by average score descending
    list.sort((a, b) => b.avgScore - a.avgScore);

    if (totalCount > 0) {
      list.unshift({
        name: 'VTI (Tổng công ty)',
        count: totalCount,
        avgScore: Math.round(overallTotalScore / totalCount),
        maxScore: overallMaxScore,
        hanoiMax: overallHanoiMax,
        tokyoMax: overallTokyoMax,
        danangMax: overallDanangMax,
      });
    }

    return {
      list,
      overallMaxScore,
      totalCount,
      overallAverage: totalCount > 0 ? Math.round(overallTotalScore / totalCount) : 0,
    };
  };

  const { list: deptStats, overallMaxScore, totalCount, overallAverage } = computeDeptStats();
  
  // Find highest average team (excluding overall VTI total)
  const highestAvgTeam = deptStats.length > 1 ? deptStats.slice(1).sort((a, b) => b.avgScore - a.avgScore)[0] : null;

  return (
    <div className="flex flex-col gap-6">
      
      {/* Tab Controls Navigation */}
      <div className="flex border-b border-slate-800/80 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('config')}
          className={`px-5 py-3.5 text-xs font-bold tracking-wider transition-all border-b-2 -mb-[2px] cursor-pointer whitespace-nowrap ${
            activeTab === 'config'
              ? 'border-brand-red text-brand-red text-glow-red font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          ⚙️ CẤU HÌNH GAME CMS
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-3.5 text-xs font-bold tracking-wider transition-all border-b-2 -mb-[2px] cursor-pointer whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-brand-cyan text-brand-cyan text-glow-cyan font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          👥 QUẢN LÝ NGƯỜI CHƠI ({userScores.length})
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`px-5 py-3.5 text-xs font-bold tracking-wider transition-all border-b-2 -mb-[2px] cursor-pointer whitespace-nowrap ${
            activeTab === 'departments'
              ? 'border-gold text-gold text-glow-gold font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          🏢 THỐNG KÊ PHÒNG BAN
        </button>
      </div>

      {/* Tab Contents */}
      <div className="w-full">
        
        {/* TAB 1: GAME CMS CONFIG EDITOR */}
        {activeTab === 'config' && (
          <div className="game-container rounded-2xl p-6 md:p-8 border border-slate-800/80">
            <MapConfigEditor initialConfigs={initialConfigs} />
          </div>
        )}

        {/* TAB 2: USER / PLAYER MANAGEMENT LIST */}
        {activeTab === 'users' && (
          <div className="game-container rounded-2xl border border-slate-800/80 overflow-hidden">
            <div className="p-4 bg-navy-medium/30 border-b border-slate-800 flex justify-between items-center">
              <h2 className="font-display font-bold text-xs text-white uppercase tracking-wider">
                Danh Sách Chiến Binh VTI
              </h2>
              <span className="text-[10px] text-slate-500 font-mono">
                Tổng cộng: {userScores.length} lập trình viên
              </span>
            </div>
            
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-navy-medium/60 border-b border-slate-800 text-[10px] uppercase font-mono font-bold tracking-widest text-slate-500">
                    <th className="py-4 px-6">Chiến binh</th>
                    <th className="py-4 px-6">Bộ phận (Dept)</th>
                    <th className="py-4 px-6 text-center">Tuổi</th>
                    <th className="py-4 px-6 text-center">Quyền</th>
                    <th className="py-4 px-6 text-center">HN Best</th>
                    <th className="py-4 px-6 text-center">TK Best</th>
                    <th className="py-4 px-6 text-center">ĐN Best</th>
                    <th className="py-4 px-6 text-right">Tổng điểm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-xs">
                  {userScores.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-200">
                            {user.fullName || 'Ẩn danh'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {user.email}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="font-semibold text-slate-300 font-mono bg-slate-800/40 px-2 py-0.5 border border-slate-700/30 rounded">
                          {user.department || 'Chưa thiết lập'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-center text-slate-300 font-mono">
                        {user.age ?? '-'}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider ${
                            user.role === 'admin'
                              ? 'bg-brand-red/20 text-brand-red border border-brand-red/35'
                              : 'bg-slate-800 text-slate-500 border border-slate-700/50'
                          }`}
                        >
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-center font-mono text-slate-400">
                        {user.hanoiBestScore ? user.hanoiBestScore.toLocaleString() : '—'}
                      </td>
                      <td className="py-3.5 px-6 text-center font-mono text-slate-400">
                        {user.tokyoBestScore ? user.tokyoBestScore.toLocaleString() : '—'}
                      </td>
                      <td className="py-3.5 px-6 text-center font-mono text-slate-400">
                        {user.danangBestScore ? user.danangBestScore.toLocaleString() : '—'}
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono font-black text-brand-cyan text-glow-cyan text-sm">
                        {(user.totalScore || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DEPARTMENT STATS & CHARTS */}
        {activeTab === 'departments' && (
          <div className="flex flex-col gap-6">
            
            {/* 1. Overview Widgets Grid */}
            <div className="grid sm:grid-cols-3 gap-4">
              {/* Card 1: Total Players */}
              <div className="p-5 rounded-2xl bg-navy-medium/60 border border-slate-800/80 flex flex-col gap-1 relative overflow-hidden">
                <div className="absolute -bottom-6 -right-6 text-6xl opacity-5 pointer-events-none">👥</div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Tổng Chiến Binh</span>
                <span className="font-display font-black text-2xl text-white mt-1">
                  {totalCount} <span className="text-xs font-normal text-slate-400">VTIans</span>
                </span>
                <span className="text-[10px] text-slate-500 mt-2 font-mono">Tham gia chạy chặng Kaizen</span>
              </div>

              {/* Card 2: Highest Avg Team */}
              <div className="p-5 rounded-2xl bg-navy-medium/60 border border-slate-800/80 flex flex-col gap-1 relative overflow-hidden">
                <div className="absolute -bottom-6 -right-6 text-6xl opacity-5 pointer-events-none">🏆</div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Phòng Ban Dẫn Đầu</span>
                <span className="font-display font-black text-2xl text-gold mt-1 truncate">
                  {highestAvgTeam ? highestAvgTeam.name : 'Chưa có'}
                </span>
                <span className="text-[10px] text-slate-400 mt-2 font-mono">
                  Avg: {highestAvgTeam ? highestAvgTeam.avgScore.toLocaleString() : 0} điểm
                </span>
              </div>

              {/* Card 3: Top Record Score */}
              <div className="p-5 rounded-2xl bg-navy-medium/60 border border-slate-800/80 flex flex-col gap-1 relative overflow-hidden">
                <div className="absolute -bottom-6 -right-6 text-6xl opacity-5 pointer-events-none">⚡</div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Kỷ Lục Điểm Đơn</span>
                <span className="font-display font-black text-2xl text-brand-cyan text-glow-cyan mt-1">
                  {overallMaxScore.toLocaleString()} <span className="text-xs font-normal text-slate-400">điểm</span>
                </span>
                <span className="text-[10px] text-slate-500 mt-2 font-mono">Kỷ lục toàn công ty</span>
              </div>
            </div>

            {/* 2. Visual Progress Chart (Department Comparison) */}
            <div className="p-6 rounded-2xl bg-navy-medium/40 border border-slate-800/80 flex flex-col gap-4">
              <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                📈 Biểu Đồ Điểm Số Trung Bình Phòng Ban
              </h3>

              <div className="flex flex-col gap-4 py-2">
                {deptStats.filter(d => d.name !== 'VTI (Tổng công ty)').map((dept, idx) => {
                  // Calculate percentage relative to overall max score
                  const targetScale = Math.max(overallMaxScore, 10000);
                  const barPercent = Math.min(100, Math.round((dept.avgScore / targetScale) * 100) || 5);
                  
                  return (
                    <div key={dept.name} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-mono">0{idx + 1}.</span>
                          <span className="text-slate-200">{dept.name}</span>
                          <span className="text-[9px] text-slate-500 font-mono">({dept.count} người)</span>
                        </div>
                        <span className="text-gold font-mono">{dept.avgScore.toLocaleString()} pts</span>
                      </div>
                      
                      <div className="h-3 w-full bg-navy-dark rounded-full overflow-hidden p-0.5 border border-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-cyan to-blue-500 shadow-[0_0_8px_rgba(0,229,255,0.4)] transition-all duration-1000"
                          style={{ width: `${barPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Detailed Stats Table */}
            <div className="game-container rounded-2xl border border-slate-800/80 overflow-hidden">
              <div className="p-4 bg-navy-medium/30 border-b border-slate-800">
                <h2 className="font-display font-bold text-xs text-white uppercase tracking-wider">
                  Bảng Thống Kê Điểm Nhóm Chi Tiết
                </h2>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-navy-medium/60 border-b border-slate-800 text-[10px] uppercase font-mono font-bold tracking-widest text-slate-500">
                      <th className="py-3.5 px-6">Tên Phòng Ban</th>
                      <th className="py-3.5 px-6 text-center">Số Chiến Binh</th>
                      <th className="py-3.5 px-6 text-center">HN Cao Nhất</th>
                      <th className="py-3.5 px-6 text-center">TK Cao Nhất</th>
                      <th className="py-3.5 px-6 text-center">ĐN Cao Nhất</th>
                      <th className="py-3.5 px-6 text-center">Kỷ Lục Đơn</th>
                      <th className="py-3.5 px-6 text-right">Trung Bình Nhóm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-xs">
                    {deptStats.map((dept, idx) => (
                      <tr
                        key={dept.name}
                        className={`hover:bg-slate-800/20 transition-colors ${
                          idx === 0 ? 'bg-brand-red/5 font-semibold border-l-4 border-l-brand-red' : ''
                        }`}
                      >
                        <td className="py-4 px-6 text-slate-200 font-bold">{dept.name}</td>
                        <td className="py-4 px-6 text-center font-semibold text-slate-300 font-mono">
                          {dept.count}
                        </td>
                        <td className="py-4 px-6 text-center font-mono text-slate-400">
                          {dept.hanoiMax ? dept.hanoiMax.toLocaleString() : '—'}
                        </td>
                        <td className="py-4 px-6 text-center font-mono text-slate-400">
                          {dept.tokyoMax ? dept.tokyoMax.toLocaleString() : '—'}
                        </td>
                        <td className="py-4 px-6 text-center font-mono text-slate-400">
                          {dept.danangMax ? dept.danangMax.toLocaleString() : '—'}
                        </td>
                        <td className="py-4 px-6 text-center font-mono font-bold text-slate-200">
                          {dept.maxScore.toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-extrabold text-brand-red text-glow-red text-sm">
                          {dept.avgScore.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
