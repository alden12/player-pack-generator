import { useState } from "react";
import { Csv, CsvUpload } from "./CsvUpload";
import { Pdf, PdfUpload } from "./PdfUpload";
import { PlayerPackTable } from "./PlayerPackTable";

import "./styles.css";

export default function App() {
  const [pdf, setPdf] = useState<Pdf>();
  const [csv, setCsv] = useState<Csv>();

  return (
    <div className="App">
      <h1>Player Packs</h1>
      <h4>Upload PDF & CSV files to generate player packs</h4>
      <PdfUpload handleUpload={setPdf} />
      <CsvUpload handleUpload={setCsv} />
      {pdf && csv && <PlayerPackTable pdf={pdf} csv={csv} />}
    </div>
  );
}
