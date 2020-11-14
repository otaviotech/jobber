const { isFunction } = require('./function.utils');

const { isArray } = Array;

function isEmpty(list) {
  if (!isArray(list)) {
    return true;
  }

  return list.length === 0;
}

function getItemsUntilMatch(list, predicate) {
  if (isEmpty(list)) {
    return [];
  }

  if (!isFunction(predicate)) {
    return [];
  }

  const newList = [];

  list.some((item) => {
    const itemMatchesCondition = predicate(item);

    // Stop iterating.
    if (itemMatchesCondition) {
      return true;
    }

    newList.push(item);

    // Keep iterating.
    return false;
  });

  return newList;
}

module.exports = {
  getItemsUntilMatch,
  isEmpty,
};
