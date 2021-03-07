/**
 * @class
 * @return {Services.auth} Instance
 */
module.exports = (cnf, deps) => {
  const { errors, queue, helper, Auth } = deps;

  const add = async ({ realIp }, params) => {
    const { name, password, code, deviceId } = params;

    const user = await helper.user.login(realIp, name, password, code);
    if (user.status !== "enabled") throw errors.notAllowed("账号被禁用");
    // 普通用户也可以登录，因此这里不需要判断是否为管理人员

    const auth = await Auth.generate(user, realIp, deviceId);
    await user.increment("loginTimes");
    await user.update(
      { lastSignedAt: new Date() },
      { silent: true, hooks: false }
    );
    const json = user.toJSON ? user.toJSON() : user;
    json.auth = auth.toJSON();
    json.token = json.auth.token;
    json._type = "user";
    json._id = `user-${json.id}`;

    queue.push({ name: "session-changed", data: json });

    return json;
  };

  const remove = async ({ token }) => {
    await helper.session(token);
    const auth = await Auth.findOne({ where: { token } });
    if (auth) await auth.destroy();
    // 发送session销毁消息
    queue.push({ name: "session-destroyed", data: token });
    return true;
  };

  const detail = async ({ token }) => helper.session(token);

  return { detail, add, remove };
};
