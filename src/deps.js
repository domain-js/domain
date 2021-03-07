const path = require("path");
const _ = require("lodash");
const moment = require("moment");
const async = require("async");
const aes = require("@domain.js/aes");
const axios = require("@domain.js/axios");
const cache = require("@domain.js/cache");
const counter = require("@domain.js/counter");
const graceful = require("@domain.js/graceful");
const listener = require("@domain.js/listener");
const queue = require("@domain.js/queue");
const logger = require("@domain.js/logger");
const redis = require("@domain.js/redis");
const hash = require("@domain.js/hash");
const schema = require("@domain.js/schema");
const parallel = require("@domain.js/parallel");
const signer = require("@domain.js/signer");
const Sequelize = require("sequelize");
const sequelize = require("@domain.js/sequelize");
const rest = require("@domain.js/rest");
const checker = require("@domain.js/checker");
const DM = require("@open-node/dm");
const errors = require("./errors");
const consts = require("./consts");
const utils = require("./utils");

// 默认模块
const defaults = {
  aes,
  axios,
  cache,
  counter,
  graceful,
  listener,
  queue,
  logger,
  redis,
  hash,
  schema,
  parallel,
  signer,
  sequelize,
  rest,
  checker
};

// 依赖的注册是有先后顺序的
// 顺序错误可能会导致依赖无法获取
module.exports = cnf => {
  const dm = DM("js", _);
  // 初始模块定义
  const deps = {
    _,
    moment,
    async,
    Sequelize,
    dm,
    errors,
    U: utils,
    utils,
    consts
  };

  const dir = path.resolve(__dirname, "deps");
  dm.auto(dir, {
    ignores: new Set(),
    deps,
    args: [cnf, deps],
    defaults
  });

  // 冻结，以免被无故篡改
  return Object.freeze(deps);
};
