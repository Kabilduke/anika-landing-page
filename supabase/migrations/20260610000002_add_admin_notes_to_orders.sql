-- Add admin_notes column to public.orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS admin_notes text;
