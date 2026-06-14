import { Csv, PlayerPack } from "../types";

/**
 * Identifier present in the player row to indicate that pages are needed.
 */
const SELECT_PAGE_IDENTIFIER = "TRUE";

/**
 * Identifier present in the player row to indicate a page should be appended at the end of the document.
 */
const APPEND_PAGE_IDENTIFIER = "FALSE";

/**
 * Convert the uploaded CSV into a player pack per row.
 *
 * - Row 0 is the page-number header (each cell may list several comma-separated pages).
 * - Each later row is a player; a cell matching {@link SELECT_PAGE_IDENTIFIER} includes
 *   that column's page(s), {@link APPEND_PAGE_IDENTIFIER} appends them at the end, and a
 *   blank cell excludes them.
 * - Page numbers are returned zero-indexed and clamped to the PDF's page range.
 */
export const computePlayerPacks = (csv: Csv, pageCount: number): PlayerPack[] => {
  const [header, ...rows] = csv;
  if (!header) return []; // No header row -> nothing to map.

  // Page numbers in order of appearance in the document (skip the top corner cell).
  const pages = header.slice(1);

  return rows
    .filter((row) => Boolean(row[0])) // Remove any empty rows (without player name).
    .map((row) => ({
      name: row[0],
      // Find which pages should be included and convert them to an array of numbers.
      pages: [
        // Pages where the row matched (skipping the player name column).
        ...pages.filter((_, i) => row[i + 1] === SELECT_PAGE_IDENTIFIER),
        // Any other pages to append at the end.
        ...pages.filter((_, i) => row[i + 1] === APPEND_PAGE_IDENTIFIER),
      ]
        .flatMap((page) => page.split(",")) // Split any cells with multiple numbers.
        .map((pageNumber) => parseInt(pageNumber, 10) - 1) // Convert to numbers (zero indexed).
        .filter((i) => i >= 0 && i < pageCount), // Remove pages outside the PDF range.
    }));
};
