const profileHasToken = require("../profile-has-token");

module.exports = [
  profileHasToken,
  {
    description: "查看某个签名客户端",
    type: "object",
    required: ["clientId"],
    additionalProperties: false,
    properties: {
      clientId: {
        description: "要查看的客户端 ID",
        type: "integer"
      }
    }
  }
];
