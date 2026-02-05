import { createClient } from "@supabase/supabase-js";

const urlSupabase = import.meta.env.VITE_SUPABASE_URL;
const anonKeySupabase = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!urlSupabase || !anonKeySupabase) {
  throw new Error("Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env.local");
}

export const supabase = createClient(urlSupabase, anonKeySupabase);
