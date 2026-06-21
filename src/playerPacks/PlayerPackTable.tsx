import { useCallback, useMemo, useState, FC } from "react";
import { Pdf, Csv } from "../types";
import { PlayerPackTableRow } from "./PlayerPackTableRow";
import { computePlayerPacks, PlayerPackOptions } from "./computePlayerPacks";
import { downloadAllPacks } from "./downloadAllPacks";

export const PlayerPackTable: FC<{
  pdf: Pdf;
  csv: Csv;
  options: PlayerPackOptions;
}> = ({ pdf, csv, options }) => {
  const playerPacks = useMemo(
    () => computePlayerPacks(csv, pdf.pageCount, options),
    [csv, pdf, options]
  );

  // Players whose CSV referenced pages outside the PDF (skipped on download).
  const outOfRange = useMemo(
    () => playerPacks.filter((pack) => pack.outOfRangePages.length > 0),
    [playerPacks]
  );

  const [zipping, setZipping] = useState(false);
  const [error, setError] = useState<string>();

  const handleDownloadAll = useCallback(async () => {
    setZipping(true);
    setError(undefined);
    try {
      await downloadAllPacks(pdf.pdfDocument, playerPacks);
    } catch (e) {
      setError(`Could not build the zip: ${e}`);
    } finally {
      setZipping(false);
    }
  }, [pdf, playerPacks]);

  if (!playerPacks.length) return null;

  return (
    <div>
      {outOfRange.length > 0 && (
        <div
          role="alert"
          className="mx-auto my-2 max-w-md rounded-md border border-amber-500/50 bg-amber-500/10 px-4 py-2 text-left text-sm text-amber-200"
        >
          <p className="font-medium">
            Some CSV page numbers are outside the PDF's {pdf.pageCount} page
            {pdf.pageCount === 1 ? "" : "s"} and were skipped:
          </p>
          <ul className="mt-1 list-disc pl-5">
            {outOfRange.map((pack) => (
              <li key={pack.name}>
                {pack.name}: page{pack.outOfRangePages.length === 1 ? "" : "s"}{" "}
                {pack.outOfRangePages.join(", ")}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex flex-col items-center gap-1 pt-2">
        <button onClick={handleDownloadAll} disabled={zipping}>
          {zipping ? "Building zip..." : "Download all (.zip)"}
        </button>
        {error && <p className="text-red-400">{error}</p>}
      </div>
      {playerPacks.map((pack, i) => (
        <PlayerPackTableRow key={i} playerPack={pack} pdf={pdf} />
      ))}
    </div>
  );
};
