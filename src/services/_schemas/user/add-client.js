const profileHasToken = require("../profile-has-token");

module.exports = [
  profileHasToken,
  {
    description: "添加签名客户端给某个用户",
    type: "object",
    required: ["userId", "name"],
    additionalProperties: false,
    properties: {
      userId: {
        description: "所属用户 ID",
        type: ["integer"]
      },
      name: {
        description: "备注信息",
        type: "string",
        minLength: 1,
        maxLength: 100
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
