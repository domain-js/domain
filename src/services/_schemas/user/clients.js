const profileHasToken = require("../profile-has-token");

module.exports = [
  profileHasToken,
  {
    type: "object",
    description: "查看用户签名授权客户端列表",
    properties: {
      _startIndex: {
        type: "integer",
        minimum: 0
      },
      _maxResults: {
        type: "integer",
        minimum: 1,
        maximum: 1000
      }
    }
  }
];
