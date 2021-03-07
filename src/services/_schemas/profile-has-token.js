module.exports = {
  title: "profile 参数设定",
  type: "object",
  required: ["clientIp", "remoteIp", "realIp", "token"],
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
    }
  }
};
