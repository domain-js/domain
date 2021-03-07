const _ = require("lodash");
const md5 = require("md5");
const otplib = require("otplib");
const Sequelize = require("sequelize");

function Main(cnf, deps) {
  const {
    aes: { key: AES_KEY }
  } = cnf;
  const {
    U: { randStr },
    sequelize: { db: sequelize },
    aes,
    consts: { USER_PROTECT_FIELDS }
  } = deps;

  const { DataTypes } = Sequelize;

  class Model extends Sequelize.Model {
    static password(password, salt) {
      return md5(`${password}${salt}`);
    }

    static resetSecurity(params, resetSecret = false) {
      if (params.password) {
        params.password = md5(params.password);
        params.salt = randStr(20);
        params.password = Model.password(params.password, params.salt);
      }

      let secret;
      if (resetSecret) {
        secret = otplib.authenticator.generateSecret();
        params.secret = aes.encrypt(secret, AES_KEY);
      }

      return secret;
    }

    toJSON() {
      return _.omit(this.get(), USER_PROTECT_FIELDS);
    }
  }

  Model.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        // 成员名称 name
        type: DataTypes.STRING(64),
        allowNull: true,
        unique: true,
        validate: {
          len: [1, 64]
        }
      },
      secret: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: "Google 二次验证，安全码, aes 加密存储"
      },
      password: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: "密码，混淆密码存储"
      },
      salt: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: "密码混淆，随机串"
      },
      status: {
        type: DataTypes.ENUM,
        values: ["enabled", "disabled"],
        defaultValue: "enabled",
        comment: "用户是否被禁用"
      },
      role: {
        type: DataTypes.ENUM,
        values: ["admin", "member"],
        defaultValue: "member",
        allowNull: false
      },
      loginTimes: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: "登录次数"
      },
      lastSignedAt: {
        type: DataTypes.DATE,
        comment: "上次登录时间"
      },
      isDeleted: {
        type: DataTypes.ENUM,
        values: ["yes", "no"],
        defaultValue: "no",
        allowNull: false,
        comment: "是否被删除"
      }
    },
    {
      sequelize,
      comment: "用户表",
      freezeTableName: true,
      modelName: "User",
      tableName: "user",
      initialAutoIncrement: 100000,
      hooks: {}
    }
  );

  Model.sort = {
    default: "id",
    defaultDirection: "DESC",
    allow: ["id", "createdAt", "updatedAt"]
  };

  Model.allowIncludeCols = [];
  Model.writableCols = ["name", "password", "secret", "salt", "status", "role"];
  Model.onlyAdminCols = ["role", "status"];

  return Model;
}

Main.Deps = ["utils", "sequelize", "aes", "consts"];

module.exports = Main;
