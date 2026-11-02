const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  await page.goto('http://localhost:3000');
  await page.evaluate(() => {
    // Unlock all cards to test worst-case height (with action bar on every single card!)
    const allIds = Array.from(document.querySelectorAll('h3')).map(h => h.textContent.trim());
    const unlocked = ['first_win', 'split_second', 'linux_recruit', 'win_recruit', 'study_break_1', 'traffic_guard', 'multi_stage_master', 'cyber_legend', 'ten_streak'];
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

  // Test different styles live in the page
  const testConfigs = [
    { name: 'current', cardMinH: '110px', padding: '16px', gap: 'mt-3 pt-2' },
    { name: 'opt1_125px', cardMinH: '125px', padding: '14px', gap: 'mt-2 pt-1.5' },
    { name: 'opt2_130px', cardMinH: '130px', padding: '14px', gap: 'mt-2 pt-1.5' },
  ];

  for (const cfg of testConfigs) {
    const result = await page.evaluate((config) => {
      const grid = document.querySelector('.grid.content-start');
      if (!grid) return null;

      const cards = Array.from(grid.querySelectorAll('.rounded-xl')).filter(c => c.querySelector('h3'));
      cards.forEach(c => {
        c.style.minHeight = config.cardMinH;
        c.style.padding = config.padding;
        const ab = c.querySelector('.border-t');
        if (ab) {
          ab.className = 'mt-2 flex items-center justify-between pt-1.5 border-t border-gray-800/60';
        }
      });

      // Force layout recompute
      const overflows = cards.filter(c => c.scrollHeight > c.clientHeight + 1).map(c => ({
        title: c.querySelector('h3')?.textContent,
        scrollHeight: c.scrollHeight,
        clientHeight: c.clientHeight,
        diff: c.scrollHeight - c.clientHeight
      }));

      return {
        config: config.name,
        totalCards: cards.length,
        overflowingCardsCount: overflows.length,
        firstThreeOverflows: overflows.slice(0, 3)
      };
    }, cfg);

    console.log(JSON.stringify(result, null, 2));
  }

  await browser.close();
})();
