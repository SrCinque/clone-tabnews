import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import user from "models/user.js";
import password from "models/password.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.claerDatabase();
  await orchestrator.runPeddingMigrations();
});

describe("POST to api/v1/users", () => {
  describe("Anonymus user", () => {
    test("with unique and valid data", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "filipecinque",
          email: "filipe@gmail.com",
          password: "senha123",
        }),
      });
      expect(response.status).toBe(201);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "filipecinque",
        email: "filipe@gmail.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const userInDatabase = await user.findOneByUsername("filipecinque");
      const correctPassswordMatch = await password.compare(
        "senha123",
        userInDatabase.password,
      );

      const inCorrectPAssswordMatch = await password.compare(
        "SenhaErrada",
        userInDatabase.password,
      );
      expect(correctPassswordMatch).toBe(true);
      expect(inCorrectPAssswordMatch).toBe(false);
    });

    test("with duplicated 'email'", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "emailDuplicado1",
          email: "email_duplicado@gmail.com",
          password: "senha123",
        }),
      });
      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "emailDuplicado2",
          email: "Email_duplicado@gmail.com",
          password: "senha123",
        }),
      });
      expect(response2.status).toBe(400);

      const responseBody2 = await response2.json();
      expect(responseBody2).toEqual({
        name: "ValidationError",
        message: "Email já cadastrado",
        action: "Utilize outro email para realizar está operação",
        status_code: 400,
      });
    });

    test("with duplicated 'username'", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "UserNameDuplicado",
          email: "email1@gmail.com",
          password: "senha123",
        }),
      });
      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "UserNameDuplicado",
          email: "email2@gmail.com",
          password: "senha123",
        }),
      });
      expect(response2.status).toBe(400);

      const responseBody2 = await response2.json();
      expect(responseBody2).toEqual({
        name: "ValidationError",
        message: "Username já cadastrado",
        action: "Atualize os dados enviados e tente novamente.",
        status_code: 400,
      });
    });
  });
});
