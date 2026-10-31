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