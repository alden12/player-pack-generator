export interface FitFontSizeParams {
  /** The text to lay out (single string; may contain spaces to wrap on). */
  text: string;
  /** Width of the box the text must fit within, in the caller's units (e.g. points). */
  boxWidth: number;
  /** Height of the box the text must fit within, in the same units. */
  boxHeight: number;
  /** Largest font size to try. */
  maxFontSize: number;
  /** Smallest acceptable font size; returned even if the text still overflows. */
  minFontSize: number;
  /** Line height as a multiple of the font size (default 1.2). */
  lineHeightFactor?: number;
  /** Measure the rendered width of `text` at `fontSize`, in the box's units. */
  measureWidth: (text: string, fontSize: number) => number;
}

export interface FitFontSizeResult {
  /** The chosen font size. */
  fontSize: number;
  /** The text greedily word-wrapped into lines at the chosen font size. */
  lines: string[];
}

/**
 * Greedily word-wrap `text` to `boxWidth` at the given font size. A single word
 * wider than the box is kept on its own line (words are never split), so the
 * font-size search below relies on shrinking to bring such words into range.
 */
const wrapText = (
  text: string,
  fontSize: number,
  boxWidth: number,
  measureWidth: FitFontSizeParams["measureWidth"]
): string[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (!current || measureWidth(candidate, fontSize) <= boxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);

  return lines;
};

/**
 * Find the largest font size (an integer between min and max) at which the
 * word-wrapped text fits inside the box on both axes, and return that size with
 * its wrapped lines. If nothing fits, returns the minimum size wrapped anyway
 * (callers can rely on a renderer-side shrink/clip as a final safety net).
 *
 * Pure and unit-tested; shared by the PPTX and PDF prompt outputs, which differ
 * only in how they measure text width.
 */
export const fitFontSize = ({
  text,
  boxWidth,
  boxHeight,
  maxFontSize,
  minFontSize,
  lineHeightFactor = 1.2,
  measureWidth,
}: FitFontSizeParams): FitFontSizeResult => {
  const fits = (fontSize: number, lines: string[]): boolean => {
    const totalHeight = lines.length * fontSize * lineHeightFactor;
    return (
      totalHeight <= boxHeight &&
      lines.every((line) => measureWidth(line, fontSize) <= boxWidth)
    );
  };

  for (let fontSize = maxFontSize; fontSize > minFontSize; fontSize--) {
    const lines = wrapText(text, fontSize, boxWidth, measureWidth);
    if (fits(fontSize, lines)) return { fontSize, lines };
  }

  return {
    fontSize: minFontSize,
    lines: wrapText(text, minFontSize, boxWidth, measureWidth),
  };
};
