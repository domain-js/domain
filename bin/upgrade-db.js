#! /usr/bin/env node

const fs = require("fs");
const path = require("path");
const util = require("util");
const readline = require("readline");
const _ = require("lodash");
const async = require("async");
const { Sequelize } = require("sequelize");
const cnf = require("../configs");

cnf.mode = "hand";
const dbOpts = cnf.sequelize;

const DB_KEYS = new Set(Object.keys(dbOpts));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
  prompt: "> ",
  removeHistoryDuplicates: true
});
rl.setPrompt("> ");

/**
 * 读取录下的所有文件，之后返回数组
 * params
 *   dir 要加载的目录
 *   exts 要加载的模块文件后缀，多个可以是数组, 默认为 coffee
 *   excludes 要排除的文件, 默认排除 index
 */
const deepReaddir = (dir, exts, excludes, files = []) => {
  for (const x of fs.readdirSync(dir)) {
    const file = path.resolve(dir, x);
    const stat = fs.lstatSync(file);
    if (stat.isFile()) {
      // 忽略隐藏文件
      if (x[0] === ".") continue;

      const arr = x.split(".");
      const ext = arr.pop();
      const name = arr.join(".");
      // 如果是不希望的后缀或者排除的名称，则直接忽略/跳过
      if (!_.includes(exts, ext) || _.includes(excludes, name)) continue;
      files.push(file);
    } else if (stat.isDirectory()) {
      deepReaddir(file, exts, excludes, files);
    }
  }

  return files;
};

const confirm = async question =>
  new Promise(resolve => {
    rl.question(`${question} [Yes/no]: `, ans =>
      resolve(ans.toLowerCase() !== "no")
    );
  });

const getObject = async () => {
  const data = {};

  const questions = [
    ["请输入要执行数据库变更的版本号(多个用逗号隔开)", "versions"]
  ];

  await async.eachSeries(questions, async ([question, key]) => {
    data[key] = await new Promise(resolve => {
      rl.question(`${question}[${key}]: `, resolve);
    });
  });

  console.log("--------- 信息添加如下 -------------");
  console.log("%o", data);
  const ok = await confirm("是否确认执行? ");
  if (!ok) return getObject();

  return data;
};

const main = async () => {
  const question = util.format(
    `该程序为执行指定版本的数据库变更脚本，当前为环境为 %o。误入，请直接 Ctrl+C 退出`,
    process.env.NODE_ENV || "development"
  );
  const ok = await confirm(question);
  if (!ok) process.exit(0);

  const obj = await getObject();
  const versions = Array.from(new Set(obj.versions.split(",")));
  console.log(versions);
  const files = [];
  for (const version of versions) {
    const dir = path.resolve(__dirname, `../upgrade/${version}`);
    // 如果目录不存在直
    if (!fs.existsSync(dir)) {
      console.log(`该版本不存在：${version}`);
      continue;
    }
    const f = fs.statSync(dir);
    // 如果文件不是一个目录直接退出
    if (!f.isDirectory()) {
      console.log(`该版本不是一个文件夹：${version}`);
      continue;
    }
    deepReaddir(dir, ["sql"], [], files);
  }

  const sqls = {};
  for (const x of DB_KEYS) sqls[x] = [];

  for (const file of _.uniq(files).sort()) {
    const name = path.basename(file, ".sql");
    if (!DB_KEYS.has(name)) {
      console.log("不支该命名数据库文件: %s", name);
      continue;
    }
    console.log("数据库文件: %s", file);
    const sql = fs.readFileSync(file, "utf8");
    if (!sql.length) continue;

    sqls[name].push(sql);
  }

  await async.each(DB_KEYS, async key => {
    const sqlString = sqls[key].join("\n");
    if (!sqlString) return;
    const opt = dbOpts[key];

    opt.logging = console.log;
    _.set(opt, "dialectOptions.multipleStatements", true);

    const sequelize = new Sequelize(opt.name, opt.user, opt.pass, opt);

    await sequelize.query(sqlString);
  });
  process.exit(0);
};

main();

process.on("uncaughtException", error => {
  console.error("[%s]: uncaughtException", new Date());
  console.error(error);
});

process.on("unhandledRejection", (reason, p) => {
  console.error("[%s]: unhandledRejection", new Date());
  console.error(reason, p);
});

process.on("rejectionHandled", error => {
  console.error("[%s]: rejectionHandled", new Date());
  console.error(error);
});
