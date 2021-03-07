const _ = require("lodash");
const { default: Ajv } = require("ajv");
const schema = require("./env.schema");

const FIELDS = new Set(Object.keys(schema.properties));

module.exports = () => {
  const ajv = new Ajv();
  const validate = ajv.compile(schema);

  const env = _.pick(process.env, [...FIELDS]);
  if (!validate(env)) {
    console.log("环境变量设置错误");
    console.log(env);
    console.log(JSON.stringify(validate.errors, null, 2));
    throw Error("环境变量设置错误");
  }

  return (key, defaultValue) => {
    if (!FIELDS.has(key))
      throw Error(`Key: ${key} 未提前在 env.schema.js 中定义, 请先定义`);

    return env[key] || defaultValue;
  };
};
