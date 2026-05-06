import { useEffect, useState } from "react";
import { Activity, Banknote, ClipboardList, LogOut, PanelTop, WalletCards } from "lucide-react";
import { Login } from "@/componentes/auth/Login";
import { PanelPrincipal } from "@/componentes/panel/PanelPrincipal";
import { CajaGeneral } from "@/componentes/caja-general/CajaGeneral";
import { CajaChica } from "@/componentes/caja-chica/CajaChica";
import { CortesCaja } from "@/componentes/cortes/CortesCaja";
import { RegistroActividad } from "@/componentes/actividad/RegistroActividad";
import { Button } from "@/componentes/compartidos/ui";
import { useToast } from "@/componentes/compartidos/Toast";
import { useAuth } from "@/hooks/useAuth";
import { useCaja } from "@/hooks/useCaja";
import { cn } from "@/lib/utils";

type Vista = "panel" | "general" | "chica" | "cortes" | "actividad";

const vistas = [
  { id: "panel", etiqueta: "Panel", icono: PanelTop },
  { id: "general", etiqueta: "Caja general", icono: Banknote },
  { id: "chica", etiqueta: "Caja chica", icono: WalletCards },
  { id: "cortes", etiqueta: "Cortes", icono: ClipboardList },
  { id: "actividad", etiqueta: "Actividad", icono: Activity }
] as const;

export function Shell() {
  const { usuario, logout } = useAuth();
  const { toast } = useToast();
  const caja = useCaja();
  const [vista, setVista] = useState<Vista>("panel");

  useEffect(() => {
    if (caja.error) toast(caja.error, "error");
  }, [caja.error, toast]);

  if (!usuario) return <Login />;

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Sistema de Control de Caja</h1>
            <p className="text-sm text-muted-foreground">Usuario activo: {usuario.nombre_usuario}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {vistas.map((item) => {
              const Icono = item.icono;
              return (
                <Button key={item.id} variant={vista === item.id ? "default" : "outline"} onClick={() => setVista(item.id)} className={cn("h-9 px-3")}>
                  <Icono className="h-4 w-4" /> {item.etiqueta}
                </Button>
              );
            })}
            <Button variant="ghost" onClick={logout}><LogOut className="h-4 w-4" /> Salir</Button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl p-4">
        {caja.cargando && <p className="mb-3 text-sm text-muted-foreground">Cargando información de caja...</p>}
        {vista === "panel" && <PanelPrincipal totalGeneral={caja.totalGeneral} totalChica={caja.totalChica} billetes={caja.billetes} movimientos={caja.movimientos} />}
        {vista === "general" && <CajaGeneral usuarioId={usuario.id} movimientos={caja.movimientos} total={caja.totalGeneral} onCambio={caja.recargar} />}
        {vista === "chica" && <CajaChica usuarioId={usuario.id} movimientos={caja.movimientos} total={caja.totalChica} onCambio={caja.recargar} />}
        {vista === "cortes" && <CortesCaja usuarioId={usuario.id} totalGeneral={caja.totalGeneral} totalChica={caja.totalChica} />}
        {vista === "actividad" && <RegistroActividad />}
      </div>
    </main>
  );
}
