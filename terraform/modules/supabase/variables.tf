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

variable "domain_name" {
  description = "The root domain name for the landing page project."
  type        = string
}

variable "use_branching" {
  description = "Whether to use database branching."
  type        = bool
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

