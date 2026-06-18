'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile } from '@/app/actions/profile';
import { extractDeptFromName } from '@/lib/profile-utils';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProfile: {
    fullName?: string;
    email?: string;
    department?: string;
  };
}

export default function ProfileModal({
  isOpen,
  onClose,
  initialProfile,
}: ProfileModalProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialProfile.fullName || '');
  
  // Khởi tạo phòng ban lấy từ database hoặc trích xuất tự động từ tên
  const [department, setDepartment] = useState(() => {
    return initialProfile.department || extractDeptFromName(initialProfile.fullName) || '';
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation
    const trimmedFullName = fullName.trim();
    if (!trimmedFullName) {
      setError('Vui lòng điền Họ và tên để tiếp tục.');
      setIsLoading(false);
      return;
    }

    const trimmedDepartment = department.trim();
    if (!trimmedDepartment) {
      setError('Vui lòng điền Phòng ban / Bộ phận.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await updateProfile({
        fullName: trimmedFullName,
        department: trimmedDepartment,
      });

      if (res.success) {
        router.refresh();
        onClose();
      } else {
        setError(res.error || 'Có lỗi xảy ra.');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/80 backdrop-blur-sm transition-all duration-300">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl p-6 md:p-8 border border-slate-700/60 glow-cyan animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button (X) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer"
          aria-label="Close settings"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-red to-brand-cyan p-0.5 shadow-md mb-3">
            <div className="w-full h-full bg-navy-dark rounded-[10px] flex items-center justify-center text-white">
              ⚙️
            </div>
          </div>
          <h2 className="text-2xl font-extrabold font-display text-white tracking-tight">
            Cập Nhật Hồ Sơ
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
            Thay đổi các thông tin hiển thị trên bảng xếp hạng và giao diện game.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email (Read-Only) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1">
              Email đăng nhập (VTI)
            </label>
            <input
              type="text"
              value={initialProfile.email || ''}
              disabled
              className="w-full px-4 py-2.5 rounded-xl bg-navy-medium/50 border border-slate-800 text-slate-400 text-sm font-mono cursor-not-allowed select-none"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-bold text-brand-cyan uppercase tracking-widest font-mono mb-1">
              Họ và tên *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="VD: Nguyễn Văn A"
              className="w-full px-4 py-2.5 rounded-xl bg-navy-dark border border-brand-cyan/40 text-white text-sm focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/30 transition-colors"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-[11px] font-bold text-brand-cyan uppercase tracking-widest font-mono mb-1">
              Phòng ban / Bộ phận *
            </label>
            <input
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="VD: VTI.D5, QA, Marketing..."
              className="w-full px-4 py-2.5 rounded-xl bg-navy-dark border border-brand-cyan/40 text-white text-sm focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/30 transition-colors"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-brand-red/10 border border-brand-red/30 text-center">
              <p className="text-xs text-brand-red font-semibold leading-relaxed">
                {error}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-navy-medium text-slate-300 font-semibold text-sm hover:bg-navy-light transition-colors border border-slate-700/40 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-2 flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-tr from-brand-red to-brand-cyan hover:scale-[1.02] active:scale-[0.98] transition-all text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>Lưu thông tin</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
