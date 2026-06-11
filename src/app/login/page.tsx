import { requireGuest } from '@/lib/auth';
import LoginClientContent from '@/components/auth/LoginClientContent';

interface LoginPageProps {
  searchParams: Promise<{
    redirectTo?: string;
    error?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  // Enforce guest status (already logged in VTI user goes to /game)
  await requireGuest();
  
  const params = await searchParams;
  const redirectTo = params.redirectTo;
  const errorCode = params.error;

  let errorMessage = '';
  if (errorCode === 'invalid_domain') {
    errorMessage = 'Lỗi: Chỉ cho phép tài khoản email VTI đăng nhập!';
  } else if (errorCode === 'auth_error') {
    errorMessage = 'Có lỗi xảy ra trong quá trình xác thực. Vui lòng thử lại.';
  }

  return (
    <LoginClientContent 
      redirectTo={redirectTo}
      errorMessage={errorMessage}
    />
  );
}
