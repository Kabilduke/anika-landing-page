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
