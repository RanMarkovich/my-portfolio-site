# Project
- Ran Markovich personal portfolio; static site served from S3 bucket `portfolio-ran-markovich` (prod)

# Stack
- Plain HTML/CSS/JS; no package.json, bundler, or tsconfig
- GSAP 3.12.5 + ScrollTrigger via jsDelivr CDN; typed as `declare const` globals in `main.ts`
- [infra] Terraform in `DevOps/Terraform`; S3 remote state via `terraform init -backend-config=backend.hcl`
- [infra] TF version pinned in `.terraform-version` and `TF_VERSION` in `deploy-infra.yml`; bump both
- [CI] `deploy.yml`: manual dispatch, `main` only, `aws s3 sync --delete` of an `--include` allowlist
- [CI] `deploy-infra.yml`: plan on PR, apply on push to `main`

# Workflow
- `main.ts` = source, `main.js` = shipped; no build step, mirror every change into both by hand
- New pages: copy `project.html` head (style.css, GSAP CDN, deferred main.js)
- Only `--include` paths in `deploy.yml` ship to S3; add new site files there
- 404 page must be `error.html` (S3 error_document; not yet created)

# Commands
- Preview: `python3 -m http.server 8000`
- Deploy (prod): `gh workflow run deploy.yml`

# Never
- **Never deploy, `aws s3 sync`, or `terraform apply` without explicit request — hits prod bucket**
- **Never commit `*.tfstate*` or `.terraform/`**
- **Never edit only one of `main.ts` / `main.js`**
