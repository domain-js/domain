const Helper = (cnf, deps) => {
  const { errors } = deps;

  return async (Model, id, opt, error) => {
    const one = await Model.findByPk(id, opt);
    if (!one || one.isDeleted === "yes")
      throw error || errors.notFound(Model.name, id);

    return one;
  };
};

Helper.Deps = ["errors"];

module.exports = Helper;
