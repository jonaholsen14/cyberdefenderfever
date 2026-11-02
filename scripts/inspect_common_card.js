const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  await page.goto('http://localhost:3000');
  await page.evaluate(() => {
    const stats = JSON.parse(localStorage.getItem('ccdc_player_stats_v2') || '{}');
    if (!stats.unlockedAchievementIds) stats.unlockedAchievementIds = [];
    if (!stats.unlockedAchievementIds.includes('first_win')) stats.unlockedAchievementIds.push('first_win');
    localStorage.setItem('ccdc_player_stats_v2', JSON.stringify(stats));
  });
  await page.reload();
  await page.waitForTimeout(500);

  await page.click('button:has-text("Trophy Room")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("ALL")');
  await page.waitForTimeout(500);

  const cardInfo = await page.evaluate(() => {
    // Find the card containing "First Response"
    const card = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.includes('First Response'))?.closest('.rounded-xl');
    if (!card) return null;

    const details = card.querySelector('.flex-grow');
    const actionBar = card.querySelector('.border-t');
    const p = card.querySelector('p');
    
    return {
      cardRect: card.getBoundingClientRect(),
      detailsRect: details ? details.getBoundingClientRect() : null,
      actionBarRect: actionBar ? actionBar.getBoundingClientRect() : null,
      pRect: p ? p.getBoundingClientRect() : null,
      cardOverflow: card.scrollHeight > card.clientHeight,
      cardScrollHeight: card.scrollHeight,
      cardClientHeight: card.clientHeight,
      computedCard: {
        height: window.getComputedStyle(card).height,
        padding: window.getComputedStyle(card).padding,
        display: window.getComputedStyle(card).display,
        boxSizing: window.getComputedStyle(card).boxSizing,
      }
    };
  });

  console.log(JSON.stringify(cardInfo, null, 2));

  // Take screenshot of the first 4 cards in ALL tab
  const grid = page.locator('.grid.content-start');
  await grid.screenshot({ path: 'C:\\Users\\jjols\\.gemini\\antigravity\\brain\\bccbaa5f-ec55-4c80-9b33-6a95cd39fbf2\\all_cards_debug.png' });
  await browser.close();
})();
