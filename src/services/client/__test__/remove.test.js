const Service = require("..");

describe("services.client.remove", () => {
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

  const { remove } = Service(cnf, deps);

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
    const res = await remove(profile, params);
    expect(res).toEqual(undefined);
    expect(rest.remove.mock.calls.length).toBe(1);
    expect(rest.remove.mock.calls.pop()).toEqual([
      { id: 100001, userId: 100001, name: "client name" },
      100000
    ]);
    expect(helper.getOrThrown.mock.calls.length).toBe(2);
    expect(helper.getOrThrown.mock.calls.pop()).toEqual([User, 100001]);
    expect(helper.getOrThrown.mock.calls.pop()).toEqual([Client, 100001]);
  });

  it("case2 isnot admin", async () => {
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
    await expect(remove(profile, params)).rejects.toThrow("禁止访问");
    expect(helper.getOrThrown.mock.calls.length).toBe(2);
    expect(helper.getOrThrown.mock.calls.pop()).toEqual([User, 100001]);
    expect(helper.getOrThrown.mock.calls.pop()).toEqual([Client, 100001]);
  });
});
