import { useCallback, useMemo, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { parse } from "papaparse";

import { FileUpload } from "../shared/FileUpload";
import { Pdf, Csv } from "../types";
import { PlayerPackTable } from "./PlayerPackTable";
import { CsvExample } from "./ExampleCsv";
import { DEFAULT_PLAYER_PACK_OPTIONS } from "./computePlayerPacks";

export const PlayerPacksTab = () => {
  const [pdf, setPdf] = useState<Pdf>();
  const [csv, setCsv] = useState<Csv>();

  const [includeValue, setIncludeValue] = useState(
    DEFAULT_PLAYER_PACK_OPTIONS.includeValue
  );
  const [appendValue, setAppendValue] = useState(
    DEFAULT_PLAYER_PACK_OPTIONS.appendValue
  );
  const [caseSensitive, setCaseSensitive] = useState(
    DEFAULT_PLAYER_PACK_OPTIONS.caseSensitive
  );

  const options = useMemo(
    () => ({ includeValue, appendValue, caseSensitive }),
    [includeValue, appendValue, caseSensitive]
  );

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
    <>
      <h1 className="mb-3">Player Packs</h1>
      <h4>Upload PDF & CSV files to generate player packs</h4>
      <FileUpload handleUpload={handlePdfUpload} accept="application/pdf">
        Upload PDF
      </FileUpload>
      <FileUpload handleUpload={handleCsvUpload} accept="application/csv">
        Upload CSV
        <CsvExample />
      </FileUpload>
      {pdf && csv && (
        <>
          <div className="my-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <label className="flex items-center gap-2">
              Include value
              <input
                type="text"
                value={includeValue}
                onChange={(e) => setIncludeValue(e.target.value)}
                className="w-20"
              />
            </label>
            <label className="flex items-center gap-2">
              Append-at-end value
              <input
                type="text"
                value={appendValue}
                onChange={(e) => setAppendValue(e.target.value)}
                className="w-20"
              />
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
              />
              Case sensitive
            </label>
          </div>
          <PlayerPackTable pdf={pdf} csv={csv} options={options} />
        </>
      )}
    </>
  );
};
