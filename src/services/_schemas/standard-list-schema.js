module.exports = description => ({
  description,
  type: "object",
  properties: {
    _startIndex: {
      description: "分页开始偏移量",
      type: "integer",
      minimum: 0
    },
    _maxResults: {
      description: "每次最多的数量",
      type: "integer",
      minimum: 1,
      maximum: 1000
    }
  }
});
