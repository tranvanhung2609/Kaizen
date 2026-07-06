import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_V1 || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_V1 || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Error: NEXT_PUBLIC_SUPABASE_URL_V1 or NEXT_PUBLIC_SUPABASE_ANON_KEY_V1 is missing in environmental variables!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isMockClient = false;
