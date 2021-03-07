/**
 * @class
 * @return {Services.client} Instance
 */
module.exports = (cnf, deps) => {
  const {
    aes: { key: AES_KEY }
  } = cnf;

  const { aes, errors, rest, helper, User, Client } = deps;

  const preCheck = async ({ token }, id) => {
    const session = await helper.session(token);

    const isAdmin = session.role === "admin";

    const client = await helper.getOrThrown(Client, id);
    const user = await helper.getOrThrown(User, client.userId);

    // 判断是否是管理员或者自己的客户端
    if (!isAdmin) {
      if (session.id !== client.userId)
        throw errors.notAllowed("仅管理员可操作");
    }

    return { client, user, session, isAdmin };
  };

  const detail = async (profile, params) => {
    const { client } = await preCheck(profile, params.clientId);

    return client;
  };

  const modify = async (profile, params) => {
    const { client, isAdmin } = await preCheck(profile, params.clientId);

    if (params.secret) params.secret = aes.encrypt(params.secret, AES_KEY);
    return rest.modify(Client, client, params, isAdmin);
  };

  const remove = async (profile, params) => {
    const { client, session } = await preCheck(profile, params.clientId);

    return rest.remove(client, session.id);
  };

  return {
    detail,
    modify,
    remove
  };
};
