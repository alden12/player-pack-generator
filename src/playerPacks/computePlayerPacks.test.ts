import {
  computePlayerPacks,
  DEFAULT_PLAYER_PACK_OPTIONS,
} from "./computePlayerPacks";
import { Csv } from "../types";

// Header mirrors the in-app example: page numbers per column, comma-separated
// where a column maps to multiple pages.
const HEADER = ["", "1,2", "3", "4,5", "6"];

describe("computePlayerPacks", () => {
  it("includes 'y' pages, then appends 'n' pages at the end, and excludes blanks", () => {
    const csv: Csv = [HEADER, ["Alice", "y", "n", "y", ""]];

    const [alice] = computePlayerPacks(csv, 6);

    expect(alice.name).toBe("Alice");
    // 'y' columns "1,2" and "4,5" first (-> 0,1,3,4), then the 'n' column "3"
    // appended at the end (-> 2). Blank column "6" excluded.
    expect(alice.pages).toEqual([0, 1, 3, 4, 2]);
  });

  it("maps every player row and skips rows without a name", () => {
    const csv: Csv = [
      HEADER,
      ["Alice", "y", "", "", ""],
      ["", "y", "y", "y", "y"], // no name -> skipped
      ["Bob", "", "y", "n", "y"],
    ];

    const packs = computePlayerPacks(csv, 6);

    expect(packs.map((p) => p.name)).toEqual(["Alice", "Bob"]);
    expect(packs[0].pages).toEqual([0, 1]); // "1,2"
    // Bob: 'y' on "3" and "6" (-> 2, 5), then 'n' on "4,5" appended (-> 3,4)
    expect(packs[1].pages).toEqual([2, 5, 3, 4]);
  });

  it("drops page numbers outside the PDF's page range", () => {
    const csv: Csv = [HEADER, ["Alice", "y", "y", "y", "y"]];

    // Only 3 pages exist, so page 4,5,6 (indexes 3,4,5) are dropped.
    const [alice] = computePlayerPacks(csv, 3);

    expect(alice.pages).toEqual([0, 1, 2]);
  });

  it("reports selected pages outside the PDF range as outOfRangePages", () => {
    const csv: Csv = [HEADER, ["Alice", "y", "y", "y", "y"]];

    // Only 3 pages exist, so the selected pages 4, 5 and 6 are out of range.
    const [alice] = computePlayerPacks(csv, 3);

    expect(alice.pages).toEqual([0, 1, 2]);
    expect(alice.outOfRangePages).toEqual([4, 5, 6]);
  });

  it("has no outOfRangePages when every selected page is in range", () => {
    const csv: Csv = [HEADER, ["Alice", "y", "n", "", ""]];

    const [alice] = computePlayerPacks(csv, 6);

    expect(alice.outOfRangePages).toEqual([]);
  });

  it("ignores columns whose page header is blank", () => {
    // Column 2 has no page header; its 'y'/'n' cells must not affect the pack.
    const csv: Csv = [
      ["", "1", "", "3"],
      ["Alice", "y", "y", "n"],
    ];

    const [alice] = computePlayerPacks(csv, 5);

    // Only header columns "1" (include -> 0) and "3" (append -> 2) count.
    expect(alice.pages).toEqual([0, 2]);
  });

  it("ignores non-numeric header cells", () => {
    const csv: Csv = [
      ["", "1", "oops", "3"],
      ["Alice", "y", "y", "y"],
    ];

    const [alice] = computePlayerPacks(csv, 5);

    expect(alice.pages).toEqual([0, 2]); // "oops" -> NaN -> dropped
  });

  it("returns no packs when there is no header row", () => {
    expect(computePlayerPacks([], 5)).toEqual([]);
  });

  it("returns no packs when there are only headers and no player rows", () => {
    expect(computePlayerPacks([HEADER], 5)).toEqual([]);
  });

  describe("configurable condition values", () => {
    it("uses custom include / append values", () => {
      const csv: Csv = [HEADER, ["Alice", "TRUE", "FALSE", "TRUE", ""]];

      const [alice] = computePlayerPacks(csv, 6, {
        includeValue: "TRUE",
        appendValue: "FALSE",
        caseSensitive: false,
      });

      // TRUE columns "1,2" and "4,5" included first, FALSE column "3" appended.
      expect(alice.pages).toEqual([0, 1, 3, 4, 2]);
    });

    it("ignores case by default (trimming whitespace)", () => {
      const csv: Csv = [HEADER, ["Alice", " Y ", "N", "yes", ""]];

      const [alice] = computePlayerPacks(csv, 6);

      // " Y " trims+lowercases to "y" (include "1,2"); "N" -> append "3";
      // "yes" does not equal "y" so "4,5" is excluded.
      expect(alice.pages).toEqual([0, 1, 2]);
    });

    it("matches exactly when case sensitive is on", () => {
      const csv: Csv = [HEADER, ["Alice", "y", "Y", "n", "N"]];

      const [alice] = computePlayerPacks(csv, 6, {
        ...DEFAULT_PLAYER_PACK_OPTIONS,
        caseSensitive: true,
      });

      // Only lowercase "y" includes ("1,2") and lowercase "n" appends ("4,5").
      // Uppercase "Y" and "N" don't match, so "3" and "6" are excluded.
      expect(alice.pages).toEqual([0, 1, 3, 4]);
    });

    it("treats an empty configured value as never matching", () => {
      const csv: Csv = [HEADER, ["Alice", "", "n", "", ""]];

      const [alice] = computePlayerPacks(csv, 6, {
        includeValue: "",
        appendValue: "n",
        caseSensitive: false,
      });

      // Empty include value must not select the blank cells; only the "n"
      // append column "3" (-> 2) is taken.
      expect(alice.pages).toEqual([2]);
    });
  });
});
