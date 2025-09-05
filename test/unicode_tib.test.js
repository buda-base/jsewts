// tib_unicode.test.js
const {
  normalizeUnicode,
} = require("../src/unicode_tib");

// Port of the original Python asserts
function assertConv(orig, expected) {
  const resultStr = normalizeUnicode(orig);
  if (resultStr !== expected) {
    throw new Error(
      `${debug(orig)} -> ${debug(resultStr)} but ${debug(expected)} expected`
    );
  }
}

function debug(s) {
  return Array.from(s, ch => `\\u${ch.codePointAt(0).toString(16)}`).join(" ");
}

describe("Tibetan Unicode normalization", () => {
  test("leading top vowel moves after base", () => {
    // \u0F7B\u0F56  -> \u0F56\u0F7B
    assertConv("\u0F7B\u0F56", "\u0F56\u0F7B");
  });

  test("deprecated sequences expanded", () => {
    // \u0f40\u0f77 -> \u0f40\u0fb2\u0f71\u0f80
    assertConv("\u0f40\u0f77", "\u0f40\u0fb2\u0f71\u0f80");
  });

  test("reordering with signs", () => {
    // \u0f40\u0f7e\u0f7c\u0f74\u0f71 -> \u0f40\u0f74\u0f71\u0f7c\u0f7e
    assertConv("\u0f40\u0f7e\u0f7c\u0f74\u0f71", "\u0f40\u0f74\u0f71\u0f7c\u0f7e");
  });

  test("ordering around \u0fb0 and \u0f83", () => {
    // \u0f58\u0f74\u0fb0\u0f83 -> \u0f58\u0fb0\u0f74\u0f83
    assertConv("\u0f58\u0f74\u0fb0\u0f83", "\u0f58\u0fb0\u0f74\u0f83");
  });

  test("ordering with U+0FB7 and U+0FB0", () => {
    // \u0F51\u0FB7\u0F74\u0FB0 -> \u0F51\u0FB7\u0fb0\u0F74
    assertConv("\u0F51\u0FB7\u0F74\u0FB0", "\u0F51\u0FB7\u0fb0\u0F74");
  });

  test("right-mark vs vowel ordering", () => {
    // \u0F66\u0F7C\u0FB1 -> \u0F66\u0FB1\u0F7C
    assertConv("\u0F66\u0F7C\u0FB1", "\u0F66\u0FB1\u0F7C");
  });

  test("unchanged forbidden combo stays (but validity differs in Python)", () => {
    // \u0F0B\u0F7E -> \u0F0B\u0F7E
    assertConv("\u0F0B\u0F7E", "\u0F0B\u0F7E");
  });

  test("0F65 rule becomes 0F62 in front of disallowed followers", () => {
    // \u0f65\u0f99\u0f7a\u0f7a -> \u0f62\u0f99\u0f7a\u0f7a
    assertConv("\u0f65\u0f99\u0f7a\u0f7a", "\u0f62\u0f99\u0f7a\u0f7a");
  });

  test("valid sequence with 0F01 followed by 0F83 stays", () => {
    // \u0f01\u0f83 -> itself
    assertConv("\u0f01\u0f83", "\u0f01\u0f83");
  });
});
