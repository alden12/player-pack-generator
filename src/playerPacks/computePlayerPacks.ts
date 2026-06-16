import { Csv, PlayerPack } from "../types";

/**
 * User-configurable cell values that decide what happens to a column's page(s)
 * for a given player. A cell matching {@link PlayerPackOptions.includeValue}
 * includes the page(s); one matching {@link PlayerPackOptions.appendValue}
 * appends them at the end; anything else (including a blank cell) excludes them.
 */
export interface PlayerPackOptions {
  /** Cell value that includes the column's page(s) in the pack. */
  includeValue: string;
  /** Cell value that appends the column's page(s) at the end of the pack. */
  appendValue: string;
  /** When false (default), matching ignores case. Whitespace is always trimmed. */
  caseSensitive: boolean;
}

/** Defaults used by the UI and tests: `y` includes, `n` appends, case-insensitive. */
export const DEFAULT_PLAYER_PACK_OPTIONS: PlayerPackOptions = {
  includeValue: "y",
  appendValue: "n",
  caseSensitive: false,
};

/**
 * Build a predicate that tests whether a CSV cell matches a configured value.
 * Whitespace is always trimmed; case is ignored unless `caseSensitive` is set.
 * An empty configured value never matches, so it can't accidentally select
 * every blank cell.
 */
const makeMatcher = (target: string, caseSensitive: boolean) => {
  const normalize = (value: string) =>
    caseSensitive ? value.trim() : value.trim().toLowerCase();
  const normalizedTarget = normalize(target);
  return (cell: string | undefined): boolean =>
    normalizedTarget !== "" &&
    cell !== undefined &&
    normalize(cell) === normalizedTarget;
};

/**
 * Convert the uploaded CSV into a player pack per row.
 *
 * - Row 0 is the page-number header (each cell may list several comma-separated pages).
 * - Each later row is a player; cell values are matched against {@link options}
 *   to decide whether each column's page(s) are included, appended, or excluded.
 * - Page numbers are returned zero-indexed and clamped to the PDF's page range.
 */
export const computePlayerPacks = (
  csv: Csv,
  pageCount: number,
  options: PlayerPackOptions = DEFAULT_PLAYER_PACK_OPTIONS
): PlayerPack[] => {
  const [header, ...rows] = csv;
  if (!header) return []; // No header row -> nothing to map.

  // Page numbers in order of appearance in the document (skip the top corner cell).
  const pages = header.slice(1);

  const matchesInclude = makeMatcher(options.includeValue, options.caseSensitive);
  const matchesAppend = makeMatcher(options.appendValue, options.caseSensitive);

  return rows
    .filter((row) => Boolean(row[0])) // Remove any empty rows (without player name).
    .map((row) => ({
      name: row[0],
      // Find which pages should be included and convert them to an array of numbers.
      pages: [
        // Pages where the row matched the include value (skipping the player name column).
        ...pages.filter((_, i) => matchesInclude(row[i + 1])),
        // Any pages to append at the end.
        ...pages.filter((_, i) => matchesAppend(row[i + 1])),
      ]
        .flatMap((page) => page.split(",")) // Split any cells with multiple numbers.
        .map((pageNumber) => parseInt(pageNumber, 10) - 1) // Convert to numbers (zero indexed).
        .filter((i) => i >= 0 && i < pageCount), // Remove pages outside the PDF range.
    }));
};
