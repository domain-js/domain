const profileHasToken = require("../profile-has-token");

module.exports = [
  profileHasToken,
  {
    description: "删除某个签名客户端",
    type: "object",
    required: ["clientId"],
    additionalProperties: false,
    properties: {
      clientId: {
        description: "要删除的客户端 ID",
        type: "integer"
      }
    }
  }
];
