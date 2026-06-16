import { PDFDocument } from "pdf-lib";
import { PlayerPack } from "../types";

/** Filename for a player's pack PDF (also used as the entry name in the zip). */
export const playerPackFilename = (name: string) => `${name}_player_pack.pdf`;

/**
 * Build a single player's pack PDF from the source document by copying just
 * their pages into a fresh document, and return the saved bytes. Shared by the
 * per-row download and the "download all" zip so both produce identical files.
 * Runs entirely in-browser; nothing is uploaded.
 */
export const buildPlayerPackPdf = async (
  source: PDFDocument,
  pages: PlayerPack["pages"]
): Promise<Uint8Array> => {
  const newDoc = await PDFDocument.create();
  const copied = await newDoc.copyPages(source, pages);
  copied.forEach((page) => newDoc.addPage(page));
  return newDoc.save();
};
