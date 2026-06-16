/**
 * Canvas-based text measuring and rendering for the TV prompt outputs.
 *
 * Using the browser's own text engine means any script the user's system can
 * display works (CJK, Arabic, etc.) with no embedded fonts, sidestepping
 * pdf-lib's WinAnsi-only standard fonts (which crash on non-Latin text). The
 * PDF output embeds these canvases as images (acceptable per product decision:
 * the PPTX is the editable format, the PDF is a flat display copy). Both
 * formats size their text with {@link measureTextWidth} so fitting is accurate.
 */

/** Sans-serif stack; "Arial" matches the face named in the PPTX output. */
export const PROMPT_FONT_FAMILY = "Arial, Helvetica, sans-serif";

/** Render at 2x the point size so embedded PDF images stay crisp (~144 DPI). */
const RENDER_SCALE = 2;

// A single reusable canvas for width measurement (no rendering side effects).
let measureContext: CanvasRenderingContext2D | undefined;

const getMeasureContext = (): CanvasRenderingContext2D => {
  if (!measureContext) {
    const context = document.createElement("canvas").getContext("2d");
    if (!context) throw new Error("Canvas 2D context is unavailable.");
    measureContext = context;
  }
  return measureContext;
};

/** Measure the rendered width of `text` at `fontSize` in the prompt font. */
export const measureTextWidth = (text: string, fontSize: number): number => {
  const context = getMeasureContext();
  context.font = `${fontSize}px ${PROMPT_FONT_FAMILY}`;
  return context.measureText(text).width;
};

export interface RenderQuoteParams {
  /** Pre-wrapped lines (from the shared autoscaler). */
  lines: string[];
  /** Chosen font size, in points. */
  fontSize: number;
  /** Slide width and height, in points. */
  width: number;
  height: number;
  /** Line height as a multiple of the font size. */
  lineHeightFactor: number;
}

/**
 * Render a single quote to a black slide with white, centered text and return
 * the PNG bytes (for embedding in the PDF output). Runs entirely client-side.
 */
export const renderQuoteToPng = async ({
  lines,
  fontSize,
  width,
  height,
  lineHeightFactor,
}: RenderQuoteParams): Promise<Uint8Array> => {
  const canvas = document.createElement("canvas");
  canvas.width = width * RENDER_SCALE;
  canvas.height = height * RENDER_SCALE;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D context is unavailable.");
  context.scale(RENDER_SCALE, RENDER_SCALE);

  context.fillStyle = "black";
  context.fillRect(0, 0, width, height);

  context.fillStyle = "white";
  context.font = `${fontSize}px ${PROMPT_FONT_FAMILY}`;
  context.textAlign = "center";
  context.textBaseline = "middle";

  // Vertically center the block of lines around the slide's middle.
  const lineHeight = fontSize * lineHeightFactor;
  const firstLineY = height / 2 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, index) => {
    context.fillText(line, width / 2, firstLineY + index * lineHeight);
  });

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png")
  );
  if (!blob) throw new Error("Failed to render the slide image.");
  return new Uint8Array(await blob.arrayBuffer());
};
