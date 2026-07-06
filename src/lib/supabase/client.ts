import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL_V1!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_V1!
  );
}
