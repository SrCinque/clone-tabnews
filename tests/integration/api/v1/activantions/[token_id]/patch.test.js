import activantion from "models/activantion";
import user from "models/user.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.claerDatabase();
  await orchestrator.runPeddingMigrations();
  await orchestrator.deleteAllEmail();
});

describe("PACTH tests for /api/v1/activantions/[token_id]", () => {});
