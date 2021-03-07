/**
 * Service 层外部引入模块
 */
const { deepFreeze } = require("./src/utils");
const cnf = deepFreeze(require("./configs"));
const deps = require("./src/deps")(cnf);
const Service = require("./src/services");

module.exports = Service(cnf, deps);
