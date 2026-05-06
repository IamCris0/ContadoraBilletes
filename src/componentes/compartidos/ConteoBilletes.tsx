import type { DetalleBilletes } from "@/tipos";
import { Input, Label } from "@/componentes/compartidos/ui";
import { formatearDinero } from "@/lib/utils";

const denominaciones = [
  ["billete_100", "$100"],
  ["billete_50", "$50"],
  ["billete_20", "$20"],
  ["billete_10", "$10"],
  ["billete_5", "$5"]
] as const;

export const conteoVacio: DetalleBilletes = {
  billete_100: 0,
  billete_50: 0,
  billete_20: 0,
  billete_10: 0,
  billete_5: 0,
  monedas: 0
};

export function totalConteo(conteo: DetalleBilletes) {
  return conteo.billete_100 * 100 + conteo.billete_50 * 50 + conteo.billete_20 * 20 + conteo.billete_10 * 10 + conteo.billete_5 * 5 + Number(conteo.monedas || 0);
}

export function ConteoBilletes({ valor, onChange }: { valor: DetalleBilletes; onChange: (valor: DetalleBilletes) => void }) {
  function cambiar(campo: keyof DetalleBilletes, nuevoValor: string) {
    const numero = campo === "monedas" ? Number(nuevoValor.replace(",", ".")) : Number.parseInt(nuevoValor || "0", 10);
    if (!Number.isFinite(numero) || numero < 0) return;
    onChange({ ...valor, [campo]: campo === "monedas" ? Number(numero.toFixed(2)) : numero });
  }

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {denominaciones.map(([campo, etiqueta]) => (
          <div key={campo} className="grid gap-1">
            <Label>{etiqueta}</Label>
            <Input type="number" min={0} step={1} value={valor[campo]} onChange={(event) => cambiar(campo, event.target.value)} />
          </div>
        ))}
        <div className="grid gap-1">
          <Label>Monedas</Label>
          <Input type="number" min={0} step="0.01" value={valor.monedas} onChange={(event) => cambiar("monedas", event.target.value)} />
        </div>
      </div>
      <div className="rounded-md border bg-muted p-3 text-right">
        <p className="text-xs uppercase text-muted-foreground">Total calculado</p>
        <p className="text-2xl font-semibold">{formatearDinero(totalConteo(valor))}</p>
      </div>
    </div>
  );
}
