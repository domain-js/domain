const _ = require("lodash");
const U = require("..");

describe("utils", () => {
  describe("lodash", () => {
    it("_.debounce", async () => {
      let count = 0;
      let index = 0;
      let timeAt = 0;
      let calledAt = 0;
      const fn = async (i, time) => {
        await U.sleep(100);
        count += 1;
        index = i;
        timeAt = time;
        calledAt = Date.now();
      };

      const debounced = _.debounce(fn, 500);
      for (let i = 0; i < 200; i += 1) {
        debounced(i, Date.now());
      }
      await U.sleep(1000 * 1);
      expect(count).toBe(1);
      expect(index).toBe(199);
      expect(calledAt).toBeGreaterThanOrEqual(timeAt + 500);
    });
  });

  describe("modifiyURL", () => {
    it("case1", () => {
      const url = "https://xiongfei.me/";
      expect(U.modifiyURL(url, { name: "redstone" })).toBe(
        "https://xiongfei.me/?name=redstone"
      );
    });

    it("case2", () => {
      const url = "https://xiongfei.me/?gender=male";
      expect(U.modifiyURL(url, { name: "redstone" })).toBe(
        "https://xiongfei.me/?gender=male&name=redstone"
      );
    });

    it("case3", () => {
      const url = "https://xiongfei.me/?gender=male#hashname";
      expect(U.modifiyURL(url, { name: "redstone" }, ["gender"])).toBe(
        "https://xiongfei.me/?name=redstone#hashname"
      );
    });

    it("case4", () => {
      const url = "https://xiongfei.me/?gender=male#hashname";
      expect(U.modifiyURL(url, { name: "redstone" }, ["gender", "name"])).toBe(
        "https://xiongfei.me/#hashname"
      );
    });
  });

  describe("sleep", () => {
    it("case1", async () => {
      const now = Date.now();
      await U.sleep(10);
      expect(now + 10 <= Date.now()).toBe(true);
    });
  });

  describe("deepFreeze", () => {
    it("case1", async () => {
      const obj = { hello: "world" };
      const freezed = U.deepFreeze(obj);
      freezed.name = "xxx";

      expect(obj.name).toBe(undefined);
      expect(Object.keys(obj).includes("name")).toBe(false);
    });

    it("case2, deep depth", async () => {
      const obj = { obj: { hello: "world" } };
      U.deepFreeze(obj);
      obj.name = "xxx";
      obj.obj.name = "xxx";

      expect(obj.name).toBe(undefined);
      expect(Object.keys(obj).includes("name")).toBe(false);

      expect(obj.obj.name).toBe(undefined);
      expect(Object.keys(obj.obj).includes("name")).toBe(false);
    });
  });

  describe("tryCatchLog", () => {
    it("case1, noraml", async () => {
      const fn = jest.fn();
      fn.mockResolvedValueOnce(10);

      const log = jest.fn();
      const fn1 = U.tryCatchLog(fn, log);

      const res = await fn1(1, 2, 3);
      expect(res).toBe(10);
      expect(fn.mock.calls.length).toBe(1);
      expect(fn.mock.calls.pop()).toEqual([1, 2, 3]);

      expect(log.mock.calls.length).toBe(0);
    });

    it("case2, unexpect", async () => {
      const fn = jest.fn();
      fn.mockRejectedValueOnce(Error("has error"));

      const log = jest.fn();
      const fn1 = U.tryCatchLog(fn, log);

      await fn1(1, 2, 3);
      expect(fn.mock.calls.length).toBe(1);
      expect(fn.mock.calls.pop()).toEqual([1, 2, 3]);

      expect(log.mock.calls.length).toBe(1);
      expect(log.mock.calls.pop()).toEqual([Error("has error")]);
    });
  });

  describe("randStr", () => {
    it("case1, type defaultValue normal", () => {
      const str = U.randStr(10);
      expect(str.length).toBe(10);
      expect(U.randStr(10)).not.toBe(U.randStr(10));
    });

    it("case2, type is noraml", () => {
      const str = U.randStr(10, "normal");
      expect(str.length).toBe(10);
      expect(U.randStr(10, "noraml")).not.toBe(U.randStr(10, "noraml"));
    });

    it("case3, type is strong", () => {
      const str = U.randStr(10, "strong");
      expect(str.length).toBe(10);
      expect(U.randStr(10, "strong")).not.toBe(U.randStr(10, "strong"));
    });

    it("case4, type is defined by user, pure integer", () => {
      const type = "0123456789";
      const str = U.randStr(10, type);
      expect(str.length).toBe(10);
      expect(/^\d+$/.test(str)).toBe(true);
      expect(U.randStr(10, type)).not.toBe(U.randStr(10, type));
    });
  });

  describe("inExpired", () => {
    it("case1", () => {
      const now = (Date.now() / 1000) | 0;
      expect(U.inExpired(now - 11, 10)).toBe(true);
      expect(U.inExpired(now - 10, 11)).toBe(false);
    });
  });
});
