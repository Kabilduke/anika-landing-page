-- Migration: Add order_number sequence and auto-generate order IDs in ORD{YYYYMMDD}{NNNN} format

-- 1. Create a daily sequence table to track per-day order counter
create table if not exists public.order_id_seq (
  seq_date date primary key,
  last_seq integer not null default 0
);

-- 2. Function to generate next order ID: ORDYYYYMMDDnnnn
create or replace function public.generate_order_id()
returns text
language plpgsql
security definer
as $$
declare
  today      date := current_date;
  date_str   text := to_char(today, 'YYYYMMDD');
  next_seq   integer;
begin
  -- Upsert into sequence table; atomically increment today's counter
  insert into public.order_id_seq (seq_date, last_seq)
  values (today, 1)
  on conflict (seq_date) do update
    set last_seq = order_id_seq.last_seq + 1
  returning last_seq into next_seq;

  return 'ORD' || date_str || lpad(next_seq::text, 4, '0');
end;
$$;

-- 3. Trigger function: auto-set id before insert if not already set
create or replace function public.set_order_id()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.id is null or new.id = '' then
    new.id := public.generate_order_id();
  end if;
  return new;
end;
$$;

-- 4. Attach trigger to orders table
drop trigger if exists trg_set_order_id on public.orders;
create trigger trg_set_order_id
  before insert on public.orders
  for each row
  execute function public.set_order_id();

-- 5. Enable RLS on sequence table (access is only via the security definer function)
alter table public.order_id_seq enable row level security;

-- No direct select/insert/update needed by clients — the generate_order_id()
-- function runs as SECURITY DEFINER and bypasses RLS automatically.
-- Revoke direct grants that were added earlier (cleanup).
revoke select, insert, update on public.order_id_seq from authenticated;
revoke select, insert, update on public.order_id_seq from service_role;
