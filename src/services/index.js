const { resolve } = require("path");
const _ = require("lodash");
const output = require("./_output");
const parallels = require("./_parallels");

/**
 * @class
 * @return {Services} Instance
 */
module.exports = (cnf, deps) => {
  const {
    errors,
    schema,
    graceful,
    dm: {
      utils: { initModules, deepGetModules, pickMethods }
    },
    U: { deepFreeze }
  } = deps;

  const schemas = deepGetModules(resolve(__dirname, "_schemas"));

  const handle = (methods, ...handlers) => {
    const handleds = {
      _getSchemaByPath(path) {
        const _schema = _.get(schemas, path);
        if (!_schema) throw errors.notFound("该接口不存在或未定义参数 schema");
        return _schema;
      }
    };
    for (const [path, method] of methods) {
      _.set(handleds, path, handlers.reduce((m, h) => h(m, path), method));
    }

    return handleds;
  };

  const services = initModules(
    __dirname,
    ["js", ""],
    ["index", "_schemas", "_output", "_parallels"],
    cnf,
    deps
  );

  // 自动记录 logging
  const logging = (method, path) => deps.logger.logger(method, path, true);

  // 自动参数校验
  const validator = (method, path) => {
    const _schema = _.get(schemas, path);
    if (!_schema) return method;
    return schema.auto(
      method,
      _schema,
      errors.domainMethodCallArgsInvalid,
      path
    );
  };

  // 并行控制
  const parallelCtl = (method, path) => {
    const args = _.get(parallels, path);
    if (!args) return method;

    return deps.parallel(method, { path, ...args });
  };

  // deepFreeze 深度冻结领域对外方法，谨防被篡改
  return deepFreeze(
    handle(
      pickMethods(services),
      graceful.runnerAsync,
      parallelCtl,
      output,
      validator,
      logging
    )
  );
};
