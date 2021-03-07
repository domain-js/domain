#! /usr/bin/env node

const async = require("async");
const cnf = require("../configs");
const Deps = require("../src/deps");

const names = process.argv.slice(2);
if (!names) throw Error("请指定要sync的表");

cnf.mode = "hand";
const deps = Deps(cnf);

(async () => {
  console.log("[%s] 开始执行", new Date());
  await async.eachSeries(names, async (x) => {
    const name = x.trim();
    if (!name) return;
    const Model = deps[name];
    if (!Model) throw Error(`没有这个表: ${name}`);
    await Model.sync();
    console.log("[%s] 执行完毕", new Date());
  });

  process.exit(0);
})();
