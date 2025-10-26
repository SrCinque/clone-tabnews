import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import session from "models/session.js";
import setCookieParser from "set-cookie-parser";

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

    test("with correct `email` and correct `password`", async () => {
      const createdUser = await orchestrator.createUser({
        email: "tudo.correto@gmail.com",
        password: "senhacorreta",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "tudo.correto@gmail.com",
          password: "senhacorreta",
        }),
      });
      expect(response.status).toBe(201);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        token: responseBody.token,
        user_id: createdUser.id,
        expires_at: responseBody.expires_at,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.expires_at)).not.toBeNaN();
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const expireAt = new Date(responseBody.expires_at);
      const createdeAt = new Date(responseBody.created_at);

      expireAt.setMilliseconds(0);
      createdeAt.setMilliseconds(0);

      expect(expireAt - createdeAt).toBe(session.EXPIRANTION_IN_MILLISECONDS);

      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: responseBody.token,
        maxAge: session.EXPIRANTION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
      });
    });
  });
});
