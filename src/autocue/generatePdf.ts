import { PDFDocument } from "pdf-lib";
import { downloadBlob } from "../shared/download";
import { fitFontSize } from "../shared/fitFontSize";
import { measureTextWidth, renderQuoteToPng } from "./canvasText";
import {
  SLIDE,
  BOX_WIDTH,
  BOX_HEIGHT,
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
  LINE_HEIGHT_FACTOR,
} from "./slideLayout";

/**
 * Build a landscape PDF with one quote per page. Each page is a black slide
 * with white text auto-scaled to fill it, rendered on a canvas and embedded as
 * an image. The image approach means any script the browser can display works
 * with no embedded fonts; the trade-off is that the PDF text is not editable
 * (the PPTX output is the editable format). Nothing leaves the device.
 */
export const generatePdf = async (quotes: string[], filename: string) => {
  const document = await PDFDocument.create();

  for (const quote of quotes) {
    const { fontSize, lines } = fitFontSize({
      text: quote,
      boxWidth: BOX_WIDTH,
      boxHeight: BOX_HEIGHT,
      maxFontSize: MAX_FONT_SIZE,
      minFontSize: MIN_FONT_SIZE,
      lineHeightFactor: LINE_HEIGHT_FACTOR,
      measureWidth: measureTextWidth,
    });

    const png = await renderQuoteToPng({
      lines,
      fontSize,
      width: SLIDE.width,
      height: SLIDE.height,
      lineHeightFactor: LINE_HEIGHT_FACTOR,
    });

    const image = await document.embedPng(png);
    const page = document.addPage([SLIDE.width, SLIDE.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: SLIDE.width,
      height: SLIDE.height,
    });
  }

  const bytes = (await document.save()) as BlobPart;
  downloadBlob(new Blob([bytes], { type: "application/pdf" }), filename);
};
