-- Add email and created_at fields to public.profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone default timezone('utc'::text, now());

-- Update the public.handle_new_user() trigger function to populate user emails and registration times
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone, email, created_at)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'No name set'),
    coalesce(new.raw_user_meta_data->>'phone', 'No phone set'),
    new.email,
    new.created_at
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill existing profiles with email and created_at from auth.users
UPDATE public.profiles p
SET 
  email = u.email,
  created_at = u.created_at
FROM auth.users u
WHERE p.id = u.id;

-- Add an RLS SELECT policy on public.profiles allowing admin users to read all customer profiles
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE public.admin_users.id = auth.uid() AND public.admin_users.role = 'admin'
    )
  );
