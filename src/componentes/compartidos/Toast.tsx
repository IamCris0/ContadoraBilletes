import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTipo = "exito" | "error" | "info";
type ToastItem = { id: string; mensaje: string; tipo: ToastTipo };
type ToastContextValue = { toast: (mensaje: string, tipo?: ToastTipo) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const toast = useCallback((mensaje: string, tipo: ToastTipo = "info") => {
    const id = crypto.randomUUID();
    setItems((actuales) => [...actuales, { id, mensaje, tipo }]);
    window.setTimeout(() => setItems((actuales) => actuales.filter((item) => item.id !== id)), 4200);
  }, []);
  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 grid w-96 max-w-[calc(100vw-2rem)] gap-2">
        {items.map((item) => (
          <div key={item.id} className={cn("flex items-start justify-between gap-3 rounded-md border p-3 text-sm shadow-lg", item.tipo === "error" ? "border-destructive bg-red-50 text-red-900" : item.tipo === "exito" ? "border-accent bg-emerald-50 text-emerald-900" : "bg-white")}>
            <span>{item.mensaje}</span>
            <button aria-label="Cerrar notificación" onClick={() => setItems((actuales) => actuales.filter((actual) => actual.id !== item.id))}>
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de ToastProvider.");
  return ctx;
}
