import { useCallback, FC } from "react";
import { Pdf, PlayerPack } from "../types";
import { downloadBlob } from "../shared/download";
import { buildPlayerPackPdf, playerPackFilename } from "./buildPlayerPackPdf";

export const PlayerPackTableRow: FC<{ playerPack: PlayerPack; pdf: Pdf }> = ({
  playerPack: { name, pages },
  pdf: { pdfDocument },
}) => {
  const handleDownload = useCallback(async () => {
    const pdfBytes = (await buildPlayerPackPdf(pdfDocument, pages)) as BlobPart;
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    downloadBlob(blob, playerPackFilename(name));
  }, [pdfDocument, name, pages]);

  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      <strong>{name}</strong>- Pages: {pages.map((page) => page + 1).join(", ")}
      <button onClick={handleDownload}>Download Pack</button>
    </div>
  );
};
