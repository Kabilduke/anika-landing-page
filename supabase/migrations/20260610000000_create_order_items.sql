-- Create public.order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id bigint generated always as identity primary key,
  order_id text references public.orders(id) on delete cascade not null,
  product_id bigint references public.products(product_id) on delete set null,
  product_name text not null,
  quantity integer not null,
  price numeric not null,
  size text,
  color text,
  image_url text
);

-- Enable RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Select policy: Users can view their own order items, admins can view all
CREATE POLICY "Users can view their own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE public.orders.id = order_items.order_id
      AND public.orders.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE public.admin_users.id = auth.uid() AND public.admin_users.role = 'admin'
    )
  );

-- Insert policy: Users can insert their own order items, admins can manage
CREATE POLICY "Users can insert order items for their own orders"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE public.orders.id = order_items.order_id
      AND public.orders.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE public.admin_users.id = auth.uid() AND public.admin_users.role = 'admin'
    )
  );

-- Admins full access
CREATE POLICY "Admins can manage order items"
  ON public.order_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE public.admin_users.id = auth.uid() AND public.admin_users.role = 'admin'
    )
  );
