# Mutual NDA Creator (prototype)

A Next.js (App Router, TypeScript, Tailwind) app that builds a Common Paper Mutual NDA.
Fill in the form, watch the agreement update live, and download it as a PDF.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

`predev` / `prebuild` run `scripts/copy-templates.mjs`, which copies the Mutual NDA cover page and
standard terms from the repo-level `templates/` directory into `content/` (git-ignored), so the
legal text has a single source of truth.

## How it works

- `app/page.tsx` loads the standard terms; `components/NdaApp.tsx` holds the form state.
- `components/NdaForm.tsx` collects the cover page fields; `components/NdaPreview.tsx` renders the
  cover page and the standard terms (Governing Law and Jurisdiction are filled into the terms).
- **Download PDF** opens the browser print dialog with a print stylesheet that hides the form and
  starts the standard terms on a new page. Choose "Save as PDF".

Agreement text: Common Paper Mutual NDA v1.0, CC BY 4.0. Prototype only, not legal advice.
