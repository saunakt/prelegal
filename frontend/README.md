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

## Tests

Playwright tests live in `tests/`:

- `form.spec.ts` (functional): defaults, live preview, term radios and year inputs, governing law
  and jurisdiction in the terms, modifications, party signature table, full standard terms.
- `e2e.spec.ts` (end to end): fill the whole form and download a PDF (the print call and a
  rendered PDF with 2+ pages), print layout, no hydration errors when an extension edits `<body>`,
  and a mobile viewport.

```bash
npm test          # starts (or reuses) the dev server on :3000 and runs headless
npm run test:ui   # interactive runner
```

Locally the tests use your installed Chrome. In CI run `npx playwright install chromium` first.
