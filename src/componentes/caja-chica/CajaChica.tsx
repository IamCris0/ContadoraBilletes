import { ModuloCaja } from "@/componentes/compartidos/ModuloCaja";
import type { MovimientoCaja } from "@/tipos";

export function CajaChica({ usuarioId, movimientos, total, onCambio }: { usuarioId: string; movimientos: MovimientoCaja[]; total: number; onCambio: () => Promise<void> }) {
  return <ModuloCaja tipoCaja="chica" usuarioId={usuarioId} movimientos={movimientos} totalActual={total} onCambio={onCambio} />;
}
