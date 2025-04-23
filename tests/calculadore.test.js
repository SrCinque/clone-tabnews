const calculadora = require("../modules/calculadora.js");

test("Esperar que 2+2 seja 4", () => {
  const soma = calculadora.somar(2, 2);
  expect(soma).toBe(4);
});
