function isEmpty(value) {
  if (typeof value !== 'string') {
    return true;
  }

  return value.length === 0;
}

const StringUtils = {
  isEmpty,
};

module.exports = StringUtils;
