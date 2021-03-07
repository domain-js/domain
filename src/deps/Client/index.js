const _ = require("lodash");
const Sequelize = require("sequelize");

function Main(cnf, deps) {
  const { DataTypes } = Sequelize;

  const {
    aes: { key: AES_KEY }
  } = cnf;
  const {
    U: { randStr },
    sequelize: { db: sequelize },
    aes,
    consts
  } = deps;

  class Model extends Sequelize.Model {
    static createOneBefore(params) {
      const secret = randStr(64);
      params.secret = aes.encrypt(secret, AES_KEY);

      return secret;
    }

    toJSON() {
      return _.omit(this.get(), consts.CLIENT_PROTECT_FIELDS);
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
        type: DataTypes.STRING,
        allowNull: true,
        comment: "备注信息"
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: "所属用户ID"
      },
      key: {
        type: DataTypes.STRING(32),
        defaultValue: null,
        unique: true,
        comment: "签名key，可公开"
      },
      secret: {
        type: DataTypes.TEXT,
        defaultValue: null,
        comment: "签名私钥，aes 加密存储"
      },
      status: {
        type: DataTypes.ENUM,
        values: ["disabled", "enabled"],
        defaultValue: "enabled",
        allowNull: false,
        comment: "是否可用"
      },
      bindIps: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
          const val = this.getDataValue("bindIps");
          if (_.isString(val) && val) return val.split(",");
          return [];
        },
        set(val) {
          this.setDataValue(
            "bindIps",
            Array.isArray(val) ? val.join(",") : null
          );
        },
        defaultValue: null,
        comment: "绑定客户端IP地址"
      },
      notificationURL: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "订单变更，通知回调地址"
      },
      creatorId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: "创建者ID"
      }
    },
    {
      sequelize,
      comment: "对接商户(客户端)",
      freezeTableName: true,
      modelName: "Client",
      tableName: "client",
      initialAutoIncrement: 500000,
      hooks: {
        beforeCreate(item) {
          item.key = randStr(32);
        }
      }
    }
  );

  Model.sort = {
    default: "createdAt",
    defaultDirection: "DESC",
    allow: ["createdAt"]
  };

  Model.allowIncludeCols = [];

  Model.writableCols = [
    "userId",
    "secret",
    "name",
    "status",
    "bindIps",
    "notificationURL"
  ];
  Model.editableCols = [
    "name",
    "secret",
    "status",
    "bindIps",
    "notificationURL"
  ];

  return Model;
}

Main.Deps = ["utils", "aes", "consts", "sequelize"];

module.exports = Main;
