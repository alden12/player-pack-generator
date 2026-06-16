import { extractQuotes } from "./extractQuotes";

describe("extractQuotes", () => {
  it("extracts each <...> quote in order", () => {
    expect(extractQuotes("intro <first quote> middle <second quote> end")).toEqual([
      "first quote",
      "second quote",
    ]);
  });

  it("trims surrounding whitespace inside the brackets", () => {
    expect(extractQuotes("<  padded quote  >")).toEqual(["padded quote"]);
  });

  it("drops brackets that are empty or whitespace-only", () => {
    expect(extractQuotes("<> <   > <kept>")).toEqual(["kept"]);
  });

  it("returns an empty array when there are no brackets", () => {
    expect(extractQuotes("no brackets here")).toEqual([]);
  });

  it("ignores unterminated brackets", () => {
    expect(extractQuotes("text < not closed and <closed>")).toEqual(["closed"]);
  });

  it("matches only the inner pair for nested brackets (documented limitation)", () => {
    expect(extractQuotes("<outer <inner> outer>")).toEqual(["inner"]);
  });
});
