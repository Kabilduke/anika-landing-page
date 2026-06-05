# outputs.tf - Modular Infrastructure Outputs

# 1. Supabase Platform Outputs
output "project_id" {
  description = "The unique reference ID (project_ref) of the Supabase project."
  value       = var.environment == "prod" ? module.supabase[0].project_id : null
}

output "project_url" {
  description = "The API Gateway URL of the Supabase project."
  value       = var.environment == "prod" ? module.supabase[0].project_url : null
}

output "anon_key" {
  description = "The publishable anonymous key for client authentication."
  value       = var.environment == "prod" ? module.supabase[0].anon_key : null
  sensitive   = true
}

output "service_role_key" {
  description = "The private service role key. Keep secure and do not share!"
  value       = var.environment == "prod" ? module.supabase[0].service_role_key : null
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

# # 3. Admin Deployment Outputs
# output "admin_s3_bucket" {
#   description = "The name of the S3 bucket hosting the admin portal application."
#   value       = module.web_admin.s3_bucket_name
# }

# output "admin_cloudfront_id" {
#   description = "The CloudFront distribution ID for the admin site."
#   value       = module.web_admin.cloudfront_distribution_id
# }

# output "admin_url" {
#   description = "The final HTTPS URL of the admin portal application."
#   value       = module.web_admin.custom_domain_url
# }
