import { test, expect } from '@playwright/test'

const testUser = {
  name: 'Test User E2E',
  email: `test-e2e-${Date.now()}@example.com`,
  password: 'testpassword123',
}

test.describe('CodeEd Core User Flow', () => {
  test('1. Register a new account', async ({ page }) => {
    await page.goto('/register')

    await expect(page.getByRole('heading', { name: /create.*account/i })).toBeVisible()

    await page.fill('input[name="name"], #name', testUser.name)
    await page.fill('input[name="email"], #email', testUser.email)
    await page.fill('input[name="password"], #password', testUser.password)

    // Handle confirm password if present
    const confirmPasswordField = page.locator('input[name="confirmPassword"], #confirmPassword')
    if (await confirmPasswordField.isVisible()) {
      await confirmPasswordField.fill(testUser.password)
    }

    // Handle terms checkbox if present
    const termsCheckbox = page.locator('input[type="checkbox"]').first()
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check()
    }

    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })
  })

  test('2. Browse courses catalog', async ({ page }) => {
    await page.goto('/courses')

    await expect(page.getByRole('heading', { name: /courses/i })).toBeVisible()

    // Expect at least one course card to appear
    await expect(page.locator('.card').first()).toBeVisible({ timeout: 10000 })
  })

  test('3. View course detail page', async ({ page }) => {
    await page.goto('/courses')

    // Click the first course link
    const firstCourseLink = page.locator('a[href^="/courses/"]').first()
    await firstCourseLink.click()

    // Should be on a course detail page
    await expect(page.url()).toMatch(/\/courses\/[^/]+$/)

    // Course title should be visible
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('4. Full checkout flow (login first)', async ({ page }) => {
    // Login with demo credentials
    await page.goto('/login')

    await page.fill('input[name="email"], #email', 'test@example.com')
    await page.fill('input[name="password"], #password', 'password123')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })

    // Browse courses and add to cart
    await page.goto('/courses')
    await page.waitForSelector('.card', { timeout: 10000 })

    // Click first course
    const courseLink = page.locator('a[href^="/courses/"]').first()
    const courseHref = await courseLink.getAttribute('href')
    await courseLink.click()
    await page.waitForLoadState('networkidle')

    // Add to cart
    const addToCartBtn = page.getByRole('button', { name: /add to cart/i })
    if (await addToCartBtn.isVisible()) {
      await addToCartBtn.click()
      await expect(addToCartBtn).toContainText(/added/i, { timeout: 3000 })
    }

    // Navigate to cart
    await page.goto('/cart')
    await expect(page.locator('.card').first()).toBeVisible()

    // Checkout
    const checkoutBtn = page.getByRole('button', { name: /checkout/i })
    if (await checkoutBtn.isVisible()) {
      await checkoutBtn.click()

      // Should show order confirmation
      await expect(
        page.getByText(/order confirmed|order placed|success/i)
      ).toBeVisible({ timeout: 10000 })
    }
  })

  test('5. Dashboard shows enrolled courses', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[name="email"], #email', 'test@example.com')
    await page.fill('input[name="password"], #password', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })

    // Dashboard should show user stats
    await expect(page.getByText(/points|level/i)).toBeVisible()
  })

  test('6. Order history page loads (no 404)', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[name="email"], #email', 'test@example.com')
    await page.fill('input[name="password"], #password', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 })

    // Navigate to order history
    await page.goto('/profile/orders')

    // Should NOT 404 — should show page
    await expect(page.getByRole('heading', { name: /order history/i })).toBeVisible({ timeout: 5000 })
  })

  test('7. Footer links do not 404', async ({ page }) => {
    await page.goto('/')

    const footerLinks = ['/about', '/contact', '/privacy', '/terms', '/help', '/faq']

    for (const link of footerLinks) {
      const response = await page.goto(link)
      expect(response?.status()).not.toBe(404)
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 5000 })
    }
  })

  test('8. Forgot password page loads', async ({ page }) => {
    await page.goto('/forgot-password')

    await expect(page.getByRole('heading', { name: /forgot password/i })).toBeVisible({ timeout: 5000 })
  })

  test('9. Course learn page redirects unenrolled users', async ({ page }) => {
    // Not logged in — go to learn page
    await page.goto('/courses/python-for-beginners/learn')

    // Should redirect to login
    await expect(page).toHaveURL(/login/, { timeout: 5000 })
  })
})
