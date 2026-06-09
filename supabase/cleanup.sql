-- Limpieza de duplicados + índice único
-- Ejecutar UNA vez en Supabase → SQL Editor → New query → Run.

-- 1) (Opcional) ver los duplicados antes de borrarlos.
select lower(btrim(name)) as clave,
       count(*)            as cuantos,
       array_agg(id)       as ids
from participants
group by lower(btrim(name))
having count(*) > 1;

-- 2) Borrar duplicados dejando la fila MÁS ANTIGUA de cada nombre.
--    (Conservamos la más antigua porque suele ser la que ya tiene predicciones.)
delete from participants p
using participants q
where lower(btrim(p.name)) = lower(btrim(q.name))
  and p.updated_at > q.updated_at;

-- 3) Índice único definitivo: la BD ya no permite dos filas con el mismo nombre
--    (ignorando mayúsculas y espacios). Belt-and-suspenders junto al chequeo
--    de la app en lib/storage.ts → signIn().
create unique index if not exists participants_name_unique
  on participants (lower(btrim(name)));
