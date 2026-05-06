import { supabase, obtenerMensajeError } from "@/lib/supabase";
import type { Usuario } from "@/tipos";

const CLAVE_SESION = "control-caja.usuario";

export async function iniciarSesion(nombreUsuario: string, contrasena: string): Promise<Usuario> {
  const { data, error } = await supabase.rpc("verificar_login", {
    p_nombre_usuario: nombreUsuario.trim().toUpperCase(),
    p_contrasena: contrasena
  });

  if (error) throw new Error(obtenerMensajeError(error));
  const usuario = data?.[0];
  if (!usuario) throw new Error("Usuario o contraseña incorrectos.");

  localStorage.setItem(CLAVE_SESION, JSON.stringify(usuario));
  return usuario;
}

export function obtenerSesion(): Usuario | null {
  const guardado = localStorage.getItem(CLAVE_SESION);
  if (!guardado) return null;
  try {
    return JSON.parse(guardado) as Usuario;
  } catch {
    localStorage.removeItem(CLAVE_SESION);
    return null;
  }
}

export function cerrarSesion() {
  localStorage.removeItem(CLAVE_SESION);
}
