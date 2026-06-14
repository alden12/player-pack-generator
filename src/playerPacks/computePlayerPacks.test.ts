import { computePlayerPacks } from "./computePlayerPacks";
import { Csv } from "../types";

// Header mirrors the in-app example: page numbers per column, comma-separated
// where a column maps to multiple pages.
const HEADER = ["", "1,2", "3", "4,5", "6"];

describe("computePlayerPacks", () => {
  it("includes TRUE pages, then appends FALSE pages at the end, and excludes blanks", () => {
    const csv: Csv = [
      HEADER,
      ["Alice", "TRUE", "FALSE", "TRUE", ""],
    ];

    const [alice] = computePlayerPacks(csv, 6);

    expect(alice.name).toBe("Alice");
    // TRUE columns "1,2" and "4,5" first (-> 0,1,3,4), then the FALSE column "3"
    // appended at the end (-> 2). Blank column "6" excluded.
    expect(alice.pages).toEqual([0, 1, 3, 4, 2]);
  });

  it("maps every player row and skips rows without a name", () => {
    const csv: Csv = [
      HEADER,
      ["Alice", "TRUE", "", "", ""],
      ["", "TRUE", "TRUE", "TRUE", "TRUE"], // no name -> skipped
      ["Bob", "", "TRUE", "FALSE", "TRUE"],
    ];

    const packs = computePlayerPacks(csv, 6);

    expect(packs.map((p) => p.name)).toEqual(["Alice", "Bob"]);
    expect(packs[0].pages).toEqual([0, 1]); // "1,2"
    // Bob: TRUE on "3" and "6" (-> 2, 5), then FALSE on "4,5" appended (-> 3,4)
    expect(packs[1].pages).toEqual([2, 5, 3, 4]);
  });

  it("drops page numbers outside the PDF's page range", () => {
    const csv: Csv = [HEADER, ["Alice", "TRUE", "TRUE", "TRUE", "TRUE"]];

    // Only 3 pages exist, so page 4,5,6 (indexes 3,4,5) are dropped.
    const [alice] = computePlayerPacks(csv, 3);

    expect(alice.pages).toEqual([0, 1, 2]);
  });

  it("ignores non-numeric header cells", () => {
    const csv: Csv = [
      ["", "1", "oops", "3"],
      ["Alice", "TRUE", "TRUE", "TRUE"],
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
});
