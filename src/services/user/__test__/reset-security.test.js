const Service = require("..");

describe("services.user.resetSecurity", () => {
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
    user: {
      login: jest.fn()
    },
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

  const { resetSecurity } = Service(cnf, deps);

  it("case1 noraml", async () => {
    const profile = {
      clientIp: "192.168.4.199",
      key1: "key1",
      key2: "key2"
    };
    const params = {
      origPass: "__orig_pass__",
      password: "__new_password__",
      resetSecret: "yes",
      code: "123456"
    };

    helper.user.login.mockResolvedValueOnce({
      id: 100001,
      name: "redstone"
    });
    User.resetSecurity.mockReturnValueOnce("__new_secret__");
    rest.modify.mockResolvedValueOnce({
      toJSON() {
        return { id: 100001, name: "redstone" };
      }
    });
    const res = await resetSecurity(profile, params);
    expect(res).toEqual({
      id: 100001,
      name: "redstone",
      originSecret: "__new_secret__"
    });
    expect(rest.modify.mock.calls.length).toBe(1);
    expect(rest.modify.mock.calls.pop()).toEqual([
      User,
      {
        id: 100001,
        name: "redstone"
      },
      params
    ]);
    expect(helper.getOrThrown.mock.calls.length).toBe(0);
  });

  it("case2 __RANDOM__", async () => {
    const profile = {
      clientIp: "192.168.4.199",
      key1: "key1",
      key2: "key2"
    };
    const params = {
      origPass: "__orig_pass__",
      password: "__RANDOM__",
      resetSecret: "yes",
      code: "123456"
    };

    randStr.mockReturnValueOnce("this is random password");

    helper.user.login.mockResolvedValueOnce({
      id: 100001,
      name: "redstone"
    });
    User.resetSecurity.mockReturnValueOnce("__new_secret__");
    rest.modify.mockResolvedValueOnce({
      toJSON() {
        return { id: 100001, name: "redstone" };
      }
    });
    const res = await resetSecurity(profile, params);
    expect(res).toEqual({
      id: 100001,
      name: "redstone",
      originSecret: "__new_secret__",
      originPassword: "this is random password"
    });
    expect(rest.modify.mock.calls.length).toBe(1);
    expect(rest.modify.mock.calls.pop()).toEqual([
      User,
      {
        id: 100001,
        name: "redstone"
      },
      params
    ]);
    expect(helper.getOrThrown.mock.calls.length).toBe(0);
  });
});
