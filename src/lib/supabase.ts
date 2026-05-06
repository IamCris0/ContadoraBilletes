import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const supabaseUrlFinal = supabaseUrl || "https://placeholder.supabase.co";
const supabaseAnonKeyFinal = supabaseAnonKey || "placeholder";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en el entorno.");
}

export const supabase = createClient(supabaseUrlFinal, supabaseAnonKeyFinal, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export function obtenerMensajeError(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return "Ocurrió un error inesperado.";
}
