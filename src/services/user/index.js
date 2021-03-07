const _ = require("lodash");

/**
 * @class
 * @return {Services.user} Instance
 */
module.exports = (cnf, deps) => {
  const {
    U: { randStr },
    errors,
    rest,
    helper,
    payment,
    User,
    Client,
    Order,
  } = deps;

  const _check = async ({ token }, id, memberAllowed = false) => {
    const session = await helper.session(token);
    const ret = { session };
    ret.isAdmin = session.role === "admin";

    if (!ret.isAdmin && !memberAllowed) throw errors.notAllowed("无权操作");

    if (id) ret.user = await helper.getOrThrown(User, id);

    return ret;
  };

  const add = async ({ clientIp, ...profile }, params) => {
    const { session, isAdmin } = await _check(profile);

    let originPassword;
    if (params.password === "__RANDOM__") {
      params.password = randStr(16);
      originPassword = params.password;
    }
    const secret = User.resetSecurity(params, true);

    const exists = await User.findOne({ where: { name: params.name } });
    if (exists) throw errors.resourceDuplicateAdd(`user: ${params.name}`);
    const user = await rest.add(User, params, isAdmin, null, {
      userId: session.id,
      clientIp,
    });

    const json = user.toJSON();
    json.originSecret = secret;
    if (originPassword) {
      json.originPassword = originPassword;
    }

    return json;
  };

  const list = async (profile, params) => {
    await _check(profile);

    return rest.list(User, params);
  };

  const detail = async (profile, params) => {
    const { user } = await _check(profile, params.userId);

    return user;
  };

  const modify = async (profile, params) => {
    const { isAdmin, user } = await _check(profile, params.userId);

    let originPassword;
    if (params.password === "__RANDOM__") {
      params.password = randStr(16);
      originPassword = params.password;
    }
    const secret = User.resetSecurity(params, params.resetSecret === "yes");

    const res = await rest.modify(User, user, params, isAdmin);
    const json = res.toJSON();
    if (originPassword) {
      json.originPassword = originPassword;
    }
    json.originSecret = secret;

    return json;
  };

  const resetSecurity = async (profile, params) => {
    const { token, realIp } = profile;
    const { origPass, code } = params;
    const session = await helper.session(token);

    const user = await helper.user.login(realIp, session.name, origPass, code);

    let originPassword;
    if (params.password === "__RANDOM__") {
      params.password = randStr(16);
      originPassword = params.password;
    }
    const secret = User.resetSecurity(params, params.resetSecret === "yes");

    const res = await rest.modify(User, user, params);
    const json = res.toJSON();
    if (originPassword) {
      json.originPassword = originPassword;
    }
    json.originSecret = secret;

    return json;
  };

  const remove = async (profile, params) => {
    const { user, session } = await _check(profile, params.userId);

    return rest.remove(user, session.id);
  };

  /** 添加个人签名授权客户端 */
  const addClient = async (profile, params) => {
    const { session, user, isAdmin } = await _check(profile, params.userId, true);

    const { clientIp } = profile;

    if (!isAdmin) {
      if (session.id !== user.id) throw errors.notAllowed("您只可以给自己添加client");
    }

    const secret = Client.createOneBefore(params);

    // 调用通用的add方法
    const client = await rest.add(Client, params, isAdmin, null, {
      userId: session.id,
      clientIp,
    });

    const json = client.toJSON();
    json.originSecret = secret;

    return json;
  };

  /** 个人签名授权客户端列表查询 */
  const clients = async (profile, params) => {
    const { session } = await _check(profile, params.userId, true);

    if (session.role === "member") {
      params.userId = session.id;
    }

    // 调用通用的 list 方法
    return rest.list(Client, params);
  };

  return {
    add,
    list,
    detail,
    modify,
    resetSecurity,
    remove,
    addClient,
    clients,
  };
};
