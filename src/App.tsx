import { lazy, Suspense } from "react";
import { HashRouter, Routes, Route, Navigate, NavLink } from "react-router-dom";

import { PlayerPacksTab } from "./playerPacks/PlayerPacksTab";
import { Attribution } from "./Attribution";
import { tabs, defaultTabPath } from "./shared/tabs";

// Lazy so the Autocue tab's heavy deps (pdfjs-dist, pptxgenjs) stay out of
// the default bundle.
const AutocueTab = lazy(() =>
  import("./autocue/AutocueTab").then((m) => ({ default: m.AutocueTab })),
);

const sidebarLinkClasses = (isActive: boolean) =>
  [
    "rounded-md px-3 py-2 text-left no-underline transition-colors",
    isActive ? "bg-sky-600 text-white" : "text-slate-300 hover:bg-slate-800",
  ].join(" ");

export default function App() {
  return (
    <HashRouter>
      <div className="flex h-full w-full">
        <nav className="flex h-full w-56 shrink-0 flex-col gap-1 border-r border-slate-700 bg-slate-950/40 p-4">
          <div className="mb-4 px-1 text-left text-lg font-bold flex items-center gap-4">
            <div className="text-4xl">⚽</div>
            <div>Player Pack Generator</div>
          </div>
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) => sidebarLinkClasses(isActive)}
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>

        <main className="flex h-full flex-1 flex-col items-center overflow-y-auto px-4 pt-4 text-center">
          <Suspense fallback={<p>Loading...</p>}>
            <Routes>
              <Route path="/player-packs" element={<PlayerPacksTab />} />
              <Route path="/autocue" element={<AutocueTab />} />
              <Route
                path="*"
                element={<Navigate to={defaultTabPath} replace />}
              />
            </Routes>
          </Suspense>

          <Attribution />
        </main>
      </div>
    </HashRouter>
  );
}
