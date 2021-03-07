const profileHasToken = require("../profile-has-token");

module.exports = [
  profileHasToken,
  {
    description: "编辑特定签名客户端信息",
    type: "object",
    required: ["clientId"],
    additionalProperties: false,
    properties: {
      clientId: {
        description: "要修改的客户端 ID",
        type: "integer"
      },
      name: {
        description: "备注信息",
        type: "string",
        minLength: 1,
        maxLength: 100
      },
      secret: {
        description: "随机私钥",
        type: "string",
        minLength: 64,
        maxLength: 64
      },
      bindIps: {
        description: "绑定的IP",
        type: "array",
        items: {
          description: "IP 地址",
          type: "string"
        }
      },
      status: {
        description: "状态",
        type: "string",
        enum: ["enabled", "disabled"]
      },
      notificationURL: {
        description: "订单状态变更回调地址",
        type: "string",
        format: "url"
      }
    }
  }
];
