-- Update unique constraint to include color
ALTER TABLE public.cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_size_key;
ALTER TABLE public.cart_items ADD CONSTRAINT cart_items_user_id_product_id_size_color_key UNIQUE (user_id, product_id, size, color);
