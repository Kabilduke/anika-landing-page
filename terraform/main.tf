# main.tf - Infrastructure Provisioning

# 1. Provision the brand new Supabase Project
resource "supabase_project" "main" {
  organization_id   = var.supabase_organization_id
  name              = "anika-${var.environment}"
  database_password = var.db_password
  region            = var.region

  # Prevent database password changes from triggering replacement of the project
  lifecycle {
    ignore_changes = [database_password]
  }
}

# 2. Configure project-level API and Auth Settings
resource "supabase_settings" "main" {
  project_ref = supabase_project.main.id

  # Configure authentication settings (e.g. redirect URL)
  auth = jsonencode({
    site_url              = var.site_url
    mailer_otp_exp        = 3600 # 1 hour
    mailer_signup_enabled = true
  })

  # Configure API gateway settings (can be customized if needed)
  api = jsonencode({
    db_schema            = "public,storage,graphql_public"
    db_extra_search_path = "public,extensions"
    max_rows             = 1000
  })
}

# Note: Database-level structures, custom RLS policies, schemas, and Storage Buckets
# are managed via SQL migrations inside your `/supabase/migrations/` folder (using the Supabase CLI),
# or dynamically created via your frontend client/server SDK. Terraform manages project-level
# infrastructure and platform configurations only.
