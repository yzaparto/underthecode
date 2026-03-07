import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('displays the main title with branding', async ({ page }) => {
    const title = page.locator('h1')
    await expect(title).toContainText('underthecode')
    await expect(title.locator('span')).toHaveClass(/text-brand/)
  })

  test('displays the tagline', async ({ page }) => {
    const tagline = page.locator('p', { hasText: 'Hard concepts made simple through text and animations' })
    await expect(tagline).toBeVisible()
  })

  test('displays the Python Asyncio article card', async ({ page }) => {
    const articleCard = page.locator('a[href="/articles/python-asyncio"]')
    await expect(articleCard).toBeVisible()
    
    await expect(articleCard.locator('span', { hasText: 'Python' })).toBeVisible()
    await expect(articleCard.locator('h2', { hasText: 'Python Asyncio: Concurrency Made Simple' })).toBeVisible()
    await expect(articleCard.locator('p', { hasText: 'Step-by-step interactive animations' })).toBeVisible()
  })

  test('navigates to asyncio overview when article card is clicked', async ({ page }) => {
    const articleCard = page.locator('a[href="/articles/python-asyncio"]')
    await articleCard.click()
    
    await expect(page).toHaveURL('/articles/python-asyncio')
    await expect(page.locator('h1', { hasText: 'Python Asyncio: Concurrency Made Simple' })).toBeVisible()
  })

  test('has proper page structure with header', async ({ page }) => {
    const header = page.locator('header')
    await expect(header).toBeVisible()
    
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('article card has hover styles applied', async ({ page }) => {
    const articleCard = page.locator('a[href="/articles/python-asyncio"]')
    await expect(articleCard).toHaveClass(/hover:/)
  })
})
