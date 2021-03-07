const fs = require("fs");
const yaml = require("yaml");

const file = process.argv[2];
if (!file) throw Error("请先指定环境变量 yaml 配置文件路径");
if (!fs.existsSync(file)) throw Error(`指定配置文件不存在: ${file}`);

const [{ env }] = yaml.parse(fs.readFileSync(file).toString());
for (const key of Object.keys(env)) {
  console.log(`export ${key}='${env[key]}'`);
}
