import { useCallback, useState } from "react";
import { PlayerPackTable } from "./PlayerPackTable";

import { PDFDocument } from "pdf-lib";
import { parse } from "papaparse";
import { FileUpload } from "./FileUpload";
import { Pdf, Csv } from "./types";
import { CsvExample } from "./ExampleCsv";
import { Attribution } from "./Attribution";

export default function App() {
  const [pdf, setPdf] = useState<Pdf>();
  const [csv, setCsv] = useState<Csv>();

  const handlePdfUpload = useCallback(async (file?: File) => {
    if (!file) {
      setPdf(undefined);
      return;
    }
    const buffer = await file.arrayBuffer();
    const pdfDocument = await PDFDocument.load(buffer);
    const pageCount = pdfDocument.getPageCount();
    setPdf({ file, pdfDocument, pageCount });
  }, []);

  const handleCsvUpload = useCallback(async (file?: File) => {
    if (!file) {
      setCsv(undefined);
      return;
    }
    // papaparse parses a File asynchronously via callbacks, so wrap it in a
    // promise. Awaiting it lets FileUpload keep its loading state until parsing
    // finishes and surface parse errors through its try/catch (a `throw` inside
    // the error callback would otherwise escape uncaught).
    const data = await new Promise<Csv>((resolve, reject) => {
      parse<string[]>(file, {
        complete: ({ data }) => resolve(data),
        error: (error) => reject(error),
      });
    });
    setCsv(data);
  }, []);

  return (
    <div className="flex h-full w-full flex-col items-center px-4 pt-4 text-center">
      <h1 className="mb-3">Player Packs</h1>
      <h4>Upload PDF & CSV files to generate player packs</h4>
      <FileUpload handleUpload={handlePdfUpload} accept="application/pdf">
        Upload PDF
      </FileUpload>
      <FileUpload handleUpload={handleCsvUpload} accept="application/csv">
        Upload CSV
        <CsvExample />
      </FileUpload>
      {pdf && csv && <PlayerPackTable pdf={pdf} csv={csv} />}
      <Attribution />
    </div>
  );
}
