# outputs.tf - Modular Infrastructure Outputs

# 1. Supabase Platform Outputs
output "project_id" {
  description = "The unique reference ID (project_ref) of the Supabase project."
  value       = module.supabase.project_id
}

output "project_url" {
  description = "The API Gateway URL of the Supabase project."
  value       = module.supabase.project_url
}

output "anon_key" {
  description = "The publishable anonymous key for client authentication."
  value       = module.supabase.anon_key
  sensitive   = true
}

output "service_role_key" {
  description = "The private service role key. Keep secure and do not share!"
  value       = module.supabase.service_role_key
  sensitive   = true
}

output "supabase_region" {
  description = "The region where the Supabase project is deployed."
  value       = module.supabase.region
}

output "db_url" {
  description = "The connection string for database migrations."
  value       = module.supabase.db_url
  sensitive   = true
}


# # 2. Storefront Deployment Outputs
# output "storefront_s3_bucket" {
#   description = "The name of the S3 bucket hosting the storefront application."
#   value       = module.web_storefront.s3_bucket_name
# }

# output "storefront_cloudfront_id" {
#   description = "The CloudFront distribution ID for the storefront site."
#   value       = module.web_storefront.cloudfront_distribution_id
# }

# output "storefront_url" {
#   description = "The final HTTPS URL of the storefront application."
#   value       = module.web_storefront.custom_domain_url
# }