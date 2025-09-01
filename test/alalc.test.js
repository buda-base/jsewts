/* eslint-env jest */
const { dtsToEwts, alalcToEwts, ewtsToAlalc } = require('../src/alalc');

describe('textEwtsToDtsAlalc (Java parity)', () => {
  test('ewtsToAlalc (sloppy=false): Ri gi A ra sha → ri gi ā ra sha', () => {
    expect(ewtsToAlalc('Ri gi A ra sha', false)).toBe('ri gi ā ra sha');
  });

  test('ewtsToAlalc (sloppy=true): <<n+yA~M → "nʹyām̐', () => {
    expect(ewtsToAlalc('<<n+yA~M', true)).toBe('"nʹyām̐');
  });

  test('ewtsToAlalc (sloppy=true): ba_cang / → ba cang', () => {
    expect(ewtsToAlalc('ba_cang /', true)).toBe('ba cang');
  });

  test('ewtsToAlalc (sloppy=true): kl-i → kl̥̄', () => {
    expect(ewtsToAlalc('kl-i', true)).toBe('kl̥̄');
  });

  test('ewtsToAlalc (sloppy=true): tshi shi → tshi shi', () => {
    expect(ewtsToAlalc('tshi shi', true)).toBe('tshi shi');
  });

  test('ewtsToAlalc (sloppy=true): g.yag → gʹyag', () => {
    expect(ewtsToAlalc('g.yag', true)).toBe('gʹyag');
  });

  test('ewtsToAlalc (sloppy=true): ga& → ga`', () => {
    expect(ewtsToAlalc('ga&', true)).toBe('ga`');
  });

  test('ewtsToAlalc (sloppy=true): dwa → dwa', () => {
    expect(ewtsToAlalc('dwa', true)).toBe('dwa');
  });

  test('ewtsToAlalc (sloppy=true): bka\' \'gyur → bkaʼ ʼgyur', () => {
    expect(ewtsToAlalc("bka' 'gyur", true)).toBe('bkaʼ ʼgyur');
  });

  test('ewtsToAlalc (sloppy=true): par gzhi 1., par thengs 2. → par gzhi 1 par thengs 2', () => {
    expect(ewtsToAlalc('par gzhi 1., par thengs 2.', true)).toBe('par gzhi 1 par thengs 2');
  });

  test('dtsToEwts: ša śa → sha sha', () => {
    expect(dtsToEwts('ša śa')).toBe('sha sha');
  });

  test('alalcToEwts: ā → A', () => {
    expect(alalcToEwts('ā')).toBe('A');
  });
});
