import { test, expect } from "@playwright/test";
import { fileURLToPath } from "node:url";

const fixture = (name: string) =>
  fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));

test.describe("TV Prompt", () => {
  test("extracts bracketed quotes and downloads both formats", async ({
    page,
  }) => {
    await page.goto("/#/tv-prompt");

    await page.locator('input[type="file"]').setInputFiles(fixture("tvPrompt.pdf"));

    // The two <bracketed> quotes in the fixture are found.
    await expect(page.getByText("Found 2 quotes.")).toBeVisible();

    // PowerPoint is the default format.
    const pptxDownload = page.waitForEvent("download");
    await page.getByRole("button", { name: "Generate Prompt" }).click();
    expect((await pptxDownload).suggestedFilename()).toBe(
      "tvPrompt_tv_prompt.pptx"
    );

    // Switching to PDF produces the PDF output.
    await page.getByLabel("PDF").check();
    const pdfDownload = page.waitForEvent("download");
    await page.getByRole("button", { name: "Generate Prompt" }).click();
    expect((await pdfDownload).suggestedFilename()).toBe(
      "tvPrompt_tv_prompt.pdf"
    );
  });
});
