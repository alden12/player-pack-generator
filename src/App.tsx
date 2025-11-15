import { useCallback, useState } from "react";
import { PlayerPackTable } from "./PlayerPackTable";

import "./styles.css";
import { PDFDocument } from "pdf-lib";
import { parse } from "papaparse";
import { FileUpload } from "./FileUpload";
import { Pdf, Csv } from "./types";
import { CsvExample } from "./ExampleCsv";

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
    parse(file, {
      complete: ({ data }) => setCsv(data as Csv),
      error: (error) => {
        throw error;
      },
    });
  }, []);

  return (
    <div className="App">
      <h1>Player Packs</h1>
      <h4>Upload PDF & CSV files to generate player packs</h4>
      <FileUpload handleUpload={handlePdfUpload} accept="application/pdf">
        Upload PDF
      </FileUpload>
      <FileUpload handleUpload={handleCsvUpload} accept="application/csv">
        Upload CSV
        <CsvExample />
      </FileUpload>
      {pdf && csv && <PlayerPackTable pdf={pdf} csv={csv} />}
    </div>
  );
}
