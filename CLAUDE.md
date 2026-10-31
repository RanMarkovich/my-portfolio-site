# Project
- Ran Markovich personal portfolio; static site served from S3 bucket `portfolio-ran-markovich` (prod)

# Stack
- Plain HTML/CSS/JS; no package.json, bundler, or tsconfig
- GSAP 3.12.5 + ScrollTrigger via jsDelivr CDN; typed as `declare const` globals in `main.ts`
- [infra] Terraform AWS provider ~> 5.0 in `DevOps/Terraform/**`; local state (`backend.hcl` not wired in)
- [CI] `.github/workflows/deploy.yml`: manual dispatch, `aws s3 sync --delete` of repo root

# Workflow
- `main.ts` = source, `main.js` = shipped; no build step, mirror every change into both by hand
- New pages: copy `project.html` head (style.css, GSAP CDN, deferred main.js)
- New root files deploy to S3 unless added to sync `--exclude` list in `deploy.yml`
- 404 page must be `error.html` (S3 error_document; not yet created)

# Commands
- Preview: `python3 -m http.server 8000`
- Deploy (prod): `gh workflow run deploy.yml`

# Never
- **Never deploy, `aws s3 sync`, or `terraform apply` without explicit request — hits prod bucket**
- **Never commit `*.tfstate*` or `.terraform/`**
- **Never edit only one of `main.ts` / `main.js`**
