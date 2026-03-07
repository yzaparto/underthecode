import { test, expect } from '@playwright/test'

test.describe('Stepper Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/articles/python-asyncio/1')
  })

  test('starts at step 0', async ({ page }) => {
    const stepIndicator = page.locator('text=Step 0 /')
    await expect(stepIndicator).toBeVisible()
  })

  test('progress bar starts at 0%', async ({ page }) => {
    const progressFill = page.locator('.h-full.rounded-full.bg-brand')
    const width = await progressFill.evaluate((el) => getComputedStyle(el).width)
    expect(parseInt(width)).toBe(0)
  })

  test('clicking next increments step', async ({ page }) => {
    const nextButton = page.locator('button', { hasText: 'Next →' })
    
    await nextButton.click()
    await expect(page.locator('text=Step 1 /')).toBeVisible()
    
    await nextButton.click()
    await expect(page.locator('text=Step 2 /')).toBeVisible()
  })

  test('clicking back decrements step', async ({ page }) => {
    const nextButton = page.locator('button', { hasText: 'Next →' })
    const backButton = page.locator('button', { hasText: '← Back' })
    
    await nextButton.click()
    await nextButton.click()
    await expect(page.locator('text=Step 2 /')).toBeVisible()
    
    await backButton.click()
    await expect(page.locator('text=Step 1 /')).toBeVisible()
  })

  test('back button becomes enabled after first step', async ({ page }) => {
    const backButton = page.locator('button', { hasText: '← Back' })
    const nextButton = page.locator('button', { hasText: 'Next →' })
    
    await expect(backButton).toBeDisabled()
    
    await nextButton.click()
    
    await expect(backButton).toBeEnabled()
  })

  test('progress bar updates with step', async ({ page }) => {
    const nextButton = page.locator('button', { hasText: 'Next →' })
    const progressFill = page.locator('.h-full.rounded-full.bg-brand')
    
    const initialWidth = await progressFill.evaluate((el) => parseFloat(getComputedStyle(el).width))
    
    await nextButton.click()
    await nextButton.click()
    await nextButton.click()
    
    await page.waitForTimeout(300)
    
    const newWidth = await progressFill.evaluate((el) => parseFloat(getComputedStyle(el).width))
    expect(newWidth).toBeGreaterThan(initialWidth)
  })

  test('keyboard navigation with arrow keys', async ({ page }) => {
    await page.locator('body').click()
    
    await page.keyboard.press('ArrowRight')
    await expect(page.locator('text=Step 1 /')).toBeVisible()
    
    await page.keyboard.press('ArrowRight')
    await expect(page.locator('text=Step 2 /')).toBeVisible()
    
    await page.keyboard.press('ArrowLeft')
    await expect(page.locator('text=Step 1 /')).toBeVisible()
  })

  test('phase explanation displays after step', async ({ page }) => {
    const nextButton = page.locator('button', { hasText: 'Next →' })
    await nextButton.click()
    
    const phaseBox = page.locator('.rounded-lg.px-5.py-4')
    await expect(phaseBox.first()).toBeVisible()
    
    const phaseTitle = phaseBox.locator('p.font-medium')
    await expect(phaseTitle.first()).toBeVisible()
    const titleText = await phaseTitle.first().textContent()
    expect(titleText?.length).toBeGreaterThan(0)
  })

  test('stepper shows total steps correctly', async ({ page }) => {
    const stepText = page.locator('span.text-xs.text-muted').filter({ hasText: 'Step' })
    const text = await stepText.textContent()
    
    const match = text?.match(/Step \d+ \/ (\d+)/)
    expect(match).toBeTruthy()
    const totalSteps = parseInt(match![1])
    expect(totalSteps).toBeGreaterThan(0)
  })

  test('next button becomes disabled at last step', async ({ page }) => {
    const nextButton = page.locator('button', { hasText: 'Next →' })
    const stepText = page.locator('span.text-xs.text-muted').filter({ hasText: 'Step' })
    
    const text = await stepText.textContent()
    const totalSteps = parseInt(text!.match(/Step \d+ \/ (\d+)/)![1])
    
    for (let i = 0; i < totalSteps; i++) {
      await nextButton.click()
    }
    
    await expect(nextButton).toBeDisabled()
  })

  test('can navigate through all steps and back', async ({ page }) => {
    const nextButton = page.locator('button', { hasText: 'Next →' })
    const backButton = page.locator('button', { hasText: '← Back' })
    const stepText = page.locator('span.text-xs.text-muted').filter({ hasText: 'Step' })
    
    const text = await stepText.textContent()
    const totalSteps = parseInt(text!.match(/Step \d+ \/ (\d+)/)![1])
    
    for (let i = 0; i < totalSteps; i++) {
      await nextButton.click()
    }
    
    await expect(page.locator(`text=Step ${totalSteps} /`)).toBeVisible()
    
    for (let i = totalSteps; i > 0; i--) {
      await backButton.click()
    }
    
    await expect(page.locator('text=Step 0 /')).toBeVisible()
  })
})
