import { PDFDocument } from "pdf-lib";
import { ChangeEvent, FC, useCallback, useState } from "react";

export interface Pdf {
  file: File;
  pdfDocument: PDFDocument;
  pageCount: number;
}

export interface PdfUploadProps {
  handleUpload: (pdf?: Pdf) => void;
}

export const PdfUpload: FC<PdfUploadProps> = ({ handleUpload }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        handleUpload(undefined);
        setLoading(true);
        setError(undefined);
        const file = e.target.files[0];
        const buffer = await file.arrayBuffer();
        try {
          const pdfDocument = await PDFDocument.load(buffer);
          const pageCount = pdfDocument.getPageCount();
          handleUpload({ file, pdfDocument, pageCount });
          setLoading(false);
        } catch (e) {
          setError(String(e));
          setLoading(false);
        }
      }
    },
    [handleUpload]
  );

  return (
    <div className="upload">
      Upload PDF
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      {loading && "Loading..."}
      {error && `Error parsing PDF: ${error}`}
    </div>
  );
};
