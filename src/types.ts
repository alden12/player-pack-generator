import { PDFDocument } from "pdf-lib";

export type Csv = string[][];

export interface Pdf {
  file: File;
  pdfDocument: PDFDocument;
  pageCount: number;
}

export interface PlayerPack {
  name: string;
  pages: number[];
}
