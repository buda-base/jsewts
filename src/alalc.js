'use strict';

/**
 * ALA-LC / DTS ⇄ EWTS conversion helpers
 * Ported from https://github.com/buda-base/ewts-converter/blob/master/src/main/java/io/bdrc/ewtsconverter/TransConverter.java (BDRC).
 *
 * Exposes:
 *   - dtsToEwts(str)
 *   - alalcToEwts(str)
 *   - ewtsToAlalc(str, sloppy=false)
 *
 * Note on `sloppy`:
 * If `sloppy` is true, we try to call EwtsConverter.normalizeSloppyWylie
 * if it’s available (as global or require('./ewts')), otherwise we proceed unchanged.
 */

/* ---------------- utilities ---------------- */

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildReplacer(mapObj) {
  // One-pass global replacement that prefers longer keys first.
  const entries = Array.from(mapObj.entries()).sort((a, b) => b[0].length - a[0].length);
  const pattern = entries.map(([k]) => escapeRegExp(k)).join('|');
  const re = pattern ? new RegExp(pattern, 'gu') : null;
  const dict = new Map(entries); // exact-match map
  return (s) => (re ? s.replace(re, (m) => dict.get(m)) : s);
}

/* ---------------- constants (match Java) ---------------- */

const DTS = 0;
const ALALC = 1;
const BOTH = 2;

const NFD = 0;
const NFC = 1;
const ALWAYS_ALALC = 2;
const NEVER_ALALC = 3;

/* ---------------- mappings (ported 1:1) ---------------- */

const replMapAlalcToEwts = new Map();
const replMapDtsToEwts = new Map();
const replMapEwtsToAlalc = new Map();

function addMapping(target, ewts, targetType, toAlalc) {
  if (targetType === DTS || targetType === BOTH) {
    replMapDtsToEwts.set(target, ewts);
  }
  if (targetType === ALALC || targetType === BOTH) {
    replMapAlalcToEwts.set(target, ewts);
  }
  if (toAlalc === ALWAYS_ALALC || toAlalc === NFC) {
    replMapEwtsToAlalc.set(ewts, target);
  }
}

(function init() {
  // Hyphen → space both for DTS and ALA-LC
  replMapDtsToEwts.set('-', ' ');
  replMapAlalcToEwts.set('-', ' ');

  addMapping('ś', 'sh', BOTH, NEVER_ALALC);
  addMapping('s\u0301', 'sh', BOTH, NEVER_ALALC);
  addMapping('ṣ', 'Sh', BOTH, NEVER_ALALC);
  addMapping('s\u0323', 'Sh', BOTH, NEVER_ALALC);
  addMapping('ź', 'zh', BOTH, NEVER_ALALC);
  addMapping('z\u0301', 'zh', BOTH, NEVER_ALALC);
  addMapping('ñ', 'ny', BOTH, NEVER_ALALC);
  addMapping('n\u0303', 'ny', BOTH, NEVER_ALALC);
  addMapping('ṅ', 'ng', BOTH, NEVER_ALALC);
  addMapping('n\u0307', 'ng', BOTH, NEVER_ALALC);
  addMapping('ā', 'A', BOTH, NFC);
  addMapping('a\u0304', 'A', BOTH, NFD);
  addMapping('ī', 'I', BOTH, NFC);
  addMapping('i\u0304', 'I', BOTH, NFD);
  addMapping('ū', 'U', BOTH, NFC);
  addMapping('u\u0304', 'U', BOTH, NFD);
  addMapping('ṃ', 'M', BOTH, NFC);
  addMapping('m\u0323', 'M', BOTH, NFD);
  addMapping('ṁ', '~M', BOTH, NEVER_ALALC);
  addMapping('m\u0307', '~M', BOTH, NEVER_ALALC);
  addMapping('m\u0310', '~M', BOTH, ALWAYS_ALALC); // candrabindu (ALALC)
  addMapping('m\u0901', '~M', BOTH, NEVER_ALALC);
  addMapping('m\u0301', '~M`', BOTH, NEVER_ALALC); // DTS
  addMapping('ṛ', 'r-i', BOTH, NFC); // DTS
  addMapping('r\u0323', 'r-i', BOTH, NEVER_ALALC);
  addMapping('r\u0325', 'r-i', BOTH, NFD); // ALALC
  addMapping('ṝ', 'r-I', BOTH, NFC); // DTS
  addMapping('ṛ\u0304', 'r-I', BOTH, NEVER_ALALC);
  addMapping('r\u0323\u0304', 'r-I', BOTH, NEVER_ALALC);
  addMapping('r\u0304\u0323', 'r-I', BOTH, NEVER_ALALC);
  addMapping('r\u0325\u0304', 'r-I', BOTH, NFD); // ALALC
  addMapping('r\u0304\u0325', 'r-I', BOTH, NEVER_ALALC);
  addMapping('ḷ', 'l-i', BOTH, NFC); // DTS
  addMapping('l\u0323', 'l-i', BOTH, NEVER_ALALC); // typo guard (kept as NEVER_ALALC)
})();

