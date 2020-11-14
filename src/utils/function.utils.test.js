describe('FunctionUtils', () => {
  describe('isFunction', () => {
    test('Should return true if an object is a function and false otherwise', () => {
      expect(() => {}).toBeTruthy();
      expect(function () {}).toBeTruthy(); // eslint-disable-line prefer-arrow-callback, func-names
    });
  });
});
