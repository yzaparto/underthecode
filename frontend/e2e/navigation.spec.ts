import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test.describe('Header Navigation', () => {
    test('logo navigates to home', async ({ page }) => {
      await page.goto('/articles/python-asyncio/5')
      
      const logo = page.locator('header a', { hasText: '_underthecode' })
      await logo.click()
      
      await expect(page).toHaveURL('/')
    })

    test('Articles link navigates to home', async ({ page }) => {
      await page.goto('/articles/python-asyncio')
      
      const articlesLink = page.locator('nav a', { hasText: 'Articles' })
      await articlesLink.click()
      
      await expect(page).toHaveURL('/')
    })

    test('Python Coder button exists', async ({ page }) => {
      await page.goto('/')
      
      const pythonCoderButton = page.locator('nav button', { hasText: 'Python Coder' })
      await expect(pythonCoderButton).toBeVisible()
    })
  })

  test.describe('Animation Sequential Navigation', () => {
    test('can navigate through all 20 animations using next link', async ({ page }) => {
      await page.goto('/articles/python-asyncio/1')
      
      for (let i = 1; i < 20; i++) {
        const nextLink = page.locator('.flex.items-center.justify-between').last().locator('a').last()
        await nextLink.click()
        await expect(page).toHaveURL(`/articles/python-asyncio/${i + 1}`)
      }
      
      const backToOverview = page.locator('a', { hasText: 'Back to overview →' })
      await expect(backToOverview).toBeVisible()
    })

    test('can navigate backwards through animations using prev link', async ({ page }) => {
      await page.goto('/articles/python-asyncio/5')
      
      for (let i = 5; i > 1; i--) {
        const prevLink = page.locator('.flex.items-center.justify-between').last().locator('a').first()
        await prevLink.click()
        await expect(page).toHaveURL(`/articles/python-asyncio/${i - 1}`)
      }
    })
  })

  test.describe('Direct URL Access', () => {
    const animationUrls = [1, 5, 10, 15, 20]
    
    for (const num of animationUrls) {
      test(`can directly access animation ${num}`, async ({ page }) => {
        await page.goto(`/articles/python-asyncio/${num}`)
        
        await expect(page).toHaveURL(`/articles/python-asyncio/${num}`)
        
        const counter = page.locator('span', { hasText: `${num} of 20` })
        await expect(counter).toBeVisible()
      })
    }
  })

  test.describe('Breadcrumb Navigation', () => {
    test('back to overview link works from animation page', async ({ page }) => {
      await page.goto('/articles/python-asyncio/7')
      
      const backLink = page.locator('a', { hasText: '← Back to overview' })
      await expect(backLink).toBeVisible()
      
      await backLink.click()
      await expect(page).toHaveURL('/articles/python-asyncio')
    })
  })

  test.describe('Flow: Home to Animation and Back', () => {
    test('complete user flow: home → overview → animation → overview → home', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('h1', { hasText: '_underthecode' })).toBeVisible()
      
      const articleCard = page.locator('a[href="/articles/python-asyncio"]')
      await articleCard.click()
      await expect(page).toHaveURL('/articles/python-asyncio')
      
      const thirdAnimation = page.locator('ol li a').nth(2)
      await thirdAnimation.click()
      await expect(page).toHaveURL('/articles/python-asyncio/3')
      
      const backToOverview = page.locator('a', { hasText: '← Back to overview' })
      await backToOverview.click()
      await expect(page).toHaveURL('/articles/python-asyncio')
      
      const logo = page.locator('header a', { hasText: '_underthecode' })
      await logo.click()
      await expect(page).toHaveURL('/')
    })
  })

  test.describe('Animation Counter Consistency', () => {
    test('animation counter matches URL parameter', async ({ page }) => {
      const testCases = [3, 8, 12, 17]
      
      for (const num of testCases) {
        await page.goto(`/articles/python-asyncio/${num}`)
        
        const counterTop = page.locator('span', { hasText: `${num} of 20` })
        await expect(counterTop).toBeVisible()
        
        const counterSubtitle = page.locator('p', { hasText: `Animation ${num} of 20` })
        await expect(counterSubtitle).toBeVisible()
      }
    })
  })
})
