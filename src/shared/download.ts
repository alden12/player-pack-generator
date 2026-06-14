/**
 * Trigger a browser download for a blob, entirely client-side (no upload).
 * Shared by the generators so the object-URL lifecycle lives in one place.
 */
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
