import { useEffect, useMemo, useState } from "react";
import { CalendarClock, CheckCircle2 } from "lucide-react";
import { Button, Card, Label, Select, Textarea } from "@/componentes/compartidos/ui";
import { useToast } from "@/componentes/compartidos/Toast";
import { listarCortes, registrarCorte } from "@/lib/cortes";
import { formatearDinero, formatearFecha } from "@/lib/utils";
import type { CorteCaja, TipoCaja } from "@/tipos";

export function CortesCaja({ usuarioId, totalGeneral, totalChica }: { usuarioId: string; totalGeneral: number; totalChica: number }) {
  const { toast } = useToast();
  const [cortes, setCortes] = useState<CorteCaja[]>([]);
  const [tipoCaja, setTipoCaja] = useState<TipoCaja>("general");
  const [observaciones, setObservaciones] = useState("");
  const total = tipoCaja === "general" ? totalGeneral : totalChica;
  const hoy = new Date().toISOString().slice(0, 10);
  const cortesHoy = useMemo(() => cortes.filter((corte) => corte.creado_en.startsWith(hoy)), [cortes, hoy]);

  async function cargar() {
    try {
      setCortes(await listarCortes());
    } catch (error) {
      toast(error instanceof Error ? error.message : "No se pudieron cargar los cortes.", "error");
    }
  }

  useEffect(() => {
    void cargar();
  }, []);

  async function guardar(tipo: "parcial" | "final") {
    if (tipo === "final" && !window.confirm("El cierre final marca el fin de la jornada. ¿Deseas continuar?")) return;
    try {
      await registrarCorte(usuarioId, tipo, tipoCaja, total, observaciones);
      toast(tipo === "final" ? "Cierre final registrado." : "Corte parcial registrado.", "exito");
      setObservaciones("");
      await cargar();
    } catch (error) {
      toast(error instanceof Error ? error.message : "No se pudo registrar el corte.", "error");
    }
  }

  return (
    <Card>
      <div className="mb-5 flex items-center gap-3"><CalendarClock className="h-5 w-5 text-primary" /><h2 className="text-xl font-semibold">Cortes de caja</h2></div>
      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <div className="grid gap-1.5"><Label>Tipo de caja</Label><Select value={tipoCaja} onChange={(event) => setTipoCaja(event.target.value as TipoCaja)}><option value="general">General</option><option value="chica">Chica</option></Select></div>
        <div className="rounded-md border bg-muted p-3"><p className="text-sm text-muted-foreground">Total al corte</p><p className="text-2xl font-semibold">{formatearDinero(total)}</p></div>
        <div className="grid gap-1.5 md:col-span-2"><Label>Observaciones</Label><Textarea value={observaciones} onChange={(event) => setObservaciones(event.target.value)} /></div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={() => guardar("parcial")}><CheckCircle2 className="h-4 w-4" /> Realizar Corte Parcial</Button>
        <Button variant="destructive" onClick={() => guardar("final")}>Cierre Final de Caja</Button>
      </div>
      <div className="mt-6 grid gap-3">
        <h3 className="font-semibold">Historial del día</h3>
        {cortesHoy.map((corte) => (
          <div key={corte.id} className="grid gap-1 border-l-2 border-primary pl-4 text-sm">
            <p className="font-medium">{corte.tipo_corte === "final" ? "Cierre final" : "Corte parcial"} | Caja {corte.tipo_caja}</p>
            <p className="text-muted-foreground">{formatearFecha(corte.creado_en)} | {formatearDinero(Number(corte.total_al_corte))}</p>
            {corte.observaciones && <p>{corte.observaciones}</p>}
          </div>
        ))}
        {cortesHoy.length === 0 && <p className="text-sm text-muted-foreground">Aún no hay cortes registrados hoy.</p>}
      </div>
    </Card>
  );
}
