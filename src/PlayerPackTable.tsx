import { useMemo, FC } from "react";
import { Pdf, Csv } from "./types";
import { PlayerPackTableRow } from "./PlayerPackTableRow";

/**
 * Identifier present in the player row to indicate that pages are needed.
 */
const SELECT_PAGE_IDENTIFIER = "TRUE";

/**
 * Identifier present in the player row to indicate a page should be appended at the end of the document.
 */
const APPEND_PAGE_IDENTIFIER = "FALSE";

export const PlayerPackTable: FC<{ pdf: Pdf; csv: Csv }> = ({ pdf, csv }) => {
  const playerPacks = useMemo(() => {
    // Get page number row (in order of appearance in the document).
    const pages = csv[0].slice(1); // Skip the top corner cell.

    // Go through each player row and figure out which pages are needed.
    const packs = csv
      .slice(1) // Skip the page number row.
      .filter((row) => Boolean(row[0])) // Remove any empty rows (without player name).
      // Create player pack object for each row.
      .map((row) => ({
        name: row[0],
        // Find which pages should be included and convert them to an array of numbers.
        pages: [
          // Find pages where row matched (skipping player name column).
          ...pages.filter((_, i) => row[i + 1] === SELECT_PAGE_IDENTIFIER),
          // Find any other pages to append.
          ...pages.filter((_, i) => row[i + 1] === APPEND_PAGE_IDENTIFIER),
        ]
          .flatMap((page) => page.split(",")) // Split any cells with multiple numbers.
          .map((pageNumber) => parseInt(pageNumber, 10) - 1) // Convert strings to numbers (zero indexed).
          .filter((i) => i >= 0 && i < pdf.pageCount), // Remove any pages which are outside of the pdf pages range.
      }));

    return packs;
  }, [csv, pdf]);

  return (
    <div>
      {playerPacks.map((pack, i) => (
        <PlayerPackTableRow key={i} playerPack={pack} pdf={pdf} />
      ))}
    </div>
  );
};
