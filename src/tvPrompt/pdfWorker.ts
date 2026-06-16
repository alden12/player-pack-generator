import * as pdfjs from "pdfjs-dist";
// Bundle the worker from the package (Vite `?url`), never a CDN, so all PDF
// processing stays on-device (see the client-side rule in CLAUDE.md).
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

export { pdfjs };
