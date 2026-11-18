const { Given, When, Then } = require("@cucumber/cucumber");
const { expect } = require("@playwright/test");

const DEMO_USERNAME = "standard_user";
const DEMO_PASSWORD = "secret_sauce";

Given("que estou na página para entrar na loja", async function () {
  await this.page.goto(this.baseUrl);
});

When(
  "entro com usuário {string} e senha {string}",
  async function (username, password) {
    await this.loginPage.login(username, password);
  }
);

When("tento entrar sem preencher os campos", async function () {
  await this.loginPage.submitEmptyForm();
});

Then("a área de produtos deve estar visível", async function () {
  await expect(this.page.locator('[data-test="title"]')).toHaveText("Products");
});

Then("devo ver a mensagem de acesso {string}", async function (message) {
  await expect(this.loginPage.errorMessage).toContainText(message);
});

When(
  "adiciono um produto ao carrinho e inicio a finalização da compra",
  async function () {
    await this.storePage.addFirstProductToCart();
    await this.storePage.openCart();
    await expect(this.page.locator('[data-test="checkout"]')).toBeVisible();
    await this.storePage.startCheckout();
  }
);

Then("o formulário de entrega deve ser exibido", async function () {
  await expect(this.page.locator('[data-test="title"]')).toHaveText(
    "Checkout: Your Information"
  );
  await expect(this.storePage.firstNameInput).toBeVisible();
  await expect(this.storePage.lastNameInput).toBeVisible();
  await expect(this.storePage.postalCodeInput).toBeVisible();
});

When("preencho os dados de entrega válidos", async function () {
  await this.storePage.fillCheckoutInformation({
    firstName: "Playwright",
    lastName: "Tester",
    postalCode: "10001"
  });
  await this.storePage.continueToOverview();
});

When("tento prosseguir com o endereço incompleto", async function () {
  await this.storePage.fillCheckoutInformation({
    firstName: "Playwright",
    lastName: "Tester",
    postalCode: ""
  });
  await this.storePage.continueToOverview();
});

Then("o resumo do pedido deve apresentar os dados da compra", async function () {
  await expect(this.page.locator('[data-test="title"]')).toHaveText(
    "Checkout: Overview"
  );
  await expect(this.page.locator('[data-test="payment-info-value"]')).toContainText(
    "SauceCard"
  );
  await expect(this.page.locator('[data-test="shipping-info-value"]')).toBeVisible();
  await expect(this.page.locator('[data-test="total-label"]')).toContainText(
    "Total"
  );
});

When("finalizo a compra", async function () {
  await this.storePage.finishOrder();
});

Then("a compra deve ser confirmada", async function () {
  await expect(this.page.locator('[data-test="complete-header"]')).toHaveText(
    "Thank you for your order!"
  );
});

Then("devo ver a validação de endereço {string}", async function (message) {
  await expect(this.storePage.errorMessage).toContainText(message);
  await expect(this.page.locator('[data-test="title"]')).toHaveText(
    "Checkout: Your Information"
  );
});

Given("que entrei na loja com uma conta válida", async function () {
  await this.page.goto(this.baseUrl);
  await this.loginPage.login(DEMO_USERNAME, DEMO_PASSWORD);
  await expect(this.page.locator('[data-test="title"]')).toHaveText("Products");
});
