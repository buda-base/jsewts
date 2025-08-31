'use strict';

/**
 * ACIP ⇄ EWTS conversion utilities (standalone)
 * Exposes: ACIPtoEWTS, EWTStoACIPContent
 *
 * Ported carefully from the original Python reference.
 */

/* ---------- helpers ---------- */

function swapCase(str) {
  return str.replace(/[A-Za-z]/g, c =>
    c === c.toLowerCase() ? c.toUpperCase() : c.toLowerCase()
  );
}

function normalizeSpaces(s) {
  // in ACIP transliteration, space can mean tsheg or space, we make a guess
  s = s.replace(
    /([aeiouIAEU]g|[gk][aeiouAEIU]|[;!/|]) +([;!/|])/g,
    (_, g1, g2) => `${g1}_${g2}`
  );
  s = s.replace(/([;!/|HX]) +/g, (_, g1) => `${g1}_`);
  return s;
}

/* ---------- Sanskrit / stack handling ---------- */

// Mirrors Python's STD_TIB_PATTERN (with fullmatch)
const STD_TIB_PATTERN = new RegExp(
  "^(" +
    "([bcdgjklm'npstzhSDTN]|" +
    "bgl|dm|sm|sn|kl|dk|bk|bkl|rk|lk|sk|brk|bsk|kh|mkh|'kh|gl|dg|bg|mg|'g|rg|lg|sg|brg|bsg|ng|dng|mng|rng|lng|sng|brng|bsng|gc|bc|lc|ch|mch|'ch|mj|'j|rj|lj|brj|ny|gny|mny|rny|sny|brny|bsny|gt|bt|rt|lt|st|brt|blt|bst|th|mth|'th|gd|bd|md|'d|rd|ld|sd|brd|bld|bsd|gn|mn|rn|brn|bsn|dp|lp|sp|ph|'ph|bl|db|'b|rb|lb|sb|rm|ts|gts|bts|rts|sts|brts|bsts|tsh|mtsh|'tsh|dz|mdz|'dz|rdz|brdz|zh|gzh|bzh|zl|gz|bz|bzl|rl|brl|sh|gsh|bsh|sl|gs|bs|bsl|lh)" +
    ")" +
    "[rwy]*$"
);

const STD_TIB_STACKS_PREFIX = [
  'bg','dm','dk','bk','brk','bsk','mkh',"'kh",'dg','bg','mg',"'g",'brg','bsg',
  'dng','mng','brng','bsng','gc','bc','ch','mch',"'ch",'mj',"'j",'brj','gny',
  'mny','brny','bsny','gt','bt','brt','blt','bst','mth',"'th",'gd','bd','md',
  "'d",'brd','bld','bsd','gn','mn','brn','bsn','dp','ph',"'ph",'bl','db',"'b",
  'gts','bts','brts','bsts','tsh','mtsh',"'tsh",'mdz',"'dz",'brdz','gzh','bzh',
  'gz','bz','bzl','brl','gsh','bsh','gs','bs','bsl'
];

