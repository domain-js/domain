const Helper = require("..");
const errors = require("../../../errors");

describe("helpers.session", () => {
  const cnf = {
    aes: { key: "AES_KEY" }
  };
  const aes = {
    decrypt: jest.fn()
  };
  const consts = {
    SIGN_AUTH_TIMESTAMP_MAX_GAP_MS: 100 * 1000
  };
  const signer = { generator: jest.fn() };
  const User = { type: "user", findByPk: jest.fn() };
  const Client = { type: "client", findOne: jest.fn() };
  const Auth = { type: "auth", readUserByToken: jest.fn() };

  const deps = { aes, consts, errors, signer, User, Client, Auth };
  const helper = Helper(cnf, deps);
  it("case1, token exists", async () => {
    const session = {
      id: 100000,
      name: "redstone",
      _type: "user",
      _id: "user-100000"
    };
    Auth.readUserByToken.mockResolvedValueOnce(session);
    const res = await helper("token");
    expect(res).toEqual({ ...session });

    expect(Auth.readUserByToken.mock.calls.length).toBe(1);
    expect(Auth.readUserByToken.mock.calls.pop()).toEqual(["token"]);
  });

  it("case2, token exists, but auth non-exists", async () => {
    Auth.readUserByToken.mockRejectedValueOnce(Error("token 错误"));
    await expect(helper("token")).rejects.toThrow("token 错误");

    expect(Auth.readUserByToken.mock.calls.length).toBe(1);
    expect(Auth.readUserByToken.mock.calls.pop()).toEqual(["token"]);
  });

  it("case3, token unset, sign unset", async () => {
    await expect(helper()).rejects.toThrow("未通过授权认证");

    expect(Auth.readUserByToken.mock.calls.length).toBe(0);
  });

  it("case4, token unset, sign set, time gap too big", async () => {
    const sign = {
      timestamp: ((Date.now() / 1000) | 0) - 1000
    };
    await expect(helper(undefined, sign, "realip")).rejects.toThrow("禁止访问");

    expect(Auth.readUserByToken.mock.calls.length).toBe(0);
  });

  it("case5, token unset, sign set, client notFound", async () => {
    const sign = {
      timestamp: ((Date.now() / 1000) | 0) - 10,
      key: "this key not found"
    };
    await expect(helper(undefined, sign, "realip")).rejects.toThrow("禁止访问");

    expect(Auth.readUserByToken.mock.calls.length).toBe(0);
    expect(Client.findOne.mock.calls.length).toBe(1);
    expect(Client.findOne.mock.calls.pop()).toEqual([
      { where: { key: "this key not found" } }
    ]);
  });

  it("case6, token unset, sign set, client status isnt enabled", async () => {
    const sign = {
      timestamp: ((Date.now() / 1000) | 0) - 10,
      key: "this key not found"
    };
    const client = {
      id: 100000,
      name: "Client name",
      status: "disabled"
    };
    Client.findOne.mockResolvedValueOnce(client);
    await expect(helper(undefined, sign, "realip")).rejects.toThrow("禁止访问");

    expect(Auth.readUserByToken.mock.calls.length).toBe(0);
    expect(Client.findOne.mock.calls.length).toBe(1);
    expect(Client.findOne.mock.calls.pop()).toEqual([
      { where: { key: "this key not found" } }
    ]);
  });

  it("case7, token unset, sign set, client bindIps exclude current realip", async () => {
    const sign = {
      timestamp: ((Date.now() / 1000) | 0) - 10,
      key: "this key not found"
    };
    const client = {
      id: 100000,
      name: "Client name",
      status: "enabled",
      bindIps: ["ip1", "ip2"]
    };
    Client.findOne.mockResolvedValueOnce(client);
    await expect(helper(undefined, sign, "realip")).rejects.toThrow("禁止访问");

    expect(Auth.readUserByToken.mock.calls.length).toBe(0);
    expect(Client.findOne.mock.calls.length).toBe(1);
    expect(Client.findOne.mock.calls.pop()).toEqual([
      { where: { key: "this key not found" } }
    ]);
  });

  it("case8, token unset, sign set, client secret not found", async () => {
    const sign = {
      timestamp: ((Date.now() / 1000) | 0) - 10,
      key: "this key not found"
    };
    const client = {
      id: 100000,
      name: "Client name",
      status: "enabled",
      secret: "this is secret"
    };
    Client.findOne.mockResolvedValueOnce(client);
    await expect(helper(undefined, sign, "realip")).rejects.toThrow("禁止访问");

    expect(Auth.readUserByToken.mock.calls.length).toBe(0);
    expect(Client.findOne.mock.calls.length).toBe(1);
    expect(Client.findOne.mock.calls.pop()).toEqual([
      { where: { key: "this key not found" } }
    ]);
  });

  it("case9, token unset, sign set, signature unmatched", async () => {
    const sign = {
      signature: "this signature unmatched",
      timestamp: ((Date.now() / 1000) | 0) - 10,
      key: "this key not found"
    };
    const client = {
      id: 100000,
      name: "Client name",
      status: "enabled",
      secret: "this is secret",
      bindIps: ["ip1", "ip2", "realip"]
    };
    aes.decrypt.mockReturnValueOnce("origin secret");
    signer.generator.mockReturnValueOnce("this signature");
    Client.findOne.mockResolvedValueOnce(client);
    await expect(helper(undefined, sign, "realip")).rejects.toThrow("禁止访问");

    expect(Auth.readUserByToken.mock.calls.length).toBe(0);
    expect(Client.findOne.mock.calls.length).toBe(1);
    expect(Client.findOne.mock.calls.pop()).toEqual([
      { where: { key: "this key not found" } }
    ]);

    expect(signer.generator.mock.calls.length).toBe(1);
    expect(signer.generator.mock.calls.pop()).toEqual([
      { timestamp: sign.timestamp, key: sign.key },
      "origin secret"
    ]);
  });

  it("case10, token unset, sign set, signature matched, user not found", async () => {
    const sign = {
      signature: "this signature",
      timestamp: ((Date.now() / 1000) | 0) - 10,
      key: "this key not found"
    };
    const client = {
      id: 100000,
      name: "Client name",
      userId: 100000,
      status: "enabled",
      secret: "this is secret",
      bindIps: ["ip1", "ip2", "realip"]
    };
    aes.decrypt.mockReturnValueOnce("origin secret");
    signer.generator.mockReturnValueOnce("this signature");
    Client.findOne.mockResolvedValueOnce(client);
    await expect(helper(undefined, sign, "realip")).rejects.toThrow("禁止访问");

    expect(Auth.readUserByToken.mock.calls.length).toBe(0);
    expect(Client.findOne.mock.calls.length).toBe(1);
    expect(Client.findOne.mock.calls.pop()).toEqual([
      { where: { key: "this key not found" } }
    ]);

    expect(signer.generator.mock.calls.length).toBe(1);
    expect(signer.generator.mock.calls.pop()).toEqual([
      { timestamp: sign.timestamp, key: sign.key },
      "origin secret"
    ]);
    expect(User.findByPk.mock.calls.length).toBe(1);
    expect(User.findByPk.mock.calls.pop()).toEqual([100000]);
  });

  it("case11, token unset, sign set, user status isnt enabled", async () => {
    const sign = {
      signature: "this signature",
      timestamp: ((Date.now() / 1000) | 0) - 10,
      key: "this key not found"
    };
    const client = {
      id: 100000,
      name: "Client name",
      status: "enabled",
      userId: 100000,
      secret: "this is secret",
      bindIps: ["ip1", "ip2", "realip"]
    };
    aes.decrypt.mockReturnValueOnce("origin secret");
    signer.generator.mockReturnValueOnce("this signature");
    Client.findOne.mockResolvedValueOnce(client);
    const user = {
      id: 100000,
      name: "user name",
      status: "disabled"
    };
    User.findByPk.mockResolvedValueOnce(user);

    await expect(helper(undefined, sign, "realip")).rejects.toThrow("禁止访问");

    expect(Auth.readUserByToken.mock.calls.length).toBe(0);
    expect(Client.findOne.mock.calls.length).toBe(1);
    expect(Client.findOne.mock.calls.pop()).toEqual([
      { where: { key: "this key not found" } }
    ]);

    expect(signer.generator.mock.calls.length).toBe(1);
    expect(signer.generator.mock.calls.pop()).toEqual([
      { timestamp: sign.timestamp, key: sign.key },
      "origin secret"
    ]);

    expect(User.findByPk.mock.calls.length).toBe(1);
    expect(User.findByPk.mock.calls.pop()).toEqual([100000]);
  });

  it("case12, token unset, sign set, user isDeleted", async () => {
    const sign = {
      signature: "this signature",
      timestamp: ((Date.now() / 1000) | 0) - 10,
      key: "this key not found"
    };
    const client = {
      id: 100000,
      name: "Client name",
      status: "enabled",
      userId: 100000,
      secret: "this is secret",
      bindIps: ["ip1", "ip2", "realip"]
    };
    aes.decrypt.mockReturnValueOnce("origin secret");
    signer.generator.mockReturnValueOnce("this signature");
    Client.findOne.mockResolvedValueOnce(client);
    const user = {
      id: 100000,
      name: "user name",
      status: "enabled",
      isDeleted: "yes"
    };
    User.findByPk.mockResolvedValueOnce(user);

    await expect(helper(undefined, sign, "realip")).rejects.toThrow("禁止访问");

    expect(Auth.readUserByToken.mock.calls.length).toBe(0);
    expect(Client.findOne.mock.calls.length).toBe(1);
    expect(Client.findOne.mock.calls.pop()).toEqual([
      { where: { key: "this key not found" } }
    ]);

    expect(signer.generator.mock.calls.length).toBe(1);
    expect(signer.generator.mock.calls.pop()).toEqual([
      { timestamp: sign.timestamp, key: sign.key },
      "origin secret"
    ]);

    expect(User.findByPk.mock.calls.length).toBe(1);
    expect(User.findByPk.mock.calls.pop()).toEqual([100000]);
  });

  it("case13, token unset, sign set, succeed", async () => {
    const sign = {
      signature: "this signature",
      timestamp: ((Date.now() / 1000) | 0) - 10,
      key: "this key not found"
    };
    const client = {
      id: 100000,
      name: "Client name",
      status: "enabled",
      userId: 100000,
      secret: "this is secret",
      bindIps: ["ip1", "ip2", "realip"],
      toJSON() {
        return {
          id: 100000,
          name: "Client name"
        };
      }
    };
    aes.decrypt.mockReturnValueOnce("origin secret");
    signer.generator.mockReturnValueOnce("this signature");
    Client.findOne.mockResolvedValueOnce(client);
    const user = {
      id: 100000,
      name: "user name",
      status: "enabled",
      isDeleted: "no",
      toJSON() {
        return {
          id: 100000,
          name: "user name"
        };
      }
    };
    User.findByPk.mockResolvedValueOnce(user);

    const res = await helper(undefined, sign, "realip");
    expect(res).toEqual({
      _id: "user-100000",
      _type: "user",
      client: {
        id: 100000,
        name: "Client name"
      },
      id: 100000,
      name: "user name"
    });

    expect(Auth.readUserByToken.mock.calls.length).toBe(0);
    expect(Client.findOne.mock.calls.length).toBe(1);
    expect(Client.findOne.mock.calls.pop()).toEqual([
      { where: { key: "this key not found" } }
    ]);

    expect(signer.generator.mock.calls.length).toBe(1);
    expect(signer.generator.mock.calls.pop()).toEqual([
      { timestamp: sign.timestamp, key: sign.key },
      "origin secret"
    ]);

    expect(User.findByPk.mock.calls.length).toBe(1);
    expect(User.findByPk.mock.calls.pop()).toEqual([100000]);
  });
});
