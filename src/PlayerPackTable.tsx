import { PDFDocument } from "pdf-lib";
import { useCallback, useMemo, type FC } from "react";
import { Csv } from "./CsvUpload";
import { Pdf } from "./PdfUpload";

interface PlayerPack {
  name: string;
  pages: number[];
}

/**
 * Identifier present in the player row to indicate that pages are needed.
 */
const SELECT_PAGE_IDENTIFIER = "TRUE";

/**
 * Identifier present in the player row to indicate a page should be appended at the end of the docuent.
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

const PlayerPackTableRow: FC<{ playerPack: PlayerPack; pdf: Pdf }> = ({
  playerPack: { name, pages },
  pdf: { file, pdfDocument },
}) => {
  const handleDownload = useCallback(async () => {
    // Create new pdf document to add required pages to.
    const newDoc = await PDFDocument.create();

    // Copy the relevant pages to the new pdf.
    const copied = await newDoc.copyPages(pdfDocument, pages);
    copied.forEach((page) => newDoc.addPage(page));

    // Download the new pdf document.
    const pdfBytes = await newDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}_player_pack.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }, [file, pdfDocument, name, pages]);

  return (
    <div className="player-pack">
      <strong>{name}</strong>- Pages: {pages.map((page) => page + 1).join(", ")}
      <button onClick={handleDownload}>Download Pack</button>
    </div>
  );
};
