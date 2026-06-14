# Roadmap

This roadmap is sequenced as a series of independently reviewable PRs, **foundation first**: modernize the toolchain before building features, so feature code (notably the PDF.js worker setup, which differs between build tools) is written once against the final stack. Every change goes through a feature branch + PR against `master`.

Guiding decisions:
- Migrate off Create React App to Vite first (also clears the remaining build-time security advisories and the `styles.css` import warning).
- Replace Pico CSS entirely with Tailwind.
- Existing dependency-security PR (#1) is merged first as a quick win; the Vite migration then makes the remaining `react-scripts` advisories moot.

## Foundation

### PR 1 - Migrate CRA to Vite
Replace `react-scripts` with Vite.

- [ ] Add `vite` + `@vitejs/plugin-react`; remove `react-scripts` and `loader-utils`; bump `typescript` to ^5.x.
- [ ] Move `public/index.html` to repo root; drop `%PUBLIC_URL%` tokens; add the module `<script>` entry.
- [ ] Add `vite.config.ts` with `base: '/player-pack-generator/'` (GitHub Pages sub-path).
- [ ] Update `package.json` scripts to `dev`/`build`/`preview`; build output becomes `dist`.
- [ ] Update `tsconfig.json` (`vite/client` types - fixes the `styles.css` side-effect import warning, `moduleResolution: "bundler"`, `noEmit`); add `tsconfig.node.json`.
- [ ] Update `.gitignore` (`build` -> `dist`) and the deploy dir; update/remove `.codesandbox/tasks.json` `start`/`eject` tasks.
- [ ] Keep the `data-theme="dark"` behavior and the Pico import for now (Pico removed in PR 4).

_Verify:_ `yarn dev` runs the app unchanged; `yarn build && yarn preview` works; `tsc --noEmit` clean with no `styles.css` warning; `yarn audit` advisories ~0.

### PR 2 - Unit testing foundation + bug scan
Establish a test harness and a safety net before larger refactors.

- [ ] Add `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`; configure `test` in `vite.config.ts`; add `test` / `test:watch` scripts.
- [ ] Extract the pure pack-mapping logic out of `PlayerPackTable.tsx` into a testable `computePlayerPacks(...)` helper; unit-test include/append/exclude, comma multi-page cells, out-of-range pages, empty rows.
- [ ] Component test for `FileUpload.tsx` (loading + error states).
- [ ] Bug scan and fix: e.g. async CSV parse errors not reaching the `FileUpload` error UI (the `throw` in papaparse's `error` callback escapes the `try/catch`), missing CSV-shape validation.

_Verify:_ `yarn test` passes with the mapping edge cases covered.

### PR 3 - CI/CD (GitHub Actions)
Automate build/test, deploy, and versioning.

- [ ] `ci.yml`: on push/PR run install (frozen lockfile), typecheck, build, test.
- [ ] `deploy.yml`: on push to `master`, build and deploy `dist` to GitHub Pages via `actions/deploy-pages` (keep a manual `yarn deploy` fallback).
- [ ] Auto-increment the published version (patch bump) and surface it in the build (e.g. shown in the `Attribution` footer).

_Verify:_ CI green on a PR; merge to `master` deploys the live site; footer shows an incremented version.

### PR 4 - Replace Pico with Tailwind
Remove Pico; rebuild all styling in Tailwind.

- [ ] Add `tailwindcss` + `postcss` + `autoprefixer`; add config + directives. Remove `@picocss/pico` and its import.
- [ ] Recreate the current look with utilities; use an `@layer components` (`@apply`) layer to replace Pico's element defaults (buttons, tables, nav).
- [ ] Preserve the dark theme.

_Verify:_ Visual parity across both upload widgets, the example CSV table, and player-pack rows; build + CI green.

## Features

### PR 5 - Multi-tab refactor (structural)
Restructure into a tabbed shell so both generators coexist and share code. Behavior-preserving, no new feature deps.

- [ ] Add `src/shared/` (move `FileUpload`; extract a reusable `downloadBlob(blob, filename)` from `PlayerPackTableRow`; tab definitions) and `src/playerPacks/` (move the player-pack components + a thin `PlayerPacksTab`).
- [ ] Convert `App.tsx` into a router-based tab host using `react-router-dom` `HashRouter` (GitHub-Pages-safe, no 404 hacks), with shareable per-tab URLs (`/#/player-packs`, `/#/tv-prompt`) and `NavLink` active styling; redirect `/` to Player Packs.
- [ ] Add a lazy-loaded (`React.lazy` + `Suspense`) stub TV Prompt route.

_Verify:_ Player Packs works exactly as before; each tab URL renders (and reloads) correctly; build + tests + CI green.

### PR 6 - Player Packs: configurable condition values
Let users specify which CSV cell values mean include vs append-at-end.

- [ ] Add text inputs for the include / append match values, defaulting to `y` (include) and `n` (append at end); empty cell = omit. These replace the hardcoded `TRUE`/`FALSE` identifiers.
- [ ] Add a "case sensitive" checkbox, defaulting off (matching lowercases both sides when off, exact when on); whitespace always trimmed.
- [ ] Thread the values + flag through `computePlayerPacks`; update the example CSV copy.

_Verify:_ Unit tests for custom values; changing inputs re-computes each pack's pages.

### PR 7 - TV Prompt Generator
New tab that extracts `<...>`-bracketed quotes from a PDF and emits one quote per slide/page.

- [ ] Add `pdfjs-dist` (latest) for text extraction only (`pdf-lib` cannot extract text - this is an addition, not a replacement). Add `pptxgenjs` (latest) for in-browser PPTX. Reuse `pdf-lib` for the PDF output option.
- [ ] `src/tvPrompt/`: `pdfWorker.ts` (isolates the Vite `?url` worker setup), `extractText.ts` (concatenate + whitespace-normalize all pages so brackets spanning lines/pages survive), `extractQuotes.ts` (pure `/<([^<>]*)>/g` parser; no nested brackets), `generatePptx.ts`, `generatePdf.ts`, `TvPromptTab.tsx` (upload + format toggle, PPTX default | PDF).
- [ ] Shared `fitFontSize.ts` autoscale (largest size whose word-wrapped text fills the box), used by both outputs.
- [ ] Output: landscape, black background, white text, scaled to fill. PPTX names Arial (viewer-supplied); PDF uses `StandardFonts.Helvetica` (no font embedding).
- [ ] Keep the tab lazy-loaded so `pdfjs-dist`/`pptxgenjs` are code-split out of the default bundle.

_Verify:_ Unit tests for `extractQuotes` and `fitFontSize`; manual generate of both PPTX and PDF (one slide/page per quote, text filling the page); the heavy chunk loads only on this tab.

### PR 8 - End-to-end tests
Cover both generators end to end.

- [ ] Add Playwright + small sample PDF/CSV fixtures.
- [ ] Player Packs (upload -> row appears -> download triggers) and TV Prompt (upload bracketed PDF -> PPTX and PDF downloads trigger).
- [ ] Wire the Playwright run into CI.

_Verify:_ `yarn e2e` passes locally and in CI.
