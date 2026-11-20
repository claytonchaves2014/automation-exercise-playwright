class FormsScreen {
  constructor(driver) {
    this.driver = driver;
    this.screen = driver.$("~Forms-screen");
    this.textInput = driver.$("~text-input");
    this.inputResult = driver.$("~input-text-result");
  }

  async open() {
    const formsTab = this.driver.$("~Forms");
    await formsTab.waitForDisplayed({ timeout: 30_000 });
    await formsTab.click();
    await this.screen.waitForDisplayed();
  }

  async submitText(value) {
    await this.textInput.setValue(value);
  }
}

module.exports = FormsScreen;
