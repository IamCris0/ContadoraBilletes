export type TipoCaja = "general" | "chica";
export type TipoMovimiento = "ingreso" | "salida" | "reposicion" | "anulacion" | "corte_parcial" | "cierre_final";
export type TipoCorte = "parcial" | "final";
export type CategoriaGasto =
  | "Suministros de oficina"
  | "Limpieza"
  | "Movilización técnica"
  | "Préstamo a trabajador"
  | "Otros";

export interface Usuario {
  id: string;
  nombre_usuario: string;
  creado_en: string;
}

export interface DetalleBilletes {
  id?: string;
  movimiento_id?: string;
  billete_100: number;
  billete_50: number;
  billete_20: number;
  billete_10: number;
  billete_5: number;
  monedas: number;
  total?: number;
}

export interface MovimientoCaja {
  id: string;
  usuario_id: string;
  tipo: TipoMovimiento;
  monto: number;
  motivo: string | null;
  categoria_gasto: CategoriaGasto | null;
  observaciones: string | null;
  creado_en: string;
  anulado: boolean;
  motivo_anulacion: string | null;
  anulado_por: string | null;
  anulado_en: string | null;
  url_recibo: string | null;
  tipo_caja: TipoCaja;
  usuarios?: Pick<Usuario, "nombre_usuario"> | null;
  detalle_billetes?: DetalleBilletes[] | null;
}

export interface CorteCaja {
  id: string;
  usuario_id: string;
  tipo_corte: TipoCorte;
  tipo_caja: TipoCaja;
  total_al_corte: number;
  observaciones: string | null;
  creado_en: string;
  usuarios?: Pick<Usuario, "nombre_usuario"> | null;
}

export interface RegistroActividad {
  id: string;
  usuario_id: string;
  accion: string;
  detalles: Record<string, unknown> | null;
  creado_en: string;
  usuarios?: Pick<Usuario, "nombre_usuario"> | null;
}

export interface ResumenCaja {
  totalGeneral: number;
  totalChica: number;
  billetes: DetalleBilletes;
  movimientos: MovimientoCaja[];
}

export type Database = {
  public: {
    Tables: {
      usuarios: {
        Row: Usuario & { contrasena_hash: string };
        Insert: { id?: string; nombre_usuario: string; contrasena_hash: string; creado_en?: string };
        Update: Partial<{ nombre_usuario: string; contrasena_hash: string; creado_en: string }>;
      };
      movimientos_caja: {
        Row: MovimientoCaja;
        Insert: Omit<MovimientoCaja, "id" | "creado_en" | "anulado" | "motivo_anulacion" | "anulado_por" | "anulado_en"> &
          Partial<Pick<MovimientoCaja, "id" | "creado_en" | "anulado" | "motivo_anulacion" | "anulado_por" | "anulado_en">>;
        Update: Partial<MovimientoCaja>;
      };
      detalle_billetes: {
        Row: Required<DetalleBilletes>;
        Insert: Omit<DetalleBilletes, "id" | "total"> & { id?: string };
        Update: Partial<DetalleBilletes>;
      };
      cortes_caja: {
        Row: CorteCaja;
        Insert: Omit<CorteCaja, "id" | "creado_en"> & { id?: string; creado_en?: string };
        Update: Partial<CorteCaja>;
      };
      registro_actividad: {
        Row: RegistroActividad;
        Insert: Omit<RegistroActividad, "id" | "creado_en"> & { id?: string; creado_en?: string };
        Update: Partial<RegistroActividad>;
      };
    };
    Functions: {
      verificar_login: {
        Args: { p_nombre_usuario: string; p_contrasena: string };
        Returns: Usuario[];
      };
    };
  };
};
