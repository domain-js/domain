const profileHasToken = require("../profile-has-token");

module.exports = [
  profileHasToken,
  {
    description: "添加/注册用户",
    type: "object",
    required: ["name", "password"],
    additionalProperties: false,
    properties: {
      name: {
        description: "用户名, 全局唯一",
        type: "string",
        minLength: 1,
        maxLength: 64
      },
      password: {
        description: "登录密码",
        type: "string",
        minLength: 8,
        maxLength: 30
      },
      role: {
        description: "用户角色",
        type: "string",
        enum: ["member", "admin"]
      },
      status: {
        description: "用户状态",
        type: "string",
        enum: ["enabled", "disabled"]
      }
    }
  }
];
