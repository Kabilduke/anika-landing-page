variable "supabase_organization_id" {
  description = "The ID of the Supabase organization where the projects will be created."
  type        = string
}

variable "environment" {
  description = "The target environment (e.g. dev, prod)."
  type        = string
}

variable "region" {
  description = "The region to deploy the Supabase project in."
  type        = string
}

variable "db_password" {
  description = "The master password for the PostgreSQL database."
  type        = string
  sensitive   = true
}

variable "site_url" {
  description = "The Site URL for Auth redirection."
  type        = string
}
