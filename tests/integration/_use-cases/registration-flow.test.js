import activantion from "models/activantion";
import user from "models/user.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.claerDatabase();
  await orchestrator.runPeddingMigrations();
  await orchestrator.deleteAllEmail();
});

describe("Use case: Registration Flow(all seccessful)", () => {
  let createUserResponseBody;
  let activantionTokenId;
  let createSessionResponseBody;
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
      features: ["read:activation_token"],
      created_at: createUserResponseBody.created_at,
      updated_at: createUserResponseBody.updated_at,
    });
  });

  test("Receive activation email", async () => {
    const lastEmail = await orchestrator.getLastEmail();
    activantionTokenId = await orchestrator.extractToken(lastEmail.text);

    const activantionTokenObject =
      await activantion.finOneById(activantionTokenId);

    expect(lastEmail.sender).toBe("<contato@gmail.com>");
    expect(lastEmail.recipients[0]).toBe("<filipe@gmail.com>");
    expect(lastEmail.subject).toBe("Ative seu cadastro no Fintab!");
    expect(lastEmail.text).toContain("filipecinque");
    expect(activantionTokenObject.user_id).toBe(createUserResponseBody.id);
    expect(activantionTokenObject.used_at).toBe(null);
  });

  test("Activate account", async () => {
    const response = await fetch(
      `http://localhost:3000/api/v1/activantions/${activantionTokenId}`,
      {
        method: "PATCH",
      },
    );
    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(Date.parse(responseBody.used_at)).not.toBeNaN();

    const activatedUser = await user.findOneByUsername("filipecinque");
    expect(activatedUser.features).toEqual([
      "create:session",
      "read:session",
      "update:user",
    ]);
  });

  test("login", async () => {
    const response = await fetch("http://localhost:3000/api/v1/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "filipe@gmail.com",
        password: "senha123",
      }),
    });
    expect(response.status).toBe(201);

    createSessionResponseBody = await response.json();
    expect(createSessionResponseBody.user_id).toEqual(
      createUserResponseBody.id,
    );
  });

  test("Get user activation", async () => {
    const response = await fetch("http://localhost:3000/api/v1/user", {
      headers: {
        Cookie: `session_id=${createSessionResponseBody.token}`,
      },
    });
    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.id).toEqual(createUserResponseBody.id);
  });
});
