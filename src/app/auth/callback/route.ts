import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { isVtiEmail } from '@/lib/auth';
import { ensureProfileExists } from '@/lib/profile';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/game';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Validate that the user email matches the VTI domain constraint on the server side
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const email = user.email;
        if (!isVtiEmail(email)) {
          console.warn(`Auth callback domain check failed for email: ${email}`);
          // Log out immediately and return error if domain check fails
          await supabase.auth.signOut();
          return NextResponse.redirect(`${origin}/login?error=invalid_domain`);
        }

        // Đảm bảo profile & journey_scores tồn tại trong database ngay khi đăng nhập
        try {
          await ensureProfileExists(
            user.id,
            user.email || '',
            user.user_metadata?.full_name || '',
            user.user_metadata?.avatar_url || ''
          );
        } catch (profileErr) {
          console.error('[auth-callback] Failed to ensure profile exists:', profileErr);
        }
      }
      
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      console.error('Auth callback exchange code error:', error);
    }
  } else {
    console.error('Auth callback missing authorization code in query parameters.');
  }

  // Redirect to login page with auth_error if something went wrong
  return NextResponse.redirect(`${origin}/login?error=auth_error`);
}
