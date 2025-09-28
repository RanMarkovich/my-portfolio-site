resource "aws_s3_bucket" "portfolio" {
  bucket = "portfolio-ran-markovich"

  tags = {
    Name        = "Portfolio"
    Environment = "Production"
  }
  force_destroy = true
}

resource "aws_s3_bucket_website_configuration" "site_config" {
  bucket = aws_s3_bucket.portfolio.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }

  routing_rule {
    condition {
      key_prefix_equals = "docs/"
    }
    redirect {
      replace_key_prefix_with = "documents/"
    }
  }
}

resource "aws_s3_bucket_ownership_controls" "ownership" {
  bucket = aws_s3_bucket.portfolio.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_public_access_block" "public_access" {
  bucket = aws_s3_bucket.portfolio.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

data "aws_iam_policy_document" "public_read" {
  statement {
    sid    = "AllowPublicReadToWebsiteContent"
    effect = "Allow"

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    actions = [
      "s3:GetObject",
    ]

    resources = [
      "${aws_s3_bucket.portfolio.arn}/*",
    ]
  }
}

resource "aws_s3_bucket_policy" "public_read" {
  bucket = aws_s3_bucket.portfolio.id
  policy = data.aws_iam_policy_document.public_read.json
}

locals {
  site_root  = abspath("${path.module}/../../../")
  asset_dir  = "${local.site_root}/assets"

  root_files = fileset(local.site_root, "{*.html,*.css,*.js,*.json,*.svg,*.xml,*.txt}")
  asset_files = fileset(local.asset_dir, "**/*")

  mime_types = {
    html = "text/html"
    css  = "text/css"
    js   = "application/javascript"
    ts   = "application/typescript"
    json = "application/json"
    svg  = "image/svg+xml"
    xml  = "application/xml"
    txt  = "text/plain"
    png  = "image/png"
    jpg  = "image/jpg"
    jpeg = "image/jpeg"
    gif  = "image/gif"
    webp = "image/webp"
    ico  = "image/x-icon"
  }
}

resource "aws_s3_object" "root" {
  for_each = { for f in local.root_files : f => f }

  bucket = aws_s3_bucket.portfolio.id
  key    = each.key
  source = "${local.site_root}/${each.value}"
  etag   = filemd5("${local.site_root}/${each.value}")

  content_type = lookup(
    local.mime_types,
    lower(element(split(".", basename(each.key)), length(split(".", basename(each.key))) - 1)),
    "application/octet-stream"
  )

  depends_on = [aws_s3_bucket_policy.public_read]
}

resource "aws_s3_object" "assets" {
  for_each = { for f in local.asset_files : f => f }

  bucket = aws_s3_bucket.portfolio.id
  key    = "assets/${each.key}"
  source = "${local.asset_dir}/${each.value}"
  etag   = filemd5("${local.asset_dir}/${each.value}")

  content_type = lookup(
    local.mime_types,
    lower(element(split(".", basename(each.key)), length(split(".", basename(each.key))) - 1)),
    "application/octet-stream"
  )

  depends_on = [aws_s3_bucket_policy.public_read]
}

output "website_endpoint" {
  value = aws_s3_bucket_website_configuration.site_config.website_endpoint
}