const { stringToHex, hexToString } = require('../utils');

describe('Utils', () => {
  const str = 'test string';
  const hex = '7465737420737472696e67';

  test('stringToHex', () => {
    expect(stringToHex(str)).toBe(hex);
  });

  test('hexToString', () => {
    expect(hexToString(hex)).toBe(str);
  });
});
