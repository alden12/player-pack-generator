import { PDFDocument } from "pdf-lib";
import { useCallback, FC } from "react";
import { Pdf, PlayerPack } from "./types";

export const PlayerPackTableRow: FC<{ playerPack: PlayerPack; pdf: Pdf }> = ({
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
    const pdfBytes = (await newDoc.save()) as BlobPart;
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
