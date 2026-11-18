const { Given, When, Then } = require("@cucumber/cucumber");
const { expect } = require("@playwright/test");

Given("que a API de exemplo está disponível", function () {});

async function saveResponse(world, response) {
  world.response = response;
  const contentType = response.headers()["content-type"] || "";
  world.responseBody = contentType.includes("json")
    ? await response.json()
    : await response.text();
}

When(
  "envio uma requisição {word} para {string}",
  async function (method, path) {
    const response = await this.api.fetch(path, { method: method.toUpperCase() });
    await saveResponse(this, response);
  }
);

When(
  "envio uma requisição {word} para {string} com o JSON",
  async function (method, path, body) {
    const response = await this.api.fetch(path, {
      method: method.toUpperCase(),
      data: JSON.parse(body),
      headers: { "Content-Type": "application/json" }
    });
    await saveResponse(this, response);
  }
);

When(
  "envio uma requisição POST para {string} com JSON malformado",
  async function (path, body) {
    const response = await this.api.fetch(path, {
      method: "POST",
      data: body,
      headers: { "Content-Type": "application/json" }
    });
    await saveResponse(this, response);
  }
);

Then("o status da resposta deve ser {int}", function (status) {
  expect(this.response.status()).toBe(status);
});

Then("o Content-Type da resposta deve indicar JSON", function () {
  expect(this.response.headers()["content-type"]).toMatch(/application\/json/i);
});

Then("o Content-Type da resposta deve indicar HTML", function () {
  expect(this.response.headers()["content-type"]).toMatch(/text\/html/i);
});

Then("o corpo da resposta deve conter {string}", function (text) {
  expect(this.responseBody).toContain(text);
});

Then(
  "o campo {string} da resposta deve ser {string}",
  function (field, expected) {
    expect(String(this.responseBody[field])).toBe(expected);
  }
);

Then(
  "o campo {string} da resposta deve ser verdadeiro",
  function (field) {
    expect(this.responseBody[field]).toBe(true);
  }
);

Then("a resposta deve conter uma mensagem de erro", function () {
  expect(this.responseBody.message).toBeTruthy();
});
