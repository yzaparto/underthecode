import { test, expect } from '@playwright/test'

test.describe('Asyncio Overview Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/articles/python-asyncio')
  })

  test('displays the main title', async ({ page }) => {
    const title = page.locator('h1', { hasText: 'Python Asyncio: Concurrency Made Simple' })
    await expect(title).toBeVisible()
  })

  test('displays introductory description', async ({ page }) => {
    const intro = page.locator('p', { hasText: 'asyncio' })
    await expect(intro.first()).toBeVisible()
  })

  test('displays all 20 animations in the list', async ({ page }) => {
    const animationLinks = page.locator('ol li a')
    await expect(animationLinks).toHaveCount(20)
  })

  test('displays animation numbers from 1 to 20', async ({ page }) => {
    const animationNumbers = page.locator('ol li span.flex')
    
    for (let i = 1; i <= 20; i++) {
      await expect(animationNumbers.nth(i - 1)).toContainText(String(i))
    }
  })

  test('first animation has correct title - Synchronous Execution', async ({ page }) => {
    const firstAnimation = page.locator('ol li').first()
    await expect(firstAnimation.locator('h3')).toContainText('Synchronous Execution')
  })

  test('displays Key Takeaways section', async ({ page }) => {
    const keyTakeaways = page.locator('h2', { hasText: 'Key Takeaways' })
    await expect(keyTakeaways).toBeVisible()
  })

  test('displays Quick Reference section with coordination methods', async ({ page }) => {
    const quickRef = page.locator('h2', { hasText: 'Quick Reference' })
    await expect(quickRef).toBeVisible()
    
    const gatherCode = page.locator('code', { hasText: 'gather()' })
    await expect(gatherCode.first()).toBeVisible()
    
    const taskGroupCode = page.locator('code', { hasText: 'TaskGroup' })
    await expect(taskGroupCode.first()).toBeVisible()
  })

  test('navigates to first animation when clicked', async ({ page }) => {
    const firstAnimationLink = page.locator('ol li a').first()
    await firstAnimationLink.click()
    
    await expect(page).toHaveURL('/articles/python-asyncio/1')
    await expect(page.locator('h1', { hasText: 'Synchronous Execution' })).toBeVisible()
  })

  test('navigates to any animation by number', async ({ page }) => {
    const fifthAnimation = page.locator('ol li a').nth(4)
    await fifthAnimation.click()
    
    await expect(page).toHaveURL('/articles/python-asyncio/5')
  })

  test('all animation links are valid', async ({ page }) => {
    const animationLinks = page.locator('ol li a')
    const count = await animationLinks.count()
    
    for (let i = 0; i < count; i++) {
      const href = await animationLinks.nth(i).getAttribute('href')
      expect(href).toBe(`/articles/python-asyncio/${i + 1}`)
    }
  })

  test('displays animations with titles and subtitles', async ({ page }) => {
    const animations = page.locator('ol li')
    const firstAnimation = animations.first()
    
    const title = firstAnimation.locator('h3')
    await expect(title).toBeVisible()
    
    const subtitle = firstAnimation.locator('p.text-sm')
    await expect(subtitle).toBeVisible()
    await expect(subtitle).toContainText('LLM')
  })

  test('back to home link via header', async ({ page }) => {
    const headerLogo = page.locator('header a', { hasText: '_underthecode' })
    await headerLogo.click()
    
    await expect(page).toHaveURL('/')
  })
})
