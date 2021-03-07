const url = require("url");
const qs = require("querystring");
const _ = require("lodash");

/** 随机字符串字典 */
const RAND_STR_DICT = {
  normal: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  strong:
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&’()*+,-./:;<=>?@[]^_`{|}~"
};

const utils = {
  /**
   * 生成随机字符串
   * @params
   *   len int.unsigned 生成的随机串的长度
   *   type enum('normal', 'strong') 随即串的强度, defaultValue is normal
   */
  randStr(len, type) {
    const dict = RAND_STR_DICT[type || "normal"] || type;
    const { length } = dict;

    /** 随机字符串的长度不能等于 0 或者负数 */
    len |= 0;
    len = Math.max(len, 3);

    return _.range(len)
      .map(() => dict[Math.floor(Math.random() * length)])
      .join("");
  },

  /**
   * 睡眠等待
   * @memberof U
   *
   * @param {number} ms 睡眠等待的毫秒数
   *
   * @return {Promise<undefined>} 无返回值
   * @example
   * await U.sleep(300); // 这里会暂停300毫秒
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * 深度冻结一个对象，防止被不小心篡改
   * @memberof U
   * @params {object} object 要被深度冻结的对象
   *
   * @return {object}
   */
  deepFreeze(object) {
    // Retrieve the property names defined on object
    const propNames = Object.getOwnPropertyNames(object);

    // Freeze properties before freezing self

    for (const name of propNames) {
      const value = object[name];

      object[name] =
        value && typeof value === "object" ? utils.deepFreeze(value) : value;
    }

    return Object.freeze(object);
  },

  /**
   * try catch 包裹执行, 记录错误日志
   * @memberof U
   * @params {function} fn 要执行的函数
   * @params {function} errorLog 错误接收函数
   *
   * @return {function} 返回加工后的函数
   */
  tryCatchLog(fn, errorLog) {
    return async (...args) => {
      try {
        const res = await fn(...args);
        return res;
      } catch (e) {
        errorLog(e);
        return e;
      }
    };
  },

  /**
   * 判断某个时间是否已过期，基于当前时间
   * @param Number time 秒级时间戳
   * @param Number life 有效期，秒级
   *
   * @return Boolean  True: 过期，False 未过期
   */
  inExpired(time, life) {
    const now = (Date.now() / 1000) | 0;

    return time < now - life;
  },

  /**
   * 修改指定url上添加一些参数
   * @params String address 给定的url地址
   * @params Object adds 要添加的参数
   * @params Array [removes] 要删除的参数key列表
   */
  modifiyURL(address, adds, removes) {
    const obj = url.parse(address);
    const params = { ...qs.parse(obj.query), ...adds };
    if (Array.isArray(removes)) {
      for (const k of removes) delete params[k];
    }
    if (_.size(params)) {
      obj.search = `?${qs.stringify(params)}`;
    } else {
      obj.search = null;
    }

    return url.format(obj);
  },

  isTest: process.env.NODE_ENV === "test",

  isProd: process.env.NODE_ENV === "production"
};

module.exports = utils;
