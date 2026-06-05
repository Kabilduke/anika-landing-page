data "supabase_apikeys" "main" {
  project_ref = supabase_project.main.id
}

output "project_id" {
  description = "The unique reference ID (project_ref) of the Supabase project."
  value       = supabase_project.main.id
}

output "project_url" {
  description = "The API Gateway URL of the Supabase project."
  value       = "https://${supabase_project.main.id}.supabase.co"
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
