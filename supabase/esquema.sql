create extension if not exists pgcrypto;

create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  nombre_usuario text unique not null,
  contrasena_hash text not null,
  creado_en timestamptz not null default now()
);

create table if not exists public.movimientos_caja (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios(id),
  tipo text not null check (tipo in ('ingreso', 'salida', 'reposicion', 'anulacion', 'corte_parcial', 'cierre_final')),
  monto numeric(12,2) not null check (monto >= 0),
  motivo text,
  categoria_gasto text check (categoria_gasto is null or categoria_gasto in ('Suministros de oficina', 'Limpieza', 'Movilización técnica', 'Préstamo a trabajador', 'Otros')),
  observaciones text,
  creado_en timestamptz not null default now(),
  anulado boolean not null default false,
  motivo_anulacion text,
  anulado_por uuid references public.usuarios(id),
  anulado_en timestamptz,
  url_recibo text,
  tipo_caja text not null check (tipo_caja in ('general', 'chica')),
  constraint motivo_requerido_por_tipo check (
    tipo not in ('salida', 'reposicion', 'anulacion') or length(trim(coalesce(motivo, ''))) > 0
  ),
  constraint motivo_anulacion_requerido check (
    anulado = false or length(trim(coalesce(motivo_anulacion, ''))) > 0
  )
);

create table if not exists public.detalle_billetes (
  id uuid primary key default gen_random_uuid(),
  movimiento_id uuid not null references public.movimientos_caja(id) on delete restrict,
  billete_100 integer not null default 0 check (billete_100 >= 0),
  billete_50 integer not null default 0 check (billete_50 >= 0),
  billete_20 integer not null default 0 check (billete_20 >= 0),
  billete_10 integer not null default 0 check (billete_10 >= 0),
  billete_5 integer not null default 0 check (billete_5 >= 0),
  monedas numeric(8,2) not null default 0 check (monedas >= 0),
  total numeric(12,2) generated always as (
    billete_100 * 100 + billete_50 * 50 + billete_20 * 20 + billete_10 * 10 + billete_5 * 5 + monedas
  ) stored
);

create table if not exists public.cortes_caja (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios(id),
  tipo_corte text not null check (tipo_corte in ('parcial', 'final')),
  tipo_caja text not null check (tipo_caja in ('general', 'chica')),
  total_al_corte numeric(12,2) not null default 0,
  observaciones text,
  creado_en timestamptz not null default now()
);

create table if not exists public.registro_actividad (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios(id),
  accion text not null,
  detalles jsonb,
  creado_en timestamptz not null default now()
);

create or replace function public.verificar_login(p_nombre_usuario text, p_contrasena text)
returns table (id uuid, nombre_usuario text, creado_en timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select u.id, u.nombre_usuario, u.creado_en
  from public.usuarios u
  where u.nombre_usuario = p_nombre_usuario
    and u.contrasena_hash = crypt(p_contrasena, u.contrasena_hash);
end;
$$;

create or replace function public.registrar_actividad()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_table_name = 'movimientos_caja' then
    insert into public.registro_actividad(usuario_id, accion, detalles)
    values (
      coalesce(new.anulado_por, new.usuario_id),
      case
        when tg_op = 'INSERT' then 'Movimiento registrado'
        when tg_op = 'UPDATE' and new.anulado = true and old.anulado = false then 'Movimiento anulado'
        else 'Movimiento actualizado'
      end,
      jsonb_build_object('movimiento_id', new.id, 'tipo', new.tipo, 'tipo_caja', new.tipo_caja, 'monto', new.monto)
    );
  elsif tg_table_name = 'cortes_caja' then
    insert into public.registro_actividad(usuario_id, accion, detalles)
    values (
      new.usuario_id,
      case when new.tipo_corte = 'final' then 'Cierre final de caja' else 'Corte parcial de caja' end,
      jsonb_build_object('corte_id', new.id, 'tipo_caja', new.tipo_caja, 'total_al_corte', new.total_al_corte)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_actividad_movimientos on public.movimientos_caja;
create trigger trg_actividad_movimientos
after insert or update on public.movimientos_caja
for each row execute function public.registrar_actividad();

drop trigger if exists trg_actividad_cortes on public.cortes_caja;
create trigger trg_actividad_cortes
after insert on public.cortes_caja
for each row execute function public.registrar_actividad();

alter table public.usuarios enable row level security;
alter table public.movimientos_caja enable row level security;
alter table public.detalle_billetes enable row level security;
alter table public.cortes_caja enable row level security;
alter table public.registro_actividad enable row level security;

create policy "usuarios pueden consultar su fila por nombre autenticado"
on public.usuarios for select
using (true);

create policy "movimientos visibles para usuarios de caja"
on public.movimientos_caja for select
using (exists (select 1 from public.usuarios u where u.id = usuario_id));

create policy "movimientos insertables por usuarios de caja"
on public.movimientos_caja for insert
with check (exists (select 1 from public.usuarios u where u.id = usuario_id));

create policy "movimientos anulables por usuarios de caja"
on public.movimientos_caja for update
using (exists (select 1 from public.usuarios u where u.id = usuario_id))
with check (anulado = true and length(trim(coalesce(motivo_anulacion, ''))) > 0);

create policy "detalle visible para usuarios de caja"
on public.detalle_billetes for select
using (exists (select 1 from public.movimientos_caja m where m.id = movimiento_id));

create policy "detalle insertable para usuarios de caja"
on public.detalle_billetes for insert
with check (exists (select 1 from public.movimientos_caja m where m.id = movimiento_id));

create policy "cortes visibles para usuarios de caja"
on public.cortes_caja for select
using (exists (select 1 from public.usuarios u where u.id = usuario_id));

create policy "cortes insertables por usuarios de caja"
on public.cortes_caja for insert
with check (exists (select 1 from public.usuarios u where u.id = usuario_id));

create policy "actividad visible para usuarios de caja"
on public.registro_actividad for select
using (exists (select 1 from public.usuarios u where u.id = usuario_id));

insert into storage.buckets (id, name, public)
values ('recibos-caja', 'recibos-caja', true)
on conflict (id) do nothing;

create policy "recibos visibles"
on storage.objects for select
using (bucket_id = 'recibos-caja');

create policy "recibos cargables"
on storage.objects for insert
with check (bucket_id = 'recibos-caja');
