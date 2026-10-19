# Knowledge Hub selection and linking release — 19 October 2026

This release strengthens all 129 existing guides and adds reciprocal educational links to 57 product and model pages. The complete generated HTML is delivered in the downloadable release ZIP; the reproducible guarded patch is stored here. It is based on the verified current public pages, preserving their existing technical text, sources, navigation, forms and executable scripts. The additions connect each subject to real calculators, equipment selection and maintenance decisions. No product ratings or calculators were invented.

## Source and deployment

The repository root is an older static snapshot and is not the complete current Vercel source. The public project `temporary-turbo-nickel-8xnl9g7` currently combines a base deployment and a separate page/download deployment through 73 project routing rules. Do not deploy the repository root as a replacement for that arrangement.

The baseline for this release is overlay `dpl_59kcHAVqVxyHgPbpgbvGtyN79vhb`, with base `dpl_6AiE5jBLD1yheM7M8nrzoUuQU9h6`. The change appends `apply-guide-connections.mjs` after every existing transformation in `apply-copy-review.mjs`, using `guide-connections.json.gz`. The guarded patch refuses to run if any of its 186 baseline page hashes differ. It verifies output hashes, calculator destinations, reciprocal links and an unchanged homepage.

The source `editorial.tsv` contains the individual editorial additions; `profiles.py` records equipment/calculator mappings and the boundaries of the existing tools. Manifests record all page hashes and connections. The source archive is a deterministic, reviewable JSON payload compressed with gzip; its edits use Unicode code-point offsets.

## Validation

- All 129 guide baselines matched the current public pages exactly.
- 308 existing HTML routes returned successful responses, following their redirects.
- 853 numerical, conversion and input-domain checks across all 20 calculators passed, as did selected-unit regression checks.
- 166 referenced live assets were fetched successfully. Calculator engine, definitions, display, UI and report modules matched the tested code.
- All 372 responsive checks across 186 changed pages passed at 390 and 1280 px, including expanded/focused FAQ colour and no document overflow or clipped new content.
- 258 calculator connections, 236 product connections and 520 reciprocal product-to-guide links are covered by the manifests.
- Source audit found no new missing destinations or fragments. The 115 inherited local-file warnings in the release audit are existing gated product PDF/ZIP links; these are served by the retained download backend, not ordinary local static files. Download authorisation and CRM receipt were not re-tested by this editorial release.

The inherited base build scripts cannot validate a merged rendered-output snapshot: they expect pre-build source and static downloads, while the live arrangement generates pages and protects downloads in the overlay. The release therefore retains the existing cloud build and appends the guarded transformation, rather than changing those scripts or bypassing their checks.
