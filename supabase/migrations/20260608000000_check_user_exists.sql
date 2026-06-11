-- Create helper function to check if a user exists in auth.users by email
create or replace function public.check_user_exists(email_to_check text)
returns boolean
security definer
as $$
begin
  return exists (
    select 1 from auth.users where email = email_to_check
  );
end;
$$ language plpgsql;