/* Oops: fix small typo introduced above */
replMapAlalcToEwts.set('l\u0323', 'l-i');
/* Continue mapping block (rest of Java init) */
(function continueInit() {
  addMapping('l\u0325', 'l-i', BOTH, NFD); // ALALC
  addMapping('ḹ', 'l-i', BOTH, NFC); // DTS
  addMapping('ḷ\u0304', 'l-i', BOTH, NEVER_ALALC);
  addMapping('l\u0323\u0304', 'l-i', BOTH, NEVER_ALALC);
  addMapping('l\u0304\u0323', 'l-i', BOTH, NEVER_ALALC);
  addMapping('l\u0325\u0304', 'l-i', BOTH, NFC); // ALALC
  addMapping('l\u0304\u0325', 'l-i', BOTH, NEVER_ALALC);
  addMapping('ṭ', 'T', BOTH, NFC);
  addMapping('t\u0323', 'T', BOTH, NFD);
  addMapping('ḍ', 'D', BOTH, NFC);
  addMapping('d\u0323', 'D', BOTH, NFD);
  addMapping('ṇ', 'N', BOTH, NFC);
  addMapping('n\u0323', 'N', BOTH, NFD);
  addMapping('`', '&', BOTH, ALWAYS_ALALC); // ALALC ampersand usage
  addMapping('gʹy', 'g.y', BOTH, ALWAYS_ALALC); // \u02B9

  addMapping('ʹ', '+', BOTH, NEVER_ALALC); // prime to '+'
  addMapping('’', "'", BOTH, NEVER_ALALC);
  addMapping('‘', "'", BOTH, NEVER_ALALC);
  addMapping('ʼ', "'", BOTH, ALWAYS_ALALC); // \u02BC
  addMapping('ʾ', "'", BOTH, NEVER_ALALC); // \u02BE

  // Only contradiction between DTS and ALA-LC: ḥ
  addMapping('ḥ', 'H', ALALC, NFC);   // ALALC
  addMapping('h\u0323', 'H', ALALC, NFD);
  addMapping('ḥ', "'", DTS, NEVER_ALALC);   // DTS
  addMapping('h\u0323', "'", DTS, NEVER_ALALC);

  // Extras sometimes seen in DTS:
  replMapDtsToEwts.set('š', 'sh');
  replMapDtsToEwts.set('s\u030C', 'sh');
  replMapDtsToEwts.set('ž', 'zh');
  replMapDtsToEwts.set('z\u030C', 'zh');

  // EWTS → ALA-LC (punctuation & sequences)
  replMapEwtsToAlalc.set('<<', '"');
  replMapEwtsToAlalc.set('>>', '"');
  // '.' handled later only when between letters
  replMapEwtsToAlalc.set('_', ' ');
  replMapEwtsToAlalc.set('n+y', 'n\u02B9y'); // nʹy
  replMapEwtsToAlalc.set('t+s', 't\u02B9s');
  replMapEwtsToAlalc.set('s+h', 's\u02B9h');
  replMapEwtsToAlalc.set('n+g', 'n\u02B9g');
})();

/* Build replacers */
const replaceDtsToEwts = buildReplacer(replMapDtsToEwts);
const replaceAlalcToEwts = buildReplacer(replMapAlalcToEwts);
const replaceEwtsToAlalc = buildReplacer(replMapEwtsToAlalc);

/* Attempt to discover a sloppy normalizer if present */
let externalNormalizeSloppyWylie = null;
try {
  // eslint-disable-next-line global-require, import/no-unresolved
  const maybe = require('./ewts');
  if (maybe && typeof maybe.normalizeSloppyWylie === 'function') {
    externalNormalizeSloppyWylie = maybe.normalizeSloppyWylie;
  }
} catch (_) {
  // ignore (ESM/browser)
}
if (!externalNormalizeSloppyWylie && typeof globalThis !== 'undefined') {
  const g = globalThis;
  if (g.EwtsConverter && typeof g.EwtsConverter.normalizeSloppyWylie === 'function') {
    externalNormalizeSloppyWylie = g.EwtsConverter.normalizeSloppyWylie;
  }
}

/* ---------------- public API ---------------- */

function dtsToEwts(dtsString) {
  const s = String(dtsString).toLowerCase();
  return replaceDtsToEwts(s);
}

function alalcToEwts(alalcStr) {
  const s = String(alalcStr).toLowerCase();
  return replaceAlalcToEwts(s);
}

function ewtsToAlalc(ewtsStr, sloppy = false) {
  let s = String(ewtsStr);
  if (sloppy && typeof externalNormalizeSloppyWylie === 'function') {
    s = externalNormalizeSloppyWylie(s);
  }
  // direct replacements first
  s = replaceEwtsToAlalc(s);

  // Drop any character outside the allowed set (match Java)
  s = s.replace(/[^a-zA-Z0-9 "ʹʼ`\u0325\u0304\u0303\u0323\u0307\u0301\u0310()\-āṭḍṇḹḷṝṛṃūī]/gu, '');

  // Dot between letters → modifier letter prime (ʹ)
  s = s.replace(/([A-Za-z])\.([A-Za-z])/g, '$1\u02B9$2');

  // Normalize spacing and case
  s = s.replace(/\s+/g, ' ').trim().toLowerCase();
  return s;
}

/* ---------------- exports (CJS + ESM) ---------------- */

const api = { dtsToEwts, alalcToEwts, ewtsToAlalc };

try {
  // CommonJS (Jest-friendly)
  // eslint-disable-next-line no-undef
  module.exports = api;
} catch (_) {
  /* noop */
}

export { dtsToEwts, alalcToEwts, ewtsToAlalc };
export default api;
