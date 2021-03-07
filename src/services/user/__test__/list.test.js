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
    session: jest.fn(() => session)
  };
  const payment = {};
  const User = {
    name: "user"
  };
  const Client = {
    name: "client"
  };
  const Order = {
    name: "order"
  };
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

  const { list } = Service(cnf, deps);

  it("case1 noraml", async () => {
    const profile = {
      clientIp: "192.168.4.199",
      key1: "key1",
      key2: "key2"
    };
    const params = { _startIndex: 10, _maxResults: 10 };
    rest.list.mockResolvedValueOnce({ rows: [], count: 0 });
    const res = await list(profile, params);
    expect(res).toEqual({
      rows: [],
      count: 0
    });
    expect(rest.list.mock.calls.length).toBe(1);
    expect(rest.list.mock.calls.pop()).toEqual([User, params]);
  });

  it("case2 not admin notAllowd", async () => {
    const profile = {
      clientIp: "192.168.4.199",
      key1: "key1",
      key2: "key2"
    };
    const params = { _startIndex: 10, _maxResults: 10 };
    helper.session.mockResolvedValueOnce({ ...session, role: "member" });
    await expect(list(profile, params)).rejects.toThrow("禁止访问");
  });
});
