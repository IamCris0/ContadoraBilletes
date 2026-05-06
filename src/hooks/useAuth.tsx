import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { cerrarSesion, iniciarSesion, obtenerSesion } from "@/lib/auth";
import type { Usuario } from "@/tipos";

type AuthContextValue = {
  usuario: Usuario | null;
  login: (nombreUsuario: string, contrasena: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => obtenerSesion());

  async function login(nombreUsuario: string, contrasena: string) {
    const sesion = await iniciarSesion(nombreUsuario, contrasena);
    setUsuario(sesion);
  }

  function logout() {
    cerrarSesion();
    setUsuario(null);
  }

  const value = useMemo(() => ({ usuario, login, logout }), [usuario]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider.");
  return ctx;
}
