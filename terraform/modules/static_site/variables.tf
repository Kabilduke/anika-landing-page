variable "bucket_name" {
  description = "The name of the S3 bucket to create for static hosting."
  type        = string
}

variable "domain_name" {
  description = "The parent domain name (e.g., anikafashion.in)."
  type        = string
}

variable "subdomain" {
  description = "The subdomain for the site (e.g. www, admin, dev, admin.dev)."
  type        = string
}

variable "use_custom_domain" {
  description = "Set to true to use a custom domain with SSL and CloudFront."
  type        = bool
  default     = true
}

variable "create_dns_records" {
  description = "Set to true to create Route 53 DNS records for the custom domain."
  type        = bool
  default     = true
}

variable "environment" {
  description = "The environment name (e.g. dev, prod)."
  type        = string
}

variable "route53_zone_name" {
  description = "The primary Route 53 Hosted Zone domain name (e.g. in)."
  type        = string
  default     = "in"
}

variable "additional_aliases" {
  description = "Additional domain aliases for CloudFront and Route 53 (e.g. apex domain when deploying www)."
  type        = list(string)
  default     = []
}

