import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

const ALLOWED_VTI_DOMAINS = [
  'vti.com.vn',
  'vti.com',
  'vtijapan.co.jp',
  'vti-solutions.com'
];

export function isVtiEmail(email: string | undefined | null): boolean {
  // if (!email) return false;
  // const cleaned = email.trim().toLowerCase();
  // return ALLOWED_VTI_DOMAINS.some(domain => cleaned.endsWith('@' + domain));
  return !!email;
}

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }

  // Enforce VTI email domain restriction
  if (!isVtiEmail(user.email)) {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login?error=invalid_domain');
  }

  return user;
}

export async function requireGuest() {
  const user = await getUser();
  if (user && isVtiEmail(user.email)) {
    redirect('/game');
  }
}
