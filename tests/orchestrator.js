import retry from "async-retry";
import { faker } from "@faker-js/faker";
import database from "infra/database";
import migrator from "models/migrator";
import user from "models/user.js";
import session from "models/session.js";
import activantion from "models/activantion";

const emailHttpUrl = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

async function waitForAllServices() {
  await waitForWebServer();
  await waitForEmailServer();

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

  async function waitForEmailServer() {
    return retry(fecthEmailPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fecthEmailPage() {
      const response = await fetch(emailHttpUrl);
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

async function deleteAllEmail() {
  await fetch(
    `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}/messages`,
    {
      method: "DELETE",
    },
  );
}

async function getLastEmail() {
  const emailListResponse = await fetch(`${emailHttpUrl}/messages`);
  const emailListBody = await emailListResponse.json();
  const lastEmailItem = emailListBody.pop();

  if (!lastEmailItem) {
    return null;
  }

  const emailTextReponse = await fetch(
    `${emailHttpUrl}/messages/${lastEmailItem.id}.plain`,
  );
  const emailTextBody = await emailTextReponse.text();
  lastEmailItem.text = emailTextBody;
  return lastEmailItem;
}

async function extractToken(text) {
  const tokenMatch = text.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}/gi,
  );
  return tokenMatch ? tokenMatch[0] : null;
}

async function activeUser(inactiveUser) {
  return await activantion.activateUserById(inactiveUser.id);
}

async function addFeatureToUser(userObject, features) {
  const updatedUser = await user.addFeatures(userObject.id, features);
  return updatedUser;
}

const orch = {
  waitForAllServices,
  claerDatabase,
  runPeddingMigrations,
  createUser,
  createSession,
  deleteAllEmail,
  getLastEmail,
  extractToken,
  activeUser,
  addFeatureToUser,
};

export default orch;
