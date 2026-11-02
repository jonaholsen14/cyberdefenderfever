const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Open Trophy Room via PROFILE button on Main Menu
  console.log('Opening Trophy Room via PROFILE button...');
  await page.click('button:has-text("PROFILE")');
  await page.waitForSelector('text=Trophy Room & Profile', { timeout: 10000 });
  await page.waitForTimeout(500);

  // Check achievement counter text
  const counterText = await page.textContent('div:has-text("Chievos")');
  console.log('Chievos counter text:', counterText);
  if (!counterText.includes('/ 100')) {
    throw new Error('Expected / 100 in Chievos counter, got: ' + counterText);
  }

  // Check SOC Director description
  const socDirectorCard = page.locator('div:has-text("SOC Director")').first();
  const socText = await socDirectorCard.textContent();
  console.log('SOC Director details:', socText);
  if (!socText.includes('50 total achievements')) {
    throw new Error('Expected 50 total achievements for SOC Director, got: ' + socText);
  }

  // Filter by EPIC and check Terminal Velocity
  console.log('Filtering by EPIC...');
  await page.click('button:has-text("EPIC")');
  await page.waitForTimeout(500);

  const termVelocity = page.locator('div:has-text("Terminal Velocity")').first();
  const termText = await termVelocity.textContent();
  console.log('Terminal Velocity details under EPIC:', termText);
  if (!termText.includes('EPIC') || !termText.includes('Terminal Velocity')) {
    throw new Error('Expected Terminal Velocity to be in EPIC filter, got: ' + termText);
  }

  // Capture screenshot of Trophy Room with 100 achievements
  const trophy100Path = path.resolve('C:/Users/jjols/.gemini/antigravity/brain/bccbaa5f-ec55-4c80-9b33-6a95cd39fbf2/trophy_room_100_achievements.png');
  await page.screenshot({ path: trophy100Path });
  console.log('Saved screenshot:', trophy100Path);

  // Close Trophy Room
  await page.click('button:has-text("ESC / CLOSE")');
  await page.waitForTimeout(500);

  // 2. Test one of the new cards via FOCUSED / DEBUG menu
  console.log('Testing new card via Focused debug menu...');
  await page.click('button:has-text("FOCUSED")');
  await page.waitForTimeout(500);

  // Select cli-linux-devshm
  await page.selectOption('select', 'cli-linux-devshm');
  await page.locator('select').nth(1).selectOption('none');
  await page.click('button:has-text("LAUNCH DEBUG RUN")');

  // Wait for VERB_SLAM to show PURGE /DEV/SHM!
  await page.waitForSelector('text=PURGE /DEV/SHM!', { timeout: 5000 });
  console.log('New card PURGE /DEV/SHM! launched successfully');

  // Wait for interactive terminal
  await page.waitForTimeout(1200);

  const newCardPath = path.resolve('C:/Users/jjols/.gemini/antigravity/brain/bccbaa5f-ec55-4c80-9b33-6a95cd39fbf2/new_card_devshm_interactive.png');
  await page.screenshot({ path: newCardPath });
  console.log('Saved new card screenshot:', newCardPath);

  console.log('ALL VERIFICATION CHECKS PASSED PERFECTLY!');
  await browser.close();
})();
