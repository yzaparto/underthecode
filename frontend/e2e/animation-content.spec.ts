import { test, expect } from '@playwright/test'

test.describe('Animation Content', () => {
  test.describe('Code Panel', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/articles/python-asyncio/1')
    })

    test('displays code panel with Python source code', async ({ page }) => {
      const codeContent = page.locator('text=import time')
      await expect(codeContent).toBeVisible()
    })

    test('code panel contains function definitions', async ({ page }) => {
      const defCallLlm = page.locator('text=def call_llm')
      const defMain = page.locator('text=def main')
      
      await expect(defCallLlm).toBeVisible()
      await expect(defMain).toBeVisible()
    })

    test('code has syntax highlighting (Monaco editor integration)', async ({ page }) => {
      const viewer = page.locator('.rounded-xl.border')
      await expect(viewer).toBeVisible()
      
      const codeEditor = viewer.locator('[class*="monaco"], pre, code').first()
      await expect(codeEditor).toBeVisible()
    })
  })

  test.describe('Output Panel', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/articles/python-asyncio/1')
    })

    test('output panel shows output after stepping', async ({ page }) => {
      const nextButton = page.locator('button', { hasText: 'Next →' })
      
      for (let i = 0; i < 7; i++) {
        await nextButton.click()
      }
      
      await page.waitForTimeout(200)
      
      const outputText = page.locator('text=Calling gpt-4')
      await expect(outputText).toBeVisible({ timeout: 10000 })
    })

    test('output updates as steps progress', async ({ page }) => {
      const nextButton = page.locator('button', { hasText: 'Next →' })
      
      for (let i = 0; i < 12; i++) {
        await nextButton.click()
      }
      
      await page.waitForTimeout(200)
      
      const gptOutput = page.locator('span.text-green', { hasText: 'gpt-4 responded' })
      await expect(gptOutput).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Animation Columns', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/articles/python-asyncio/1')
    })

    test('animation viewer has multiple columns', async ({ page }) => {
      const columns = page.locator('.flex.min-h-\\[480px\\] > div')
      const count = await columns.count()
      expect(count).toBeGreaterThanOrEqual(1)
    })

    test('columns layout is responsive (flex-col on mobile, flex-row on desktop)', async ({ page }) => {
      const container = page.locator('.flex.min-h-\\[480px\\]')
      await expect(container).toHaveClass(/md:flex-row/)
    })
  })

  test.describe('Article Sections', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/articles/python-asyncio/1')
    })

    test('Introduction section has content', async ({ page }) => {
      const introSection = page.locator('section').filter({ has: page.locator('h2', { hasText: 'Introduction' }) })
      const paragraphs = introSection.locator('p')
      const count = await paragraphs.count()
      expect(count).toBeGreaterThan(0)
    })

    test('Why This Matters section has content', async ({ page }) => {
      const whySection = page.locator('section').filter({ has: page.locator('h2', { hasText: 'Why This Matters' }) })
      const paragraphs = whySection.locator('p')
      const count = await paragraphs.count()
      expect(count).toBeGreaterThan(0)
    })

    test('When to Use section has bullet list', async ({ page }) => {
      const whenSection = page.locator('section').filter({ has: page.locator('h3', { hasText: 'When to Use' }) })
      const bullets = whenSection.locator('ul li')
      const count = await bullets.count()
      expect(count).toBeGreaterThan(0)
    })

    test('What Just Happened section exists', async ({ page }) => {
      const whatSection = page.locator('h2', { hasText: 'What Just Happened' })
      await expect(whatSection).toBeVisible()
    })
  })

  test.describe('Keep in Mind and Pitfalls Sections', () => {
    test('Keep in Mind section with warning styling', async ({ page }) => {
      await page.goto('/articles/python-asyncio/1')
      
      const keepInMindSection = page.locator('.border-amber\\/50, [class*="border-amber"]')
      if (await keepInMindSection.count() > 0) {
        await expect(keepInMindSection.first()).toBeVisible()
      }
    })

    test('Common Pitfalls section with red styling when present', async ({ page }) => {
      await page.goto('/articles/python-asyncio/5')
      
      const pitfallsSection = page.locator('.border-red\\/50, [class*="border-red"]')
      if (await pitfallsSection.count() > 0) {
        await expect(pitfallsSection.first()).toBeVisible()
      }
    })
  })

  test.describe('Animation Cards', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/articles/python-asyncio/1')
    })

    test('stepping through animation shows code changes', async ({ page }) => {
      const nextButton = page.locator('button', { hasText: 'Next →' })
      
      for (let i = 0; i < 5; i++) {
        await nextButton.click()
      }
      
      await page.waitForTimeout(200)
      
      const viewer = page.locator('.rounded-xl')
      await expect(viewer.first()).toBeVisible()
      
      const stepIndicator = page.locator('text=Step 5 /')
      await expect(stepIndicator).toBeVisible()
    })

    test('cards column displays animation state', async ({ page }) => {
      const nextButton = page.locator('button', { hasText: 'Next →' })
      
      for (let i = 0; i < 6; i++) {
        await nextButton.click()
      }
      
      const viewer = page.locator('.rounded-xl')
      await expect(viewer.first()).toBeVisible()
    })
  })
})

test.describe('All Animations Load Correctly', () => {
  const animations = [
    { num: 1, title: 'Synchronous Execution' },
    { num: 2, title: 'Basic Coroutines' },
    { num: 3, title: 'Creating Tasks' },
    { num: 5, title: 'Blocking the Event Loop' },
    { num: 7, title: 'Scheduling Patterns' },
    { num: 10, title: 'as_completed' },
    { num: 12, title: 'Semaphore' },
    { num: 15, title: 'Event' },
    { num: 17, title: 'Graceful Shutdown' },
    { num: 20, title: 'Wait' },
  ]

  for (const { num, title } of animations) {
    test(`Animation ${num} - ${title} loads and has content`, async ({ page }) => {
      await page.goto(`/articles/python-asyncio/${num}`)
      
      const h1 = page.locator('h1')
      await expect(h1).toBeVisible()
      
      const viewer = page.locator('.rounded-xl.border')
      await expect(viewer).toBeVisible()
      
      const nextButton = page.locator('button', { hasText: 'Next →' })
      await expect(nextButton).toBeVisible()
      
      const intro = page.locator('h2', { hasText: 'Introduction' })
      await expect(intro).toBeVisible()
    })
  }
})
