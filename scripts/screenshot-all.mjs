import { chromium } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const BASE_URL = 'http://localhost:3000'
const OUTPUT_DIR = '/Users/abiskaracharya/Projects/ecom-docs/screenshots'

const ADMIN_EMAIL = 'admin@codeed.com'
const ADMIN_PASSWORD = 'admin123'
const USER_EMAIL = 'test@example.com'
const USER_PASSWORD = 'password123'

fs.mkdirSync(OUTPUT_DIR, { recursive: true })

async function shot(page, name) {
  const filePath = path.join(OUTPUT_DIR, `${name}.png`)
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.waitForTimeout(1200) // let animations settle
  await page.screenshot({ path: filePath, fullPage: true })
  console.log(`✓ ${name}.png`)
}

async function login(page, email, password) {
  await page.goto(`${BASE_URL}/login`)
  await page.waitForSelector('input[type="email"]')
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 }).catch(() => {})
  await page.waitForTimeout(1500)
}

async function logout(page) {
  await page.context().clearCookies()
  await page.context().addInitScript(() => localStorage.clear())
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  })
  const page = await context.newPage()

  console.log('\n=== PUBLIC PAGES (logged out) ===\n')

  await page.goto(`${BASE_URL}/`)
  await shot(page, '01-home')

  await page.goto(`${BASE_URL}/courses`)
  await shot(page, '02-courses-listing')

  await page.goto(`${BASE_URL}/courses/python-for-beginners`)
  await shot(page, '03-course-detail-python')

  await page.goto(`${BASE_URL}/courses/ai-deep-learning-tensorflow`)
  await shot(page, '04-course-detail-ai')

  await page.goto(`${BASE_URL}/about`)
  await shot(page, '05-about')

  await page.goto(`${BASE_URL}/contact`)
  await shot(page, '06-contact')

  await page.goto(`${BASE_URL}/faq`)
  await shot(page, '07-faq')

  await page.goto(`${BASE_URL}/help`)
  await shot(page, '08-help')

  await page.goto(`${BASE_URL}/privacy`)
  await shot(page, '09-privacy')

  await page.goto(`${BASE_URL}/terms`)
  await shot(page, '10-terms')

  await page.goto(`${BASE_URL}/login`)
  await shot(page, '11-login')

  await page.goto(`${BASE_URL}/register`)
  await shot(page, '12-register')

  await page.goto(`${BASE_URL}/forgot-password`)
  await shot(page, '13-forgot-password')

  console.log('\n=== TEST USER PAGES ===\n')

  await login(page, USER_EMAIL, USER_PASSWORD)

  await page.goto(`${BASE_URL}/dashboard`)
  await shot(page, '14-user-dashboard')

  await page.goto(`${BASE_URL}/profile`)
  await shot(page, '15-user-profile')

  await page.goto(`${BASE_URL}/profile/orders`)
  await shot(page, '16-user-orders')

  await page.goto(`${BASE_URL}/leaderboard`)
  await shot(page, '17-leaderboard')

  await page.goto(`${BASE_URL}/cart`)
  await shot(page, '18-cart-empty')

  // Learning platform - the test user is enrolled in these
  await page.goto(`${BASE_URL}/courses/python-for-beginners/learn`)
  await shot(page, '19-learning-platform-python')

  await page.goto(`${BASE_URL}/courses/ai-deep-learning-tensorflow/learn`)
  await shot(page, '20-learning-platform-ai')

  await page.goto(`${BASE_URL}/courses/data-structures-algorithms/learn`)
  await shot(page, '21-learning-platform-dsa')

  await page.goto(`${BASE_URL}/courses/javascript-mastery/learn`)
  await shot(page, '22-learning-platform-js-completed')

  console.log('\n=== ADMIN PAGES ===\n')

  await logout(page)
  await login(page, ADMIN_EMAIL, ADMIN_PASSWORD)

  await page.goto(`${BASE_URL}/admin/dashboard`)
  await shot(page, '23-admin-dashboard')

  await page.goto(`${BASE_URL}/admin/courses`)
  await shot(page, '24-admin-courses-list')

  await page.goto(`${BASE_URL}/admin/courses/new`)
  await shot(page, '25-admin-course-create')

  // Get first course id for edit page
  try {
    const firstCourseRes = await page.request.get(`${BASE_URL}/api/admin/courses?page=1&limit=1`)
    const courseData = await firstCourseRes.json()
    const firstId = courseData.items?.[0]?.id
    if (firstId) {
      await page.goto(`${BASE_URL}/admin/courses/${firstId}/edit`)
      await shot(page, '26-admin-course-edit')

      await page.goto(`${BASE_URL}/admin/courses/${firstId}/modules`)
      await shot(page, '27-admin-course-modules')
    }
  } catch (e) {
    console.log('Could not fetch course id for edit:', e.message)
  }

  await page.goto(`${BASE_URL}/admin/users`)
  await shot(page, '28-admin-users')

  await page.goto(`${BASE_URL}/admin/orders`)
  await shot(page, '29-admin-orders')

  await page.goto(`${BASE_URL}/admin/pages`)
  await shot(page, '30-admin-pages-cms')

  await page.goto(`${BASE_URL}/admin/pages/new`)
  await shot(page, '31-admin-page-create')

  // Get first page id for edit
  try {
    const pagesRes = await page.request.get(`${BASE_URL}/api/admin/pages`)
    const pagesData = await pagesRes.json()
    const firstPageId = (pagesData.data || pagesData.pages || [])[0]?.id
    if (firstPageId) {
      await page.goto(`${BASE_URL}/admin/pages/${firstPageId}/edit`)
      await shot(page, '32-admin-page-edit')
    }
  } catch (e) {
    console.log('Could not fetch page id:', e.message)
  }

  await browser.close()
  console.log(`\n✅ All screenshots saved to ${OUTPUT_DIR}`)
}

main().catch((e) => {
  console.error('Screenshot failed:', e)
  process.exit(1)
})
