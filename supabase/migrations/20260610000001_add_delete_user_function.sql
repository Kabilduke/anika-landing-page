-- Create delete_own_user function to allow users to self-delete their auth account
create or replace function public.delete_own_user()
returns void as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$ language plpgsql security definer;
