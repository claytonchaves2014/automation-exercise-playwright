class LoginScreen {
  constructor(driver) {
    this.driver = driver;
    this.emailInput = driver.$("~input-email");
    this.passwordInput = driver.$("~input-password");
    this.confirmPasswordInput = driver.$("~input-repeat-password");
    this.loginButton = driver.$("~button-LOGIN");
    this.signUpButton = driver.$("~button-SIGN UP");
  }

  async open() {
    const loginTab = this.driver.$("~Login");
    await loginTab.waitForDisplayed({ timeout: 30_000 });
    await loginTab.click();
    await this.driver.$("~Login-screen").waitForDisplayed();
  }

  async logIn(email, password) {
    await this.emailInput.setValue(email);
    await this.passwordInput.setValue(password);
    await this.loginButton.click();
  }

  async signUp(email, password) {
    await this.driver.$("~sign-up-container").click();
    await this.emailInput.setValue(email);
    await this.passwordInput.setValue(password);
    await this.confirmPasswordInput.setValue(password);
    await this.signUpButton.click();
  }
}

module.exports = LoginScreen;
