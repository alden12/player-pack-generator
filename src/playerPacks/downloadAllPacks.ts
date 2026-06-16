import { PDFDocument } from "pdf-lib";
import { PlayerPack } from "../types";
import { downloadBlob } from "../shared/download";
import { buildPlayerPackPdf, playerPackFilename } from "./buildPlayerPackPdf";

/**
 * Build every player's pack PDF and download them together as a single zip.
 * Each entry is identical to that player's individual download. The zip is
 * created in-browser with JSZip and saved via a Blob; nothing is uploaded.
 *
 * JSZip is dynamically imported so it only loads when a user actually downloads
 * all packs, keeping it out of the initial bundle.
 */
export const downloadAllPacks = async (
  source: PDFDocument,
  packs: PlayerPack[]
) => {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (const pack of packs) {
    const bytes = await buildPlayerPackPdf(source, pack.pages);
    zip.file(playerPackFilename(pack.name), bytes);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  downloadBlob(blob, "player_packs.zip");
};
