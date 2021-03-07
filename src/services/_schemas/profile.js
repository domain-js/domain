module.exports = {
  title: "profile 参数设定",
  type: "object",
  required: ["clientIp", "remoteIp", "realIp"],
  properties: {
    // 这个地址是完全读取的头信息，可能是最真实的，但是最不可信的
    clientIp: {
      title: "客户端真实ip地址",
      type: "string"
    },
    // 这个地址一般是nginx代理的地址
    remoteIp: {
      title: "直接建立连接IP地址",
      type: "string"
    },
    // 这个地址是授信nginx代理头信息传递过来的
    // 私有ip客户端应该基于此ip来判断
    realIp: {
      title: "可信任的真实ip",
      type: "string"
    },
    token: {
      title: "登录授权token",
      type: "string"
    },
    sign: {
      description: "签名认证相关信息",
      type: "object",
      required: [
        "signature",
        "uri",
        "key",
        "timestamp",
        "signMethod",
        "signVersion"
      ],
      properties: {
        signature: {
          description: "请求验证签名",
          type: "string"
        },
        uri: {
          description: "请求uri",
          type: "string"
        },
        key: {
          description: "client key",
          type: "string"
        },
        timestamp: {
          description: "请求时间戳, 秒级",
          type: "integer"
        },
        signMethod: {
          description: "签名算法名称",
          type: "string",
          enum: ["HmacSHA256"]
        },
        signVersion: {
          description: "签名算法版本",
          type: "string",
          enum: ["1"]
        }
      }
    }
  }
};
