import { lazy, Suspense, useEffect, useState } from "react";
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

const iconButtonClasses =
  "rounded-md bg-transparent p-2 text-slate-300 hover:bg-slate-800";

// Below this width the sidebar overlays the content and auto-collapses.
const MOBILE_QUERY = "(max-width: 767px)";

/**
 * Track whether we're on a small screen and keep the sidebar open/closed in
 * sync: collapse it on entering mobile, reopen it on returning to a wide
 * screen. Between breakpoint changes the user can still toggle it manually.
 */
const useResponsiveSidebar = () => {
  const isMobileNow = () =>
    typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches;

  const [isMobile, setIsMobile] = useState(isMobileNow);
  const [open, setOpen] = useState(() => !isMobileNow());

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
      setOpen(!e.matches);
    };
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  return { isMobile, open, setOpen };
};

const MenuIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CollapseIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M15 6l-6 6 6 6" />
  </svg>
);

export default function App() {
  const { isMobile, open, setOpen } = useResponsiveSidebar();

  // On wide screens the sidebar reflows the content (animated margin); on small
  // screens it slides in as a fixed overlay above a tap-to-close backdrop.
  const navClasses = [
    "z-30 flex h-full w-56 shrink-0 flex-col gap-1 border-r border-slate-700 p-4 transition-[margin,transform] duration-200 ease-in-out",
    isMobile
      ? `fixed inset-y-0 left-0 bg-slate-950 ${open ? "translate-x-0" : "-translate-x-full"}`
      : `relative bg-slate-950/40 ${open ? "ml-0" : "-ml-56"}`,
  ].join(" ");

  return (
    <HashRouter>
      <div className="relative flex h-full w-full overflow-hidden">
        {/* Mobile only: floating open button, shown while collapsed. On desktop
            the sidebar is always expanded, so no toggle is offered there. */}
        {isMobile && !open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            className={`absolute left-2 top-2 z-40 ${iconButtonClasses}`}
          >
            <MenuIcon />
          </button>
        )}

        {/* Backdrop behind the overlay sidebar on small screens. */}
        {isMobile && open && (
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-20 bg-black/50"
            aria-hidden="true"
          />
        )}

        <nav className={navClasses}>
          <div className="mb-4 flex items-center gap-3">
            <div className="text-4xl">⚽</div>
            <div className="flex-1 px-1 text-left text-lg font-bold">
              Player Pack Generator
            </div>
            {isMobile && (
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Collapse navigation"
                className={iconButtonClasses}
              >
                <CollapseIcon />
              </button>
            )}
          </div>
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              onClick={() => {
                if (isMobile) setOpen(false);
              }}
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
