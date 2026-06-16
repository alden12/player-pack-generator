// Regenerates the binary PDF fixtures used by the e2e tests.
//
//   node e2e/fixtures/generateFixtures.mjs
//
// The output PDFs are committed so CI doesn't need to regenerate them; rerun
// this only when you want to change the fixture content. Uses the app's own
// pdf-lib dependency so the fixtures match what the app can load.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { PDFDocument, StandardFonts } from "pdf-lib";

const here = dirname(fileURLToPath(import.meta.url));

// A 6-page PDF for the Player Packs tab. The CSV fixture maps these page
// numbers, so the page count must cover them.
const buildPlayerPacksPdf = async () => {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let n = 1; n <= 6; n++) {
    const page = doc.addPage([300, 400]);
    page.drawText(`Page ${n}`, { x: 50, y: 350, size: 32, font });
  }
  return doc.save();
};

// A PDF whose extracted text contains two <bracketed> quotes for the TV Prompt
// tab. Each quote is its own text run so it survives text extraction intact.
const buildTvPromptPdf = async () => {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([400, 300]);
  page.drawText("Intro paragraph", { x: 40, y: 240, size: 18, font });
  page.drawText("<quote one>", { x: 40, y: 200, size: 18, font });
  page.drawText("<quote two>", { x: 40, y: 160, size: 18, font });
  return doc.save();
};

const write = (name, bytes) => {
  const path = join(here, name);
  writeFileSync(path, bytes);
  console.log(`wrote ${path} (${bytes.length} bytes)`);
};

write("playerPacks.pdf", await buildPlayerPacksPdf());
write("tvPrompt.pdf", await buildTvPromptPdf());
