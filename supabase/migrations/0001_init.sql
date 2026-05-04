-- =======================
-- Extensiones
-- =======================
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- =======================
-- ENUMs
-- =======================
create type user_role as enum ('seller', 'buyer', 'admin');
create type product_status as enum ('active', 'paused', 'deleted');
create type measure_unit as enum ('kg', 'unit', 'box', 'bag', 'liter');
create type conversation_status as enum ('open', 'closed');
create type report_status as enum ('pending', 'reviewing', 'resolved', 'dismissed');

-- =======================
-- users (extiende auth.users)
-- =======================
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  business_name text,
  phone text,
  comuna text not null,
  avatar_url text,
  role user_role not null default 'buyer',
  is_suspended boolean not null default false,
  suspended_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =======================
-- categories (arbol jerarquico)
-- =======================
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  parent_id uuid references public.categories(id) on delete restrict,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index categories_parent_id_idx on public.categories(parent_id);

-- =======================
-- products
-- =======================
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid not null references public.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  title text not null,
  description text,
  measure_unit measure_unit not null,
  stock numeric(12, 2) not null check (stock >= 0),
  comuna text not null,
  status product_status not null default 'active',
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_seller_id_idx on public.products(seller_id);
create index products_category_id_idx on public.products(category_id);
create index products_status_idx on public.products(status);
create index products_search_vector_idx on public.products using gin(search_vector);

-- =======================
-- product_images
-- =======================
create table public.product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index product_images_product_id_idx on public.product_images(product_id);

-- =======================
-- price_tiers
-- =======================
create table public.price_tiers (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  min_quantity numeric(12, 2) not null check (min_quantity >= 0),
  price_per_unit numeric(12, 2) not null check (price_per_unit > 0),
  created_at timestamptz not null default now(),
  unique(product_id, min_quantity)
);
create index price_tiers_product_id_idx on public.price_tiers(product_id);

-- =======================
-- conversations
-- =======================
create table public.conversations (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  buyer_id uuid not null references public.users(id) on delete cascade,
  seller_id uuid not null references public.users(id) on delete cascade,
  status conversation_status not null default 'open',
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  unique(product_id, buyer_id),
  check (buyer_id <> seller_id)
);
create index conversations_buyer_id_idx on public.conversations(buyer_id);
create index conversations_seller_id_idx on public.conversations(seller_id);
create index conversations_last_message_at_idx on public.conversations(last_message_at desc);

