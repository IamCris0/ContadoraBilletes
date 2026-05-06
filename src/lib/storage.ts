import { supabase, obtenerMensajeError } from "@/lib/supabase";

const BUCKET_RECIBOS = "recibos-caja";

export async function subirRecibo(archivo: File, usuarioId: string): Promise<string> {
  const extension = archivo.name.split(".").pop() ?? "dat";
  const ruta = `${usuarioId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(BUCKET_RECIBOS).upload(ruta, archivo, {
    cacheControl: "3600",
    upsert: false
  });
  if (error) throw new Error(obtenerMensajeError(error));

  const { data } = supabase.storage.from(BUCKET_RECIBOS).getPublicUrl(ruta);
  return data.publicUrl;
}
