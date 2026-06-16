import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { downloadBlob } from "../shared/download";
import { fitFontSize } from "../shared/fitFontSize";
import {
  SLIDE,
  BOX_WIDTH,
  BOX_HEIGHT,
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
  LINE_HEIGHT_FACTOR,
} from "./slideLayout";

/**
 * Build a landscape PDF with one quote per page: black background, white
 * Helvetica text auto-scaled to fill the page, centered. Helvetica is a
 * standard PDF font so nothing is embedded (keeps the output small and
 * sidesteps font licensing). Saved and downloaded entirely client-side.
 */
export const generatePdf = async (quotes: string[], filename: string) => {
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);

  for (const quote of quotes) {
    const page = document.addPage([SLIDE.width, SLIDE.height]);
    page.drawRectangle({
      x: 0,
      y: 0,
      width: SLIDE.width,
      height: SLIDE.height,
      color: rgb(0, 0, 0),
    });

    const { fontSize, lines } = fitFontSize({
      text: quote,
      boxWidth: BOX_WIDTH,
      boxHeight: BOX_HEIGHT,
      maxFontSize: MAX_FONT_SIZE,
      minFontSize: MIN_FONT_SIZE,
      lineHeightFactor: LINE_HEIGHT_FACTOR,
      measureWidth: (text, size) => font.widthOfTextAtSize(text, size),
    });

    // Vertically center the block of lines on the page (pdf-lib's y origin is
    // the bottom-left, and drawText positions the text baseline).
    const lineHeight = fontSize * LINE_HEIGHT_FACTOR;
    const blockHeight = lines.length * lineHeight;
    const firstBaselineY = SLIDE.height / 2 + blockHeight / 2 - fontSize;

    lines.forEach((line, index) => {
      const lineWidth = font.widthOfTextAtSize(line, fontSize);
      page.drawText(line, {
        x: (SLIDE.width - lineWidth) / 2,
        y: firstBaselineY - index * lineHeight,
        size: fontSize,
        font,
        color: rgb(1, 1, 1),
      });
    });
  }

  const bytes = (await document.save()) as BlobPart;
  downloadBlob(new Blob([bytes], { type: "application/pdf" }), filename);
};
