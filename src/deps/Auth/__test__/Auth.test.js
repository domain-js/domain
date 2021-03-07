const { DataTypes } = require("sequelize");
const Main = require("..");

describe("Auth", () => {
  const U = {
    randStr: jest.fn(() => "__RNADOM_STR__")
  };
  const init = jest.fn();
  const create = jest.fn();
  const findOne = jest.fn();
  class Model {
    static init(define) {
      return init(define);
    }

    static create(attr) {
      return create(attr);
    }

    static findOne(opt) {
      return findOne(opt);
    }
  }
  const Sequelize = {
    DataTypes,
    Model
  };

  const errors = {
    tokenError: jest.fn(() => Error("Token 不存在")),
    tokenErrorUserNotExisits: jest.fn(() => Error("Token 错误，用户不存在")),
    tokenErrorUserStatusDisabled: jest.fn(() =>
      Error("Token 错误，用户被禁用")
    ),
    tokenErrorUserBeenDeleted: jest.fn(() => Error("Token 错误，用户被删除"))
  };
  const User = {
    findByPk: jest.fn()
  };
  const sequelize = {};
  const consts = {};
  const deps = {
    consts,
    U,
    errors,
    User,
    sequelize: { db: sequelize },
    Sequelize
  };
  const cnf = {};
  const Auth = Main(cnf, deps);

  describe("static methods generate", () => {
    it("case1 TOKEN_LIFE_SECONDS default", async () => {
      const user = { id: "userId" };
      const onlineIp = "127.0.0.1";
      const deviceId = "DEVICE_ID";
      create.mockResolvedValueOnce({ id: "id" });
      const res = await Auth.generate(user, onlineIp, deviceId);
      expect(res).toEqual({ id: "id" });

      expect(create.mock.calls.length).toBe(1);
      const [attr] = create.mock.calls.pop();
      expect(attr).toMatchObject({
        token: "user___RNADOM_STR__",
        deviceId: "DEVICE_ID",
        onlineIp: "127.0.0.1",
        creatorId: "userId"
      });
      expect(attr.expiredAt <= Date.now() + 1000 * 86400).toBe(true);
    });

    it("case2", async () => {
      consts.TOKEN_LIFE_SECONDS = 10000;
      const user = { id: "userId" };
      const onlineIp = "127.0.0.1";
      const deviceId = "DEVICE_ID";
      create.mockResolvedValueOnce({ id: "id" });
      const res = await Auth.generate(user, onlineIp, deviceId);
      expect(res).toEqual({ id: "id" });

      expect(create.mock.calls.length).toBe(1);
      const [attr] = create.mock.calls.pop();
      expect(attr).toMatchObject({
        token: "user___RNADOM_STR__",
        deviceId: "DEVICE_ID",
        onlineIp: "127.0.0.1",
        creatorId: "userId"
      });
      expect(
        attr.expiredAt <= Date.now() + 1000 * consts.TOKEN_LIFE_SECONDS
      ).toBe(true);
    });
  });

  describe("static methods readUserByToken", () => {
    it("case1, token error", async () => {
      await expect(Auth.readUserByToken("token")).rejects.toThrow(
        "Token 不存在"
      );

      expect(findOne.mock.calls.length).toBe(1);
      expect(findOne.mock.calls.pop()).toEqual([
        {
          where: { token: "token" }
        }
      ]);

      expect(errors.tokenError.mock.calls.length).toBe(1);
      expect(errors.tokenError.mock.calls.pop()).toEqual(["token"]);
    });

    it("case2, inexpired", async () => {
      findOne.mockResolvedValueOnce({
        expiredAt: new Date(Date.now() - 1000000)
      });
      await expect(Auth.readUserByToken("token")).rejects.toThrow(
        "Token 不存在"
      );

      expect(findOne.mock.calls.length).toBe(1);
      expect(findOne.mock.calls.pop()).toEqual([
        {
          where: { token: "token" }
        }
      ]);

      expect(errors.tokenError.mock.calls.length).toBe(1);
      expect(errors.tokenError.mock.calls.pop()).toEqual(["token"]);
    });

    it("case3, user unexists", async () => {
      findOne.mockResolvedValueOnce({
        expiredAt: new Date(Date.now() + 1000000)
      });
      await expect(Auth.readUserByToken("token")).rejects.toThrow("用户不存在");

      expect(findOne.mock.calls.length).toBe(1);
      expect(findOne.mock.calls.pop()).toEqual([
        {
          where: { token: "token" }
        }
      ]);

      expect(errors.tokenErrorUserNotExisits.mock.calls.length).toBe(1);
      expect(errors.tokenErrorUserNotExisits.mock.calls.pop()).toEqual([
        "token"
      ]);
    });

    it("case4, user disabled", async () => {
      findOne.mockResolvedValueOnce({
        expiredAt: new Date(Date.now() + 1000000)
      });
      User.findByPk.mockResolvedValueOnce({
        id: "userId",
        status: "disabled"
      });
      await expect(Auth.readUserByToken("token")).rejects.toThrow("用户被禁用");

      expect(findOne.mock.calls.length).toBe(1);
      expect(findOne.mock.calls.pop()).toEqual([
        {
          where: { token: "token" }
        }
      ]);

      expect(errors.tokenErrorUserStatusDisabled.mock.calls.length).toBe(1);
      expect(errors.tokenErrorUserStatusDisabled.mock.calls.pop()).toEqual([
        "userId",
        "disabled"
      ]);
    });

    it("case5, user isDeleted", async () => {
      findOne.mockResolvedValueOnce({
        expiredAt: new Date(Date.now() + 1000000)
      });
      User.findByPk.mockResolvedValueOnce({
        id: "userId",
        status: "enabled",
        isDeleted: "yes"
      });
      await expect(Auth.readUserByToken("token")).rejects.toThrow("用户被删除");

      expect(findOne.mock.calls.length).toBe(1);
      expect(findOne.mock.calls.pop()).toEqual([
        {
          where: { token: "token" }
        }
      ]);

      expect(errors.tokenErrorUserBeenDeleted.mock.calls.length).toBe(1);
      expect(errors.tokenErrorUserBeenDeleted.mock.calls.pop()).toEqual([
        "userId"
      ]);
    });

    it("case6, user noraml", async () => {
      findOne.mockResolvedValueOnce({
        expiredAt: new Date(Date.now() + 1000000),
        toJSON() {
          return { token: "token" };
        }
      });
      User.findByPk.mockResolvedValueOnce({
        id: "userId",
        status: "enabled",
        isDeleted: "no",
        toJSON() {
          return { id: "userId", status: "enabled", isDeleted: "no" };
        }
      });
      const res = await Auth.readUserByToken("token");
      expect(res).toEqual({
        _id: "user-userId",
        _type: "user",
        id: "userId",
        status: "enabled",
        isDeleted: "no",
        auth: {
          token: "token"
        }
      });

      expect(findOne.mock.calls.length).toBe(1);
      expect(findOne.mock.calls.pop()).toEqual([
        {
          where: { token: "token" }
        }
      ]);
    });
  });
});
