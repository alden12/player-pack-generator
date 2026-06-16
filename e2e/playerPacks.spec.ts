import { test, expect } from "@playwright/test";
import { fileURLToPath } from "node:url";

const fixture = (name: string) =>
  fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));

test.describe("Player Packs", () => {
  test("maps uploaded files to per-player packs and downloads them", async ({
    page,
  }) => {
    await page.goto("/#/player-packs");

    // FileUpload renders one file input each: PDF first, then CSV.
    const inputs = page.locator('input[type="file"]');
    await inputs.nth(0).setInputFiles(fixture("playerPacks.pdf"));
    await inputs.nth(1).setInputFiles(fixture("players.csv"));

    // A row per player appears once both files parse.
    await expect(page.getByText("Alice", { exact: false })).toBeVisible();
    await expect(page.getByText("Bob", { exact: false })).toBeVisible();

    // Downloading a single pack yields that player's PDF.
    const singleDownload = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download Pack" }).first().click();
    expect((await singleDownload).suggestedFilename()).toBe(
      "Alice_player_pack.pdf"
    );

    // Downloading all yields the zip.
    const zipDownload = page.waitForEvent("download");
    await page.getByRole("button", { name: /Download all/ }).click();
    expect((await zipDownload).suggestedFilename()).toBe("player_packs.zip");
  });
});
