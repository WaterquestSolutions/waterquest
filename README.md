# WaterQuest Solutions website

Complete static website files, including the Power Centre models and water hydraulic valve range added in September 2026.

## Website files

The web root is `public/`. It contains 238 HTML pages and their assets.

- Valve range: `/products/water-hydraulic-valves/` — searchable index and 20 detail pages.
- Power Centre overview: `/products/power-center-reverse-osmosis/`.
- New models: `/products/power-centre-reverse-osmosis/pc250/`, `/pc300/`, `/pc500/` and `/pc1000/` beneath the same model parent path.

The existing overview links to all four new models. The sitemap includes every HTML page.

## Local preview

```sh
python3 -m http.server 8080 --directory public
```

Open `http://localhost:8080/`. Serve from the domain root because links and assets use root-relative paths.

## Hosting integration

Use `public/` as the static output directory. No asset build step is required. Existing GitHub-connected hosting projects may deploy commits automatically. This repository does not configure hosting or DNS.

The inherited site contains `/api/zoho/intake` and `/api/zoho/event` integration calls. Their existing backend must be retained or connected by the hosting project; this static repository does not include credentials or provision those endpoints. The new valve option-enquiry links open an email draft.

## Validation

`docs/site-validation.json` records structural checks. The new Power Centre and valve pages were also reviewed in a local browser. Product configuration details marked “Confirm” require engineering review before final selection.
