'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface GoogleLoginButtonProps {
  redirectTo?: string;
}

export default function GoogleLoginButton({ redirectTo }: GoogleLoginButtonProps) {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const redirectUrl = redirectTo 
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
        : `${window.location.origin}/auth/callback`;

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: 'select_account'
          }
        }
      });

      if (authError) {
        throw authError;
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <button
        id="google-login-btn"
        onClick={handleLogin}
        disabled={isLoading}
        className="w-full max-w-sm flex items-center justify-center gap-3 bg-white text-gray-900 font-semibold px-6 py-3.5 rounded-xl transition-all duration-300 hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border border-slate-200"
      >
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 text-gray-900" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24">
            <g transform="matrix(1, 0, 0, 1, 0, 0)">
              <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.6h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.4C21.68,11.83 21.56,11.45 21.35,11.1z" fill="#4285F4" />
              <path d="M12,20.8c2.43,0 4.47,-0.8 5.96,-2.2l-3.3,-2.6c-0.91,0.61 -2.08,0.98 -3.3,0.98 -2.34,0 -4.33,-1.58 -5.04,-3.7H3v2.7C4.48,18.8 8.02,20.8 12,20.8z" fill="#34A853" />
              <path d="M6.96,13.28c-0.18,-0.55 -0.28,-1.13 -0.28,-1.73s0.1,-1.18 0.28,-1.73V7.12H3c-0.64,1.28 -1,2.72 -1,4.25s0.36,2.97 1,4.25l3.96,-3.1V13.28z" fill="#FBBC05" />
              <path d="M12,6.5c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.46,3.75 14.43,3.2 12,3.2c-3.98,0 -7.52,2 -9,4.92l3.96,3.1C7.67,8.08 9.66,6.5 12,6.5z" fill="#EA4335" />
            </g>
          </svg>
        )}
        <span>{isLoading ? 'Đang kết nối...' : 'Đăng nhập với Google SSO'}</span>
      </button>
      
      {error && (
        <p className="text-sm text-brand-red font-medium mt-2 max-w-sm text-center">
          {error}
        </p>
      )}
    </div>
  );
}
