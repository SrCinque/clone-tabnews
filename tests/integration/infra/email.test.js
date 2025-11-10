import email from "infra/email.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email", () => {
  test("send", async () => {
    await orchestrator.deleteAllEmail();
    await email.send({
      from: "Filipe <contato@gmail>",
      to: "contato@gmail.com",
      subject: "Teste de assunto",
      text: "Teste de corpo.",
    });

    await email.send({
      from: "Filipe <contato@gmail.com>",
      to: "recebe@gmail.com",
      subject: "Ultimo Email",
      text: "Teste de Ultimo email.",
    });

    const lastEmail = await orchestrator.getLastEmail();
    expect(lastEmail.sender).toBe("<contato@gmail.com>");
    expect(lastEmail.recipients[0]).toBe("<recebe@gmail.com>");
    expect(lastEmail.subject).toBe("Ultimo Email");
    expect(lastEmail.text).toBe("Teste de Ultimo email.\n");
  });
});
