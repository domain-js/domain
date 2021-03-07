const Service = require("..");

describe("services.user.remove", () => {
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
    remove: jest.fn()
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

  const { remove } = Service(cnf, deps);

  it("case1 noraml", async () => {
    const profile = {
      clientIp: "192.168.4.199",
      key1: "key1",
      key2: "key2"
    };
    const params = { userId: 100001, _startIndex: 10, _maxResults: 10 };
    helper.getOrThrown.mockResolvedValueOnce({ id: 100001, name: "redstone" });
    rest.remove.mockResolvedValueOnce({ id: 100001, name: "redstone" });
    const res = await remove(profile, params);
    expect(res).toEqual({
      id: 100001,
      name: "redstone"
    });
    expect(rest.remove.mock.calls.length).toBe(1);
    expect(rest.remove.mock.calls.pop()).toEqual([
      { id: 100001, name: "redstone" },
      100000
    ]);
    expect(helper.getOrThrown.mock.calls.length).toBe(1);
    expect(helper.getOrThrown.mock.calls.pop()).toEqual([User, 100001]);
  });

  it("case2 not admin notAllowd", async () => {
    const profile = {
      clientIp: "192.168.4.199",
      key1: "key1",
      key2: "key2"
    };
    const params = { userId: 100001, _startIndex: 10, _maxResults: 10 };
    helper.session.mockResolvedValueOnce({ ...session, role: "member" });
    await expect(remove(profile, params)).rejects.toThrow("禁止访问");
  });
});
