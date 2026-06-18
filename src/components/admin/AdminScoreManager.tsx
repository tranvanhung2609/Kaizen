'use client';

import { useState } from 'react';
import { resetUserScoreAction, updateUserScoreAction } from '@/app/actions/admin';
import { extractDeptFromName } from '@/lib/profile';

interface UserScore {
  id: string;
  email: string;
  fullName: string | null;
  department: string;
  role: string;
  totalScore: number | null;
  hanoiBestScore: number | null;
  tokyoBestScore: number | null;
  danangBestScore: number | null;
}

interface AdminScoreManagerProps {
  initialUserScores: UserScore[];
}

export default function AdminScoreManager({ initialUserScores }: AdminScoreManagerProps) {
  const [userScores, setUserScores] = useState<UserScore[]>(initialUserScores);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMutating, setIsMutating] = useState<string | null>(null); // userId of currently loading row

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<UserScore | null>(null);
  const [hanoiScoreInput, setHanoiScoreInput] = useState('0');
  const [tokyoScoreInput, setTokyoScoreInput] = useState('0');
  const [danangScoreInput, setDanangScoreInput] = useState('0');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isModalSaving, setIsModalSaving] = useState(false);

  // Filter users by search query
  const filteredUsers = userScores.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.fullName || '').toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q)
    );
  });

  // Action: Reset User Score
  const handleResetScore = async (userId: string, userName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn reset toàn bộ điểm số của người dùng "${userName || userId}" về 0?`)) {
      return;
    }

    setIsMutating(userId);
    try {
      const res = await resetUserScoreAction(userId);
      if (res.success) {
        setUserScores((prev) =>
          prev.map((u) =>
            u.id === userId
              ? { ...u, totalScore: 0, hanoiBestScore: 0, tokyoBestScore: 0, danangBestScore: 0 }
              : u
          )
        );
      } else {
        alert(res.error || 'Reset điểm thất bại.');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi kết nối.');
    } finally {
      setIsMutating(null);
    }
  };

  // Action: Open Edit Modal
  const handleOpenEditModal = (user: UserScore) => {
    setEditingUser(user);
    setHanoiScoreInput(String(user.hanoiBestScore || 0));
    setTokyoScoreInput(String(user.tokyoBestScore || 0));
    setDanangScoreInput(String(user.danangBestScore || 0));
    setModalError(null);
  };

  // Action: Save Edit Modal
  const handleSaveScores = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const hn = parseInt(hanoiScoreInput);
    const tk = parseInt(tokyoScoreInput);
    const dn = parseInt(danangScoreInput);

    if (isNaN(hn) || hn < 0 || isNaN(tk) || tk < 0 || isNaN(dn) || dn < 0) {
      setModalError('Điểm số phải là một số nguyên dương hợp lệ.');
      return;
    }

    setIsModalSaving(true);
    setModalError(null);

    try {
      const res = await updateUserScoreAction(editingUser.id, { hanoi: hn, tokyo: tk, danang: dn });
      if (res.success) {
        setUserScores((prev) =>
          prev.map((u) =>
            u.id === editingUser.id
              ? {
                  ...u,
                  hanoiBestScore: hn,
                  tokyoBestScore: tk,
                  danangBestScore: dn,
                  totalScore: hn + tk + dn,
                }
              : u
          )
        );
        setEditingUser(null);
      } else {
        setModalError(res.error || 'Cập nhật điểm thất bại.');
      }
    } catch (err: any) {
      setModalError(err.message || 'Lỗi hệ thống.');
    } finally {
      setIsModalSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Search Filter Bar */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-navy-medium/30 border border-slate-800/60 backdrop-blur-md">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Tìm kiếm theo họ tên, email hoặc phòng ban..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-dark border border-slate-700/60 text-white text-sm focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/30 transition-all placeholder:text-slate-500"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm select-none">
            🔍
          </span>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Hiển thị: <strong className="text-brand-cyan">{filteredUsers.length}</strong> / {userScores.length} chiến binh
        </div>
      </div>

      {/* User Scores Table */}
      <div className="overflow-x-auto w-full rounded-xl border border-slate-800/60 bg-navy-medium/10 backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-navy-medium/50 border-b border-slate-800 text-[10px] uppercase font-mono font-bold tracking-widest text-slate-500">
              <th className="py-4 px-6">Chiến Binh</th>
              <th className="py-4 px-6 text-center">Phòng Ban</th>
              <th className="py-4 px-6 text-center">⛩️ Hà Nội</th>
              <th className="py-4 px-6 text-center">🗼 Tokyo</th>
              <th className="py-4 px-6 text-center">🌉 Đà Nẵng</th>
              <th className="py-4 px-6 text-right">Tổng Điểm</th>
              <th className="py-4 px-6 text-center w-40">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40 text-xs">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-500 font-mono">
                  Không tìm thấy người chơi nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const isUserMutating = isMutating === user.id;

                return (
                  <tr key={user.id} className="hover:bg-slate-800/20 transition-colors">
                    {/* User Profile Info */}
                    <td className="py-3.5 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-200 text-sm">
                          {user.fullName || 'Chiến binh VTI'}
                          {user.role === 'admin' && (
                            <span className="ml-2 px-1.5 py-0.5 rounded bg-brand-red/10 text-brand-red border border-brand-red/20 text-[8px] font-black uppercase font-mono tracking-wider">
                              ADMIN
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {user.email}
                        </span>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-6 text-center">
                      <span className="font-mono bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700/40 text-slate-400">
                        {user.department || extractDeptFromName(user.fullName) || 'VTI'}
                      </span>
                    </td>

                    {/* Hanoi Best */}
                    <td className="py-3.5 px-6 text-center font-mono text-slate-300">
                      {user.hanoiBestScore?.toLocaleString() ?? 0}
                    </td>

                    {/* Tokyo Best */}
                    <td className="py-3.5 px-6 text-center font-mono text-slate-300">
                      {user.tokyoBestScore?.toLocaleString() ?? 0}
                    </td>

                    {/* Danang Best */}
                    <td className="py-3.5 px-6 text-center font-mono text-slate-300">
                      {user.danangBestScore?.toLocaleString() ?? 0}
                    </td>

                    {/* Total Score */}
                    <td className="py-3.5 px-6 text-right">
                      <span className="font-display font-black text-brand-cyan text-glow-cyan text-sm">
                        {user.totalScore?.toLocaleString() ?? 0}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          disabled={isUserMutating}
                          className="px-2.5 py-1.5 rounded-lg bg-brand-cyan/10 hover:bg-brand-cyan text-brand-cyan hover:text-navy-dark border border-brand-cyan/20 text-[10px] font-bold uppercase transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Sửa
                        </button>
                        {/* Reset Button */}
                        <button
                          onClick={() => handleResetScore(user.id, user.fullName || user.email)}
                          disabled={isUserMutating}
                          className="px-2.5 py-1.5 rounded-lg bg-brand-red/10 hover:bg-brand-red text-brand-red hover:text-white border border-brand-red/20 text-[10px] font-bold uppercase transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUserMutating ? '...' : 'Reset'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Score Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/80 backdrop-blur-sm transition-all duration-300">
          <div className="relative w-full max-w-md glass-panel rounded-2xl p-6 border border-slate-700/60 glow-cyan animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="mb-4">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Chỉnh Sửa Điểm Số
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Chỉnh sửa điểm số cho: <strong className="text-brand-cyan">{editingUser.fullName || editingUser.email}</strong>
              </p>
            </div>

            <form onSubmit={handleSaveScores} className="space-y-4">
              {/* Hanoi Score */}
              <div>
                <label className="block text-[10px] font-bold text-brand-cyan uppercase tracking-widest font-mono mb-1">
                  Màn Hà Nội (Score)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={hanoiScoreInput}
                  onChange={(e) => setHanoiScoreInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-navy-dark border border-slate-700/80 text-white text-sm focus:outline-none focus:border-brand-cyan"
                />
              </div>

              {/* Tokyo Score */}
              <div>
                <label className="block text-[10px] font-bold text-gold uppercase tracking-widest font-mono mb-1">
                  Màn Tokyo (Score)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={tokyoScoreInput}
                  onChange={(e) => setTokyoScoreInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-navy-dark border border-slate-700/80 text-white text-sm focus:outline-none focus:border-brand-cyan"
                />
              </div>

              {/* Danang Score */}
              <div>
                <label className="block text-[10px] font-bold text-brand-red uppercase tracking-widest font-mono mb-1">
                  Màn Đà Nẵng (Score)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={danangScoreInput}
                  onChange={(e) => setDanangScoreInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-navy-dark border border-slate-700/80 text-white text-sm focus:outline-none focus:border-brand-cyan"
                />
              </div>

              {/* Total Score display */}
              <div className="p-3 bg-navy-dark/60 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono font-bold">TỔNG ĐIỂM DỰ KIẾN:</span>
                <span className="font-display font-black text-brand-cyan text-glow-cyan text-base">
                  {((parseInt(hanoiScoreInput) || 0) + (parseInt(tokyoScoreInput) || 0) + (parseInt(danangScoreInput) || 0)).toLocaleString()}
                </span>
              </div>

              {modalError && (
                <p className="text-[11px] font-semibold text-brand-red leading-relaxed bg-brand-red/10 border border-brand-red/20 rounded p-2 text-center">
                  {modalError}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  disabled={isModalSaving}
                  className="flex-1 py-2 rounded-xl bg-navy-medium text-slate-300 font-semibold text-xs border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isModalSaving}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-tr from-brand-red to-brand-cyan text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isModalSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
