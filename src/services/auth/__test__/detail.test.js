const Service = require("..");

describe("services.auth.detail", () => {
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
  const { detail } = Service(cnf, deps);

  it("case1 noraml", async () => {
    const session = { id: "sessionId " };
    helper.session.mockResolvedValueOnce(session);
    const res = await detail({ token: "token" });
    expect(res).toBe(session);
  });
});
