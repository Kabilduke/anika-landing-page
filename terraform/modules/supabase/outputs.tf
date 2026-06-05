data "supabase_apikeys" "main" {
  project_ref = local.project_ref
}

output "project_id" {
  description = "The unique reference ID (project_ref) of the Supabase project."
  value       = local.project_ref
}

output "project_url" {
  description = "The API Gateway URL of the Supabase project."
  value       = "https://${local.project_ref}.supabase.co"
}

output "anon_key" {
  description = "The publishable anonymous key for client authentication."
  value       = data.supabase_apikeys.main.anon_key
  sensitive   = true
}

output "service_role_key" {
  description = "The private service role key. Keep secure and do not share!"
  value       = data.supabase_apikeys.main.service_role_key
  sensitive   = true
}

output "region" {
  description = "The region where the project is deployed."
  value       = var.region
}

output "db_url" {
  description = "The connection string for database migrations."
  value       = local.is_prod ? "postgresql://postgres.${supabase_project.main[0].id}:${var.db_password}@aws-0-${var.region}.pooler.supabase.com:5432/postgres" : "postgresql://${supabase_branch.main[0].database.user}:${supabase_branch.main[0].database.password}@${supabase_branch.main[0].database.host}:${supabase_branch.main[0].database.port}/postgres"
  sensitive   = true
}

