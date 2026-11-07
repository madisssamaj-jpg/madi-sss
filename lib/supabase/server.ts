// Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu
// Server-side Supabase Client (Server Actions, Server Components & Route Handlers)
// Note: SUPABASE_SERVICE_ROLE_KEY is strictly confined to server-side execution.
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ypcrfeufdghpxhhjexja.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';

/**
 * Returns a privileged Supabase client for backend/admin operations using service_role key.
 * If service_role key is not configured, gracefully falls back to the anon client.
 */
export function getSupabaseServerClient(useServiceRole = true) {
  const key = useServiceRole && serviceRoleKey ? serviceRoleKey : anonKey;
  
  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

