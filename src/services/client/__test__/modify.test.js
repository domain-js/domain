const Service = require("..");

describe("services.client.modify", () => {
  const cnf = {
    aes: { key: "AES_KEY" }
  };
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
  const User = {};
  const Client = {};
  const Order = {};
  const deps = {
    U: { randStr },
    aes: {
      encrypt: jest.fn(x => `${x} encrypted`)
    },
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
    const params = { clientId: 100001, _startIndex: 10, _maxResults: 10 };
    helper.getOrThrown
      .mockResolvedValueOnce({
        id: 100001,
        name: "client name",
        userId: 100001
      })
      .mockResolvedValueOnce({ id: 100001, name: "user name" });
    rest.modify.mockResolvedValueOnce({
      id: 100001,
      name: "client name",
      userId: 100001
    });
    const res = await modify(profile, params);
    expect(res).toEqual({
      id: 100001,
      name: "client name",
      userId: 100001
    });
    expect(rest.modify.mock.calls.length).toBe(1);
    expect(rest.modify.mock.calls.pop()).toEqual([
      Client,
      { id: 100001, userId: 100001, name: "client name" },
      params,
      true
    ]);
    expect(helper.getOrThrown.mock.calls.length).toBe(2);
    expect(helper.getOrThrown.mock.calls.pop()).toEqual([User, 100001]);
    expect(helper.getOrThrown.mock.calls.pop()).toEqual([Client, 100001]);
  });

  it("case2 secret isset", async () => {
    const profile = {
      clientIp: "192.168.4.199",
      key1: "key1",
      key2: "key2"
    };
    const params = { clientId: 100001, secret: "NEW_SECRET" };
    helper.getOrThrown
      .mockResolvedValueOnce({
        id: 100001,
        name: "client name",
        userId: 100001
      })
      .mockResolvedValueOnce({ id: 100001, name: "user name" });
    rest.modify.mockResolvedValueOnce({
      id: 100001,
      name: "client name",
      userId: 100001
    });
    const res = await modify(profile, params);
    expect(res).toEqual({
      id: 100001,
      name: "client name",
      userId: 100001
    });
    expect(rest.modify.mock.calls.length).toBe(1);
    expect(rest.modify.mock.calls.pop()).toEqual([
      Client,
      { id: 100001, userId: 100001, name: "client name" },
      params,
      true
    ]);
    expect(params.secret).toBe("NEW_SECRET encrypted");
    expect(helper.getOrThrown.mock.calls.length).toBe(2);
    expect(helper.getOrThrown.mock.calls.pop()).toEqual([User, 100001]);
    expect(helper.getOrThrown.mock.calls.pop()).toEqual([Client, 100001]);
  });

  it("case3 isnot admin", async () => {
    const profile = {
      clientIp: "192.168.4.199",
      key1: "key1",
      key2: "key2"
    };
    const params = { clientId: 100001, _startIndex: 10, _maxResults: 10 };
    helper.getOrThrown
      .mockResolvedValueOnce({
        id: 100001,
        name: "client name",
        userId: 100001
      })
      .mockResolvedValueOnce({ id: 100001, name: "user name" });
    helper.session.mockResolvedValueOnce({ ...session, role: "member" });
    await expect(modify(profile, params)).rejects.toThrow("禁止访问");
    expect(helper.getOrThrown.mock.calls.length).toBe(2);
    expect(helper.getOrThrown.mock.calls.pop()).toEqual([User, 100001]);
    expect(helper.getOrThrown.mock.calls.pop()).toEqual([Client, 100001]);
  });

  it("case4 isnot admin, bus self", async () => {
    const profile = {
      clientIp: "192.168.4.199",
      key1: "key1",
      key2: "key2"
    };
    const params = { clientId: 100001, _startIndex: 10, _maxResults: 10 };
    helper.getOrThrown
      .mockResolvedValueOnce({
        id: 100001,
        name: "client name",
        userId: 100001
      })
      .mockResolvedValueOnce({ id: 100001, name: "user name" });
    helper.session.mockResolvedValueOnce({
      ...session,
      role: "member",
      id: 100001
    });
    await modify(profile, params);
    expect(helper.getOrThrown.mock.calls.length).toBe(2);
    expect(helper.getOrThrown.mock.calls.pop()).toEqual([User, 100001]);
    expect(helper.getOrThrown.mock.calls.pop()).toEqual([Client, 100001]);
  });
});
