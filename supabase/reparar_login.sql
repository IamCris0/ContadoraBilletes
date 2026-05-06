create extension if not exists pgcrypto with schema extensions;

create or replace function public.verificar_login(p_nombre_usuario text, p_contrasena text)
returns table (id uuid, nombre_usuario text, creado_en timestamptz)
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  return query
  select u.id, u.nombre_usuario, u.creado_en
  from public.usuarios u
  where u.nombre_usuario = p_nombre_usuario
    and u.contrasena_hash = crypt(p_contrasena, u.contrasena_hash);
end;
$$;

set search_path = public, extensions;

insert into public.usuarios (nombre_usuario, contrasena_hash)
values
  ('GEA23', crypt('GEA23', gen_salt('bf'))),
  ('DANI29', crypt('DANI29', gen_salt('bf')))
on conflict (nombre_usuario) do update
set contrasena_hash = excluded.contrasena_hash;
