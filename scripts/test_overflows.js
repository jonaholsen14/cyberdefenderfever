const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  await page.goto('http://localhost:3000');
  await page.evaluate(() => {
    const unlocked = ['first_win', 'split_second', 'linux_recruit', 'win_recruit', 'study_break_1', 'traffic_guard'];
    localStorage.setItem('ccdc_unlocked_achievements_v2', JSON.stringify(unlocked));
    const stats = JSON.parse(localStorage.getItem('ccdc_player_stats_v2') || '{}');
    stats.unlockedAchievementIds = unlocked;
    localStorage.setItem('ccdc_player_stats_v2', JSON.stringify(stats));
  });
  await page.reload();
  await page.waitForTimeout(500);

  await page.click('button:has-text("Trophy Room")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("ALL")');
  await page.waitForTimeout(500);

  // Measure all cards and see which ones overflow
  const cardData = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.rounded-xl')).filter(c => c.querySelector('h3'));
    return cards.map(c => {
      const title = c.querySelector('h3')?.textContent;
      const scrollHeight = c.scrollHeight;
      const clientHeight = c.clientHeight;
      const overflows = scrollHeight > clientHeight;
      return { title, scrollHeight, clientHeight, overflows };
    });
  });

  console.log('Cards overflow report:');
  console.log(cardData.slice(0, 10));
  await browser.close();
})();
