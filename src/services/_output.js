const _ = require("lodash");

module.exports = fn => async (...args) => {
  const res = await fn(...args);
  if (!_.isObject(res)) return res;
  // *.detail, *.remove, *.modify, add*
  if (_.isFunction(res.toJSON)) return res.toJSON();

  // *.*s(list)
  if (res.count && Array.isArray(res.rows))
    res.rows = res.rows.map(x => (_.isFunction(x.toJSON) ? x.toJSON() : x));

  return res;
};
