import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase. Si no hay variables de entorno configuradas, queda en
 * `null` y la app sigue funcionando con almacenamiento local del navegador.
 * En cuanto se rellena `.env.local` (o las variables en Vercel), se activa.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

export const isSupabaseConfigured = Boolean(supabase);
