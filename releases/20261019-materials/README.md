# Materials Engineering wording — 19 October 2026

Replaces the selected Materials Engineering section on /products/ with the owner-supplied wording. Five exact text replacements preserve all surrounding HTML, styling and the ASSDA reference.

Published deployment: dpl_GUKzwSA3WthARo4nMYpaisAcRWFN (READY).
Live page: https://temporary-turbo-nickel-8xnl9g7.vercel.app/products/#materials-engineering

The full current deployment recipe is vercel-release-request.json. It retains the base/overlay arrangement and all 129 guide enhancements. Existing source files are referenced by their Vercel SHA; new transformations are inline. The Materials patch runs after the guide patch and refuses a changed baseline.

Validation: Vercel cloud build passed; exact public Products HTML and unchanged homepage hashes verified; mobile (390 px) and desktop (1280 px) layout checks passed.

Do not deploy the repository root as a replacement site. It is an older snapshot. Publish this tested overlay through waterquest-palette-20261016.vercel.app; retain the existing base alias and project routes. The production alias already points at the deployment above.
