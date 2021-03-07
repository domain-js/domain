const profile = require("../profile");

module.exports = [
  profile,
  {
    description: "用户登录",
    type: "object",
    additionalProperties: false,
    required: ["name", "password", "code"],
    properties: {
      name: {
        description: "用户名",
        type: "string",
        minLength: 1,
        maxLength: 64
      },
      password: {
        description: "用户密码，md5 后",
        type: "string",
        minLength: 32,
        maxLength: 32
      },
      code: {
        description: "Google 身份验证码",
        type: "string"
      },
      deviceId: {
        description: "设备ID",
        type: "string"
      }
    }
  }
];
