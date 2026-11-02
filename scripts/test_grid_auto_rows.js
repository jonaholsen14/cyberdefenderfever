const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  await page.goto('http://localhost:3000');
  await page.click('button:has-text("Trophy Room")');
  await page.waitForTimeout(500);

  const testResults = await page.evaluate(() => {
    const grid = document.querySelector('.grid.content-start');
    if (!grid) return null;

    // Test changing gridAutoRows
    grid.style.gridAutoRows = 'minmax(130px, auto)';
    const cards = Array.from(grid.querySelectorAll('.rounded-xl')).filter(c => c.querySelector('h3'));
    cards.forEach(c => {
      c.style.minHeight = '125px';
      c.style.padding = '14px';
    });

    const overflows = cards.filter(c => c.scrollHeight > c.clientHeight).map(c => ({
      title: c.querySelector('h3')?.textContent,
      scrollHeight: c.scrollHeight,
      clientHeight: c.clientHeight
    }));

    return {
      overflowCount: overflows.length,
      firstCardHeight: cards[0].clientHeight,
      parentRows: window.getComputedStyle(grid).gridTemplateRows.split(' ').slice(0, 5)
    };
  });

  console.log(JSON.stringify(testResults, null, 2));
  await browser.close();
})();
