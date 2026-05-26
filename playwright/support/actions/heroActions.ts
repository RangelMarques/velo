import { expect, Page } from '@playwright/test'

export function createHeroActions(page: Page) {
  return {
    async open() {
      await page.goto('/')
      const cta = page.getByRole('link', { name: /Configure Agora/i })
      await expect(cta).toBeVisible()
      await cta.click()
    },
  }
}