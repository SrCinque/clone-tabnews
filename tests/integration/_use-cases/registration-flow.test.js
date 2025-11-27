import activantion from "models/activantion";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.claerDatabase();
  await orchestrator.runPeddingMigrations();
  await orchestrator.deleteAllEmail();
});

describe("Use case: Registration Flow(all seccessful)", () => {
  let createUserResponseBody;
  test("Create user account", async () => {
    const createUserResponse = await fetch(
      "http://localhost:3000/api/v1/users",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "filipecinque",
          email: "filipe@gmail.com",
          password: "senha123",
        }),
      },
    );

    expect(createUserResponse.status).toBe(201);

    createUserResponseBody = await createUserResponse.json();
    expect(createUserResponseBody).toEqual({
      id: createUserResponseBody.id,
      username: "filipecinque",
      email: "filipe@gmail.com",
      features: ["read:activation_token"],
      password: createUserResponseBody.password,
      created_at: createUserResponseBody.created_at,
      updated_at: createUserResponseBody.updated_at,
    });
  });

  test("Receive activation email", async () => {
    const lastEmail = await orchestrator.getLastEmail();
    const activantionToken = await activantion.finOneByUserId(
      createUserResponseBody.id,
    );

    expect(lastEmail.sender).toBe("<contato@gmail.com>");
    expect(lastEmail.recipients[0]).toBe("<filipe@gmail.com>");
    expect(lastEmail.subject).toBe("Ative seu cadastro no Fintab!");
    expect(lastEmail.text).toContain("filipecinque");
    expect(lastEmail.text).toContain(activantionToken.id);
  });

  test("Activate account", async () => {});

  test("login", async () => {});

  test("Get user activation", async () => {});
});
