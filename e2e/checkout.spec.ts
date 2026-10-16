import { expect, test, type Page } from '@playwright/test';

// Needs the store running (`pnpm dev`), a seeded database, and Stripe test keys.
// The success page is Stripe's redirect. Marking the order paid still needs `pnpm stripe:listen`.
test('login, add to cart, and pay with the test card', async ({ page }) => {
  const email = process.env.E2E_EMAIL ?? 'admin@gg.local';
  const password = process.env.E2E_PASSWORD ?? 'admin12345';

  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.waitForURL('**/account');

  await page.goto('/products/apex-pro-tkl');
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await page.getByRole('link', { name: 'View cart' }).click();
  await page.getByRole('button', { name: 'Checkout' }).click();
  await page.waitForURL(/checkout\.stripe\.com/);

  await fillStripeCard(page);
  await page.getByRole('button', { name: /^Pay/ }).click();

  await page.waitForURL('**/checkout/success');
  await expect(page.getByRole('heading', { name: 'Thanks for your order!' })).toBeVisible();
});

// Stripe Checkout keeps the card fields in titled iframes.
async function fillStripeCard(page: Page) {
  await page
    .frameLocator('iframe[title="Secure card number input frame"]')
    .locator('input[name="cardnumber"]')
    .fill('4242424242424242');
  await page
    .frameLocator('iframe[title="Secure expiration date input frame"]')
    .locator('input[name="exp-date"]')
    .fill('1234');
  await page
    .frameLocator('iframe[title="Secure CVC input frame"]')
    .locator('input[name="cvc"]')
    .fill('123');

  const postal = page.getByRole('textbox', { name: /postal|zip/i });
  if (await postal.isVisible()) await postal.fill('10001');
}
