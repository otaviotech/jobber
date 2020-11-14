const CollectionUtils = require('./collection.utils');

describe('CollectionUtils', () => {
  const list = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
  ];

  describe('getItemsUntilMatch', () => {
    test('Should return another list with all items before the predicate match', () => {
      const predicate = (obj) => obj.id === 3;
      const result = CollectionUtils.getItemsUntilMatch(list, predicate);

      expect(result).toHaveLength(2);
      expect(result).toEqual(list.slice(0, 2));
    });

    test('Should return an empty list if the predicate is not a function', () => {
      expect(CollectionUtils.getItemsUntilMatch(list, 0)).toEqual([]);
      expect(CollectionUtils.getItemsUntilMatch(list, '')).toEqual([]);
      expect(CollectionUtils.getItemsUntilMatch(list, null)).toEqual([]);
      expect(CollectionUtils.getItemsUntilMatch(list, undefined)).toEqual([]);
    });

    test('Should return an empty list if list is an empty list', () => {
      expect(CollectionUtils.getItemsUntilMatch([], 0)).toEqual([]);
    });

    test('Should return an empty list if list is not a list list', () => {
      expect(CollectionUtils.getItemsUntilMatch(0, () => {})).toEqual([]);
      expect(CollectionUtils.getItemsUntilMatch('', () => {})).toEqual([]);
      expect(CollectionUtils.getItemsUntilMatch(null, () => {})).toEqual([]);
      expect(CollectionUtils.getItemsUntilMatch(undefined, () => {})).toEqual([]);
    });
  });

  describe('isEmpty', () => {
    test('Should return false if list is falsy', () => {
      expect(CollectionUtils.isEmpty(0)).toBeTruthy();
      expect(CollectionUtils.isEmpty('')).toBeTruthy();
      expect(CollectionUtils.isEmpty(null)).toBeTruthy();
      expect(CollectionUtils.isEmpty(undefined)).toBeTruthy();
    });

    test('Should return true if list is empty', () => {
      expect(CollectionUtils.isEmpty([])).toBeTruthy();
    });

    test('Should return false if list has items', () => {
      expect(CollectionUtils.isEmpty(list)).toBeFalsy();
    });
  });
});
