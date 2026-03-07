import { test, expect } from '@playwright/test'

test.describe('Theme Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  })

  test('theme toggle button exists in header', async ({ page }) => {
    const themeButton = page.locator('header button[aria-label*="Switch to"]')
    await expect(themeButton).toBeVisible()
  })

  test('clicking theme toggle changes theme', async ({ page }) => {
    const themeButton = page.locator('header button[aria-label*="Switch to"]')
    const html = page.locator('html')
    
    const hasDarkBefore = await html.evaluate((el) => el.classList.contains('dark'))
    
    await themeButton.click()
    
    const hasDarkAfter = await html.evaluate((el) => el.classList.contains('dark'))
    
    expect(hasDarkAfter).not.toBe(hasDarkBefore)
  })

  test('theme persists across page navigation', async ({ page }) => {
    const themeButton = page.locator('header button[aria-label*="Switch to"]')
    const html = page.locator('html')
    
    await themeButton.click()
    const themeAfterToggle = await html.evaluate((el) => el.classList.contains('dark'))
    
    await page.goto('/articles/python-asyncio')
    
    const themeAfterNav = await html.evaluate((el) => el.classList.contains('dark'))
    
    expect(themeAfterNav).toBe(themeAfterToggle)
  })

  test('theme persists after page reload', async ({ page }) => {
    const themeButton = page.locator('header button[aria-label*="Switch to"]')
    const html = page.locator('html')
    
    await themeButton.click()
    const themeAfterToggle = await html.evaluate((el) => el.classList.contains('dark'))
    
    await page.reload()
    
    const themeAfterReload = await html.evaluate((el) => el.classList.contains('dark'))
    
    expect(themeAfterReload).toBe(themeAfterToggle)
  })

  test('theme toggle button shows correct icon for dark mode', async ({ page }) => {
    const html = page.locator('html')
    const isDark = await html.evaluate((el) => el.classList.contains('dark'))
    
    const themeButton = page.locator('header button[aria-label*="Switch to"]')
    
    if (isDark) {
      await expect(themeButton).toHaveAttribute('aria-label', 'Switch to light mode')
    } else {
      await expect(themeButton).toHaveAttribute('aria-label', 'Switch to dark mode')
    }
  })

  test('double toggle returns to original theme', async ({ page }) => {
    const themeButton = page.locator('header button[aria-label*="Switch to"]')
    const html = page.locator('html')
    
    const originalTheme = await html.evaluate((el) => el.classList.contains('dark'))
    
    await themeButton.click()
    await themeButton.click()
    
    const finalTheme = await html.evaluate((el) => el.classList.contains('dark'))
    
    expect(finalTheme).toBe(originalTheme)
  })

  test('theme affects page styling', async ({ page }) => {
    const themeButton = page.locator('header button[aria-label*="Switch to"]')
    const html = page.locator('html')
    
    const hasDarkBefore = await html.evaluate((el) => el.classList.contains('dark'))
    
    await themeButton.click()
    await page.waitForTimeout(100)
    
    const hasDarkAfter = await html.evaluate((el) => el.classList.contains('dark'))
    
    expect(hasDarkAfter).not.toBe(hasDarkBefore)
  })
})
