/**
 * Shared 16:9 slide geometry for both autocue outputs, in points.
 *
 * 960 x 540 pt is exactly PowerPoint's 16:9 widescreen size (13.333 x 7.5 in at
 * 72 pt/in), so the PPTX and PDF outputs share one coordinate system: the PDF
 * page uses these points directly, and the PPTX layout divides them by 72 to
 * get inches.
 */
export const SLIDE = {
  width: 960,
  height: 540,
  margin: 60,
} as const;

/** Points per inch, for converting the point geometry to PPTX inches. */
export const POINTS_PER_INCH = 72;

/** Largest / smallest autocue font sizes (points) the autoscaler will choose. */
export const MAX_FONT_SIZE = 200;
export const MIN_FONT_SIZE = 12;

/** Line height as a multiple of the font size, shared by both outputs. */
export const LINE_HEIGHT_FACTOR = 1.2;

export const BOX_WIDTH = SLIDE.width - 2 * SLIDE.margin;
export const BOX_HEIGHT = SLIDE.height - 2 * SLIDE.margin;
