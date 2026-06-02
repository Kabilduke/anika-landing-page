# outputs.tf - Infrastructure Outputs

# Fetch project-level API keys dynamically using the data source
data "supabase_apikeys" "main" {
  project_ref = supabase_project.main.id
}

# 1. Output the project reference ID
output "project_id" {
  description = "The unique reference ID (project_ref) of the Supabase project."
  value       = supabase_project.main.id
}

# 2. Output the public Supabase API URL
output "project_url" {
  description = "The API Gateway URL of the Supabase project."
  value       = "https://${supabase_project.main.id}.supabase.co"
}

# 3. Output the public anonymous API key (for frontend client initialization)
output "anon_key" {
  description = "The publishable anonymous key for client authentication."
  value       = data.supabase_apikeys.main.anon_key
  sensitive   = true
}

# 4. Output the private service role API key (highly sensitive, bypasses RLS)
output "service_role_key" {
  description = "The private service role key. Keep secure and do not share!"
  value       = data.supabase_apikeys.main.service_role_key
  sensitive   = true
}
