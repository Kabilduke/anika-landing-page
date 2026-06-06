terraform {
  required_providers {
    aws = {
      source                = "hashicorp/aws"
      version               = "~> 5.0"
      configuration_aliases = [aws, aws.us_east_1]
    }
  }
}

locals {
  full_domain = var.subdomain == "" ? var.domain_name : "${var.subdomain}.${var.domain_name}"
  all_domains = concat([local.full_domain], var.additional_aliases)
}

# 1. Route 53 Zone Lookup
data "aws_route53_zone" "primary" {
  count = (var.use_custom_domain && var.create_dns_records) ? 1 : 0
  name  = "${var.route53_zone_name}."
}

# 2. S3 Bucket for Static Assets
resource "aws_s3_bucket" "site" {
  bucket        = var.bucket_name
  force_destroy = true

  tags = {
    Name        = var.bucket_name
    Environment = var.environment
  }
}

# 3. Block All Public Access to S3
resource "aws_s3_bucket_public_access_block" "site" {
  bucket = aws_s3_bucket.site.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# 4. CloudFront Origin Access Control (OAC)
resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "${var.bucket_name}-oac"
  description                       = "OAC for static website bucket ${var.bucket_name}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# 5. S3 Bucket Policy allowing CloudFront OAC Read Access
resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontServicePrincipalReadOnly"
        Effect    = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.site.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.site.arn
          }
        }
      }
    ]
  })
}

# 6. AWS Certificate Manager (ACM) Certificate for Custom Subdomain
# Note: MUST be in us-east-1 for CloudFront. Done via provider alias.
resource "aws_acm_certificate" "site" {
  count                     = var.use_custom_domain ? 1 : 0
  provider                  = aws.us_east_1
  domain_name               = local.full_domain
  subject_alternative_names = var.additional_aliases
  validation_method         = "DNS"

  tags = {
    Name        = "${local.full_domain}-cert"
    Environment = var.environment
  }

  lifecycle {
    create_before_destroy = true
  }
}

# 7. Route 53 ACM Validation Records
resource "aws_route53_record" "site_acm_validation" {
  for_each = var.use_custom_domain && var.create_dns_records ? {
    for dvo in aws_acm_certificate.site[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.primary[0].zone_id
}

# 8. ACM Certificate Validation Status
resource "aws_acm_certificate_validation" "site" {
  count           = var.use_custom_domain ? 1 : 0
  provider        = aws.us_east_1
  certificate_arn = aws_acm_certificate.site[0].arn
  validation_record_fqdns = var.create_dns_records ? [
    for record in aws_route53_record.site_acm_validation : record.fqdn
  ] : []
}

# 9. CloudFront Distribution
resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  comment             = "CloudFront for ${local.full_domain} in ${var.environment}"

  aliases = var.use_custom_domain ? local.all_domains : []

  origin {
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.site.bucket}"
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.site.bucket}"

    # Use AWS Managed caching policies for high performance
    viewer_protocol_policy     = "redirect-to-https"
    compress                   = true
    cache_policy_id            = "658327aa-a8f4-4750-a103-019d850f85d6" # CachingOptimized
    origin_request_policy_id   = "88a5eaf4-2af3-4bc7-95d0-49d415d22117" # CORS-S3Origin
  }

  price_class = "PriceClass_100" # Limit to North America and Europe for cost efficiency

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # SPA Routing Configuration: Redirect 403 & 404 to index.html with HTTP 200
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  viewer_certificate {
    acm_certificate_arn            = var.use_custom_domain ? aws_acm_certificate_validation.site[0].certificate_arn : null
    ssl_support_method             = var.use_custom_domain ? "sni-only" : null
    minimum_protocol_version       = var.use_custom_domain ? "TLSv1.2_2021" : null
    cloudfront_default_certificate = var.use_custom_domain ? false : true
  }

  tags = {
    Environment = var.environment
  }
}

# 10. Route 53 A Record for Domain(s)
resource "aws_route53_record" "site_a" {
  for_each = (var.use_custom_domain && var.create_dns_records) ? toset(local.all_domains) : []
  zone_id  = data.aws_route53_zone.primary[0].zone_id
  name     = each.value
  type     = "A"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}
