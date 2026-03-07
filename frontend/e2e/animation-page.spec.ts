import { test, expect } from '@playwright/test'

test.describe('Animation Page', () => {
  test.describe('First Animation - Synchronous Execution', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/articles/python-asyncio/1')
    })

    test('displays animation title', async ({ page }) => {
      const title = page.locator('h1', { hasText: 'Synchronous Execution' })
      await expect(title).toBeVisible()
    })

    test('displays animation counter "1 of 20"', async ({ page }) => {
      const counter = page.locator('span', { hasText: '1 of 20' })
      await expect(counter).toBeVisible()
    })

    test('has back to overview link', async ({ page }) => {
      const backLink = page.locator('a', { hasText: 'Back to overview' })
      await expect(backLink).toBeVisible()
      await backLink.click()
      await expect(page).toHaveURL('/articles/python-asyncio')
    })

    test('displays Introduction section', async ({ page }) => {
      const introHeading = page.locator('h2', { hasText: 'Introduction' })
      await expect(introHeading).toBeVisible()
    })

    test('displays Why This Matters section', async ({ page }) => {
      const whyHeading = page.locator('h2', { hasText: 'Why This Matters' })
      await expect(whyHeading).toBeVisible()
    })

    test('displays When to Use This Pattern section', async ({ page }) => {
      const whenHeading = page.locator('h2', { hasText: 'When to Use This Pattern' })
      await expect(whenHeading).toBeVisible()
    })

    test('displays the animation viewer', async ({ page }) => {
      const viewer = page.locator('.rounded-xl.border')
      await expect(viewer).toBeVisible()
    })

    test('displays stepper with navigation buttons', async ({ page }) => {
      const backButton = page.locator('button', { hasText: '← Back' })
      const nextButton = page.locator('button', { hasText: 'Next →' })
      
      await expect(backButton).toBeVisible()
      await expect(nextButton).toBeVisible()
    })

    test('back button is disabled at step 0', async ({ page }) => {
      const backButton = page.locator('button', { hasText: '← Back' })
      await expect(backButton).toBeDisabled()
    })

    test('next button advances the step', async ({ page }) => {
      const nextButton = page.locator('button', { hasText: 'Next →' })
      const stepIndicator = page.locator('text=Step 0 /')
      
      await expect(stepIndicator).toBeVisible()
      
      await nextButton.click()
      
      const newStepIndicator = page.locator('text=Step 1 /')
      await expect(newStepIndicator).toBeVisible()
    })

    test('displays progress bar', async ({ page }) => {
      const progressBar = page.locator('.w-full.overflow-hidden.rounded-full')
      await expect(progressBar.first()).toBeVisible()
    })

    test('displays phase explanation after stepping', async ({ page }) => {
      const nextButton = page.locator('button', { hasText: 'Next →' })
      
      await nextButton.click()
      
      const phaseBox = page.locator('.rounded-lg.px-5.py-4')
      await expect(phaseBox.first()).toBeVisible()
    })

    test('navigating through steps updates phase', async ({ page }) => {
      const nextButton = page.locator('button', { hasText: 'Next →' })
      
      await nextButton.click()
      
      const phaseBox = page.locator('.rounded-lg.px-5.py-4')
      await expect(phaseBox.first()).toBeVisible()
      
      for (let i = 0; i < 4; i++) {
        await nextButton.click()
      }
      
      await expect(phaseBox.first()).toBeVisible()
    })

    test('displays What Just Happened section', async ({ page }) => {
      const whatHappenedHeading = page.locator('h2', { hasText: 'What Just Happened' })
      await expect(whatHappenedHeading).toBeVisible()
    })

    test('has navigation to next animation', async ({ page }) => {
      const nextAnimationLink = page.locator('a', { hasText: 'Basic Coroutines' })
      await expect(nextAnimationLink).toBeVisible()
    })

    test('first animation has no previous link (empty div)', async ({ page }) => {
      const prevLinks = page.locator('a', { hasText: '← ' }).filter({ hasNotText: 'Back to overview' })
      await expect(prevLinks).toHaveCount(0)
    })
  })

  test.describe('Middle Animation - Animation 10', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/articles/python-asyncio/10')
    })

    test('displays correct animation counter', async ({ page }) => {
      const counter = page.locator('span', { hasText: '10 of 20' })
      await expect(counter).toBeVisible()
    })

    test('has both previous and next navigation links', async ({ page }) => {
      const navigation = page.locator('.flex.items-center.justify-between').last()
      const links = navigation.locator('a')
      await expect(links).toHaveCount(2)
    })

    test('previous link navigates to animation 9', async ({ page }) => {
      const prevLink = page.locator('.flex.items-center.justify-between').last().locator('a').first()
      await prevLink.click()
      await expect(page).toHaveURL('/articles/python-asyncio/9')
    })

    test('next link navigates to animation 11', async ({ page }) => {
      const nextLink = page.locator('.flex.items-center.justify-between').last().locator('a').last()
      await nextLink.click()
      await expect(page).toHaveURL('/articles/python-asyncio/11')
    })
  })

  test.describe('Last Animation - Animation 20', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/articles/python-asyncio/20')
    })

    test('displays correct animation counter', async ({ page }) => {
      const counter = page.locator('span', { hasText: '20 of 20' })
      await expect(counter).toBeVisible()
    })

    test('has "Back to overview" button instead of next', async ({ page }) => {
      const backToOverview = page.locator('a', { hasText: 'Back to overview →' })
      await expect(backToOverview).toBeVisible()
    })

    test('back to overview navigates correctly', async ({ page }) => {
      const backToOverview = page.locator('a', { hasText: 'Back to overview →' })
      await backToOverview.click()
      await expect(page).toHaveURL('/articles/python-asyncio')
    })
  })

  test.describe('Invalid Animation Routes', () => {
    test('invalid animation number redirects to animation 1', async ({ page }) => {
      await page.goto('/articles/python-asyncio/999')
      await expect(page).toHaveURL('/articles/python-asyncio/1')
    })

    test('zero animation number redirects to animation 1', async ({ page }) => {
      await page.goto('/articles/python-asyncio/0')
      await expect(page).toHaveURL('/articles/python-asyncio/1')
    })

    test('negative animation number redirects to animation 1', async ({ page }) => {
      await page.goto('/articles/python-asyncio/-1')
      await expect(page).toHaveURL('/articles/python-asyncio/1')
    })

    test('non-numeric animation parameter redirects to animation 1', async ({ page }) => {
      await page.goto('/articles/python-asyncio/abc')
      await expect(page).toHaveURL('/articles/python-asyncio/1')
    })
  })
})
