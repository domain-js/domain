const Helper = require("..");
const errors = require("../../../errors");

describe("helpers.get-or-throw", () => {
  const Model = {
    findByPk: jest.fn()
  };

  const helper = Helper({}, { errors });
  it("case1, noraml", async () => {
    const one = {};
    Model.findByPk.mockResolvedValueOnce(one);
    const opt = { include: ["sfasd"] };
    const res = await helper(Model, 20, opt);
    expect(res).toBe(one);

    expect(Model.findByPk.mock.calls.length).toBe(1);
    expect(Model.findByPk.mock.calls.pop()).toEqual([20, opt]);
  });

  it("case2, not-found", async () => {
    const one = null;
    Model.findByPk.mockResolvedValueOnce(one);
    const opt = { include: ["sfasd"] };

    await expect(helper(Model, 20, opt)).rejects.toThrow("不存在");

    expect(Model.findByPk.mock.calls.length).toBe(1);
    expect(Model.findByPk.mock.calls.pop()).toEqual([20, opt]);
  });

  it("case3, isDeleted is yes", async () => {
    const one = {
      isDeleted: "yes"
    };
    Model.findByPk.mockResolvedValueOnce(one);
    const opt = { include: ["sfasd"] };

    await expect(helper(Model, 20, opt)).rejects.toThrow("不存在");

    expect(Model.findByPk.mock.calls.length).toBe(1);
    expect(Model.findByPk.mock.calls.pop()).toEqual([20, opt]);
  });

  it("case4, isDeleted is no", async () => {
    const one = {
      isDeleted: "no"
    };
    Model.findByPk.mockResolvedValueOnce(one);
    const opt = { include: ["sfasd"] };
    const res = await helper(Model, 20, opt);
    expect(res).toBe(one);

    expect(Model.findByPk.mock.calls.length).toBe(1);
    expect(Model.findByPk.mock.calls.pop()).toEqual([20, opt]);
  });

  it("case5, findByPk error", async () => {
    Model.findByPk.mockRejectedValueOnce(Error("查询失败"));
    const opt = { include: ["sfasd"] };
    await expect(helper(Model, 20, opt)).rejects.toThrow("查询失败");

    expect(Model.findByPk.mock.calls.length).toBe(1);
    expect(Model.findByPk.mock.calls.pop()).toEqual([20, opt]);
  });
});
