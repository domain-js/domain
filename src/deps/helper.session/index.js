function Helper(cnf, deps) {
  const {
    aes: { key: AES_KEY }
  } = cnf;
  const { aes, consts, errors, signer, User, Client, Auth } = deps;

  return async (token, sign, realIp) => {
    if (token) return Auth.readUserByToken(token);

    if (!sign) throw errors.noAuth("未包含授权信息");
    const { signature, ...opt } = sign;

    const timeGapMS = Math.abs(Date.now() - opt.timestamp * 1000);
    if (consts.SIGN_AUTH_TIMESTAMP_MAX_GAP_MS < timeGapMS)
      throw errors.notAllowed(`签名认证 timestamp 不合法: ${opt.timestamp}`);

    const client = await Client.findOne({ where: { key: opt.key } });
    if (!client) throw errors.notAllowed(`签名认证 key 不存在: ${opt.key}`);
    if (client.status !== "enabled")
      throw errors.notAllowed("签名客户端已被禁用");

    if (client.bindIps && client.bindIps.length) {
      if (!client.bindIps.includes(realIp))
        throw errors.notAllowed(`签名认证失败，IP 不被允许: ${realIp}`);
    }

    const secret = aes.decrypt(client.secret, AES_KEY);
    if (!secret) throw errors.notAllowed("签名认证服务端缺少对应的私钥");

    if (signature !== signer.generator(opt, secret))
      throw errors.notAllowed("签名认证失败，signature 不合法");

    const user = await User.findByPk(client.userId);
    if (!user) throw errors.notAllowed("签名认证失败，对应的用户不存在");
    if (user.status !== "enabled")
      throw errors.notAllowed("签名认证失败，对应的用户被禁用");
    if (user.isDeleted !== "no")
      throw errors.notAllowed("签名认证失败，对应的用户被删除");

    const json = user.toJSON();
    json.client = client.toJSON();
    json._type = "user";
    json._id = `user-${json.id}`;

    return json;
  };
}

Helper.Deps = ["aes", "consts", "errors", "User", "Client", "Auth", "signer"];

module.exports = Helper;
