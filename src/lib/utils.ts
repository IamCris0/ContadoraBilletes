import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatearDinero(valor: number) {
  return new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(valor || 0);
}

export function formatearFecha(fecha: string) {
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "short", timeStyle: "short" }).format(new Date(fecha));
}

export function numeroPositivo(valor: string) {
  const limpio = valor.replace(",", ".");
  if (!/^\d*(\.\d{0,2})?$/.test(limpio)) return null;
  const numero = Number(limpio);
  return Number.isFinite(numero) && numero >= 0 ? numero : null;
}
