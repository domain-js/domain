const { git } = require("../../../package");

function Home() {
  const startAt = new Date();
  const index = (profile, params) => ({
    name: "I am open-domain layer",
    startAt,
    now: new Date(),
    git,
    profile,
    params
  });

  return { index };
}

module.exports = Home;
