const dict = {
  // 记录登录信息，所有各种身份的登录都记录于此，不用担心互相冲突
  // token 是很长的随机字符串，不会冲撞在一起
  // 这么做的好处是可以简化session的处理
  // 不同种类用户通过属性 _type 来区别对待
  token: token => `LoginToken: ${token}`
};

const key = name => {
  const fn = dict[name];
  if (!fn) throw Error(`Key function non-exists: ${name}`);

  return fn;
};

function Caching(cnf, deps) {
  const { consts, cache, listener, Auth } = deps;

  // 不管什么登陆成功，都可以同样处理，因为token不可能相同
  listener.add("session-changed", async user => {
    const life = consts.SESSION_CACHE_LIFE || 1800;
    await cache.set(key("token")(user.token), JSON.stringify(user), life);
  });

  // 销毁登录信息的cache
  listener.add("session-destroyed", async token => {
    await cache.del(key("token")(token));
  });

  Auth.readUserByToken = cache.caching(
    Auth.readUserByToken,
    consts.SESSION_CACHE_LIFE || 1800,
    key("token")
  );

  return { key };
}

Caching.Deps = ["cache", "listener", "Auth", "consts"];

module.exports = Caching;
