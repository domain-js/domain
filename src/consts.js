const { deepFreeze } = require("./utils");

module.exports = deepFreeze({
  // 默认Model 需要触发事件的hook
  DEFAULT_MODEL_HOOKS_EVENT: [
    "afterCreate",
    "afterDestroy",
    "afterUpdate",
    "afterSave",
    "afterUpsert"
  ],

  // 用户信息需要保护的字段
  USER_PROTECT_FIELDS: ["secret", "password", "salt"],

  // 订单信息需要保护的字段
  ORDER_PROTECT_FIELDS: ["gateInfo"],

  // client 信息需要保护的字段
  CLIENT_PROTECT_FIELDS: ["secret"],

  // session 在cache里的有效期, 单位秒, 和token有效期不是一个概念
  SESSION_CACHE_LIFE: 1800,

  // token 有效期, 单位秒
  TOKEN_LIFE_SECONDS: 7 * 86400,

  // 密码错误次数, 超出锁定 IP 一段时间
  LOGIN_ERROR_TIMES_MAX: 5,

  // 错误超过次数，锁定 IP 时间，单位秒
  LOGIN_ERROR_LOCK_IP_SECONDS: 30 * 60,

  // 订单号维度随机数字长度, 最大 13
  ORDER_NO_TAIL_LENGTH: 5,

  // 订单有效期，单位秒，超过有效期会自动关闭
  ORDER_VERIFICATION_LIFE_SECONDS: 2 * 60 * 60,

  // 订单验证最多次数
  ORDER_VERIFICATION_TIMES_MAXIMUM: 10,

  // 订单完成支付后通知的有效期，单位秒
  ORDER_NOTIFICATION_LIFE_SECONDS: 3 * 24 * 60 * 60,

  // 同一个订单通知间隔多少秒
  ORDER_NOTIFICATION_INTERVAL_SECONDS: 2500,

  // 周期性订单提醒任务间隔多少秒
  ORDER_NOTIFY_TASK_INTERVAL_SECONDS: 2 * 60,

  // 订单通知最大次数
  ORDER_NOTIFICATION_TIMES_MAXIMUM: 105,

  // 订票票据长度
  ORDER_TICKET_LENGTH: 64
});
