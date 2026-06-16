# CLAUDE.md

Guidance for working in this repository.

## What this is

A small, fully client-side React + TypeScript static web app, deployed to GitHub Pages at https://alden12.github.io/player-pack-generator/. It currently hosts one tool, the **Player Packs Generator**, and the roadmap adds a second, the **Autocue Generator**. See [ROADMAP.md](ROADMAP.md) for the planned, PR-sequenced work.

## CRITICAL: everything must stay 100% client-side

**All file processing happens in the browser. Uploaded data (PDFs, CSVs) must NEVER be sent anywhere.** This is a deliberate privacy design decision, validated across the codebase: there are no `fetch`/`XMLHttpRequest`/`axios`/`WebSocket`/`sendBeacon` calls, no analytics, and no external runtime resources. Users hand over their own files and the app processes them locally.

When adding features or dependencies, preserve this guarantee:
- No network requests with user data. No uploading files to any server or third-party API. No telemetry/analytics that could include file contents.
- Prefer libraries that run entirely in-browser (e.g. `pdf-lib`, `pdfjs-dist`, `pptxgenjs`, `papaparse`).
- The hard rule is only about user data: third-party requests that carry no user data are acceptable. For example, the app font (Google Sans Flex) is loaded from the Google Fonts CDN in `index.html`. Prefer bundling where practical, but a CDN font is fine.
- Still load processing assets from the bundle, not a CDN: set the PDF.js worker from a bundled URL (Vite `?url` import), never a remote CDN URL.
- Outputs are delivered via a local Blob + object URL download, never an upload.
- If a change would require sending user data off-device, stop and flag it.

## How the Player Packs Generator works

User uploads a PDF and a CSV; the app generates a downloadable per-player PDF subset entirely in the browser.

- CSV shape: row 0 is the header (column headers are page numbers, comma-separated for multiple pages, e.g. `1,2`). Each later row is a player; cell values decide what happens to that column's page(s) for that player.
- Currently hardcoded identifiers (`PlayerPackTable.tsx`): `TRUE` = include the page(s), `FALSE` = append the page(s) at the end, blank = exclude. (Roadmap PR 6 makes these configurable with a case-sensitivity option.)
- Page numbers are converted to zero-indexed and filtered to the PDF's page range.
- Download (`PlayerPackTableRow.tsx`): a new `PDFDocument` is created, relevant pages are `copyPages`'d in, saved to bytes, and downloaded as `{name}_player_pack.pdf` via a Blob + object URL.

## Tech stack

- React 18 + TypeScript, `pdf-lib` (PDF structure / output), `papaparse` (CSV parsing).
- Build tooling: currently Create React App (`react-scripts`); the roadmap migrates this to **Vite** (PR 1).
- Styling: currently `@picocss/pico`; the roadmap replaces it with **Tailwind** (PR 4).
- Package manager: **yarn classic** (v1). The committed `yarn.lock` is the source of truth; there is no `package-lock.json`. Do not introduce npm lockfiles.

## Key files

- `src/App.tsx` - root component; holds PDF/CSV state and the two `FileUpload`s. (Becomes a router-based tab host in roadmap PR 5.)
- `src/PlayerPackTable.tsx` - the core mapping logic (CSV rows -> per-player page lists).
- `src/PlayerPackTableRow.tsx` - builds and downloads each player's PDF.
- `src/FileUpload.tsx` - reusable upload component taking a `handleUpload(file)` callback (intended to be shared by both generators).
- `src/ExampleCsv.tsx` - the in-app example/help for the CSV format.
- `src/types.ts` - shared `Pdf`, `Csv`, `PlayerPack` types.

## Workflow conventions

- **Never commit directly to `master`.** All changes go through a feature branch + PR against `master`.
- End git commit messages with: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
- End PR bodies with the Claude Code generation footer.
- Do not use the em-dash character in any written text (commits, PRs, comments, docs). Use a hyphen, comma, or parentheses.
- Deployed to GitHub Pages, so the build `base` / `homepage` is the `/player-pack-generator/` sub-path. Keep asset paths working under that sub-path.

## Known gotchas

- `pdf-lib` cannot extract text; the Autocue Generator (roadmap PR 7) needs `pdfjs-dist` for that. They serve different purposes and both are kept.
- PDF.js requires a Web Worker; its `workerSrc` setup is build-tool-specific (bundle the worker, do not use a CDN - see the client-side rule above).
- Async CSV parse errors thrown inside papaparse's `error` callback do not reach the `FileUpload` `try/catch` (known bug, addressed in roadmap PR 2).
