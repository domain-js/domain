const Service = require("..");

describe("services.user.addClient", () => {
  const cnf = {};
  const session = {
    id: 100000,
    name: "redstone",
    role: "admin",
    status: "enabled"
  };
  const randStr = jest.fn(() => "thisisarandompassword");
  const errors = {
    resourceDuplicateaddClient: jest.fn(m => Error(`已存在: ${m}`)),
    notAllowed: jest.fn(m => Error(`禁止访问: ${m}`))
  };
  const rest = {
    add: jest.fn()
  };
  const helper = {
    session: jest.fn(() => session),
    getOrThrown: jest.fn()
  };
  const payment = {};
  const User = {
    findOne: jest.fn()
  };
  const Client = {
    createOneBefore: jest.fn(() => "RANDOM_SECRET")
  };
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

  const { addClient } = Service(cnf, deps);

  it("case1 noraml", async () => {
    const profile = {
      clientIp: "192.168.4.199",
      key1: "key1",
      key2: "key2"
    };
    const params = {
      userId: 100001,
      name: "Redstone",
      password: "123456",
      role: "admin",
      status: "enabled"
    };
    const client = {
      id: 1000001,
      name: "Redstone",
      toJSON() {
        return { id: 1000001, name: "Redstone" };
      }
    };
    rest.add.mockResolvedValueOnce(client);
    const res = await addClient(profile, params);
    expect(res).toEqual({
      id: 1000001,
      name: "Redstone",
      originSecret: "RANDOM_SECRET"
    });
    expect(helper.getOrThrown.mock.calls.length).toBe(1);
    expect(helper.getOrThrown.mock.calls.pop()).toEqual([User, 100001]);
  });

  it("case2 not admin but not self", async () => {
    const profile = {
      clientIp: "192.168.4.199",
      key1: "key1",
      key2: "key2"
    };
    const params = {
      userId: 100000,
      name: "Redstone",
      password: "__RANDOM__",
      role: "admin",
      status: "enabled"
    };
    helper.session.mockResolvedValueOnce({ ...session, role: "member" });
    helper.getOrThrown.mockResolvedValueOnce({ id: 1000001 });
    await expect(addClient(profile, params)).rejects.toThrow(
      "您只可以给自己添加client"
    );

    expect(helper.getOrThrown.mock.calls.length).toBe(1);
    expect(helper.getOrThrown.mock.calls.pop()).toEqual([User, 100000]);
  });

  it("case3 not admin but isself", async () => {
    const profile = {
      clientIp: "192.168.4.199",
      key1: "key1",
      key2: "key2"
    };
    const params = {
      userId: 100000,
      name: "Redstone",
      password: "__RANDOM__",
      role: "admin",
      status: "enabled"
    };
    helper.session.mockResolvedValueOnce({
      ...session,
      role: "member",
      id: 100000
    });
    helper.getOrThrown.mockResolvedValueOnce({ id: 100000 });
    const client = {
      id: 1000001,
      name: "Redstone",
      toJSON() {
        return { id: 1000001, name: "Redstone" };
      }
    };
    rest.add.mockResolvedValueOnce(client);
    const res = await addClient(profile, params);
    expect(res).toEqual({
      id: 1000001,
      name: "Redstone",
      originSecret: "RANDOM_SECRET"
    });

    expect(helper.getOrThrown.mock.calls.length).toBe(1);
    expect(helper.getOrThrown.mock.calls.pop()).toEqual([User, 100000]);
  });
});
