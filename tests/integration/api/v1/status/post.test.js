import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("POST to api/v1/status", () => {
  describe("Anonymos user", () => {
    test("Testa via POST se o status está funcionando", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status", {
        method: "POST",
      });

      expect(response.status).toBe(405);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "MethodNotAllowedError",
        message: "Only GET method is allowed on this endpoint",
        action: "Use GET method on this endpoint.",
        status_code: 405,
      });
    });
  });
});
