import { FormEvent, useMemo, useState } from "react";
import { Ban, FileUp, Plus, RotateCcw, Save } from "lucide-react";
import { ConteoBilletes, conteoVacio, totalConteo } from "@/componentes/compartidos/ConteoBilletes";
import { Badge, Button, Card, Input, Label, Select, Textarea } from "@/componentes/compartidos/ui";
import { useToast } from "@/componentes/compartidos/Toast";
import { crearMovimiento, anularMovimiento } from "@/lib/movimientos";
import { subirRecibo } from "@/lib/storage";
import { formatearDinero, numeroPositivo } from "@/lib/utils";
import type { CategoriaGasto, DetalleBilletes, MovimientoCaja, TipoCaja } from "@/tipos";

const categorias: CategoriaGasto[] = ["Suministros de oficina", "Limpieza", "Movilización técnica", "Préstamo a trabajador", "Otros"];
type Tab = "ingreso" | "salida" | "reposicion" | "anular";

export function ModuloCaja({ tipoCaja, usuarioId, movimientos, totalActual, onCambio }: { tipoCaja: TipoCaja; usuarioId: string; movimientos: MovimientoCaja[]; totalActual: number; onCambio: () => Promise<void> }) {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("ingreso");
  const [conteo, setConteo] = useState<DetalleBilletes>(conteoVacio);
  const [monto, setMonto] = useState("");
  const [motivo, setMotivo] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [categoria, setCategoria] = useState<CategoriaGasto>("Suministros de oficina");
  const [categoriaOtros, setCategoriaOtros] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [movimientoAnular, setMovimientoAnular] = useState("");
  const [motivoAnulacion, setMotivoAnulacion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const totalConteoActual = totalConteo(conteo);

  const movimientosAnulables = useMemo(() => movimientos.filter((movimiento) => movimiento.tipo_caja === tipoCaja && !movimiento.anulado), [movimientos, tipoCaja]);

  function limpiar() {
    setConteo(conteoVacio);
    setMonto("");
    setMotivo("");
    setObservaciones("");
    setArchivo(null);
    setMovimientoAnular("");
    setMotivoAnulacion("");
    setCategoria("Suministros de oficina");
    setCategoriaOtros("");
  }

  async function guardarIngreso(event: FormEvent) {
    event.preventDefault();
    if (totalConteoActual <= 0) {
      toast("El ingreso debe ser mayor a cero.", "error");
      return;
    }
    setGuardando(true);
    try {
      await crearMovimiento({ usuarioId, tipoCaja, tipo: "ingreso", monto: totalConteoActual, observaciones, detalleBilletes: conteo });
      toast("Ingreso registrado correctamente.", "exito");
      limpiar();
      await onCambio();
    } catch (error) {
      toast(error instanceof Error ? error.message : "No se pudo registrar el ingreso.", "error");
    } finally {
      setGuardando(false);
    }
  }

  async function guardarSimple(tipo: "salida" | "reposicion", event: FormEvent) {
    event.preventDefault();
    const valor = numeroPositivo(monto);
    if (!valor || valor <= 0) {
      toast("El monto debe ser un número positivo con máximo 2 decimales.", "error");
      return;
    }
    if (!motivo.trim()) {
      toast("El motivo es obligatorio.", "error");
      return;
    }
    setGuardando(true);
    try {
      let urlRecibo: string | null = null;
      if (tipoCaja === "chica" && tipo === "salida" && archivo) {
        urlRecibo = await subirRecibo(archivo, usuarioId);
      }
      await crearMovimiento({
        usuarioId,
        tipoCaja,
        tipo,
        monto: valor,
        motivo: tipoCaja === "chica" && tipo === "salida" && categoria === "Otros" ? `${motivo.trim()} | Otro: ${categoriaOtros.trim()}` : motivo,
        categoriaGasto: tipoCaja === "chica" && tipo === "salida" ? categoria : null,
        observaciones,
        urlRecibo
      });
      toast(`${tipo === "salida" ? "Salida" : "Reposición"} registrada correctamente.`, "exito");
      limpiar();
      await onCambio();
    } catch (error) {
      toast(error instanceof Error ? error.message : "No se pudo guardar el movimiento.", "error");
    } finally {
      setGuardando(false);
    }
  }

  async function confirmarAnulacion(event: FormEvent) {
    event.preventDefault();
    if (!movimientoAnular) {
      toast("Selecciona un movimiento para anular.", "error");
      return;
    }
    if (!motivoAnulacion.trim()) {
      toast("El motivo de anulación es obligatorio.", "error");
      return;
    }
    if (!window.confirm("Esta anulación no se puede revertir. ¿Deseas continuar?")) return;
    setGuardando(true);
    try {
      await anularMovimiento(movimientoAnular, usuarioId, motivoAnulacion);
      toast("Movimiento anulado correctamente.", "exito");
      limpiar();
      await onCambio();
    } catch (error) {
      toast(error instanceof Error ? error.message : "No se pudo anular el movimiento.", "error");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Card>
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">{tipoCaja === "general" ? "Caja general" : "Caja chica"}</h2>
          <p className="text-sm text-muted-foreground">Saldo actual: {formatearDinero(totalActual)} {tipoCaja === "chica" ? " | Saldo inicial: $100.00" : ""}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["ingreso", "salida", "reposicion", "anular"] as Tab[]).map((item) => (
            <Button key={item} type="button" variant={tab === item ? "default" : "outline"} onClick={() => setTab(item)} className="capitalize">{item}</Button>
          ))}
        </div>
      </div>

      {tab === "ingreso" && (
        <form className="grid gap-4" onSubmit={guardarIngreso}>
          <ConteoBilletes valor={conteo} onChange={setConteo} />
          <div className="grid gap-1.5"><Label>Observaciones</Label><Textarea value={observaciones} onChange={(event) => setObservaciones(event.target.value)} /></div>
          <Button type="submit" disabled={guardando}><Save className="h-4 w-4" /> Guardar</Button>
        </form>
      )}

      {tab === "salida" && (
        <form className="grid gap-4" onSubmit={(event) => guardarSimple("salida", event)}>
          <div className="grid gap-1.5"><Label>Monto</Label><Input type="number" min={0.01} step="0.01" value={monto} onChange={(event) => setMonto(event.target.value)} required /></div>
          {tipoCaja === "chica" && (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-1.5"><Label>Categoría de gasto</Label><Select value={categoria} onChange={(event) => setCategoria(event.target.value as CategoriaGasto)}>{categorias.map((item) => <option key={item}>{item}</option>)}</Select></div>
              {categoria === "Otros" && <div className="grid gap-1.5"><Label>Detalle de otros</Label><Input value={categoriaOtros} onChange={(event) => setCategoriaOtros(event.target.value)} /></div>}
              <div className="grid gap-1.5 md:col-span-2"><Label>Recibo o PDF</Label><Input type="file" accept="image/*,.pdf" onChange={(event) => setArchivo(event.target.files?.[0] ?? null)} /></div>
            </div>
          )}
          <div className="grid gap-1.5"><Label>Motivo</Label><Input value={motivo} onChange={(event) => setMotivo(event.target.value)} required /></div>
          <div className="grid gap-1.5"><Label>Observaciones</Label><Textarea value={observaciones} onChange={(event) => setObservaciones(event.target.value)} /></div>
          <Button type="submit" disabled={guardando}><Plus className="h-4 w-4" /> Guardar salida</Button>
          {archivo && <Badge><FileUp className="mr-1 h-3 w-3" /> {archivo.name}</Badge>}
        </form>
      )}

      {tab === "reposicion" && (
        <form className="grid gap-4" onSubmit={(event) => guardarSimple("reposicion", event)}>
          <div className="grid gap-1.5"><Label>Monto</Label><Input type="number" min={0.01} step="0.01" value={monto} onChange={(event) => setMonto(event.target.value)} required /></div>
          <div className="grid gap-1.5"><Label>Motivo</Label><Input value={motivo} onChange={(event) => setMotivo(event.target.value)} required /></div>
          <div className="grid gap-1.5"><Label>Observaciones</Label><Textarea value={observaciones} onChange={(event) => setObservaciones(event.target.value)} /></div>
          <Button type="submit" disabled={guardando}><RotateCcw className="h-4 w-4" /> Guardar reposición</Button>
        </form>
      )}

      {tab === "anular" && (
        <form className="grid gap-4" onSubmit={confirmarAnulacion}>
          <div className="grid gap-1.5"><Label>Movimiento a anular</Label><Select value={movimientoAnular} onChange={(event) => setMovimientoAnular(event.target.value)}><option value="">Selecciona un movimiento</option>{movimientosAnulables.map((movimiento) => <option key={movimiento.id} value={movimiento.id}>{new Date(movimiento.creado_en).toLocaleString("es-EC")} | {movimiento.tipo} | {formatearDinero(Number(movimiento.monto))}</option>)}</Select></div>
          <div className="grid gap-1.5"><Label>Motivo de anulación</Label><Textarea value={motivoAnulacion} onChange={(event) => setMotivoAnulacion(event.target.value)} required /></div>
          <Button type="submit" variant="destructive" disabled={guardando}><Ban className="h-4 w-4" /> Anular movimiento</Button>
        </form>
      )}
    </Card>
  );
}
