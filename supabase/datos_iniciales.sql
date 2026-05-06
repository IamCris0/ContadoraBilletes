create extension if not exists pgcrypto with schema extensions;

set search_path = public, extensions;

insert into public.usuarios (nombre_usuario, contrasena_hash)
values
  ('GEA23', crypt('GEA23', gen_salt('bf'))),
  ('DANI29', crypt('DANI29', gen_salt('bf')))
on conflict (nombre_usuario) do update
set contrasena_hash = excluded.contrasena_hash;
