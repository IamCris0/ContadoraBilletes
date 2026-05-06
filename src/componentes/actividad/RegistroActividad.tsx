import { useEffect, useState } from "react";
import { Card, Input, Select } from "@/componentes/compartidos/ui";
import { useToast } from "@/componentes/compartidos/Toast";
import { listarActividad } from "@/lib/cortes";
import { formatearFecha } from "@/lib/utils";
import type { RegistroActividad as RegistroActividadTipo } from "@/tipos";

export function RegistroActividad() {
  const { toast } = useToast();
  const [items, setItems] = useState<RegistroActividadTipo[]>([]);
  const [usuario, setUsuario] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  useEffect(() => {
    listarActividad()
      .then((data) => setItems(data as RegistroActividadTipo[]))
      .catch((error) => toast(error instanceof Error ? error.message : "No se pudo cargar la auditoría.", "error"));
  }, [toast]);

  const usuarios = Array.from(new Set(items.map((item) => item.usuarios?.nombre_usuario).filter(Boolean)));
  const filtrados = items.filter((item) => {
    const fecha = item.creado_en.slice(0, 10);
    return (!usuario || item.usuarios?.nombre_usuario === usuario) && (!desde || fecha >= desde) && (!hasta || fecha <= hasta);
  });

  return (
    <Card>
      <h2 className="mb-4 text-xl font-semibold">Registro de actividad</h2>
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <Select value={usuario} onChange={(event) => setUsuario(event.target.value)}><option value="">Todos los usuarios</option>{usuarios.map((item) => <option key={item} value={item}>{item}</option>)}</Select>
        <Input type="date" value={desde} onChange={(event) => setDesde(event.target.value)} />
        <Input type="date" value={hasta} onChange={(event) => setHasta(event.target.value)} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-muted-foreground"><tr><th className="py-2">Fecha/Hora</th><th>Usuario</th><th>Acción</th><th>Detalles</th></tr></thead>
          <tbody>
            {filtrados.map((item) => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="py-2">{formatearFecha(item.creado_en)}</td>
                <td>{item.usuarios?.nombre_usuario ?? "Usuario"}</td>
                <td>{item.accion}</td>
                <td className="max-w-lg truncate">{item.detalles ? JSON.stringify(item.detalles) : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
