const Service = require("..");

describe("services.auth.logout", () => {
  const cnf = {};
  const helper = {
    session: jest.fn()
  };
  const Auth = {
    findOne: jest.fn()
  };
  const queue = {
    push: jest.fn()
  };
  const deps = {
    queue,
    helper,
    Auth
  };
  const { remove } = Service(cnf, deps);

  it("case1 noraml", async () => {
    const session = { id: "sessionId " };
    const auth = { id: "authId", destroy: jest.fn() };
    helper.session.mockResolvedValueOnce(session);
    Auth.findOne.mockResolvedValueOnce(auth);

    const res = await remove({ token: "token" });
    expect(res).toBe(true);
    expect(helper.session.mock.calls.length).toBe(1);
    expect(helper.session.mock.calls.pop()).toEqual(["token"]);

    expect(Auth.findOne.mock.calls.length).toBe(1);
    expect(Auth.findOne.mock.calls.pop()[0]).toEqual({
      where: {
        token: "token"
      }
    });

    expect(queue.push.mock.calls.length).toBe(1);
    expect(queue.push.mock.calls.pop()).toEqual([
      { name: "session-destroyed", data: "token" }
    ]);

    expect(auth.destroy.mock.calls.length).toBe(1);
    expect(auth.destroy.mock.calls.pop()).toEqual([]);
  });

  it("case2 auth notfound", async () => {
    const session = { id: "sessionId " };
    helper.session.mockResolvedValueOnce(session);
    Auth.findOne.mockResolvedValueOnce(null);

    const res = await remove({ token: "token" });
    expect(res).toBe(true);
    expect(helper.session.mock.calls.length).toBe(1);
    expect(helper.session.mock.calls.pop()).toEqual(["token"]);

    expect(Auth.findOne.mock.calls.length).toBe(1);
    expect(Auth.findOne.mock.calls.pop()[0]).toEqual({
      where: {
        token: "token"
      }
    });

    expect(queue.push.mock.calls.length).toBe(1);
    expect(queue.push.mock.calls.pop()).toEqual([
      { name: "session-destroyed", data: "token" }
    ]);
  });
});
