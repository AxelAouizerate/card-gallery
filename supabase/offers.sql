-- Table des offres ("Faire une offre" sur une carte).
-- À exécuter UNE FOIS dans Supabase → SQL Editor.
-- Miroir de `photo_requests` + un montant proposé (offer_price).

create table if not exists public.offers (
  id             bigint generated always as identity primary key,
  user_id        uuid references auth.users (id) on delete set null,
  card_id        integer not null,
  card_set       text    not null,
  card_nom       text,
  card_prix      numeric,          -- prix affiché au moment de l'offre
  offer_price    numeric not null, -- montant proposé par l'acheteur
  contact_handle text    not null, -- @pseudo (sans le @)
  contact_platform text  not null, -- 'instagram' | 'facebook'
  session_id     text,
  created_at     timestamptz not null default now()
);

create index if not exists offers_created_at_idx on public.offers (created_at desc);
create index if not exists offers_session_idx    on public.offers (session_id, created_at desc);

-- RLS : un visiteur anonyme peut INSÉRER une offre, mais personne ne peut la
-- lire côté client (la lecture se fait via la service_role sur /stats).
alter table public.offers enable row level security;

drop policy if exists offers_insert_anon on public.offers;
create policy offers_insert_anon
  on public.offers for insert
  to anon, authenticated
  with check (true);

-- (Pas de policy SELECT/UPDATE/DELETE => lecture réservée à la service_role.)
