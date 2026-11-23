# WaterQuest Solutions

This repository contains the current WaterQuest Solutions website. Edit the HTML, styles, images and calculator modules in `public/`. The homepage, navy/aqua branding, 96 Knowledge Hub guides and Materials Engineering section are based on the verified deployed commit 94e77ee of 23 November 2026.

## Build and validation

Use Node.js 22 or newer and Python 3. Run `npm ci --ignore-scripts` and `npm run build`. The build checks local page and asset references, reciprocal guide/product links and gated document availability. Run `npm run verify:baseline` to compare all 308 captured route destinations with the recovered live release; deliberate future page changes will require updating that release baseline.

## Deployment

The connected Vercel project is `temporary-turbo-nickel-8xnl9g73` in the `watequest-solutions` team. Its production branch is `main`, repository root is the project root, and `vercel.json` sets the output directory to `public`.

The repository is a complete static source tree with its existing Vercel functions in `api/`. It does not need a separate palette deployment or an archived release folder to produce its current pages. Redirects and the product-download rewrites are included in `vercel.json`.

Product PDFs are versioned and the catalogue ZIP is rebuilt from them; both are stored in `private-downloads/` and served through the existing email-gated function. Never copy these documents into `public/downloads/`. Enquiry and CRM functions are preserved; credentials belong in Vercel environment variables. CRM receipt has not been verified by this repository recovery.

## Recovery provenance

The original base and palette deployment sources were recovered through authenticated Vercel access and all 892 original source hashes were checked. Their builds were combined into this directly editable source tree. Five existing public route overrides were retained exactly. See `docs/source-recovery.json` and `scripts/deployed-baseline.json` for the deployment identifiers and release comparison.

## Engineering quality review (23 November 2026)

This revision is for local/preview review only. The user explicitly instructed that it must not be put into production. Do not merge or promote it without a new explicit production instruction. See `docs/engineering-quality-release.json` for baseline, scope and unresolved evidence.

`python3 scripts/build-engineering-resources.py` generates the worked guide records and equipment document register from the controlled JSON records in `scripts/engineering-data/`. Examples are illustrative and must never be presented as field results or product approvals. Seven public literature PDFs include a technical clarification notice before the unchanged original reference pages.
