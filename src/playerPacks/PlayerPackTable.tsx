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
