const path = require("path");
const cfg = require("./env")();

const storagePath = cfg("STORAGE_PATH", path.resolve(__dirname, "../storage"));

module.exports = {
  // 系统主域名
  domain: cfg("DOMAIN"),

  // 模式，手动模式下，一切自动执行的脚本需要停止
  mode: cfg("MODE", "auto"),

  // schema 通用模块配置
  schema: {
    allowUnionTypes: true,
    coerceTypes: true,
    useDefaults: true,
  },

  // @domain.js/axios 配置信息
  axios: {
    loggers: ["post", "get", "put", "patch", "delete"],
    retry: ["post", "get"],
    retryTimes: 3,
    retryIntervalMS: 10 * 1000,
    conf: {
      // defines the max size of the http response content in bytes allowed
      maxContentLength: 100 * 1024 * 1024,
      // defines the max size of the http request content in bytes allowed
      maxBodyLength: 100 * 1024 * 1024,
    },
  },

  // 并发控制的设置
  parallel: {
    // 并发控制的key, 存储单元
    key: "parallel-control",
    // 超过多长时间会被清理
    defaultErrorFn: (p) => Error(`并发控制，禁止同一时间多次请求: ${p}`),
  },

  // 计数器相关设置
  counter: {
    key: "counters",
  },

  // 通用 redis hash 设置相关
  hash: {
    key: "hashs",
  },

  aes: {
    key: cfg("AES_KEY"),
  },

  /** 数据库配置 */
  sequelize: {
    db: {
      host: cfg("DB_HOST", "127.0.0.1"),
      port: cfg("DB_PORT", 3306),
      name: cfg("DB_NAME", "redstone"),
      encode: {
        set: "utf8mb4",
        collation: "utf8mb4_general_ci",
      },
      user: cfg("DB_USER", "root"),
      pass: cfg("DB_PASS"),
      dialect: "mysql",
      dialectOptions: {
        /** 支持大数的计算 */
        supportBigNumbers: true,
        charset: "utf8mb4",
      },
      logging: console.log,
      define: {
        underscored: false,
        freezeTableName: true,
        syncOnAssociation: false,
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
        engine: "InnoDB",
      },
      syncOnAssociation: true,
      pool: {
        min: 2,
        max: 10,
        /** 单位毫秒 */
        idle: 300 * 1000,
      },
    },
  },

  /** redis 配置信息, 使用 ioredis 的options格式 */
  redis: {
    host: cfg("REDIS_HOST", "127.0.0.1"),
    port: cfg("REDIS_PORT", 6379),
    keyPrefix: cfg("REDIS_PRE", "RED::"),
  },

  logger: {
    errorLogPath: `${storagePath}/logs`,
    infoLogPath: `${storagePath}/logs`,
  },

  rest: {
    relativeMaxRangeDays: 90,
  },

  /** 日期格式化的格式 */
  dateFormat: "YYYY-MM-DD",

  /** 时间格式化的格式 */
  dateTimeFormat: "YYYY-MM-DD HH:mm:ss",

  /** 允许的语言 */
  languages: ["zh", "en", "zh-tw"],
  defaultLanguage: "zh",
};
