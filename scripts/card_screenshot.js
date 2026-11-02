const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  // Set stats with Terminal Velocity equipped
  await page.goto('http://localhost:3000');
  await page.evaluate(() => {
    const stats = JSON.parse(localStorage.getItem('ccdc_player_stats_v2') || '{}');
    stats.selectedBadgeId = 'multi_stage_master';
    if (!stats.unlockedAchievementIds) stats.unlockedAchievementIds = [];
    if (!stats.unlockedAchievementIds.includes('multi_stage_master')) stats.unlockedAchievementIds.push('multi_stage_master');
    localStorage.setItem('ccdc_player_stats_v2', JSON.stringify(stats));
  });
  await page.reload();
  await page.waitForTimeout(500);

  await page.click('button:has-text("Trophy Room")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("LEGENDARY")');
  await page.waitForTimeout(500);

  // find card with Terminal Velocity
  const card = page.locator('.rainbow-border:has-text("Terminal Velocity")');
  const destPath = 'C:\\Users\\jjols\\.gemini\\antigravity\\brain\\bccbaa5f-ec55-4c80-9b33-6a95cd39fbf2\\terminal_velocity_debug.png';
  await card.screenshot({ path: destPath });
  await browser.close();
  console.log('Saved terminal_velocity_debug.png');
})();
