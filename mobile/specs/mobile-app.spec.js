const assert = require("node:assert/strict");
const path = require("node:path");
const addContext = require("mochawesome/addContext");
const { remote } = require("webdriverio");
const FormsScreen = require("../src/pages/forms.screen");
const LoginScreen = require("../src/pages/login.screen");

const appPath =
  process.env.MOBILE_APP_PATH ||
  path.join(__dirname, "..", "apps", "android.wdio.native.app.v2.2.0.apk");

describe("Aplicativo Android de demonstração com Appium", function () {
  this.timeout(120_000);

  let driver;

  beforeEach(async function () {
    driver = await remote({
      hostname: process.env.APPIUM_HOST || "127.0.0.1",
      port: Number(process.env.APPIUM_PORT || 4723),
      path: process.env.APPIUM_PATH || "/",
      capabilities: {
        platformName: "Android",
        "appium:automationName": "UiAutomator2",
        "appium:deviceName": process.env.ANDROID_DEVICE_NAME || "Android Emulator",
        "appium:app": appPath,
        "appium:autoGrantPermissions": true,
        "appium:newCommandTimeout": 120,
        "appium:uiautomator2ServerInstallTimeout": 120_000,
        "appium:adbExecTimeout": 120_000
      }
    });
  });

  afterEach(async function () {
    if (!driver) {
      return;
    }

    try {
      const screenshot = await driver.takeScreenshot();
      addContext(this, {
        title: "Captura da tela do aplicativo",
        value: `data:image/png;base64,${screenshot}`
      });
    } finally {
      await driver.deleteSession();
      driver = undefined;
    }
  });

  it("faz login, navega até Formulários e valida os controles nativos", async function () {
    const login = new LoginScreen(driver);
    await login.open();
    await login.logIn("teste@example.com", "senha-segura-123");

    const loginSuccess = driver.$(
      'android=new UiSelector().text("You are logged in!")'
    );
    await loginSuccess.waitForDisplayed();
    assert.equal(await loginSuccess.getText(), "You are logged in!");
    await driver.$('android=new UiSelector().text("OK")').click();

    const forms = new FormsScreen(driver);
    await forms.open();
    assert.equal(await forms.textInput.isDisplayed(), true);
    assert.equal(await forms.inputResult.isDisplayed(), true);
  });

  it("preenche e envia o formulário de cadastro com sucesso", async function () {
    const login = new LoginScreen(driver);
    await login.open();
    await login.signUp("novo-usuario@example.com", "senha-segura-123");

    const signUpSuccess = driver.$(
      'android=new UiSelector().text("You successfully signed up!")'
    );
    await signUpSuccess.waitForDisplayed();
    assert.equal(await signUpSuccess.getText(), "You successfully signed up!");
    await driver.$('android=new UiSelector().text("OK")').click();
  });

  it("valida campos obrigatórios do cadastro antes do envio", async function () {
    const login = new LoginScreen(driver);
    await login.open();
    await driver.$("~sign-up-container").click();
    await driver.$("~button-SIGN UP").click();

    const emailError = driver.$(
      'android=new UiSelector().text("Please enter a valid email address")'
    );
    await emailError.waitForDisplayed();
    assert.equal(await emailError.getText(), "Please enter a valid email address");
  });
});
