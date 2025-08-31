/* eslint-env jest */
const { ACIPtoEWTS, EWTStoACIPContent } = require('../src/acip');

describe('ACIPtoEWTS', () => {
  const cases = [
    ["KA(BA)CA()BA[ABC]BA@001A BA", "kabacabababa"],
    ["KA/BA/CA//DA/", "ka(ba)ca()da"],
    ["A'I", "I"],
    ["^", "\\u0f38"],
    ["Ai", "-i"],
    ["A'i", "-I"],
    ["B'I", "bI"],
    ["'I ’OD", "'i 'od"],
    ["BA'I", "ba'i"],
    ["AI", "i"],
    ["A'U", "U"],
    ["AA:", "aH"],
    ["A'A:", "AH"],
    ["G-YAS", "g.yas"],
    ["GA-YAS", "g.yas"],
    ["ZHVA", "zhwa"],
    ["L'i", "l-I"],
    ["AEE", "ai"],
    ["KEEm", "kaiM"],
    ["DRA", "dra"],
    ["PAndI", "paN+Di"],
    ["PAn+dI T+SA", "paN+Di t+sa"],
    ["BSGRUBS", "bsgrubs"],
    ["BSGRVUBS", "bsgrwubs"],
    ["KHAMS", "khams"],
    ["ARTHA", "ar+tha"],
    ["DHA KshA", "d+ha k+Sha"],
    ["TSA TZA", "tsha tsa"],
    ["SV'A", "swA"],
    ["TZTSA", "ts+tsha"],
    [
      "*, ,'PHAGS PA GSER 'OD DAM PA MDO SDE DBANG PO'I BSDUS PA BSHUGS SO, ,",
      "@#/_/'phags pa gser 'od dam pa mdo sde dbang po'i bsdus pa bshugs so/_/"
    ]
  ];

  test.each(cases)('ACIPtoEWTS(%j) -> %j', (input, expected) => {
    expect(ACIPtoEWTS(input)).toBe(expected);
  });
});

describe('EWTStoACIPContent', () => {
  const cases = [
    ["I", "A'I"],
    ["\\u0f38", "^"],
    ["-i", "Ai"],
    ["-I", "A'i"],
    ["bI", "B'I"],
    ["'i ’od", "'I 'OD"],
    ["ba'i", "BA'I"],
    ["i", "AI"],
    ["U", "A'U"],
    ["aH", "AA:"],
    ["AH", "A'A:"],
    ["g.yas", "G-YAS"],
    ["ga.yas", "GA-YAS"],
    ["zhwa", "ZHVA"],
    ["l-I", "L'i"],
    ["ai", "AEE"],
    ["kaiM", "KEEm"],
    ["dra", "DRA"],
    ["paN+Di", "PAn+dI"],
    ["paN+Di t+sa", "PAn+dI T+SA"],
    ["bsgrubs", "BSGRUBS"],
    ["bsgrwubs", "BSGRVUBS"],
    ["khams", "KHAMS"],
    ["ar+tha", "AAR+THA"],
    ["d+ha k+Sha", "D+HA K+shA"],
    ["tsha tsa", "TSA TZA"],
    [
      "@#/ /'phags pa gser 'od dam pa mdo sde dbang po'i bsdus pa bshugs so/_/",
      "*, ,'PHAGS PA GSER 'OD DAM PA MDO SDE DBANG PO'I BSDUS PA BSHUGS SO, ,"
    ]
  ];

  test.each(cases)('EWTStoACIPContent(%j) -> %j', (input, expected) => {
    expect(EWTStoACIPContent(input)).toBe(expected);
  });
});
