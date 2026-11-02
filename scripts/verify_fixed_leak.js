const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  await page.goto('http://localhost:3000');
  await page.evaluate(() => {
    // Unlock some, lock some to test mixed rows
    const unlocked = ['first_win', 'split_second', 'linux_recruit', 'win_recruit', 'study_break_1', 'traffic_guard', 'multi_stage_master'];
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

  await page.evaluate(() => {
    const grid = document.querySelector('.grid.content-start');
    if (!grid) return;
    grid.className = 'flex-grow min-h-0 p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 content-start auto-rows-[minmax(130px,auto)]';
    grid.style.gridAutoRows = 'minmax(130px, auto)';

    const cards = Array.from(grid.querySelectorAll('.rounded-xl')).filter(c => c.querySelector('h3'));
    cards.forEach(c => {
      c.style.minHeight = '125px';
      c.style.padding = '14px';
      const details = c.querySelector('.flex-grow');
      if (details) details.classList.add('h-full');
      const ab = c.querySelector('.border-t');
      if (ab) {
        ab.className = 'mt-2 flex items-center justify-between pt-1.5 border-t border-gray-800/60';
      }
      const prog = c.querySelector('.mt-2\\.5');
      if (prog) prog.className = 'mt-2';
    });
  });

  const grid = page.locator('.grid.content-start');
  await grid.screenshot({ path: 'C:\\Users\\jjols\\.gemini\\antigravity\\brain\\bccbaa5f-ec55-4c80-9b33-6a95cd39fbf2\\fixed_leak_debug.png' });
  await browser.close();
  console.log('Saved fixed_leak_debug.png');
})();
