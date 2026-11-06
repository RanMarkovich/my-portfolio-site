# CDN in front of the portfolio bucket (ranmarkovich.com).
# It was created outside Terraform; this block adopts it on the next apply.
import {
  to = aws_cloudfront_distribution.portfolio
  id = "E33VLOYOPNMYQI"
}

locals {
  s3_origin_id = "portfolio-ran-markovich.s3.ap-northeast-1.amazonaws.com-mh1z7al7kx1"
}

resource "aws_cloudfront_distribution" "portfolio" {
  aliases             = ["ranmarkovich.com", "www.ranmarkovich.com"]
  comment             = "for serving my-portfolio-site over static s3"
  default_root_object = "index.html"
  enabled             = true
  http_version        = "http2"
  is_ipv6_enabled     = true
  price_class         = "PriceClass_All"

  tags = {
    Name = "my-portfolio-site"
  }

  origin {
    domain_name              = aws_s3_bucket.portfolio_ran_markovich.bucket_regional_domain_name
    origin_access_control_id = "E1SVUX8DTDEEVR"
    origin_id                = local.s3_origin_id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # AWS managed CachingOptimized
    compress               = true
    default_ttl            = 0
    max_ttl                = 0
    min_ttl                = 0
    target_origin_id       = local.s3_origin_id
    viewer_protocol_policy = "redirect-to-https"

    grpc_config {
      enabled = false
    }
  }

  # With OAC, S3 answers 403 (not 404) for missing keys, so map both to the 404 page.
  custom_error_response {
    error_code         = 403
    response_code      = 404
    response_page_path = "/error.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 404
    response_page_path = "/error.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = "arn:aws:acm:us-east-1:681048796370:certificate/8b3a20b5-a0b1-4af2-a31f-42cfe1d76db9"
    minimum_protocol_version = "TLSv1.2_2021"
    ssl_support_method       = "sni-only"
  }
}
