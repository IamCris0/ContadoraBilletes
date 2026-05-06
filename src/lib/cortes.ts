import { supabase, obtenerMensajeError } from "@/lib/supabase";
import type { CorteCaja, TipoCaja, TipoCorte } from "@/tipos";

export async function listarCortes() {
  const { data, error } = await supabase
    .from("cortes_caja")
    .select("*, usuarios(nombre_usuario)")
    .order("creado_en", { ascending: false });
  if (error) throw new Error(obtenerMensajeError(error));
  return (data ?? []) as CorteCaja[];
}

export async function registrarCorte(usuarioId: string, tipoCorte: TipoCorte, tipoCaja: TipoCaja, total: number, observaciones?: string) {
  const { data, error } = await supabase
    .from("cortes_caja")
    .insert({
      usuario_id: usuarioId,
      tipo_corte: tipoCorte,
      tipo_caja: tipoCaja,
      total_al_corte: total,
      observaciones: observaciones?.trim() || null
    })
    .select()
    .single();
  if (error) throw new Error(obtenerMensajeError(error));
  return data as CorteCaja;
}

export async function listarActividad() {
  const { data, error } = await supabase
    .from("registro_actividad")
    .select("*, usuarios(nombre_usuario)")
    .order("creado_en", { ascending: false });
  if (error) throw new Error(obtenerMensajeError(error));
  return data ?? [];
}
