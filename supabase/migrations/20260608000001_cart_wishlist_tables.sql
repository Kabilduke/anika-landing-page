-- Create cart_items table
create table if not exists public.cart_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  product_id bigint references public.products(product_id) on delete cascade not null,
  qty integer not null default 1 check (qty > 0),
  size text,
  color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, product_id, size)
);

alter table public.cart_items enable row level security;

create policy "Users can manage their own cart items" 
  on public.cart_items for all 
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create wishlist_items table
create table if not exists public.wishlist_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  product_id bigint references public.products(product_id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, product_id)
);

alter table public.wishlist_items enable row level security;

create policy "Users can manage their own wishlist items" 
  on public.wishlist_items for all 
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

