resource "aws_s3_bucket" "bucket" {
  bucket = "portfolio-ran-markovich"

  tags = {
    Name        = "Portfolio"
    Environment = "Production"
  }
  force_destroy = true
}
