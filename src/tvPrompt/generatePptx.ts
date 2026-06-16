import pptxgen from "pptxgenjs";
import { downloadBlob } from "../shared/download";
import { fitFontSize } from "../shared/fitFontSize";
import { measureTextWidth } from "./canvasText";
import {
  BOX_WIDTH,
  BOX_HEIGHT,
  SLIDE,
  POINTS_PER_INCH,
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
  LINE_HEIGHT_FACTOR,
} from "./slideLayout";

const pt = (points: number) => points / POINTS_PER_INCH;

/**
 * Build a 16:9 PPTX with one quote per slide: black background, white centered
 * Arial text auto-scaled to fill the slide. Arial is supplied by the viewer so
 * nothing is embedded and any script it can display works. Written to a Blob
 * and downloaded entirely client-side.
 *
 * Font size is computed with the shared autoscaler using canvas text metrics;
 * pptxgenjs's `fit: "shrink"` is kept as a final safety net for any drift
 * between the measured and rendered widths.
 */
export const generatePptx = async (quotes: string[], filename: string) => {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in == 960 x 540 pt (see slideLayout).

  for (const quote of quotes) {
    const { fontSize } = fitFontSize({
      text: quote,
      boxWidth: BOX_WIDTH,
      boxHeight: BOX_HEIGHT,
      maxFontSize: MAX_FONT_SIZE,
      minFontSize: MIN_FONT_SIZE,
      lineHeightFactor: LINE_HEIGHT_FACTOR,
      measureWidth: measureTextWidth,
    });

    const slide = pptx.addSlide();
    slide.background = { color: "000000" };
    slide.addText(quote, {
      x: pt(SLIDE.margin),
      y: pt(SLIDE.margin),
      w: pt(BOX_WIDTH),
      h: pt(BOX_HEIGHT),
      align: "center",
      valign: "middle",
      color: "FFFFFF",
      fontFace: "Arial",
      fontSize,
      fit: "shrink",
    });
  }

  const blob = (await pptx.write({ outputType: "blob" })) as Blob;
  downloadBlob(blob, filename);
};
