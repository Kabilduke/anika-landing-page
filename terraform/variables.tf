variable "supabase_access_token" {
  description = "Supabase Personal Access Token (PAT) used to authenticate with the Supabase API."
  type        = string
  sensitive   = true
}

variable "supabase_organization_id" {
  description = "The ID of the Supabase organization where the projects will be created."
  type        = string
}

variable "environment" {
  description = "The target environment (e.g. dev, prod)."
  type        = string
}

variable "region" {
  description = "The region to deploy the Supabase project in (e.g. us-east-1, ap-southeast-1, eu-west-1)."
  type        = string
  default     = "us-east-1"
}

variable "db_password" {
  description = "The master password for the PostgreSQL database. Must be strong."
  type        = string
  sensitive   = true
}

variable "site_url" {
  description = "The Site URL for Auth redirection (e.g., http://localhost:5173 for local, your custom domain for prod)."
  type        = string
  default     = "http://localhost:5173"
}

variable "use_branching" {
  description = "Set to true to use Supabase database branching (requires Pro/Enterprise plan). Set to false to use separate projects (Free tier)."
  type        = bool
  default     = false
}

# AWS Deployment and Custom Domains Variables

variable "aws_region" {
  description = "The AWS region to provision primary S3 storage and Route 53 resources in."
  type        = string
  default     = "ap-south-1"
}

variable "domain_name" {
  description = "The root domain name for the landing page project."
  type        = string
  default     = "anikajewelry.in"
}

variable "route53_zone_name" {
  description = "The Route 53 Hosted Zone domain name where DNS records should be created."
  type        = string
  default     = "in"
}

variable "use_custom_domain" {
  description = "Set to true to configure SSL with ACM and bind CloudFront to the custom domain name."
  type        = bool
  default     = true
}

variable "create_dns_records" {
  description = "Set to true to create dynamic A records in your Route 53 hosted zone."
  type        = bool
  default     = true
}

variable "supabase_project_ref" {
  description = "The Project Ref ID of the parent/production Supabase project. Required for development environment to branch from it."
  type        = string
  default     = ""

  validation {
    condition     = var.supabase_project_ref == "" || can(regex("^[a-z0-9]{20}$", var.supabase_project_ref))
    error_message = "The supabase_project_ref must be a valid 20-character lowercase alphanumeric slug (e.g. 'jdgubohcwzgmaadjrhrm')."
  }
}

variable "smtp_pass" {
  description = "SMTP password (API key) for the email service"
  type        = string
  sensitive   = true
}

variable "smtp_admin_email" {
  description = "The sender email address for auth emails (e.g., noreply@yourdomain.com)"
  type        = string
}


