// tib_unicode.js

// ported from https://github.com/OpenPecha/Botok/blob/master/botok/utils/unicode_normalization.py

// Category enum equivalent
const Cats = {
  Other: 0,
  Base: 1,
  Subscript: 2,
  BottomVowel: 3,
  BottomMark: 4,
  TopVowel: 5,
  TopMark: 6,
  RightMark: 7,
};

// Build categories table for U+0F00..U+0FBC (inclusive)
const CATEGORIES = [].concat(
  [Cats.Other],                      // 0F00
  [Cats.Base],                       // 0F01 (often followed by 0F83)
  Array(22).fill(Cats.Other),        // 0F02–0F17
  Array(2).fill(Cats.BottomVowel),   // 0F18–0F19
  Array(6).fill(Cats.Other),         // 0F1A–0F1F
  Array(20).fill(Cats.Base),         // 0F20–0F33 (digits; special followers possible)
  [Cats.Other],                      // 0F34
  [Cats.BottomMark],                 // 0F35
  [Cats.Other],                      // 0F36
  [Cats.BottomMark],                 // 0F37
  [Cats.Other],                      // 0F38
  [Cats.Subscript],                  // 0F39 (cheat but works)
  Array(4).fill(Cats.Other),         // 0F3A–0F3D
  [Cats.RightMark],                  // 0F3E
  [Cats.Other],                      // 0F3F (not quite sure)
  Array(45).fill(Cats.Base),         // 0F40–0F6C
  Array(4).fill(Cats.Other),         // 0F6D–0F70
  [Cats.BottomVowel],                // 0F71
  [Cats.TopVowel],                   // 0F72
  [Cats.TopVowel],                   // 0F73
  Array(2).fill(Cats.BottomVowel),   // 0F74–0F75
  Array(8).fill(Cats.TopVowel),      // 0F76–0F7D
  [Cats.TopMark],                    // 0F7E
  [Cats.RightMark],                  // 0F7F
  Array(2).fill(Cats.TopVowel),      // 0F80–0F81
  Array(2).fill(Cats.TopMark),       // 0F82–0F83
  [Cats.BottomMark],                 // 0F84
  [Cats.Other],                      // 0F85
  Array(2).fill(Cats.TopMark),       // 0F86–0F87
  Array(2).fill(Cats.Base),          // 0F88–0F89
  [Cats.Base],                       // 0F8A (always followed by 0F82 per spec)
  [Cats.Other],                      // 0F8B
  [Cats.Base],                       // 0F8C
  Array(48).fill(Cats.Subscript)     // 0F8D–0FBC
);

function charcat(ch) {
  const o = ch.codePointAt(0);
  if (o >= 0x0F00 && o <= 0x0FBC) return CATEGORIES[o - 0x0F00];
  return Cats.Other;
}

function unicodeReorder(txt) {
  // Inspired by SIL Khmer/Tibetan notes: reorders components within a syllable
  const charcats = Array.from(txt, charcat);
  let i = 0;
  const out = [];
  let valid = true;

  while (i < charcats.length) {
    const c = charcats[i];
    if (c !== Cats.Base) {
      if (c > Cats.Base) valid = false;
      out.push(txt[i]);
      i += 1;
      continue;
    }
    // Find syllable end: base followed by > Base categories
    let j = i + 1;
    while (j < charcats.length && charcats[j] > Cats.Base) j += 1;

    // Sort indices in [i, j) by (category, original position)
    const newIndices = [];
    for (let k = i; k < j; k += 1) newIndices.push(k);
    newIndices.sort((a, b) => {
      const da = charcats[a] - charcats[b];
      return da !== 0 ? da : a - b;
    });

    out.push(newIndices.map(idx => txt[idx]).join(""));
    i = j;
  }

  return { str: out.join(""), valid };
}

function isVowel(ch) {
  return /[\u0F71-\u0F84]/.test(ch);
}

function isSuffix(ch) {
  return /[\u0F90-\u0FBC]/.test(ch);
}

function normalizeInvalidStartString(s) {
  if (s.length < 2) return s;

  if (isVowel(s[0]) && !isVowel(s[1]) && !isSuffix(s[1])) {
    // Move leading vowel to second position if next isn't vowel/suffix
    return s[1] + s[0] + (s.length > 2 ? s.slice(2) : "");
  }
  if (isSuffix(s[0])) {
    // Drop leading subjoined
    return s.slice(1);
  }
  return s;
}

