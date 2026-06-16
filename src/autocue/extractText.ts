import { pdfjs } from "./pdfWorker";

/**
 * Extract all text from a PDF as a single whitespace-normalized string.
 *
 * Every page's text items are joined with spaces and runs of whitespace are
 * collapsed to single spaces, so a `<...>` quote that spans line or page breaks
 * still reads as one continuous string for {@link extractQuotes}.
 *
 * Uses PDF.js (pdf-lib has no text-extraction API). Runs entirely in-browser.
 */
export const extractText = async (file: File): Promise<string> => {
  const data = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data });
  const document = await loadingTask.promise;

  try {
    const pageTexts: string[] = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      pageTexts.push(pageText);
    }
    return pageTexts.join(" ").replace(/\s+/g, " ").trim();
  } finally {
    // Release worker-side resources for the parsed document.
    await loadingTask.destroy();
  }
};
