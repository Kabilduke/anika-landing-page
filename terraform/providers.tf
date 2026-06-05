terraform {
  required_version = ">= 1.0.0"
  required_providers {
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.0"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  cloud {
    organization = "GenLabTesting"

    workspaces {
      prefix = "anika-landing-page-"
    }
  }
}

provider "supabase" {
  access_token = var.supabase_access_token
}

# Default AWS Provider for deployment region
provider "aws" {
  region = var.aws_region
}

# Regional AWS Provider for CloudFront SSL Certificate (Must be us-east-1)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}
