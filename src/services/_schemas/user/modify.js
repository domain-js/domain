const profileHasToken = require("../profile-has-token");

module.exports = [
  profileHasToken,
  {
    description: "编辑用户",
    type: "object",
    required: ["userId"],
    properties: {
      userId: {
        description: "用户ID",
        type: "integer"
      },
      status: {
        description: "用户状态",
        type: "string",
        enum: ["enabled", "disabled"]
      },
      role: {
        description: "用户角色",
        type: "string",
        enum: ["member", "admin"]
      },
      password: {
        description: "登录密码",
        type: "string",
        minLength: 8,
        maxLength: 30
      },
      resetSecret: {
        description: "是否重置Google二次验证码",
        type: "string",
        enum: ["yes", "no"]
      }
    }
  }
];
