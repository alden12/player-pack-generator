import { PDFDocument } from "pdf-lib";

export type Csv = string[][];

export interface Pdf {
  file: File;
  pdfDocument: PDFDocument;
  pageCount: number;
}

export interface PlayerPack {
  name: string;
  /** Zero-indexed pages to include, in order, clamped to the PDF's range. */
  pages: number[];
  /**
   * Page numbers (as written in the CSV, 1-indexed) that this player selected
   * but which fall outside the PDF's page range, so they were skipped.
   */
  outOfRangePages: number[];
}
