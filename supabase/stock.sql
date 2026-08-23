-- ============================================================================
--  Gestion de stock achat/revente TCG
--  - card_types : le referentiel (une carte "modele")
--  - items      : un exemplaire physique (c'est LUI qu'on achete et qu'on vend)
--  - photos     : 0..n photos rattachees a un exemplaire
--  Rien de calcule n'est stocke : marges, anciennete et alertes sont des vues.
-- ============================================================================

create schema if not exists stock;

-- ─── Referentiel ────────────────────────────────────────────────────────────
create table if not exists stock.card_types (
  id              bigserial primary key,
  code            text unique,          -- code imprime : LCGX-EN176, DP06-FR008
  nom             text not null,
  set_code        text not null,
  rarete          text,
  langue          text,                 -- fr / en / jp / ...
  is_1st          boolean not null default false,
  jeu             text not null default 'yugioh',
  cardmarket_url  text,
  created_at      timestamptz not null default now()
);
create index if not exists idx_ct_set  on stock.card_types (lower(set_code));
create index if not exists idx_ct_nom  on stock.card_types (lower(nom));

-- ─── Exemplaires ────────────────────────────────────────────────────────────
do $$ begin
  create type stock.item_statut as enum ('commandee', 'en_stock', 'vendue');
exception when duplicate_object then null; end $$;

create table if not exists stock.items (
  id                 bigserial primary key,
  card_type_id       bigint not null references stock.card_types(id) on delete restrict,
  proprietaire       text not null default 'moi',   -- 'moi' | 's2' | 's3'
  statut             stock.item_statut not null default 'en_stock',

  etat               text,          -- NM, EX, LP...
  grade              numeric(3,1),
  grade_org          text,          -- PSA, CCC, CollectAura...
  pop                int,

  prix_affiche       numeric(10,2), -- prix demande
  date_mise_en_vente date,          -- point de depart du compteur des 3 mois

  date_achat         date,
  prix_achat         numeric(10,2),
  source_achat       text,

  date_vente         date,
  prix_vente         numeric(10,2),
  acheteur           text,
  plateforme_vente   text,
  frais              numeric(10,2) not null default 0,

  legacy_id          int,           -- id du Google Sheet, pour la reprise
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  constraint vendue_a_une_date check (statut <> 'vendue' or date_vente is not null),
  constraint pas_vendue_pas_de_date check (statut = 'vendue' or date_vente is null)
);
create index if not exists idx_items_statut on stock.items (proprietaire, statut);
create index if not exists idx_items_legacy on stock.items (legacy_id);

create table if not exists stock.photos (
  id        bigserial primary key,
  item_id   bigint not null references stock.items(id) on delete cascade,
  slot      smallint not null check (slot in (1, 2)),   -- 1 = recto, 2 = verso
  url       text not null,
  unique (item_id, slot)
);

create or replace function stock.touch() returns trigger as $$
begin new.updated_at = now(); return new; end $$ language plpgsql;
drop trigger if exists trg_items_touch on stock.items;
create trigger trg_items_touch before update on stock.items
  for each row execute function stock.touch();

-- ─── Vues ───────────────────────────────────────────────────────────────────
create or replace view stock.v_stock as
select i.id, i.proprietaire, ct.nom, ct.set_code, ct.rarete, ct.langue, ct.is_1st,
       i.etat, i.grade_org, i.grade, i.pop, i.prix_affiche,
       i.date_achat, i.prix_achat, i.date_mise_en_vente,
       (current_date - i.date_mise_en_vente) as jours_en_vente,
       (select count(*) from stock.photos p where p.item_id = i.id) as nb_photos
from stock.items i
join stock.card_types ct on ct.id = i.card_type_id
where i.statut = 'en_stock';

create or replace view stock.v_mon_stock as
select * from stock.v_stock where proprietaire = 'moi';

-- Cartes en vente depuis plus de 3 mois -> a passer aux encheres
create or replace view stock.v_encheres as
select * from stock.v_mon_stock
where date_mise_en_vente is not null
  and date_mise_en_vente < current_date - interval '3 months'
order by date_mise_en_vente;

create or replace view stock.v_ventes as
select i.id, ct.nom, ct.set_code, ct.rarete, ct.langue, i.etat,
       i.date_achat, i.prix_achat, i.date_vente, i.prix_vente, i.frais,
       i.acheteur, i.plateforme_vente,
       case when i.prix_achat is not null
            then i.prix_vente - i.prix_achat - i.frais end as benefice,
       case when i.prix_achat is not null and i.prix_achat > 0
            then round((i.prix_vente - i.prix_achat - i.frais) / i.prix_achat * 100, 1) end as marge_pct,
       (i.date_vente - i.date_achat) as jours_pour_vendre
from stock.items i
join stock.card_types ct on ct.id = i.card_type_id
where i.statut = 'vendue' and i.proprietaire = 'moi';

create or replace view stock.v_benefices_mensuels as
select date_trunc('month', date_vente)::date as mois,
       count(*)                        as nb_ventes,
       sum(prix_vente)                 as ca,
       sum(benefice) filter (where benefice is not null) as benefice_connu,
       count(*) filter (where benefice is null)          as ventes_sans_prix_achat
from stock.v_ventes
group by 1 order by 1 desc;

-- ─── Fonctions ──────────────────────────────────────────────────────────────
create or replace function stock.vendre(
  p_item bigint, p_prix numeric,
  p_plateforme text default null, p_acheteur text default null,
  p_date date default current_date
) returns stock.items as $$
  update stock.items
     set statut = 'vendue', prix_vente = p_prix, date_vente = p_date,
         plateforme_vente = coalesce(p_plateforme, plateforme_vente),
         acheteur = coalesce(p_acheteur, acheteur)
   where id = p_item
  returning *;
$$ language sql;

create or replace function stock.acheter(
  p_card_type bigint, p_prix_achat numeric default null,
  p_etat text default null, p_prix_affiche numeric default null,
  p_statut stock.item_statut default 'en_stock',
  p_date date default current_date
) returns stock.items as $$
  insert into stock.items (card_type_id, prix_achat, etat, prix_affiche, statut, date_achat)
  values (p_card_type, p_prix_achat, p_etat, p_prix_affiche, p_statut, p_date)
  returning *;
$$ language sql;