function normalizeUnicode(input, form = "nfd") {
  // Mirrors normalize_unicode in Python
  // References:
  // - https://unicode.org/reports/tr15/
  // - https://unicode.org/charts/normalization/chart_Tibetan.html

  let s = String(input);

  // Deprecated/discouraged sequences
  s = s.replaceAll("\u0F73", "\u0F71\u0F72");      // discouraged
  s = s.replaceAll("\u0F75", "\u0F71\u0F74");      // discouraged
  s = s.replaceAll("\u0F77", "\u0FB2\u0F71\u0F80"); // deprecated
  s = s.replaceAll("\u0F79", "\u0FB3\u0F71\u0F80"); // deprecated
  s = s.replaceAll("\u0F81", "\u0F71\u0F80");       // discouraged

  if (form.toLowerCase() === "nfd") {
    s = s.replaceAll("\u0F43", "\u0F42\u0FB7");
    s = s.replaceAll("\u0F4D", "\u0F4C\u0FB7");
    s = s.replaceAll("\u0F52", "\u0F51\u0FB7");
    s = s.replaceAll("\u0F57", "\u0F56\u0FB7");
    s = s.replaceAll("\u0F5C", "\u0F5B\u0FB7");
    s = s.replaceAll("\u0F69", "\u0F40\u0FB5");
    s = s.replaceAll("\u0F76", "\u0FB2\u0F80");
    s = s.replaceAll("\u0F78", "\u0FB3\u0F80");
    s = s.replaceAll("\u0F93", "\u0F92\u0FB7");
    s = s.replaceAll("\u0F9D", "\u0F9C\u0FB7");
    s = s.replaceAll("\u0FA2", "\u0FA1\u0FB7");
    s = s.replaceAll("\u0FA7", "\u0FA6\u0FB7");
    s = s.replaceAll("\u0FAC", "\u0FAB\u0FB7");
    s = s.replaceAll("\u0FB9", "\u0F90\u0FB5");
  } else {
    s = s.replaceAll("\u0F42\u0FB7", "\u0F43");
    s = s.replaceAll("\u0F4C\u0FB7", "\u0F4D");
    s = s.replaceAll("\u0F51\u0FB7", "\u0F52");
    s = s.replaceAll("\u0F56\u0FB7", "\u0F57");
    s = s.replaceAll("\u0F5B\u0FB7", "\u0F5C");
    s = s.replaceAll("\u0F40\u0FB5", "\u0F69");
    s = s.replaceAll("\u0FB2\u0F80", "\u0F76");
    s = s.replaceAll("\u0FB3\u0F80", "\u0F78");
    s = s.replaceAll("\u0F92\u0FB7", "\u0F93");
    s = s.replaceAll("\u0F9C\u0FB7", "\u0F9D");
    s = s.replaceAll("\u0FA1\u0FB7", "\u0FA2");
    s = s.replaceAll("\u0FA6\u0FB7", "\u0FA7");
    s = s.replaceAll("\u0FAB\u0FB7", "\u0FAC");
    s = s.replaceAll("\u0F90\u0FB5", "\u0FB9");
  }

  // 0F00 isn't marked as composed in Unicode; expand to its parts
  s = s.replaceAll("\u0F00", "\u0F68\u0F7C\u0F7E");

  // Reorder within syllables
  const { str: reord, valid } = unicodeReorder(s);
  s = reord;

  // ra (0F65) to 0F62 when not followed by most subjoined forms
  s = s.replace(/\u0F65([^\u0F90-\u0F97\u0F9A-\u0FAC\u0FAE\u0FAF\u0FB4-\u0FBC])/g, "ར$1");

  // Fix invalid starts
  s = normalizeInvalidStartString(s);

  // We return only the normalized string, mirroring usage in the tests.
  // If you want the 'valid' flag as well, expose another API.
  return s;
}

const api = { unicodeReorder, normalizeUnicode, normalizeInvalidStartString };

try {
  // CommonJS (Jest-friendly)
  // eslint-disable-next-line no-undef
  module.exports = api;
} catch (_) {
  /* noop */
}

export { unicodeReorder, normalizeUnicode, normalizeInvalidStartString };
export default api;
