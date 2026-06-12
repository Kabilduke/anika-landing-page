## Why

When users try to log in via email, Supabase sends a Magic Link instead of a 6-digit numeric OTP code. This causes a mismatch with the frontend verification UI (which expects a code) and leads to a broken login flow. Additionally, the default Supabase email contains no branding representing Anika Fashion, resulting in a poor user experience.

## What Changes

- **NEW** Branded email template (`supabase/templates/magic_link.html`) using the `{{ .Token }}` variable to trigger a numeric OTP code instead of a magic link.
- **MODIFY** Local Supabase configuration (`supabase/config.toml`) to load the custom `magic_link` template.
- **MODIFY** Infrastructure configuration (`terraform/modules/supabase/main.tf` and variables) to dynamically read the template file and deploy it via the Supabase settings resource.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `api-services-layer`: The passwordless authentication system must send a numeric 6-digit verification code (OTP) via email instead of a clickable magic link.

## Impact

- **Supabase Local Development**: Upgrades the local development container configurations to send OTP codes instead of Magic Links.
- **Terraform Infrastructure**: Modifies the `supabase_settings` resource definition to deploy the custom email templates to staging/production environments.
- **CI/CD Pipeline**: Deploys the templates automatically on pushed changes to the repository.
