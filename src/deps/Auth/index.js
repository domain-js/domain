function Main(cnf, deps) {
  const {
    U,
    Sequelize,
    sequelize: { db: sequelize },
    User,
    errors,
    consts
  } = deps;
  const { DataTypes } = Sequelize;

  class Model extends Sequelize.Model {
    static generate(user, onlineIp, deviceId) {
      return Model.create({
        token: `user_${U.randStr(64)}`,
        expiredAt: new Date(
          Date.now() + 1000 * (consts.TOKEN_LIFE_SECONDS || 1 * 86400)
        ),
        deviceId,
        onlineIp,
        creatorId: user.id
      });
    }

    static async readUserByToken(token) {
      const auth = await Model.findOne({ where: { token } });
      if (!auth) throw errors.tokenError(token);
      if (auth.expiredAt < new Date()) throw errors.tokenError(token);
      const user = await User.findByPk(auth.creatorId);
      if (!user) throw errors.tokenErrorUserNotExisits(token);
      if (user.status === "disabled")
        throw errors.tokenErrorUserStatusDisabled(user.id, user.status);
      if (user.isDeleted === "yes")
        throw errors.tokenErrorUserBeenDeleted(user.id);
      const json = user.toJSON();
      json.auth = auth.toJSON();
      json._type = "user";
      json._id = `user-${json.id}`;

      return json;
    }
  }

  Model.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      token: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: "存放 token"
      },
      deviceId: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "设备唯一标识"
      },
      expiredAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "过期时间"
      },
      onlineIp: {
        type: DataTypes.STRING(15),
        allowNull: false,
        comment: "创建者即登陆者IP"
      },
      creatorId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: "创建者，即关联用户"
      }
    },
    {
      sequelize,
      comment: "登陆授权表",
      freezeTableName: true,
      modelName: "Auth",
      tableName: "auth",
      hooks: {}
    }
  );

  Model.sort = {
    default: "id",
    allow: ["id", "name", "updatedAt", "createdAt"]
  };

  return Model;
}

Main.Deps = ["consts", "utils", "errors", "User", "sequelize", "Sequelize"];

module.exports = Main;
