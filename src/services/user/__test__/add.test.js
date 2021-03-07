const Service = require("..");

describe("services.user.add", () => {
  const cnf = {};
  const session = {
    id: 100000,
    name: "redstone",
    role: "admin",
    status: "enabled"
  };
  const randStr = jest.fn(() => "thisisarandompassword");
  const errors = {
    resourceDuplicateAdd: jest.fn(m => Error(`已存在: ${m}`)),
    notAllowed: jest.fn(m => Error(`禁止访问: ${m}`))
  };
  const rest = {
    add: jest.fn()
  };
  const helper = {
    session: jest.fn(() => session)
  };
  const payment = {};
  const User = {
    resetSecurity: jest.fn(() => "GOOLE_CODE_SECRET"),
    findOne: jest.fn()
  };
  const Client = {};
  const Order = {};
  const deps = {
    U: { randStr },
    errors,
    rest,
    helper,
    payment,
    User,
    Client,
    Order
  };

  const { add } = Service(cnf, deps);

  it("case1 noraml", async () => {
    const profile = {
      clientIp: "192.168.4.199",
      key1: "key1",
      key2: "key2"
    };
    const params = {
      name: "Redstone",
      password: "123456",
      role: "admin",
      status: "enabled"
    };
    const user = {
      id: 1000001,
      name: "Redstone",
      toJSON() {
        return { id: 1000001, name: "Redstone" };
      }
    };
    rest.add.mockResolvedValueOnce(user);
    const res = await add(profile, params);
    expect(res).toEqual({
      id: 1000001,
      name: "Redstone",
      originSecret: "GOOLE_CODE_SECRET"
    });
  });

  it("case2 password is __RANDOM__", async () => {
    const profile = {
      clientIp: "192.168.4.199",
      key1: "key1",
      key2: "key2"
    };
    const params = {
      name: "Redstone",
      password: "__RANDOM__",
      role: "admin",
      status: "enabled"
    };
    const user = {
      id: 1000001,
      name: "Redstone",
      toJSON() {
        return { id: 1000001, name: "Redstone" };
      }
    };
    rest.add.mockResolvedValueOnce(user);
    const res = await add(profile, params);
    expect(res).toEqual({
      id: 1000001,
      name: "Redstone",
      originSecret: "GOOLE_CODE_SECRET",
      originPassword: "thisisarandompassword"
    });
  });

  it("case3 user exists", async () => {
    const profile = {
      clientIp: "192.168.4.199",
      key1: "key1",
      key2: "key2"
    };
    const params = {
      name: "Redstone",
      password: "__RANDOM__",
      role: "admin",
      status: "enabled"
    };
    const user = {
      id: 1000001,
      name: "Redstone",
      toJSON() {
        return { id: 1000001, name: "Redstone" };
      }
    };
    User.findOne.mockResolvedValueOnce(user);
    await expect(add(profile, params)).rejects.toThrow("已存在");
  });

  it("case4 not admin notAllowd", async () => {
    const profile = {
      clientIp: "192.168.4.199",
      key1: "key1",
      key2: "key2"
    };
    const params = {
      name: "Redstone",
      password: "__RANDOM__",
      role: "admin",
      status: "enabled"
    };
    helper.session.mockResolvedValueOnce({ ...session, role: "member" });
    await expect(add(profile, params)).rejects.toThrow("禁止访问");
  });
});
