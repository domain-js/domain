const profileHasToken = require("../profile-has-token");

module.exports = [
  profileHasToken,
  {
    description: "获取用户列表",
    type: "object",
    properties: {
      _startIndex: {
        description: "分页起始位置",
        type: "integer",
        minimum: 0
      },
      _maxResults: {
        description: "分页返回条目数",
        type: "integer",
        minimum: 1,
        maximum: 1000
      }
    }
  }
];
