# Roadmap

This roadmap was delivered as a series of independently reviewable PRs, **foundation first**: the toolchain was modernized before building features, so feature code (notably the PDF.js worker setup, which differs between build tools) was written once against the final stack. Every change went through a feature branch + PR against `master`.

All items below are complete and merged; the checklist doubles as a record of what shipped. Where the implementation diverged from the original plan, the bullets describe what was actually built.

Guiding decisions:

- Migrate off Create React App to Vite first (also cleared the remaining build-time security advisories and the `styles.css` import warning).
- Replace Pico CSS entirely with Tailwind.
- Existing dependency-security PR (#1) was merged first as a quick win; the Vite migration then made the remaining `react-scripts` advisories moot.

## Foundation

### PR 1 - Migrate CRA to Vite

Replace `react-scripts` with Vite.

- [x] Add `vite` + `@vitejs/plugin-react`; remove `react-scripts` and `loader-utils`; bump `typescript` to ^5.x.
- [x] Move `public/index.html` to repo root; drop `%PUBLIC_URL%` tokens; add the module `<script>` entry.
- [x] Add `vite.config.ts` with `base: '/player-pack-generator/'` (GitHub Pages sub-path).
- [x] Update `package.json` scripts to `dev`/`build`/`preview`; build output becomes `dist`.
- [x] Update `tsconfig.json` (`vite/client` types - fixes the `styles.css` side-effect import warning, `moduleResolution: "bundler"`, `noEmit`) and typecheck `vite.config.ts` via the same config (a separate `tsconfig.node.json` proved unnecessary).
- [x] Update `.gitignore` (`build` -> `dist`) and the deploy dir; update/remove `.codesandbox/tasks.json` `start`/`eject` tasks.
- [x] Keep the `data-theme="dark"` behavior and the Pico import for now (Pico removed in PR 4).

_Verify:_ `yarn dev` runs the app unchanged; `yarn build && yarn preview` works; `tsc --noEmit` clean with no `styles.css` warning; `yarn audit` advisories ~0.

### PR 2 - Unit testing foundation + bug scan

Establish a test harness and a safety net before larger refactors.

- [x] Add `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`; configure `test` in `vite.config.ts`; add `test` / `test:watch` scripts.
- [x] Extract the pure pack-mapping logic out of `PlayerPackTable.tsx` into a testable `computePlayerPacks(...)` helper; unit-test include/append/exclude, comma multi-page cells, out-of-range pages, empty rows.
- [x] Component test for `FileUpload.tsx` (loading + error states).
- [x] Bug scan and fix: async CSV parse errors not reaching the `FileUpload` error UI (the `throw` in papaparse's `error` callback escaped the `try/catch`) is fixed by awaiting a promise that rejects in the callback.

_Verify:_ `yarn test` passes with the mapping edge cases covered.

### PR 3 - CI/CD (GitHub Actions)

Automate build/test, deploy, and versioning.

- [x] `ci.yml`: on push to `master` / PR, run install (frozen lockfile), typecheck, test, build.
- [x] `deploy.yml`: build and deploy `dist` to GitHub Pages via `actions/deploy-pages`. Deploys are **manual (`workflow_dispatch`)**, triggered on demand from the Actions tab, rather than automatically on push - CI gates every change but releases are intentional. No `contents: write` is needed.
- [x] Surface the published version in the build (shown in the `Attribution` footer). The deploy workflow derives it as `major.minor` from `package.json` plus the workflow run number as the patch (`1.1.<run#>`), injected via Vite `define` into `__APP_VERSION__`; nothing is committed back to the repo. `major.minor` is bumped manually to mark milestones.

_Verify:_ CI green on a PR; triggering Deploy publishes the live site; footer shows the run-numbered version.

### PR 4 - Replace Pico with Tailwind

Remove Pico; rebuild all styling in Tailwind.

- [x] Add Tailwind v4 via `@tailwindcss/vite`; add directives to the global stylesheet. Remove `@picocss/pico` and its import.
- [x] Recreate the current look with utilities; add base styles for the element defaults the app relied on (buttons, inputs, tables, nav).
- [x] Preserve the dark theme.

_Verify:_ Visual parity across both upload widgets, the example CSV table, and player-pack rows; build + CI green.

## Features

### PR 5 - Multi-tab refactor (structural)

Restructure into a tabbed shell so both generators coexist and share code. Behavior-preserving, no new feature deps.

- [x] Add `src/shared/` (move `FileUpload`; extract a reusable `downloadBlob(blob, filename)` from `PlayerPackTableRow`; tab definitions) and `src/playerPacks/` (move the player-pack components + a thin `PlayerPacksTab`).
- [x] Convert `App.tsx` into a router-based tab host using `react-router-dom` `HashRouter` (GitHub-Pages-safe, no 404 hacks), with shareable per-tab URLs (`/#/player-packs`, `/#/tv-prompt`) and `NavLink` active styling; redirect `/` to Player Packs.
- [x] Add a lazy-loaded (`React.lazy` + `Suspense`) stub TV Prompt route.

_Verify:_ Player Packs works exactly as before; each tab URL renders (and reloads) correctly; build + tests + CI green.

### PR 6 - Player Packs: configurable condition values

Let users specify which CSV cell values mean include vs append-at-end.

- [x] Add text inputs for the include / append match values, defaulting to `y` (include) and `n` (append at end); empty cell (or any other value) = omit. These replace the hardcoded `TRUE`/`FALSE` identifiers.
- [x] Add a "case sensitive" checkbox, defaulting off (matching lowercases both sides when off, exact when on); whitespace always trimmed. An empty configured value never matches.
- [x] Thread the values + flag through `computePlayerPacks`; update the example CSV copy.

_Verify:_ Unit tests for custom values; changing inputs re-computes each pack's pages.

### PR 7 - TV Prompt Generator

New tab that extracts `<...>`-bracketed quotes from a PDF and emits one quote per slide/page.

- [x] Add `pdfjs-dist` for text extraction only (`pdf-lib` cannot extract text - an addition, not a replacement). Add `pptxgenjs` for in-browser PPTX. Reuse `pdf-lib` for the PDF output.
- [x] `src/tvPrompt/`: `pdfWorker.ts` (isolates the Vite `?url` worker setup), `extractText.ts` (concatenate + whitespace-normalize all pages so brackets spanning lines/pages survive), `extractQuotes.ts` (pure `/<([^<>]*)>/g` parser; no nested brackets), `generatePptx.ts`, `generatePdf.ts`, `canvasText.ts`, `TvPromptTab.tsx` (upload + format toggle, PPTX default | PDF).
- [x] Shared `fitFontSize.ts` autoscale (largest size whose word-wrapped text fills the box), used by both outputs.
- [x] Output: landscape, black background, white text scaled to fill. Text is measured and rendered with the **HTML canvas** (the browser's own fonts) so any script the system can display works - this replaced the original `pdf-lib` Helvetica plan, whose WinAnsi-only standard fonts crashed on non-Latin characters (e.g. CJK). The **PPTX** emits real editable Arial text (viewer-supplied, nothing embedded); the **PDF** embeds each slide as a canvas-rendered PNG image (any language, but a flat non-editable copy - the PPTX is the editable format, surfaced in the UI).
- [x] Keep the tab lazy-loaded so `pdfjs-dist`/`pptxgenjs` are code-split out of the default bundle.

_Verify:_ Unit tests for `extractQuotes` and `fitFontSize`; manual generate of both PPTX and PDF (one slide/page per quote, text filling the page); the heavy chunk loads only on this tab.

### PR 8 - End-to-end tests

Cover both generators end to end.

- [x] Add Playwright + small sample PDF/CSV fixtures. The binary PDF fixtures are committed and regenerable via `e2e/fixtures/generateFixtures.mjs` (uses the app's own `pdf-lib`).
- [x] Player Packs (upload -> a row appears per player -> per-pack and download-all-zip downloads trigger with the right filenames) and TV Prompt (upload bracketed PDF -> "Found N quotes" -> PPTX and PDF downloads trigger). Tests run against the production build via `vite preview` so the bundled PDF.js worker and lazy chunk behave as deployed; Vitest is scoped to `src/` so it ignores the Playwright specs.
- [x] Wire the Playwright run into CI as a separate `e2e` job (installs Chromium, runs `yarn e2e`, uploads the report artifact).

_Verify:_ `yarn e2e` passes locally and in CI.

## Extra features requested

Smaller follow-ups requested alongside the roadmap, all on the Player Packs generator (plus a shared improvement).

- [x] **Download all**: a button that builds every player's pack PDF and downloads them together as a single `.zip`. The per-pack build is shared with the individual download so the files are identical; `JSZip` is dynamically imported so it only loads on use (kept out of the initial bundle).
- [x] **Ignore unheaded columns**: `computePlayerPacks` explicitly drops any column whose page header is blank, so stray cell values under an unlabelled column can't affect a pack.
- [x] **Useful parse errors**: `FileUpload` surfaces the handler's own message in a styled alert, and the PDF/CSV parse handlers throw human-readable messages on failure.

These features were released together as **v1.1.0**.
