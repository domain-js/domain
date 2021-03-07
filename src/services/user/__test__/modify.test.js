const Service = require("..");

describe("services.user.modify", () => {
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
    modify: jest.fn()
  };
  const helper = {
    session: jest.fn(() => session),
    getOrThrown: jest.fn()
  };
  const payment = {};
  const User = {
    resetSecurity: jest.fn()
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

  const { modify } = Service(cnf, deps);

  it("case1 noraml", async () => {
    const profile = {
      clientIp: "192.168.4.199",
      key1: "key1",
      key2: "key2"
    };
    const params = { userId: 100001, _startIndex: 10, _maxResults: 10 };
    helper.getOrThrown.mockResolvedValueOnce({
      id: 100001,
      name: "redstone"
    });
    rest.modify.mockResolvedValueOnce({
      toJSON() {
        return { id: 100001, name: "redstone" };
      }
    });
    const res = await modify(profile, params);
    expect(res).toEqual({
      id: 100001,
      name: "redstone"
    });
    expect(rest.modify.mock.calls.length).toBe(1);
    expect(rest.modify.mock.calls.pop()).toEqual([
      User,
      { id: 100001, name: "redstone" },
      params,
      true
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
    await expect(modify(profile, params)).rejects.toThrow("禁止访问");
  });

  it("case3 __RANDOM__", async () => {
    const profile = {
      clientIp: "192.168.4.199",
      key1: "key1",
      key2: "key2"
    };
    randStr.mockReturnValueOnce("This is a string with random");
    const params = {
      password: "__RANDOM__",
      userId: 100001,
      _startIndex: 10,
      _maxResults: 10
    };
    helper.getOrThrown.mockResolvedValueOnce({
      id: 100001,
      name: "redstone"
    });
    rest.modify.mockResolvedValueOnce({
      toJSON() {
        return { id: 100001, name: "redstone" };
      }
    });
    const res = await modify(profile, params);
    expect(res).toEqual({
      id: 100001,
      name: "redstone",
      originPassword: "This is a string with random"
    });
    expect(randStr.mock.calls.length).toBe(1);
    expect(randStr.mock.calls.pop()).toEqual([16]);
    expect(rest.modify.mock.calls.length).toBe(1);
    expect(rest.modify.mock.calls.pop()).toEqual([
      User,
      { id: 100001, name: "redstone" },
      params,
      true
    ]);
    expect(helper.getOrThrown.mock.calls.length).toBe(1);
    expect(helper.getOrThrown.mock.calls.pop()).toEqual([User, 100001]);
  });
});
