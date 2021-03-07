const relations = require("./relations");

function Main(cnf, deps) {
  // 注册默认hook
  const { consts, queue, User, Client, Auth } = deps;

  const Models = { Client, Auth, User };

  for (const k of Object.keys(Models)) {
    const Model = Models[k];
    for (const hook of consts.DEFAULT_MODEL_HOOKS_EVENT) {
      Model.addHook(hook, (instance) => queue.push({ name: `${k}.${hook}`, data: instance }));
    }
  }

  // 初始化models之间的关系
  relations(Models);
}

Main.Deps = ["consts", "queue", "User", "Client", "Auth"];

module.exports = Main;
