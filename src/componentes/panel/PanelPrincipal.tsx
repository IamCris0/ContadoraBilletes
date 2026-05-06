import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge, Card, Input, Select, Textarea } from "@/componentes/compartidos/ui";
import { formatearDinero, formatearFecha } from "@/lib/utils";
import type { DetalleBilletes, MovimientoCaja } from "@/tipos";

function datosSemanales(movimientos: MovimientoCaja[]) {
  const dias = new Map<string, { fecha: string; ingresos: number; egresos: number }>();
  const inicio = new Date();
  inicio.setDate(inicio.getDate() - 6);

  movimientos.forEach((movimiento) => {
    const fechaMovimiento = new Date(movimiento.creado_en);
    if (fechaMovimiento < inicio || movimiento.anulado) return;
    const clave = fechaMovimiento.toLocaleDateString("es-EC", { weekday: "short", day: "2-digit" });
    const actual = dias.get(clave) ?? { fecha: clave, ingresos: 0, egresos: 0 };
    if (movimiento.tipo === "salida") actual.egresos += Number(movimiento.monto);
    if (movimiento.tipo === "ingreso" || movimiento.tipo === "reposicion") actual.ingresos += Number(movimiento.monto);
    dias.set(clave, actual);
  });

  return Array.from(dias.values());
}

export function PanelPrincipal({ totalGeneral, totalChica, billetes, movimientos }: { totalGeneral: number; totalChica: number; billetes: DetalleBilletes; movimientos: MovimientoCaja[] }) {
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [fechaFiltro, setFechaFiltro] = useState("");
  const chartData = useMemo(() => datosSemanales(movimientos), [movimientos]);
  const filtrados = movimientos.filter((movimiento) => {
    const coincideTipo = !tipoFiltro || movimiento.tipo === tipoFiltro;
    const coincideFecha = !fechaFiltro || movimiento.creado_en.startsWith(fechaFiltro);
    return coincideTipo && coincideFecha;
  });

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card><p className="text-sm text-muted-foreground">Caja general</p><p className="text-3xl font-semibold">{formatearDinero(totalGeneral)}</p></Card>
        <Card><p className="text-sm text-muted-foreground">Caja chica</p><p className="text-3xl font-semibold">{formatearDinero(totalChica)}</p><p className="text-xs text-muted-foreground">Saldo inicial: $100.00</p></Card>
        <Card className="xl:col-span-2">
          <p className="mb-3 text-sm text-muted-foreground">Detalle de billetes</p>
          <div className="grid grid-cols-3 gap-2 text-sm md:grid-cols-6">
            <Badge>$100: {billetes.billete_100}</Badge><Badge>$50: {billetes.billete_50}</Badge><Badge>$20: {billetes.billete_20}</Badge><Badge>$10: {billetes.billete_10}</Badge><Badge>$5: {billetes.billete_5}</Badge><Badge>Monedas: {formatearDinero(billetes.monedas)}</Badge>
          </div>
        </Card>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Ingresos vs egresos semanal</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip formatter={(value) => formatearDinero(Number(value))} />
                <Legend />
                <Bar dataKey="ingresos" fill="#168895" name="Ingresos" />
                <Bar dataKey="egresos" fill="#d94848" name="Egresos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Observaciones</h2>
          <Textarea placeholder="Notas operativas de la jornada" />
        </Card>
      </div>
      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end">
          <div className="grid gap-1 md:w-56"><span className="text-sm font-medium">Fecha</span><Input type="date" value={fechaFiltro} onChange={(event) => setFechaFiltro(event.target.value)} /></div>
          <div className="grid gap-1 md:w-56"><span className="text-sm font-medium">Tipo</span><Select value={tipoFiltro} onChange={(event) => setTipoFiltro(event.target.value)}><option value="">Todos</option><option value="ingreso">Ingreso</option><option value="salida">Salida</option><option value="reposicion">Reposición</option></Select></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-muted-foreground"><tr><th className="py-2">Fecha/Hora</th><th>Usuario</th><th>Caja</th><th>Tipo</th><th>Monto</th><th>Motivo</th><th>Estado</th></tr></thead>
            <tbody>
              {filtrados.map((movimiento) => (
                <tr key={movimiento.id} className="border-b last:border-0">
                  <td className="py-2">{formatearFecha(movimiento.creado_en)}</td>
                  <td>{movimiento.usuarios?.nombre_usuario ?? "Usuario"}</td>
                  <td>{movimiento.tipo_caja}</td>
                  <td>{movimiento.tipo}</td>
                  <td>{formatearDinero(Number(movimiento.monto))}</td>
                  <td>{movimiento.motivo ?? "-"}</td>
                  <td>{movimiento.anulado ? "Anulado" : "Activo"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
