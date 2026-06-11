output "s3_bucket_name" {
  description = "The name of the S3 bucket."
  value       = aws_s3_bucket.site.bucket
}

output "cloudfront_distribution_id" {
  description = "The ID of the CloudFront distribution."
  value       = aws_cloudfront_distribution.site.id
}

output "cloudfront_domain_name" {
  description = "The default CloudFront domain name."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "custom_domain_url" {
  description = "The URL of the static website with custom domain mapping."
  value       = var.use_custom_domain ? "https://${local.full_domain}" : "https://${aws_cloudfront_distribution.site.domain_name}"
}
