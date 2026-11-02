const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = await chromium.launch({
    executablePath: fs.existsSync(edgePath) ? edgePath : undefined,
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();
  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  const artifactDir = 'C:\\Users\\jjols\\.gemini\\antigravity\\brain\\bccbaa5f-ec55-4c80-9b33-6a95cd39fbf2';

  // Helper to set badge in localStorage and reload
  async function setEquippedBadge(badgeId) {
    await page.evaluate((id) => {
      const statsStr = localStorage.getItem('ccdc_player_stats_v2');
      let stats = statsStr ? JSON.parse(statsStr) : {};
      stats.selectedBadgeId = id;
      if (!stats.unlockedAchievementIds) stats.unlockedAchievementIds = [];
      if (!stats.unlockedAchievementIds.includes(id)) stats.unlockedAchievementIds.push(id);
      localStorage.setItem('ccdc_player_stats_v2', JSON.stringify(stats));
    }, badgeId);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
  }

  function saveShot(filename) {
    const srcPath = path.join(__dirname, filename);
    const destPath = path.join(artifactDir, filename);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
    }
  }

  // 1. Common Badge (first_win: First Response, Common)
  await setEquippedBadge('first_win');
  await page.screenshot({ path: path.join(__dirname, 'qa_badge_common.png') });
  saveShot('qa_badge_common.png');
  console.log('Captured qa_badge_common.png (Common emerald border)');

  // 2. Rare Badge (linux_adept: Sudo Champion, Rare)
  await setEquippedBadge('linux_adept');
  await page.screenshot({ path: path.join(__dirname, 'qa_badge_rare.png') });
  saveShot('qa_badge_rare.png');
  console.log('Captured qa_badge_rare.png (Rare silver-cyan border)');

  // 3. Epic Badge (streak_ten: Unbreachable, Epic)
  await setEquippedBadge('streak_ten');
  await page.screenshot({ path: path.join(__dirname, 'qa_badge_epic.png') });
  saveShot('qa_badge_epic.png');
  console.log('Captured qa_badge_epic.png (Epic gold border)');

  // 4. Legendary Badge (cyber_legend: Cyber Defender Fever, Legendary)
  await setEquippedBadge('cyber_legend');
  await page.screenshot({ path: path.join(__dirname, 'qa_badge_legendary.png') });
  saveShot('qa_badge_legendary.png');
  console.log('Captured qa_badge_legendary.png (Legendary RGB spinning rainbow border)');

  // 5. Open Leaderboard with Legendary Badge equipped
  await page.click('button:has-text("Leaderboard")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(__dirname, 'qa_badge_leaderboard.png') });
  saveShot('qa_badge_leaderboard.png');
  console.log('Captured qa_badge_leaderboard.png');
  await page.click('button:has-text("ESC / CLOSE")');
  await page.waitForTimeout(400);

  // 6. Open Trophy Room with Legendary Badge equipped
  await page.click('button:has-text("Trophy Room")');
  await page.waitForTimeout(600);
  // Switch to LEGENDARY tab to check legendary card borders
  await page.click('button:has-text("LEGENDARY")');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(__dirname, 'qa_badge_trophyroom_legendary.png') });
  saveShot('qa_badge_trophyroom_legendary.png');
  console.log('Captured qa_badge_trophyroom_legendary.png');
  
  // Switch to ALL tab to check card sizes and scrolling
  await page.click('button:has-text("ALL")');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(__dirname, 'qa_badge_trophyroom.png') });
  saveShot('qa_badge_trophyroom.png');
  console.log('Captured qa_badge_trophyroom.png');

  // Click edit username to test header responsiveness
  await page.click('button[title="Edit Username"]');
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(__dirname, 'qa_trophyroom_editing.png') });
  saveShot('qa_trophyroom_editing.png');
  console.log('Captured qa_trophyroom_editing.png');

  await page.click('button:has-text("ESC / CLOSE")');
  await page.waitForTimeout(400);

  // 7. Verify Bug Report / Feedback modal
  await page.click('button:has-text("Feedback")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(__dirname, 'qa_feedback_modal.png') });
  saveShot('qa_feedback_modal.png');
  console.log('Captured qa_feedback_modal.png');
  await page.click('button:has-text("ESC / CLOSE")');
  await page.waitForTimeout(400);

  // 8. Verify Auth Sign-Up / Log-In modal
  await page.click('button:has-text("Sign In")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(__dirname, 'qa_auth_modal.png') });
  saveShot('qa_auth_modal.png');
  console.log('Captured qa_auth_modal.png');
  await page.click('button:has-text("ESC")');
  await page.waitForTimeout(400);

  // 9. Verify In-Game Screen with Legendary Badge
  await page.click('button:has-text("FOCUSED")');
  await page.waitForTimeout(400);
  await page.selectOption('select:has-text("LOCATE WEBSHELL")', 'multi-apache-webshell');
  await page.locator('select').nth(1).selectOption('none');
  await page.click('button:has-text("LAUNCH DEBUG RUN")');
  await page.waitForTimeout(1800);
  await page.screenshot({ path: path.join(__dirname, 'qa_in_game_legendary.png') });
  saveShot('qa_in_game_legendary.png');
  console.log('Captured qa_in_game_legendary.png');

  // 10. Win card and capture Victory Share UI
  await page.click('button:has-text("EXIT")');
  await page.waitForTimeout(600);
  // Ensure we are at main menu home tab
  await page.click('button:has-text("Home")');
  await page.waitForTimeout(400);
  await page.click('button:has-text("FOCUSED")');
  await page.waitForTimeout(400);
  await page.selectOption('select:has-text("LOCATE WEBSHELL")', 'sb-1');
  await page.locator('select').nth(1).selectOption('none');
  await page.click('button:has-text("LAUNCH DEBUG RUN")');
  await page.waitForTimeout(2000);
  await page.click('button:has-text("COOL!")');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(__dirname, 'qa_victory_share_snippet.png') });
  saveShot('qa_victory_share_snippet.png');
  console.log('Captured qa_victory_share_snippet.png');

  await browser.close();
  console.log('All QA tests and badge rarity captures completed!');
}

run().catch(err => {
  console.error('QA Script failed:', err);
  process.exit(1);
});
