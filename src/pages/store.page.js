class StorePage {
  constructor(page) {
    this.page = page;
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  async addFirstProductToCart() {
    await this.page.locator('[data-test^="add-to-cart"]').first().click();
  }

  async openCart() {
    await this.cartLink.click();
  }

  async startCheckout() {
    await this.checkoutButton.click();
  }

  async fillCheckoutInformation({ firstName, lastName, postalCode }) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    if (postalCode) {
      await this.postalCodeInput.fill(postalCode);
    }
  }

  async continueToOverview() {
    await this.continueButton.click();
  }

  async finishOrder() {
    await this.finishButton.click();
  }
}

module.exports = StorePage;
