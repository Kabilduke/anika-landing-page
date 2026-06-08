# main.tf - Infrastructure Orchestration

locals {
  repo_name = "anika-landing-page"
}

# 1. Provision Supabase Platform Infrastructure via Reusable Module
module "supabase" {
  source = "./modules/supabase"

  supabase_organization_id = var.supabase_organization_id
  environment              = var.environment
  region                   = var.region
  db_password              = var.db_password
  site_url                 = var.site_url
  supabase_project_ref     = var.supabase_project_ref
  domain_name              = var.domain_name
  use_branching            = var.use_branching
}


# 2. Deploy Customer Portal Static Site (web/) via Reusable AWS S3 + CloudFront Module
# module "web_storefront" {
#   source = "./modules/static_site"

#   providers = {
#     aws           = aws
#     aws.us_east_1 = aws.us_east_1
#   }

#   bucket_name        = "${local.repo_name}-storefront-${var.environment}"
#   domain_name        = var.domain_name
#   route53_zone_name  = var.route53_zone_name
#   subdomain          = var.environment == "prod" ? "www" : "dev"
#   additional_aliases = var.environment == "prod" ? [var.domain_name] : []
#   use_custom_domain  = var.use_custom_domain
#   create_dns_records = var.create_dns_records
#   environment        = var.environment
# }
