-- ── 6. ADMIN REGISTRY TABLE ──
create table if not exists public.admin_users (
  id uuid references auth.users on delete cascade primary key,
  email text not null unique,
  role text not null default 'admin',
  created_at timestamp with time zone default now()
);

alter table public.admin_users enable row level security;

create policy "Users can check if they are admin" 
  on public.admin_users for select 
  using (auth.uid() = id);

-- ── 1. USER PROFILES TABLE ──
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  phone text,
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Profiles Security Policies
create policy "Users can view their own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can update their own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- ── 2. PRODUCT CATEGORIES TABLE ──
create table if not exists public.categories (
  id serial primary key,
  name text not null unique,
  description text,
  sku text,
  category_image text,
  category_image_meta jsonb,
  storefront_images text[],
  visible boolean default false,
  featured boolean default false,
  status text not null default 'Visible',
  filters text[],
  filter_groups jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.categories enable row level security;

create policy "Allow public read access to categories" 
  on public.categories for select 
  using (true);

create policy "Admins can manage categories" 
  on public.categories for all 
  using (
    exists (
      select 1 from public.admin_users 
      where public.admin_users.id = auth.uid() and public.admin_users.role = 'admin'
    )
  );

-- ── 3. PRODUCTS CATALOG TABLE ──
create table if not exists public.products (
  id serial primary key,
  name text not null,
  description text,
  sku text not null unique,
  category text references public.categories(name) on update cascade,
  price numeric not null,
  compare_price numeric,
  discount_price numeric,
  stock integer not null default 0,
  stock_qty integer not null default 0,
  material text,
  weight text,
  size text,
  care text,
  images text[],
  visible boolean default false,
  featured boolean default false,
  status text not null default 'Visible',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.products enable row level security;

create policy "Allow public read access to products" 
  on public.products for select 
  using (true);

create policy "Admins can manage products" 
  on public.products for all 
  using (
    exists (
      select 1 from public.admin_users 
      where public.admin_users.id = auth.uid() and public.admin_users.role = 'admin'
    )
  );

-- ── 4. CUSTOMER ADDRESSES TABLE ──
create table if not exists public.addresses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  email text,
  mobile text not null,
  flat text not null,
  area text not null,
  city text not null,
  state text not null,
  pin_code text not null,
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.addresses enable row level security;

create policy "Users can manage their own addresses" 
  on public.addresses for all 
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can view all customer addresses" 
  on public.addresses for select 
  using (
    exists (
      select 1 from public.admin_users 
      where public.admin_users.id = auth.uid() and public.admin_users.role = 'admin'
    )
  );

-- ── 5. ORDERS TABLE ──
create table if not exists public.orders (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  order_date timestamp with time zone default timezone('utc'::text, now()) not null,
  item_name text not null,
  quantity integer not null,
  total_price numeric not null,
  payment text not null default 'COD',
  type text not null default 'Regular',
  status text not null default 'Pending'
);

alter table public.orders enable row level security;

create policy "Users can view their own orders" 
  on public.orders for select 
  using (auth.uid() = user_id);

create policy "Users can place their own orders" 
  on public.orders for insert 
  with check (auth.uid() = user_id);

create policy "Admins can view and update all customer orders" 
  on public.orders for all 
  using (
    exists (
      select 1 from public.admin_users 
      where public.admin_users.id = auth.uid() and public.admin_users.role = 'admin'
    )
  );


-- ── 7. POSTGRES TRIGGERS (Automated Profile Creation) ──

-- Trigger Function
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'No name set'),
    coalesce(new.raw_user_meta_data->>'phone', 'No phone set')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger Binding
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
