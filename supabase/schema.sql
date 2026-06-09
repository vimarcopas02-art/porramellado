-- Porra Mundial 2026 — esquema de base de datos
-- Cómo aplicarlo: en Supabase, abre "SQL Editor" → "New query",
-- pega todo este archivo y pulsa "Run".

-- Participantes: un registro por persona de la peña.
create table if not exists participants (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  secret      text not null,
  predictions jsonb not null default '{}'::jsonb,
  locked      boolean not null default false,
  locked_at   timestamptz,
  updated_at  timestamptz not null default now()
);

-- Un nombre = una porra. Comparación case-insensitive y sin espacios sobrantes,
-- para que "Vicente", "vicente" y "  Vicente " sean la misma persona y la BD
-- impida crear duplicados aunque dos peticiones lleguen a la vez.
create unique index if not exists participants_name_unique
  on participants (lower(btrim(name)));

-- Resultados reales: una sola fila (id = 1) que gestiona el administrador.
create table if not exists results (
  id              int primary key default 1,
  group_matches   jsonb not null default '{}'::jsonb,
  bracket         jsonb not null default '{}'::jsonb,
  bracket_scores  jsonb not null default '{}'::jsonb,
  question_grades jsonb not null default '{}'::jsonb,
  updated_at      timestamptz not null default now(),
  constraint results_single_row check (id = 1)
);

insert into results (id) values (1) on conflict (id) do nothing;

-- Seguridad a nivel de fila.
alter table participants enable row level security;
alter table results enable row level security;

-- Porra entre amigos: lectura y escritura abiertas con la clave pública (anon).
-- La integridad la dan el "secret" del dispositivo (desde la app cada uno solo
-- edita su propia porra) y el botón "Guardar porra".
drop policy if exists participants_read on participants;
drop policy if exists participants_insert on participants;
drop policy if exists participants_update on participants;
drop policy if exists participants_delete on participants;
create policy participants_read on participants for select using (true);
create policy participants_insert on participants for insert with check (true);
create policy participants_update on participants for update using (true) with check (true);
create policy participants_delete on participants for delete using (true);

drop policy if exists results_read on results;
drop policy if exists results_update on results;
create policy results_read on results for select using (true);
create policy results_update on results for update using (true) with check (true);

-- Realtime: la clasificación se actualiza en vivo en todos los móviles.
alter publication supabase_realtime add table participants;
alter publication supabase_realtime add table results;
