import { ModuloCaja } from "@/componentes/compartidos/ModuloCaja";
import type { MovimientoCaja } from "@/tipos";

export function CajaGeneral({ usuarioId, movimientos, total, onCambio }: { usuarioId: string; movimientos: MovimientoCaja[]; total: number; onCambio: () => Promise<void> }) {
  return <ModuloCaja tipoCaja="general" usuarioId={usuarioId} movimientos={movimientos} totalActual={total} onCambio={onCambio} />;
}
