const otplib = require("otplib");
const Helper = require("..");
const errors = require("../../../errors");

describe("helpers.user.login", () => {
  otplib.authenticator.check = jest.fn();
  const cnf = {
    aes: { key: "AES_KEY" }
  };
  const aes = {
    decrypt: jest.fn()
  };
  const consts = {
    LOGIN_ERROR_TIMES_MAX: 3,
    LOGIN_ERROR_LOCK_IP_SECONDS: 30 * 60
  };
  const User = { type: "user", findOne: jest.fn(), password: jest.fn() };
  const counter = {
    get: jest.fn(),
    set: jest.fn(),
    incr: jest.fn()
  };
  const hash = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn()
  };

  const inExpired = jest.fn(false);
  const deps = {
    U: { inExpired },
    counter,
    hash,
    consts,
    aes,
    errors,
    User
  };
  const { login } = Helper(cnf, deps);
  it("case1, login error times too much, lock ip expired", async () => {
    counter.get.mockResolvedValueOnce(20);
    hash.get.mockResolvedValueOnce((Date.now() / 1000) | 0);
    await expect(
      login("realip", "redstone", "password_md5", "666666")
    ).rejects.toThrow("登录被锁定");

    expect(counter.get.mock.calls.length).toBe(1);
    expect(counter.get.mock.calls.pop()).toEqual([
      "user-login-error-timers-realip"
    ]);

    expect(hash.get.mock.calls.length).toBe(1);
    expect(hash.get.mock.calls.pop()).toEqual([
      "user-login-error-timers-realip"
    ]);
  });

  it("case2, login error times too much, lock ip inExpired, user not found", async () => {
    counter.get.mockResolvedValueOnce(20);
    hash.get.mockResolvedValueOnce(Date.now() / 1000 - 9000);
    inExpired.mockReturnValueOnce(true);
    await expect(
      login("realip", "redstone", "password_md5", "666666")
    ).rejects.toThrow("登录用户名或密码错误");

    expect(counter.get.mock.calls.length).toBe(1);
    expect(counter.get.mock.calls.pop()).toEqual([
      "user-login-error-timers-realip"
    ]);

    expect(hash.get.mock.calls.length).toBe(1);
    expect(hash.get.mock.calls.pop()).toEqual([
      "user-login-error-timers-realip"
    ]);

    expect(hash.del.mock.calls.length).toBe(1);
    expect(hash.del.mock.calls.pop()).toEqual([
      "user-login-error-timers-realip"
    ]);
    expect(counter.set.mock.calls.length).toBe(1);
    expect(counter.set.mock.calls.pop()).toEqual([
      "user-login-error-timers-realip",
      0
    ]);
  });

  it("case3, login error times too much, lock ip inExpired, user not found", async () => {
    counter.get.mockResolvedValueOnce(20);
    inExpired.mockReturnValueOnce(true);
    await expect(
      login("realip", "redstone", "password_md5", "666666")
    ).rejects.toThrow("登录用户名或密码错误");

    expect(counter.get.mock.calls.length).toBe(1);
    expect(counter.get.mock.calls.pop()).toEqual([
      "user-login-error-timers-realip"
    ]);

    expect(hash.get.mock.calls.length).toBe(1);
    expect(hash.get.mock.calls.pop()).toEqual([
      "user-login-error-timers-realip"
    ]);

    expect(hash.del.mock.calls.length).toBe(0);
    expect(counter.set.mock.calls.length).toBe(0);
  });

  it("case4, login error user not found", async () => {
    counter.get.mockResolvedValueOnce(0);
    inExpired.mockReturnValueOnce(true);
    await expect(
      login("realip", "redstone", "password_md5", "666666")
    ).rejects.toThrow("登录用户名或密码错误");

    expect(counter.get.mock.calls.length).toBe(1);
    expect(counter.get.mock.calls.pop()).toEqual([
      "user-login-error-timers-realip"
    ]);

    expect(hash.get.mock.calls.length).toBe(0);
    expect(hash.del.mock.calls.length).toBe(0);
    expect(counter.set.mock.calls.length).toBe(0);
  });

  it("case5, login error user exists but password umatched", async () => {
    const user = {
      id: 100000,
      name: "user name",
      password: "password_md5_salt",
      salt: "salt"
    };
    counter.get.mockResolvedValueOnce(0);
    inExpired.mockReturnValueOnce(true);
    User.findOne.mockResolvedValueOnce(user);
    await expect(
      login("realip", "redstone", "password_md5", "666666")
    ).rejects.toThrow("登录用户名或密码错误");

    expect(counter.get.mock.calls.length).toBe(1);
    expect(counter.get.mock.calls.pop()).toEqual([
      "user-login-error-timers-realip"
    ]);

    expect(hash.get.mock.calls.length).toBe(0);
    expect(hash.del.mock.calls.length).toBe(0);
    expect(counter.set.mock.calls.length).toBe(0);
  });

  it("case6, login error user exists password matched, googleAuthCheck faild", async () => {
    const user = {
      id: 100000,
      name: "user name",
      password: "password_md5_salt",
      secret: "secret",
      salt: "salt"
    };
    counter.get.mockResolvedValueOnce(0);
    inExpired.mockReturnValueOnce(true);
    User.findOne.mockResolvedValueOnce(user);
    User.password.mockReturnValueOnce("password_md5_salt");
    otplib.authenticator.check.mockReturnValueOnce(false);

    await expect(
      login("realip", "redstone", "password_md5", "666666")
    ).rejects.toThrow("Google 身份验证码错误");

    expect(counter.get.mock.calls.length).toBe(1);
    expect(counter.get.mock.calls.pop()).toEqual([
      "user-login-error-timers-realip"
    ]);

    expect(hash.get.mock.calls.length).toBe(0);
    expect(hash.del.mock.calls.length).toBe(0);
    expect(counter.set.mock.calls.length).toBe(0);

    expect(aes.decrypt.mock.calls.length).toBe(1);
    expect(aes.decrypt.mock.calls.pop()).toEqual(["secret", "AES_KEY"]);
  });

  it("case7, login error user exists password matched, googleAuthCheck faild", async () => {
    const user = {
      id: 100000,
      name: "user name",
      password: "password_md5_salt",
      secret: "secret",
      salt: "salt"
    };
    counter.get.mockResolvedValueOnce(0);
    inExpired.mockReturnValueOnce(true);
    User.findOne.mockResolvedValueOnce(user);
    User.password.mockReturnValueOnce("password_md5_salt");
    otplib.authenticator.check.mockReturnValueOnce(true);

    const res = await login("realip", "redstone", "password_md5", "666666");
    expect(res).toEqual({
      id: 100000,
      name: "user name",
      password: "password_md5_salt",
      secret: "secret",
      salt: "salt"
    });

    expect(counter.get.mock.calls.length).toBe(1);
    expect(counter.get.mock.calls.pop()).toEqual([
      "user-login-error-timers-realip"
    ]);

    expect(hash.get.mock.calls.length).toBe(0);
    expect(hash.del.mock.calls.length).toBe(0);
    expect(counter.set.mock.calls.length).toBe(0);

    expect(aes.decrypt.mock.calls.length).toBe(1);
    expect(aes.decrypt.mock.calls.pop()).toEqual(["secret", "AES_KEY"]);
  });
});
