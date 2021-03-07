const profileHasToken = require("../profile-has-token");

module.exports = [
  profileHasToken,
  {
    description: "查看用户",
    type: "object",
    required: ["userId"],
    properties: {
      userId: {
        description: "用户ID",
        type: "integer"
      }
    }
  }
];
