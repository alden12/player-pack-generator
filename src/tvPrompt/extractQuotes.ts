/**
 * Extract `<...>`-bracketed quotes from text, in order of appearance.
 *
 * Returns the trimmed inner text of each `<...>` pair, dropping any that are
 * empty after trimming. Nested brackets are not supported (documented
 * limitation): the pattern matches the shortest run containing no `<` or `>`,
 * so `<outer <inner> outer>` yields only `inner`.
 */
export const extractQuotes = (text: string): string[] =>
  Array.from(text.matchAll(/<([^<>]*)>/g), (match) => match[1].trim()).filter(
    Boolean
  );
