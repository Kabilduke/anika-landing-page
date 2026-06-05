terraform {
  required_providers {
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.0"
    }
  }
}

locals {
  is_prod     = var.environment == "prod"
  project_ref = local.is_prod ? supabase_project.main[0].id : supabase_branch.main[0].id
}

resource "supabase_project" "main" {
  count             = local.is_prod ? 1 : 0
  organization_id   = var.supabase_organization_id
  name              = "anika-${var.environment}"
  database_password = var.db_password
  region            = var.region

  # Prevent database password changes from triggering replacement of the project
  lifecycle {
    ignore_changes = [database_password]
  }
}

resource "supabase_branch" "main" {
  count              = local.is_prod ? 0 : 1
  parent_project_ref = var.supabase_project_ref
  git_branch         = var.environment
  region             = var.region
}

resource "supabase_settings" "main" {
  project_ref = local.project_ref

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

