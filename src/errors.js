const Errors = require("@open-node/errors");

const defines = [
  // 错误定义，第一项为 code, 第二项为 message, message 可以包含变量，用法%s, %d 这样的
  // 具体定义方式参考 @open-node/errors 库包的定义
  ["notFound", "资源不存在: %o"],
  ["loginNameOrPassword", "登录用户名或密码错误"],
  ["loginLockByIP", "登录被锁定"],
  ["googleAuthCodeError", "Google 身份验证码错误"],
  ["notAllowed", "禁止访问: %o"],
  ["notAllowedTheIp", "禁止改IP访问: %o"],
  ["tokenError", "系统未找到, token错误: %s"],
  ["loginCodeError", "登录错误code不正确: %s"],
  ["loginVerifyError", "登录错误verify不合法"],
  ["tokenErrorUserNotExisits", "token错误, 对应用户不存在: %s"],
  [
    "tokenErrorUserStatusDisabled",
    "token错误, 对应用户为不可访问状态(ID = %d, Status: %s)"
  ],
  ["tokenErrorUserBeenDeleted", "token错误, 对应用户已被删除(ID = %d)"],
  ["resourceDuplicateAdd", "重复添加资源: %o"],
  ["lackProfileParams", "profile 缺少必要参数: %s"],
  ["lackParamsParams", "params 缺少必要参数: %s"],
  ["noAuth", "未通过授权认证: %o"],
  [
    "domainMethodCallArgsInvalid",
    "请求参数错误, 第 %d 个参数, msg: %o, data: %o, method-path: %s"
  ],
  [
    "schemesUnmatched",
    "数据模式匹配错误, 资源: %s, 路径: %s, 信息: %o, 数据: %o"
  ],
  // 以上是基础错误信息

  ["masterCardCreateOrderError", "利用 MasterCard 支付网关，创建订单错误"],
  ["stcPayCreateOrderError", "利用 STCPay 支付网关，创建订单错误"],
  ["requestVerifyOrderError", "请求验证订单失败，并发控制"],
  ["requestVerifyOrderButStatusError", "请求验证订单失败，订单状态错误"],
  ["requestVerifyOrderButTimeout", "请求验证订单失败，订单已过期"],
  ["verifyOrderError", "验证订单失败，信息不匹配"],
  [
    "requestVerifyOrderVerificationTimesTooMany",
    "请求验证订单失败，订单验证次数太多"
  ],
  [
    "setPaidByAdminButStatusNotAllow",
    "管理员设置订单已支付，仅允许状态是 active 和 doing 的"
  ],
  ["requestNotifyOrderButTimeout", "请求通知订单失败，订单已过期"],
  [
    "requestNotifyOrderButNotifiedIsSucceed",
    "请求通知订单失败，订单已成功通知"
  ],
  ["requestNotifyOrderButStatusError", "请求订单通知，但是状态错误"],
  ["requestNotifyOrderVerificationTimesTooMany", "请求订单通知次数太多"],
  ["requestNotifyOrderError", "请求通知订单失败，并发控制"],
  ["autoExecNotifyTaskError", "自动执行notify任务脚本失败"],
  ["notifyNoticeError", "notify.notice 执行失败"]
];

module.exports = Object.freeze(Errors(defines));
