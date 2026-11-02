import { test, expect } from '@playwright/test';

test.describe('QA Agent: Core Game Loop Validation', () => {
  test('Microgames execute without runtime errors', async ({ page }) => {
    // 1. Fail immediately if the browser throws any unhandled exceptions
    const errors: Error[] = [];
    page.on('pageerror', (err) => {
      errors.push(err);
      console.error('QA Agent caught browser error:', err.message);
    });

    // 2. Navigate to the local dev server
    await page.goto('http://localhost:3000');

    // 3. Play through 4 games to verify the loop
    for (let i = 0; i < 4; i++) {
      console.log(`\n--- QA Agent: Testing Game ${i + 1} ---`);
      
      // Wait for the VERB SLAM to pass and the interactive engine to render
      await page.waitForSelector('.border-2.border-gray-700', { state: 'visible' });

      // Determine which engine loaded
      const isCli = await page.locator('.xterm').isVisible();
      const isConfig = await page.locator('textarea').isVisible();

      if (isCli) {
        console.log('Detected CLI_EXEC engine.');
        // Type a dummy command to ensure xterm isn't crashing on input
        await page.keyboard.type('ls');
        await page.keyboard.press('Enter');
      } else if (isConfig) {
        console.log('Detected CONFIG_EDIT engine.');
        // Type into the config editor to ensure it doesn't crash on state updates
        await page.locator('textarea').type('QA_TEST');
      }

      // Wait for the RESOLUTION phase to complete and loop to the next game
      await page.waitForTimeout(12000); 
    }

    // Assert no runtime errors were caught
    expect(errors.length).toBe(0);
  });
});
