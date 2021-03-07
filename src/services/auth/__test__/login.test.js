const Service = require("..");

describe("services.auth.login", () => {
  const cnf = {};
  const helper = {
    user: {
      login: jest.fn()
    }
  };
  const Auth = {
    generate: jest.fn()
  };
  const queue = {
    push: jest.fn()
  };
  const deps = {
    errors: {
      notAllowed: jest.fn(m => Error(`禁止访问: ${m}`))
    },
    queue,
    helper,
    Auth
  };
  const { add } = Service(cnf, deps);

  it("case1 noraml", async () => {
    const user = {
      id: 10000,
      status: "enabled",
      role: "admin",
      increment: jest.fn(),
      update: jest.fn(),
      toJSON() {
        return {
          id: 10000,
          status: "enabled",
          role: "admin"
        };
      }
    };
    const auth = { toJSON: () => ({ id: "authId" }) };
    helper.user.login.mockResolvedValueOnce(user);
    Auth.generate.mockResolvedValueOnce(auth);
    const params = {
      name: "Redstone",
      password: "passwd",
      code: "123456",
      deviceId: "myphone"
    };

    const res = await add({ realIp: "192.168.199.123" }, params);
    expect(res).toEqual({
      id: 10000,
      status: "enabled",
      role: "admin",
      auth: { id: "authId" },
      _type: "user",
      _id: "user-10000"
    });
  });

  it("case2 status isnt enabled", async () => {
    const user = {
      id: 10000,
      status: "disabled",
      role: "admin",
      increment: jest.fn(),
      update: jest.fn()
    };
    helper.user.login.mockResolvedValueOnce(user);
    const params = {
      name: "Redstone",
      password: "passwd",
      code: "123456",
      deviceId: "myphone"
    };

    await expect(add({ realIp: "192.168.199.123" }, params)).rejects.toThrow(
      "账号被禁用"
    );
  });

  it("case3 role isnt admin", async () => {
    const user = {
      id: 10000,
      status: "enabled",
      role: "member",
      increment: jest.fn(),
      update: jest.fn(),
      toJSON() {
        return {
          id: 10000,
          status: "enabled",
          role: "member"
        };
      }
    };
    helper.user.login.mockResolvedValueOnce(user);
    const auth = { toJSON: () => ({ id: "authId" }) };
    Auth.generate.mockResolvedValueOnce(auth);
    const params = {
      name: "Redstone",
      password: "passwd",
      code: "123456",
      deviceId: "myphone"
    };

    const res = await add({ realIp: "192.168.199.123" }, params);
    expect(res).toEqual({
      id: 10000,
      status: "enabled",
      role: "member",
      auth: { id: "authId" },
      _type: "user",
      _id: "user-10000"
    });
  });

  it("case3 noraml, user.toJSON non-exists", async () => {
    const user = {
      id: 10000,
      status: "enabled",
      role: "admin",
      increment: jest.fn(),
      update: jest.fn()
    };
    const auth = { toJSON: () => ({ id: "authId" }) };
    helper.user.login.mockResolvedValueOnce(user);
    Auth.generate.mockResolvedValueOnce(auth);
    const params = {
      name: "Redstone",
      password: "passwd",
      code: "123456",
      deviceId: "myphone"
    };

    const res = await add({ realIp: "192.168.199.123" }, params);
    expect(res).toMatchObject({
      id: 10000,
      status: "enabled",
      role: "admin",
      auth: { id: "authId" },
      _type: "user",
      _id: "user-10000"
    });
  });
});
