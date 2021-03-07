const profileHasToken = require("../profile-has-token");

module.exports = [
  profileHasToken,
  {
    description: "重置自己账户安全",
    type: "object",
    required: ["origPass", "code"],
    properties: {
      origPass: {
        description: "原始密码(md5)",
        type: "string",
        minLength: 32,
        maxLength: 32
      },
      password: {
        description: "新设置密码(密码原文)",
        type: "string",
        minLength: 8,
        maxLength: 30
      },
      resetSecret: {
        description: "是否重置Google二次验证码",
        type: "string",
        enum: ["yes", "no"]
      },
      code: {
        description: "Google 身份验证码",
        type: "string"
      }
    }
  }
];
