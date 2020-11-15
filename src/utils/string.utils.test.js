const StringUtils = require('./string.utils');

describe('StringUtils', () => {
  describe('isEmpty', () => {
    test('Should return true if param is falsy', () => {
      expect(StringUtils.isEmpty(0)).toBeTruthy();
      expect(StringUtils.isEmpty(null)).toBeTruthy();
      expect(StringUtils.isEmpty(undefined)).toBeTruthy();
      expect(StringUtils.isEmpty(1)).toBeTruthy();
    });

    test('Should return true if param length is equal to zero', () => {
      expect(StringUtils.isEmpty('')).toBeTruthy();
    });

    test('Should return false if param length is greater than zero', () => {
      expect(StringUtils.isEmpty('a')).toBeFalsy();
      expect(StringUtils.isEmpty('ab')).toBeFalsy();
      expect(StringUtils.isEmpty('abc')).toBeFalsy();
      expect(StringUtils.isEmpty('ab cd')).toBeFalsy();
    });
  });
});
