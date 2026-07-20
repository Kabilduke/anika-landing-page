-- Add Ekart Delivery fields to public.orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS delivery_provider text DEFAULT 'Ekart',
ADD COLUMN IF NOT EXISTS waybill text,
ADD COLUMN IF NOT EXISTS shipment_id text,
ADD COLUMN IF NOT EXISTS delivery_status text DEFAULT 'Pending',
ADD COLUMN IF NOT EXISTS estimated_delivery_date timestamptz;
