import { useCallback, useState } from "react";
import { FileUpload } from "../shared/FileUpload";
import { extractText } from "./extractText";
import { extractQuotes } from "./extractQuotes";
import { generatePptx } from "./generatePptx";
import { generatePdf } from "./generatePdf";

type PromptFormat = "pptx" | "pdf";

/**
 * Extracts `<...>`-bracketed quotes from an uploaded PDF and generates one
 * slide/page per quote, as a PowerPoint or PDF. Lazy-loaded (see App.tsx) so
 * pdfjs-dist and pptxgenjs stay out of the default bundle.
 */
export const TvPromptTab = () => {
  const [quotes, setQuotes] = useState<string[]>();
  const [baseName, setBaseName] = useState("tv_prompt");
  const [format, setFormat] = useState<PromptFormat>("pptx");
  const [generating, setGenerating] = useState(false);

  const handleUpload = useCallback(async (file?: File) => {
    if (!file) {
      setQuotes(undefined);
      return;
    }
    const text = await extractText(file);
    const found = extractQuotes(text);
    if (!found.length) {
      // Surfaced by FileUpload's error UI.
      throw new Error("No <bracketed> quotes found in this PDF.");
    }
    setQuotes(found);
    setBaseName(file.name.replace(/\.pdf$/i, "") || "tv_prompt");
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!quotes) return;
    setGenerating(true);
    try {
      const filename = `${baseName}_tv_prompt.${format}`;
      if (format === "pptx") {
        await generatePptx(quotes, filename);
      } else {
        await generatePdf(quotes, filename);
      }
    } finally {
      setGenerating(false);
    }
  }, [quotes, baseName, format]);

  return (
    <>
      <h1 className="mb-3">TV Prompt</h1>
      <h4>
        Upload a PDF to generate one slide per &lt;bracketed&gt; quote it
        contains
      </h4>
      <FileUpload handleUpload={handleUpload} accept="application/pdf">
        Upload PDF
      </FileUpload>

      {quotes && (
        <div className="my-4 flex flex-col items-center gap-4">
          <p>
            Found {quotes.length} quote{quotes.length === 1 ? "" : "s"}.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span>Format:</span>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="format"
                checked={format === "pptx"}
                onChange={() => setFormat("pptx")}
              />
              PowerPoint (.pptx)
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="format"
                checked={format === "pdf"}
                onChange={() => setFormat("pdf")}
              />
              PDF
            </label>
          </div>
          <button onClick={handleGenerate} disabled={generating}>
            {generating ? "Generating..." : "Generate Prompt"}
          </button>
        </div>
      )}
    </>
  );
};