-- =======================
-- messages
-- =======================
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  content text not null check (length(content) between 1 and 2000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index messages_conversation_id_created_at_idx on public.messages(conversation_id, created_at);

-- =======================
-- ratings
-- =======================
create table public.ratings (
  id uuid primary key default uuid_generate_v4(),
  rater_id uuid not null references public.users(id) on delete cascade,
  rated_id uuid not null references public.users(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  score smallint not null check (score between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique(rater_id, conversation_id),
  check (rater_id <> rated_id)
);
create index ratings_rated_id_idx on public.ratings(rated_id);

-- =======================
-- reports
-- =======================
create table public.reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references public.users(id) on delete cascade,
  reported_id uuid not null references public.users(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  reason text not null,
  status report_status not null default 'pending',
  admin_notes text,
  resolved_by uuid references public.users(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  check (reporter_id <> reported_id)
);
create index reports_status_idx on public.reports(status);
create index reports_reported_id_idx on public.reports(reported_id);

-- =======================
-- Triggers de updated_at y search_vector
-- =======================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_users_updated_at
before update on public.users
for each row
execute function public.touch_updated_at();

create trigger trg_products_updated_at
before update on public.products
for each row
execute function public.touch_updated_at();

create or replace function public.products_refresh_search_vector()
returns trigger
language plpgsql
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('spanish', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(new.description, '')), 'B');
  return new;
end;
$$;

create trigger trg_products_search_vector
before insert or update of title, description on public.products
for each row
execute function public.products_refresh_search_vector();

create or replace view public.user_ratings_summary as
select
  rated_id as user_id,
  count(*) as total_ratings,
  coalesce(round(avg(score)::numeric, 2), 0) as average_score
from public.ratings
group by rated_id;

-- =======================
-- Helpers RLS
-- =======================
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'admin'
  );
$$;

create or replace function public.is_conversation_participant(conv_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.conversations c
    where c.id = conv_id
      and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
  );
$$;

-- =======================
-- RLS: enable
-- =======================
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.price_tiers enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.ratings enable row level security;
alter table public.reports enable row level security;

-- =======================
-- RLS: users
-- =======================
create policy users_public_read
  on public.users for select
  using (true);

create policy users_self_insert
  on public.users for insert
  with check (auth.uid() = id);

create policy users_self_or_admin_update
  on public.users for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

create policy users_admin_delete
  on public.users for delete
  using (public.is_admin());

-- =======================
-- RLS: categories
-- =======================
create policy categories_public_read
  on public.categories for select
  using (true);

create policy categories_admin_insert
  on public.categories for insert
  with check (public.is_admin());

create policy categories_admin_update
  on public.categories for update
  using (public.is_admin())
  with check (public.is_admin());

create policy categories_admin_delete
  on public.categories for delete
  using (public.is_admin());

-- =======================
-- RLS: products
-- =======================
create policy products_public_read_active
  on public.products for select
  using (status = 'active' or seller_id = auth.uid() or public.is_admin());

create policy products_owner_insert
  on public.products for insert
  with check (seller_id = auth.uid());

create policy products_owner_update
  on public.products for update
  using (seller_id = auth.uid() or public.is_admin())
  with check (seller_id = auth.uid() or public.is_admin());

create policy products_admin_delete
  on public.products for delete
  using (public.is_admin());

-- =======================
-- RLS: product_images
-- =======================
create policy product_images_public_read
  on public.product_images for select
  using (true);

create policy product_images_owner_insert
  on public.product_images for insert
  with check (
    exists (
      select 1
      from public.products p
      where p.id = product_id and p.seller_id = auth.uid()
    )
  );

create policy product_images_owner_update
  on public.product_images for update
  using (
    exists (
      select 1
      from public.products p
      where p.id = product_id and p.seller_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.products p
      where p.id = product_id and p.seller_id = auth.uid()
    )
  );

create policy product_images_owner_delete
  on public.product_images for delete
  using (
    exists (
      select 1
      from public.products p
      where p.id = product_id and p.seller_id = auth.uid()
    )
  );

-- =======================
-- RLS: price_tiers
-- =======================
create policy price_tiers_public_read
  on public.price_tiers for select
  using (true);

create policy price_tiers_owner_insert
  on public.price_tiers for insert
  with check (
    exists (
      select 1
      from public.products p
      where p.id = product_id and p.seller_id = auth.uid()
    )
  );

create policy price_tiers_owner_update
  on public.price_tiers for update
  using (
    exists (
      select 1
      from public.products p
      where p.id = product_id and p.seller_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.products p
      where p.id = product_id and p.seller_id = auth.uid()
    )
  );

create policy price_tiers_owner_delete
  on public.price_tiers for delete
  using (
    exists (
      select 1
      from public.products p
      where p.id = product_id and p.seller_id = auth.uid()
    )
  );

-- =======================
-- RLS: conversations
-- =======================
create policy conversations_participants_or_admin_read
  on public.conversations for select
  using (buyer_id = auth.uid() or seller_id = auth.uid() or public.is_admin());

create policy conversations_buyer_insert
  on public.conversations for insert
  with check (
    buyer_id = auth.uid()
    and buyer_id <> seller_id
    and exists (
      select 1
      from public.products p
      where p.id = product_id and p.seller_id = seller_id
    )
  );

create policy conversations_participants_or_admin_update
  on public.conversations for update
  using (buyer_id = auth.uid() or seller_id = auth.uid() or public.is_admin())
  with check (buyer_id = auth.uid() or seller_id = auth.uid() or public.is_admin());

create policy conversations_admin_delete
  on public.conversations for delete
  using (public.is_admin());

-- =======================
-- RLS: messages
-- =======================
create policy messages_participants_or_admin_read
  on public.messages for select
  using (public.is_conversation_participant(conversation_id) or public.is_admin());

create policy messages_participants_insert
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and public.is_conversation_participant(conversation_id)
  );

create policy messages_sender_update
  on public.messages for update
  using (sender_id = auth.uid())
  with check (sender_id = auth.uid());

create policy messages_admin_delete
  on public.messages for delete
  using (public.is_admin());

-- =======================
-- RLS: ratings
-- =======================
create policy ratings_public_read
  on public.ratings for select
  using (true);

create policy ratings_participant_insert
  on public.ratings for insert
  with check (
    rater_id = auth.uid()
    and public.is_conversation_participant(conversation_id)
  );

create policy ratings_admin_delete
  on public.ratings for delete
  using (public.is_admin());

-- =======================
-- RLS: reports
-- =======================
create policy reports_reporter_or_admin_read
  on public.reports for select
  using (reporter_id = auth.uid() or public.is_admin());

create policy reports_participant_insert
  on public.reports for insert
  with check (
    reporter_id = auth.uid()
    and conversation_id is not null
    and public.is_conversation_participant(conversation_id)
  );

create policy reports_admin_update
  on public.reports for update
  using (public.is_admin())
  with check (public.is_admin());

create policy reports_admin_delete
  on public.reports for delete
  using (public.is_admin());
