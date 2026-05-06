import { useCallback, useEffect, useMemo, useState } from "react";
import { calcularBilletes, calcularTotalCaja, listarMovimientos } from "@/lib/movimientos";
import type { MovimientoCaja } from "@/tipos";

export function useCaja() {
  const [movimientos, setMovimientos] = useState<MovimientoCaja[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setMovimientos(await listarMovimientos());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los movimientos.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  return useMemo(
    () => ({
      movimientos,
      cargando,
      error,
      recargar,
      totalGeneral: calcularTotalCaja(movimientos, "general"),
      totalChica: calcularTotalCaja(movimientos, "chica"),
      billetes: calcularBilletes(movimientos)
    }),
    [movimientos, cargando, error, recargar]
  );
}
