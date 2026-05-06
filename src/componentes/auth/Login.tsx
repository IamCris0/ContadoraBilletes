import { FormEvent, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { Button, Card, Input, Label } from "@/componentes/compartidos/ui";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/componentes/compartidos/Toast";

export function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [cargando, setCargando] = useState(false);

  async function enviar(event: FormEvent) {
    event.preventDefault();
    setCargando(true);
    try {
      await login(nombreUsuario, contrasena);
      toast("Sesión iniciada correctamente.", "exito");
    } catch (error) {
      toast(error instanceof Error ? error.message : "No se pudo iniciar sesión.", "error");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Control de Caja</h1>
            <p className="text-sm text-muted-foreground">Ingreso autorizado para GEA23 y DANI29</p>
          </div>
        </div>
        <form className="grid gap-4" onSubmit={enviar}>
          <div className="grid gap-1.5">
            <Label>Nombre de usuario</Label>
            <Input value={nombreUsuario} onChange={(event) => setNombreUsuario(event.target.value.toUpperCase())} autoFocus required />
          </div>
          <div className="grid gap-1.5">
            <Label>Contraseña</Label>
            <Input type="password" value={contrasena} onChange={(event) => setContrasena(event.target.value)} required />
          </div>
          <Button type="submit" disabled={cargando}>{cargando ? "Validando..." : "Ingresar"}</Button>
        </form>
      </Card>
    </main>
  );
}
