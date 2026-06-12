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
  # If branching is enabled, dev environment uses a branch. If disabled, dev environment uses a separate project.
  use_branch  = !local.is_prod && var.use_branching

  project_ref = local.use_branch ? supabase_branch.main[0].database.id : supabase_project.main[0].id

  # Dynamically construct additional redirect URLs based on the environment
  additional_redirect_urls = local.is_prod ? [
    "https://admin.${var.domain_name}"
  ] : [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://admin.dev.${var.domain_name}"
  ]
}

resource "supabase_project" "main" {
  count             = local.use_branch ? 0 : 1
  organization_id   = var.supabase_organization_id
  name              = var.use_branching ? "anika-fashion" : "anika-${var.environment}"
  database_password = var.db_password
  region            = var.region

  # Prevent database password changes from triggering replacement of the project
  lifecycle {
    ignore_changes = [database_password]
  }
}

resource "supabase_branch" "main" {
  count              = local.use_branch ? 1 : 0
  parent_project_ref = var.supabase_project_ref
  git_branch         = var.environment
  region             = var.region

  lifecycle {
    precondition {
      condition     = !local.use_branch || (var.supabase_project_ref != "" && var.supabase_project_ref != null)
      error_message = "The variable 'supabase_project_ref' must be provided to create a development branch. Please ensure you have set the SUPABASE_PROJECT_REF secret in GitHub Actions or supabase_project_ref in your tfvars file."
    }
  }
}

resource "supabase_settings" "main" {
  project_ref = local.project_ref

  # Configure authentication settings (e.g. redirect URL)
  auth = jsonencode({
    site_url                            = var.site_url
    additional_redirect_urls            = local.additional_redirect_urls
    mailer_otp_exp                      = 3600 # 1 hour
    mailer_signup_enabled               = true
    rate_limit_email_sent               = 1000
    rate_limit_otp                      = 100
    rate_limit_verify                   = 100
    rate_limit_token_refresh            = 500
    rate_limit_anonymous_users          = 100
    mailer_subjects_magic_link          = "Confirm Your Login - Anika Fashion"
    mailer_templates_magic_link_content = file("${path.module}/../../../supabase/templates/magic_link.html")
    smtp_host                           = "smtp.resend.com"
    smtp_port                           = "587"
    smtp_user                           = "resend"
    smtp_pass                           = var.smtp_pass
    smtp_sender_name                    = "Anika Fashion"
    smtp_admin_email                    = var.smtp_admin_email
  })

  # Configure API gateway settings (can be customized if needed)
  api = jsonencode({
    db_schema            = "public,storage,graphql_public"
    db_extra_search_path = "public,extensions"
    max_rows             = 1000
  })
}

