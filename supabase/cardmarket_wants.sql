-- ============================================================================
--  Recap automatique des alertes "wants" CardMarket (mail toutes les 2h)
--  - wants_alerts : une ligne par mail d'alerte CardMarket recu, dedupliquee
--    par message_id (Message-ID du mail). notifie_at reste NULL tant que
--    l'alerte n'a pas encore ete incluse dans un recap envoye.
-- ============================================================================

create schema if not exists cardmarket;

do $$ begin
  create type cardmarket.priorite as enum ('tres_grosse', 'grosse', 'basse');
exception when duplicate_object then null; end $$;

create table if not exists cardmarket.wants_alerts (
  id            bigserial primary key,
  message_id    text unique not null,
  received_at   timestamptz not null,
  vendeur       text not null,
  carte         text not null,
  prix          numeric(12,2),
  url           text,
  priorite      cardmarket.priorite not null default 'basse',
  notifie_at    timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists idx_wants_alerts_a_notifier
  on cardmarket.wants_alerts (received_at)
  where notifie_at is null;

-- Curseur IMAP : dernier UID Gmail deja traite, pour ne relire a chaque
-- passage que les nouveaux mails (evite de rescanner toute la boite).
create table if not exists cardmarket.imap_state (
  id         int primary key default 1,
  last_uid   bigint not null default 0,
  updated_at timestamptz not null default now(),
  constraint imap_state_singleton check (id = 1)
);
insert into cardmarket.imap_state (id, last_uid)
  values (1, 0)
  on conflict (id) do nothing;
