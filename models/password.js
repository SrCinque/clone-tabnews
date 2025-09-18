import bcrypt from "bcryptjs";

async function hash(password) {
  const rounds = getNumberOfRounds();
  return await bcrypt.hash(password, rounds);
}

async function compare(providerPassord, storedPassword) {
  return await bcrypt.compare(providerPassord, storedPassword);
}

function getNumberOfRounds() {
  let rounds = 1;
  if (process.env.NODE_ENV === "production") {
    rounds = 10;
  }

  return rounds;
}

const password = { hash, compare };

export default password;
