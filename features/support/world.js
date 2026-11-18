const {
  setWorldConstructor,
  setDefaultTimeout,
  Before,
  After
} = require("@cucumber/cucumber");
const { chromium, devices, request } = require("@playwright/test");
const LoginPage = require("../../src/pages/login.page");
const StorePage = require("../../src/pages/store.page");

setDefaultTimeout(30_000);

class TestWorld {
  constructor({ attach }) {
    this.attach = attach;
    this.response = undefined;
    this.responseBody = undefined;
    this.loginPage = undefined;
    this.storePage = undefined;
    this.page = undefined;
  }
}

setWorldConstructor(TestWorld);

async function startBrowser(world, contextOptions = {}) {
  world.browser = await chromium.launch({ headless: true });
  world.context = await world.browser.newContext(contextOptions);
  world.page = await world.context.newPage();
  world.loginPage = new LoginPage(world.page);
  world.storePage = new StorePage(world.page);
  world.baseUrl = process.env.E2E_BASE_URL || "https://www.saucedemo.com";
}

Before({ tags: "@api" }, async function () {
  this.api = await request.newContext({
    baseURL: process.env.API_BASE_URL || "https://dummyjson.com",
    extraHTTPHeaders: { Accept: "application/json" }
  });
});

After({ tags: "@api" }, async function () {
  await this.api.dispose();
});

Before({ tags: "@e2e and not @mobile" }, async function () {
  await startBrowser(this);
});

Before({ tags: "@mobile" }, async function () {
  await startBrowser(this, devices["Pixel 5"]);
});

After({ tags: "@e2e" }, async function () {
  if (this.page) {
    await this.attach(await this.page.screenshot({ fullPage: true }), "image/png");
    await this.browser.close();
  }
});
