import { fitFontSize } from "./fitFontSize";

// Deterministic measurer: every character is half the font size wide. This
// lets the tests reason about wrapping and sizing exactly.
const measureWidth = (text: string, fontSize: number) =>
  text.length * fontSize * 0.5;

const base = {
  maxFontSize: 200,
  minFontSize: 10,
  lineHeightFactor: 1.2,
  measureWidth,
};

describe("fitFontSize", () => {
  it("uses the max size when the text easily fits on one line", () => {
    const { fontSize, lines } = fitFontSize({
      ...base,
      text: "Hi",
      boxWidth: 1000,
      boxHeight: 1000,
    });

    expect(fontSize).toBe(200);
    expect(lines).toEqual(["Hi"]);
  });

  it("shrinks to the largest size whose wrapped text fits the box height", () => {
    // "aaa bbb ccc ddd" is 15 chars; at 0.5x width it needs 7.5 * size <= 1000
    // to stay on one line (size <= 133), and one line is 1.2 * size <= 200 tall
    // (size <= 166). The binding constraint is width, so 133 with a single line.
    const { fontSize, lines } = fitFontSize({
      ...base,
      text: "aaa bbb ccc ddd",
      boxWidth: 1000,
      boxHeight: 200,
    });

    expect(fontSize).toBe(133);
    expect(lines).toEqual(["aaa bbb ccc ddd"]);
  });

  it("wraps onto multiple lines when the box is narrow", () => {
    const { lines } = fitFontSize({
      ...base,
      text: "aaa bbb ccc",
      boxWidth: 200,
      boxHeight: 1000,
      maxFontSize: 100,
    });

    // At size 100 each word is 150 wide and any pair exceeds 200, so one per line.
    expect(lines).toEqual(["aaa", "bbb", "ccc"]);
  });

  it("falls back to the min size (still wrapping) when nothing fits", () => {
    const { fontSize, lines } = fitFontSize({
      ...base,
      text: "aaaaa",
      boxWidth: 10,
      boxHeight: 10,
    });

    expect(fontSize).toBe(10);
    expect(lines).toEqual(["aaaaa"]);
  });

  it("keeps a single over-wide word on its own line (words are never split)", () => {
    const { lines } = fitFontSize({
      ...base,
      text: "superlongword",
      boxWidth: 10,
      boxHeight: 1000,
    });

    expect(lines).toEqual(["superlongword"]);
  });
});
