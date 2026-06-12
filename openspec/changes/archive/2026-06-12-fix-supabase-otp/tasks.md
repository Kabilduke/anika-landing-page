## 1. Local Supabase Setup

- [x] 1.1 Create custom email template file `supabase/templates/magic_link.html` with premium branding and the `{{ .Token }}` variable.
- [x] 1.2 Update local Supabase configuration file `supabase/config.toml` to link to the new template file under `[auth.email.template.magic_link]`.

## 2. Infrastructure Setup (Terraform)

- [x] 2.1 Update `terraform/modules/supabase/main.tf` to load the custom HTML template dynamically using the `file()` function and assign it to the `supabase_settings.main` settings auth block.
- [x] 2.2 Define the variables `smtp_pass` and `smtp_admin_email` in the Terraform module and root configuration, passing SMTP settings to the `supabase_settings` resource.


## 3. Verification & Testing

- [x] 3.1 Restart local Supabase stack (`supabase stop && supabase start`) to apply local email template configurations.
- [x] 3.2 Verify local email delivery behavior via Inbucket (`http://localhost:54324`), ensuring a 6-digit verification code is sent.
- [x] 3.3 Verify login and verification success on the storefront frontend.

