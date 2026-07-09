create extension if not exists pgcrypto;

create table if not exists product_import_batches (
  id uuid primary key default gen_random_uuid(),
  source_file text not null,
  source_hash text not null,
  source_version text not null,
  status text not null default 'draft',
  counts jsonb not null default '{}'::jsonb,
  quality_report jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists product_import_rows (
  id uuid primary key default gen_random_uuid(),
  import_batch_id uuid not null references product_import_batches(id) on delete cascade,
  source_sheet text not null,
  source_row integer not null,
  category text,
  raw_fields jsonb not null default '{}'::jsonb,
  normalized_fields jsonb not null default '{}'::jsonb,
  quality_flags jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists product_resources (
  id uuid primary key default gen_random_uuid(),
  import_batch_id uuid references product_import_batches(id) on delete set null,
  source_key text not null,
  category text not null,
  city text,
  name text,
  service_type text,
  route text,
  model text,
  spec text,
  supplier_name text,
  cost_price numeric,
  sale_price numeric,
  low_season_cost numeric,
  high_season_cost numeric,
  adult_cost numeric,
  child_cost numeric,
  pricing_unit text,
  status text not null default '待补成本',
  source text not null default 'Excel导入',
  source_sheet text,
  source_row integer,
  raw_fields jsonb not null default '{}'::jsonb,
  extra_fields jsonb not null default '{}'::jsonb,
  quality_flags jsonb not null default '{}'::jsonb,
  published_version text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists product_price_tiers (
  id uuid primary key default gen_random_uuid(),
  product_resource_id uuid not null references product_resources(id) on delete cascade,
  tier_group text not null,
  tier_name text not null,
  cost_price numeric,
  sale_price numeric,
  raw_fields jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists product_quality_checks (
  id uuid primary key default gen_random_uuid(),
  import_batch_id uuid not null references product_import_batches(id) on delete cascade,
  check_name text not null,
  severity text not null,
  status text not null,
  message text not null,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  city text,
  status text not null default 'active',
  raw_fields jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists supplier_service_details (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid references suppliers(id) on delete cascade,
  category text not null,
  city text,
  service_type text,
  route text,
  model text,
  spec text,
  cost_price numeric,
  sale_price numeric,
  pricing_unit text,
  status text not null default 'active',
  raw_fields jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists product_supplier_links (
  id uuid primary key default gen_random_uuid(),
  product_resource_id uuid not null references product_resources(id) on delete cascade,
  supplier_service_detail_id uuid not null references supplier_service_details(id) on delete cascade,
  priority integer not null default 100,
  is_preferred boolean not null default false,
  created_at timestamptz not null default now(),
  unique(product_resource_id, supplier_service_detail_id)
);

create table if not exists quote_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  demand jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists quote_lines (
  id uuid primary key default gen_random_uuid(),
  quote_project_id uuid references quote_projects(id) on delete cascade,
  product_resource_id uuid references product_resources(id) on delete set null,
  supplier_service_detail_id uuid references supplier_service_details(id) on delete set null,
  service_type text,
  city text,
  product_name text,
  unit_cost numeric,
  quantity numeric not null default 1,
  total_cost numeric,
  source_name text,
  supplier_name text,
  match_status text not null default 'unmatched',
  match_reason text,
  cost_source text,
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists product_resources_batch_source_key_idx
  on product_resources(import_batch_id, source_key);
create index if not exists product_resources_lookup_idx
  on product_resources(category, city, service_type, model);
create index if not exists product_resources_published_idx
  on product_resources(is_published, published_version);
create index if not exists product_resources_raw_fields_idx
  on product_resources using gin(raw_fields);
create index if not exists product_import_rows_batch_idx
  on product_import_rows(import_batch_id, source_sheet, source_row);
create index if not exists product_quality_checks_batch_idx
  on product_quality_checks(import_batch_id, severity, status);

alter table product_import_batches enable row level security;
alter table product_import_rows enable row level security;
alter table product_resources enable row level security;
alter table product_price_tiers enable row level security;
alter table product_quality_checks enable row level security;
alter table suppliers enable row level security;
alter table supplier_service_details enable row level security;
alter table product_supplier_links enable row level security;
alter table quote_projects enable row level security;
alter table quote_lines enable row level security;
