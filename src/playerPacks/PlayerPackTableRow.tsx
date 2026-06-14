import { PDFDocument } from "pdf-lib";
import { useCallback, FC } from "react";
import { Pdf, PlayerPack } from "../types";
import { downloadBlob } from "../shared/download";

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
    downloadBlob(blob, `${name}_player_pack.pdf`);
  }, [file, pdfDocument, name, pages]);

  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      <strong>{name}</strong>- Pages: {pages.map((page) => page + 1).join(", ")}
      <button onClick={handleDownload}>Download Pack</button>
    </div>
  );
};
