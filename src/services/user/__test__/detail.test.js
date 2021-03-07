const Service = require("..");

describe("services.user.list", () => {
  const cnf = {};
  const session = {
    id: 100000,
    name: "redstone",
    role: "admin",
    status: "enabled"
  };
  const randStr = jest.fn();
  const errors = {
    notAllowed: jest.fn(m => Error(`禁止访问: ${m}`))
  };
  const rest = {
    list: jest.fn()
  };
  const helper = {
    session: jest.fn(() => session),
    getOrThrown: jest.fn()
  };
  const payment = {};
  const User = {};
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

  const { detail } = Service(cnf, deps);

  it("case1 noraml", async () => {
    const profile = {
      clientIp: "192.168.4.199",
      key1: "key1",
      key2: "key2"
    };
    const params = { userId: 100001 };
    helper.getOrThrown.mockResolvedValueOnce({ id: 100001, name: "redstone" });
    expect(await detail(profile, params)).toEqual({
      id: 100001,
      name: "redstone"
    });

    expect(helper.getOrThrown.mock.calls.length).toBe(1);
    expect(helper.getOrThrown.mock.calls.pop()).toEqual([User, 100001]);
  });

  it("case2 not admin notAllowd", async () => {
    const profile = {
      clientIp: "192.168.4.199",
      key1: "key1",
      key2: "key2"
    };
    const params = { userId: 100001 };
    helper.session.mockResolvedValueOnce({ ...session, role: "member" });
    await expect(detail(profile, params)).rejects.toThrow("禁止访问");
  });
});
