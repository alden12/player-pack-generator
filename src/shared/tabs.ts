/**
 * The app's top-level tabs. Each maps to a hash route (see App.tsx).
 * Add a tab here and wire its route/component in App.tsx.
 */
export interface TabDef {
  path: string;
  label: string;
}

export const tabs: TabDef[] = [
  { path: "/player-packs", label: "Player Packs" },
  { path: "/autocue", label: "Autocue" },
];

/** The tab shown at "/" (and any unknown route). */
export const defaultTabPath = tabs[0].path;
