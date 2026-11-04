provider "aws" {
  region = var.region
}

variable "region" {
  description = "AWS region of the portfolio bucket"
  type        = string
  default     = "ap-northeast-1"
}

output "bucket_name" {
  description = "Name of the portfolio S3 bucket"
  value       = aws_s3_bucket.portfolio_ran_markovich.bucket
}

resource "aws_s3_bucket" "portfolio_ran_markovich" {
  bucket = "portfolio-ran-markovich"

  tags = {
    Name          = "Portfolio"
    "Environment" = "Production"
  }
}


resource "aws_s3_bucket_website_configuration" "portfolio_ran_markovich" {
  bucket = aws_s3_bucket.portfolio_ran_markovich.bucket

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }

}

resource "aws_s3_bucket_versioning" "portfolio_ran_markovich" {
  bucket = aws_s3_bucket.portfolio_ran_markovich.id
  versioning_configuration {
    status = "Enabled"
  }
}