function tokenizeConsonnants(s) {
  const multi = ['tsh', 'zh', 'ny', 'dz', 'ts', 'ch', 'ph', 'th', 'sh', 'Sh', 'kh', 'ng']
    .sort((a, b) => b.length - a.length);
  const singles = "NDTRYWbcdghjklmnprstwyz'";

  const result = [];
  let i = 0;
  while (i < s.length) {
    let matched = false;
    for (const tok of multi) {
      if (s.startsWith(tok, i)) {
        result.push(tok);
        i += tok.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      if (singles.includes(s[i])) {
        result.push(s[i]);
      }
      i += 1;
    }
  }
  return result;
}

const STD_TIB_STACKS_PREFIX_TOKENS = STD_TIB_STACKS_PREFIX.map(tokenizeConsonnants);

function startsWithAnyPrefix2(tokens) {
  if (tokens.length < 2) return false;
  const firstTwo = tokens.slice(0, 2).join('|'); // stable compare
  for (const pref of STD_TIB_STACKS_PREFIX_TOKENS) {
    if (pref.length >= 2 && firstTwo === pref.slice(0, 2).join('|')) return true;
  }
  return false;
}

const CONSONNANTS_PATTERN = /([bcdgjklm'nprstvyzhSDTN]+)([aeiouAEIOU.-])/g;

function addPlusToConsonnants(c) {
  if (STD_TIB_PATTERN.test(c)) return c;

  const tokens = tokenizeConsonnants(c);
  if (tokens.length <= 1) return c;

  if (startsWithAnyPrefix2(tokens)) {
    return tokens[0] + '+' + tokens.slice(1).join('+');
  }
  return tokens.join('+');
}

function addPlus(src) {
  return src.replace(CONSONNANTS_PATTERN, (_, c, tail) => addPlusToConsonnants(c) + tail);
}

/* ---------- main API ---------- */

function ACIPtoEWTS(input) {
  let s = String(input);

  // comments
  s = s.replace(/\[[^\]]*\]/g, '');
  s = s.replace(/@[^ ]* */g, '');

  // remove parentheses
  s = s.replace(/[()]/g, '');

  // /.../  =>  (...)
  s = s.replace(/\/([^/]*)\//g, '($1)');
  s = s.replace(/\//g, ''); // leftover /

  // simple substitutions
  s = s.replace(/;/g, '|');
  s = s.replace(/#/g, '@##');
  s = s.replace(/\*+/g, m => '@' + '#'.repeat(m.length));
  s = s.replace(/\\/g, '?');

  // case-dependent transformations (to be swapcased later)
  s = s.replace(/\^/g, '\\U0F38'); // sometimes encoded as 7
  s = s.replace(/,/g, '/');
  s = s.replace(/`/g, '!');
  s = s.replace(/V/g, 'W');
  s = s.replace(/TS/g, 'TSH');
  s = s.replace(/TZ/g, 'TS');

  // - => .
  s = s.replace(/([BCDGHJKLMN'PRSTWYZhdtn])A-/g, '$1.');
  s = s.replace(/-/g, '.');

  // i-cases
  s = s.replace(/A?i/g, '-I');
  s = s.replace(/A?'-I/g, '-i');

  // o / %
  s = s.replace(/o/g, 'x');
  s = s.replace(/%/g, '~x');

  // non-vowel + ' + vowel (except i) => lower-case vowel
  s = s.replace(/([BCDGHJKLMNPRSTWYZ'hdtn])'([AEOUI])/g, (_, g1, g2) => g1 + g2.toLowerCase());
  // correction when A is the main letter
  s = s.replace(/(^|[^BCDGHJKLMNPR'STWYZhdtn])A'([AEOUI])/g, (_, g1, g2) => g1 + g2.toLowerCase());

  // A + vowel => vowel
  s = s.replace(/A([AEIOUaeiou])/g, '$1');

  // sh => sH
  s = s.replace(/sh/g, 'sH');

  // normalize apostrophes
  s = s.replace(/[’ʼʹ‘ʾ]/g, "'");

  // inverse case
  s = swapCase(s);

  // ee => ai ; oo => au
  s = s.replace(/ee/g, 'ai');
  s = s.replace(/oo/g, 'au');

  // : => H
  s = s.replace(/:/g, 'H');

  // add pluses for Sanskrit stacks etc.
  s = addPlus(s);

  // space heuristic
  s = normalizeSpaces(s);

  return s;
}

function EWTStoACIPContent(input) {
  let s = String(input);

  // normalize apostrophes
  s = s.replace(/[’ʼʹ‘ʾ]/g, "'");

  // (...) => /.../
  s = s.replace(/\(([^/]*)\)/g, '/$1/');

  // simple substitutions
  s = s.replace(/\|/g, ';');
  // remove * not after [
  s = s.replace(/(^|\[)\*/g, (_, g1) => g1);
  s = s.replace(/@##/g, 'ZZ');
  s = s.replace(/@#/g, '*');
  s = s.replace("_", " ") // no space in ACIP
  // remove # not after [
  s = s.replace(/(^|\[)#/g, (_, g1) => g1);
  s = s.replace(/ZZ/g, '#');
  s = s.replace(/\?/g, '\\');

  // case-related transforms
  s = s.replace(/\\u0f38/gi, '^');
  s = s.replace(/\//g, ',');
  s = s.replace(/!/g, '`');
  s = s.replace(/w/g, 'v');
  s = s.replace(/tsh/g, 'ZZZ');
  s = s.replace(/ts/g, 'tz');
  s = s.replace(/ZZZ/g, 'ts');

  // % / H
  s = s.replace(/~X/g, '%');
  s = s.replace(/H/g, ':');

  // inverse case
  s = swapCase(s);

  // i-cases swapped at this point
  s = s.replace(/-I/g, 'w'); // -> i (later)
  s = s.replace(/-i/g, 'q'); // -> 'i (later)

  // . => -
  s = s.replace(/\./g, '-');

  // ai/au after swapcase became AI/AU
  s = s.replace(/AI/g, 'EE');
  s = s.replace(/AU/g, 'OO');

  // add A for ཨ
  s = s.replace(
    /(^|[^BCDGHJKLMNPR'STVYZhdtnEO])([AEOUIqaewiou])/g,
    (_, g1, g2) => g1 + 'A' + g2
  );

  // vowels / markers
  s = s.replace(/a/g, "'A");
  s = s.replace(/u/g, "'U");
  s = s.replace(/o/g, "'O");
  s = s.replace(/e/g, "'E");
  s = s.replace(/i/g, "'I");
  s = s.replace(/q/g, "'i");
  s = s.replace(/w/g, 'i');

  // X => o ; Sh => sh
  s = s.replace(/x/g, 'o');
  s = s.replace(/sH/g, 'sh');

  return s;
}

/* ---------- exports ---------- */

const api = { ACIPtoEWTS, EWTStoACIPContent };
try {
  // ESM
  // (If used as ESM, these lines will be tree-shaken appropriately)
  // eslint-disable-next-line no-undef
  if (typeof exports !== 'undefined') {
    // CommonJS (Jest-friendly)
    // eslint-disable-next-line no-undef
    module.exports = api;
  }
  // Also attach named exports in ESM bundlers if needed
  // (Bundlers will ignore when not applicable)
} catch (_) {}

export { ACIPtoEWTS, EWTStoACIPContent };
export default api;
