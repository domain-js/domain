const otplib = require("otplib");

function Helper(cnf, deps) {
  const {
    aes: { key: AES_KEY }
  } = cnf;
  const {
    U: { inExpired },
    counter,
    hash,
    consts,
    aes,
    errors,
    User
  } = deps;

  const googleAuthCheck = (user, code) => {
    const secret = aes.decrypt(user.secret, AES_KEY);
    if (!otplib.authenticator.check(code, secret)) {
      throw errors.googleAuthCodeError(code);
    }
  };

  const _login = async (realIp, name, password, code) => {
    const user = await User.findOne({ where: { name } });
    if (!user) throw errors.loginNameOrPassword();

    if (user.password !== User.password(password, user.salt)) {
      throw errors.loginNameOrPassword();
    }

    googleAuthCheck(user, code);

    return user;
  };

  const login = async (realIp, name, password, code) => {
    const key = `user-login-error-timers-${realIp}`;

    if (consts.LOGIN_ERROR_TIMES_MAX <= (await counter.get(key))) {
      const lockedAt = (await hash.get(key)) | 0;
      if (lockedAt) {
        if (!inExpired(lockedAt, consts.LOGIN_ERROR_LOCK_IP_SECONDS)) {
          throw errors.loginLockByIP();
        }
        await hash.del(key);
        await counter.set(key, 0);
      }
    }

    try {
      const user = await _login(realIp, name, password, code);
      return user;
    } catch (e) {
      await counter.incr(key);
      await hash.set(key, (Date.now() / 1000) | 0);
      throw e;
    }
  };

  return { login, googleAuthCheck };
}

Helper.Deps = ["utils", "User", "counter", "consts", "hash", "aes", "errors"];

module.exports = Helper;
