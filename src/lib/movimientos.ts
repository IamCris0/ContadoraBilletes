import { supabase, obtenerMensajeError } from "@/lib/supabase";
import type { CategoriaGasto, DetalleBilletes, MovimientoCaja, TipoCaja, TipoMovimiento } from "@/tipos";

export interface CrearMovimientoInput {
  usuarioId: string;
  tipoCaja: TipoCaja;
  tipo: Exclude<TipoMovimiento, "anulacion" | "corte_parcial" | "cierre_final">;
  monto: number;
  motivo?: string;
  categoriaGasto?: CategoriaGasto | null;
  observaciones?: string;
  detalleBilletes?: DetalleBilletes;
  urlRecibo?: string | null;
}

export async function listarMovimientos() {
  const { data, error } = await supabase
    .from("movimientos_caja")
    .select("*, usuarios!movimientos_caja_usuario_id_fkey(nombre_usuario), detalle_billetes(*)")
    .order("creado_en", { ascending: false });
  if (error) throw new Error(obtenerMensajeError(error));
  return (data ?? []) as MovimientoCaja[];
}

export async function crearMovimiento(input: CrearMovimientoInput) {
  if (["salida", "reposicion"].includes(input.tipo) && !input.motivo?.trim()) {
    throw new Error("El motivo es obligatorio para salidas y reposiciones.");
  }

  const { data, error } = await supabase
    .from("movimientos_caja")
    .insert({
      usuario_id: input.usuarioId,
      tipo: input.tipo,
      monto: input.monto,
      motivo: input.motivo?.trim() || null,
      categoria_gasto: input.categoriaGasto ?? null,
      observaciones: input.observaciones?.trim() || null,
      url_recibo: input.urlRecibo ?? null,
      tipo_caja: input.tipoCaja
    })
    .select()
    .single();

  if (error) throw new Error(obtenerMensajeError(error));

  if (input.detalleBilletes) {
    const { error: detalleError } = await supabase.from("detalle_billetes").insert({
      movimiento_id: data.id,
      billete_100: input.detalleBilletes.billete_100,
      billete_50: input.detalleBilletes.billete_50,
      billete_20: input.detalleBilletes.billete_20,
      billete_10: input.detalleBilletes.billete_10,
      billete_5: input.detalleBilletes.billete_5,
      monedas: input.detalleBilletes.monedas
    });
    if (detalleError) throw new Error(obtenerMensajeError(detalleError));
  }

  return data as MovimientoCaja;
}

export async function anularMovimiento(movimientoId: string, usuarioId: string, motivo: string) {
  if (!motivo.trim()) throw new Error("El motivo de anulación es obligatorio.");
  const { data, error } = await supabase
    .from("movimientos_caja")
    .update({
      anulado: true,
      motivo_anulacion: motivo.trim(),
      anulado_por: usuarioId,
      anulado_en: new Date().toISOString()
    })
    .eq("id", movimientoId)
    .eq("anulado", false)
    .select()
    .single();
  if (error) throw new Error(obtenerMensajeError(error));
  return data as MovimientoCaja;
}

export function calcularTotalCaja(movimientos: MovimientoCaja[], tipoCaja: TipoCaja) {
  const base = tipoCaja === "chica" ? 100 : 0;
  return movimientos
    .filter((movimiento) => movimiento.tipo_caja === tipoCaja && !movimiento.anulado)
    .reduce((total, movimiento) => {
      if (movimiento.tipo === "salida") return total - Number(movimiento.monto);
      if (movimiento.tipo === "ingreso" || movimiento.tipo === "reposicion") return total + Number(movimiento.monto);
      return total;
    }, base);
}

export function calcularBilletes(movimientos: MovimientoCaja[]): DetalleBilletes {
  return movimientos
    .filter((movimiento) => !movimiento.anulado && movimiento.tipo === "ingreso")
    .flatMap((movimiento) => movimiento.detalle_billetes ?? [])
    .reduce<DetalleBilletes>(
      (total, detalle) => ({
        billete_100: total.billete_100 + Number(detalle.billete_100),
        billete_50: total.billete_50 + Number(detalle.billete_50),
        billete_20: total.billete_20 + Number(detalle.billete_20),
        billete_10: total.billete_10 + Number(detalle.billete_10),
        billete_5: total.billete_5 + Number(detalle.billete_5),
        monedas: total.monedas + Number(detalle.monedas)
      }),
      { billete_100: 0, billete_50: 0, billete_20: 0, billete_10: 0, billete_5: 0, monedas: 0 }
    );
}
