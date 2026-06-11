-- Seed admin user in auth.users
-- Password is 'password123'
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6',
  'authenticated',
  'authenticated',
  'admin@anika.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Anika Admin", "phone": "+919999999999"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Seed admin user registry
INSERT INTO public.admin_users (id, email, role)
VALUES ('a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6', 'admin@anika.com', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Seed test customer in auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
  'authenticated',
  'authenticated',
  'customer@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Rahul Sharma", "phone": "+918888888888"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Seed categories matching the frontend definitions
INSERT INTO public.categories (name, slug, sort_order, image_url, is_active, description)
VALUES
  ('Rings', 'rings', 1, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&q=80', true, 'Beautiful handcrafted rings for all occasions.'),
  ('Earrings', 'earrings', 2, 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=500&q=80', true, 'Stunning earrings including jhumkas, studs, and drops.'),
  ('Bracelets', 'bracelets', 3, 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&q=80', true, 'Elegant bracelets and kadas with premium gold plating.'),
  ('Bangles', 'bangles', 4, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80', true, 'Traditional and modern bangle sets for bridal and festive wear.'),
  ('Necklaces', 'necklaces', 5, 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80', true, 'Heavy temple harams, chokers, and designer necklace sets.')
ON CONFLICT (name) DO NOTHING;

-- Seed products matching catalog items with attributes
INSERT INTO public.products (
  name, description, sku, category_id, price, compare_price, discount_price, stock, stock_alert, material, weight, sizes, colors, care, images, is_active, is_featured
) VALUES
  -- Rings
  ('Elegant Solitaire Gold Ring', 'Premium handcrafted gold band with gem', 'RNG-001', 
   (SELECT category_id FROM public.categories WHERE name = 'Rings'), 
   1299, 2800, null, 10, 5, 'Gold Plated Alloy', 5.0, ARRAY['6', '7', '8', '9'], ARRAY['Gold'], 'Avoid contact with perfume and water', ARRAY['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&q=80'], true, true),

  ('Vanki Gold Ring', 'Traditional South Indian chevron gold ring', 'RNG-002', 
   (SELECT category_id FROM public.categories WHERE name = 'Rings'), 
   1599, 3000, null, 15, 5, '22kt Gold Plating', 6.0, ARRAY['5', '6', '7'], ARRAY['Gold'], 'Keep in dry jewelry organizer', ARRAY['https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=500&q=80'], true, true),

  ('Eternity Diamond Ring', 'Exquisite diamond studded gold ring', 'RNG-003', 
   (SELECT category_id FROM public.categories WHERE name = 'Rings'), 
   1899, 3500, null, 8, 5, 'Diamond, Gold', 4.0, ARRAY['6', '7', '8'], ARRAY['Silver', 'Gold'], 'Clean with soft cloth', ARRAY['https://images.unsplash.com/photo-1543294001-f7cbfe92237e?w=500&q=80'], true, true),

  ('Matte Gold Floral Ring', 'Floral motif gold plated ring', 'RNG-004', 
   (SELECT category_id FROM public.categories WHERE name = 'Rings'), 
   999, 2000, null, 25, 5, 'Matte Finished Gold', 5.5, ARRAY['7', '8', '9', '10'], ARRAY['Matte Gold'], 'Store in airtight pouch', ARRAY['https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=500&q=80'], true, true),

  -- Earrings
  ('Glamore Earrings Set', 'Intricate jhumka earrings with gems', 'ERR-001', 
   (SELECT category_id FROM public.categories WHERE name = 'Earrings'), 
   749, 1200, null, 30, 5, 'Brass Alloy', 15.0, ARRAY['Standard'], ARRAY['Gold', 'Red'], 'Do not submerge in liquids', ARRAY['https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=500&q=80'], true, true),

  ('Glamore Pearls Earrings', 'Classic hanging pearl gold earrings', 'ERR-002', 
   (SELECT category_id FROM public.categories WHERE name = 'Earrings'), 
   899, 1500, null, 20, 5, 'Synthetic Pearls & Gold Alloy', 10.0, ARRAY['Standard'], ARRAY['Pearl White'], 'Store in dry place', ARRAY['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80'], true, true),

  ('Kundan Stud Earrings', 'Vibrant Kundan stones on gold plating', 'ERR-003', 
   (SELECT category_id FROM public.categories WHERE name = 'Earrings'), 
   650, 1100, null, 15, 5, 'Kundan Stone, Gold Plating', 8.0, ARRAY['Standard'], ARRAY['Multi'], 'Handle with care, stones can crack', ARRAY['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80'], true, true),

  ('Matte Antique Ear Studs', 'Royal heritage matte finish earrings', 'ERR-004', 
   (SELECT category_id FROM public.categories WHERE name = 'Earrings'), 
   800, 1400, null, 12, 5, 'Matte Antique Brass', 12.0, ARRAY['Standard'], ARRAY['Bronze'], 'Wipe clean after use', ARRAY['https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=500&q=80'], true, true),

  ('Premium Temple Jhumkas', 'Traditional South Indian temple jhumka set', 'ERR-005', 
   (SELECT category_id FROM public.categories WHERE name = 'Earrings'), 
   1199, 2500, null, 18, 5, 'Gold Plated Copper', 20.0, ARRAY['Standard'], ARRAY['Gold'], 'Keep away from humidity', ARRAY['https://images.unsplash.com/photo-1629224316810-9d8805b95e76?w=500&q=80'], true, true),

  -- Bracelets
  ('Antique Gold Kada', 'Chased details antique gold kada bracelet', 'BRC-001', 
   (SELECT category_id FROM public.categories WHERE name = 'Bracelets'), 
   1499, 2800, null, 14, 5, 'Antique Finished Brass', 28.0, ARRAY['2.4', '2.6', '2.8'], ARRAY['Antique Gold'], 'Store away from humidity', ARRAY['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&q=80'], true, true),

  ('Glamore Stone Bracelet', 'Fashion chain bracelet with white stones', 'BRC-002', 
   (SELECT category_id FROM public.categories WHERE name = 'Bracelets'), 
   999, 1900, null, 22, 5, 'Rhodium Plating, CZ Stones', 12.0, ARRAY['2.4', '2.6'], ARRAY['Silver'], 'Wipe with soft cotton pouch', ARRAY['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=500&q=80'], true, true),

  -- Bangles
  ('Glamore Gold Bangles', 'Exquisitely detailed antique bangle set', 'BNG-001', 
   (SELECT category_id FROM public.categories WHERE name = 'Bangles'), 
   1299, 2800, null, 16, 5, 'Gold Alloys', 35.0, ARRAY['2.4', '2.6', '2.8'], ARRAY['Gold'], 'Avoid chemical contact', ARRAY['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80'], true, true),

  ('Ruby Studded Bangles', 'Vibrant ruby stones on matte gold bangles', 'BNG-002', 
   (SELECT category_id FROM public.categories WHERE name = 'Bangles'), 
   1849, 2800, null, 10, 5, 'Synthetic Ruby, Gold Plating', 40.0, ARRAY['2.6', '2.8'], ARRAY['Ruby Red'], 'Avoid scratching', ARRAY['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&q=80'], true, true),

  -- Necklaces
  ('Long Layered Haram Set', 'Heavy temple haram gold plated necklace', 'NCL-001', 
   (SELECT category_id FROM public.categories WHERE name = 'Necklaces'), 
   3499, 7000, null, 8, 5, 'Temple Jewelry Gold Alloys', 120.0, ARRAY['Adjustable'], ARRAY['Gold'], 'Store in velvet boxes only', ARRAY['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80'], true, true),

  ('Kundan Choker Set', 'Traditional Kundan choker with matching studs', 'NCL-002', 
   (SELECT category_id FROM public.categories WHERE name = 'Necklaces'), 
   2899, 5500, null, 5, 5, 'Kundan Gemstones, Gold Foil', 95.0, ARRAY['Adjustable'], ARRAY['Multi'], 'Store flat in separate box', ARRAY['https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=500&q=80'], true, true)
ON CONFLICT (sku) DO NOTHING;

-- Seed addresses for the customer
INSERT INTO public.addresses (user_id, full_name, phone_number, address_line1, address_line2, city, state, postal_code, is_default)
VALUES (
  'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
  'Rahul Sharma',
  '+918888888888',
  'Apt 4B, Shanti Enclave',
  'Sector 15',
  'Gurugram',
  'Haryana',
  '122001',
  true
) ON CONFLICT DO NOTHING;

-- Seed sample orders
INSERT INTO public.orders (id, user_id, item_name, quantity, total_price, payment, type, status)
VALUES
  ('ORD-001', 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Kundan Choker Set', 1, 2899, 'COD', 'Regular', 'Delivered'),
  ('ORD-002', 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Vanki Gold Ring', 2, 3198, 'COD', 'Regular', 'Pending')
ON CONFLICT (id) DO NOTHING;
