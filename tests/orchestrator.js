import retry from "async-retry";
import { faker } from "@faker-js/faker";
import database from "infra/database";
import migrator from "models/migrator";
import user from "models/user.js";
import session from "models/session.js";
async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fecthStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fecthStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");
      if (response.status != 200) {
        throw Error();
      }
    }
  }
}
async function claerDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

async function runPeddingMigrations() {
  await migrator.runPendingMigrations();
}
async function createUser(userObject) {
  return await user.create({
    username:
      userObject.username || faker.internet.username().replace(/[_.-]/g, ""),
    email: userObject.email || faker.internet.email(),
    password: userObject.password || "validPassword",
  });
}

async function createSession(userId) {
  return await session.create(userId);
}

const orch = {
  waitForAllServices,
  claerDatabase,
  runPeddingMigrations,
  createUser,
  createSession,
};

export default orch;
