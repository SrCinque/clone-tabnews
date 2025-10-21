import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.claerDatabase();
  await orchestrator.runPeddingMigrations();
});

describe("POST to api/v1/sessions", () => {
  describe("Anonymous user", () => {
    test("with incorrect `email` but correct `password`", async () => {
      await orchestrator.createUser({
        //username: "validUser",
        //email: ""
        password: "senha-correta",
      });

      const response1 = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "email.errado@gmail.com",
          password: "senha123",
        }),
      });
      expect(response1.status).toBe(401);
      const responseBody = await response1.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação não conferem.",
        action: "Verifique os dados e tente novamente.",
        status_code: 401,
      });
    });

    test("with correct `email` but incorrect `password`", async () => {
      await orchestrator.createUser({
        //username: "validUser",
        email: "email.correto@gmail.com",
      });

      const response1 = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "email.correto@gmail.com",
          password: "senha-incorreta",
        }),
      });
      expect(response1.status).toBe(401);
      const responseBody = await response1.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação não conferem.",
        action: "Verifique os dados e tente novamente.",
        status_code: 401,
      });
    });

    test("with incorrect `email` but incorrect `password`", async () => {
      await orchestrator.createUser({
        //username: "validUser",
        //email: "email.correto@gmail.com",
      });

      const response1 = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "email.incorreto@gmail.com",
          password: "senha-incorreta",
        }),
      });
      expect(response1.status).toBe(401);
      const responseBody = await response1.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação não conferem.",
        action: "Verifique os dados e tente novamente.",
        status_code: 401,
      });
    });
  });
});
