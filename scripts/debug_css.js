const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  await page.goto('http://localhost:3000');
  await page.click('button:has-text("Trophy Room")');
  await page.waitForTimeout(500);

  const debug = await page.evaluate(() => {
    const card = document.querySelector('h3').closest('.rounded-xl');
    const parent = card.parentElement;
    return {
      cardClass: card.className,
      cardInlineStyle: card.getAttribute('style'),
      cardComputedHeight: window.getComputedStyle(card).height,
      cardComputedMinHeight: window.getComputedStyle(card).minHeight,
      cardComputedMaxHeight: window.getComputedStyle(card).maxHeight,
      parentComputedDisplay: window.getComputedStyle(parent).display,
      parentComputedGridTemplateRows: window.getComputedStyle(parent).gridTemplateRows,
      parentComputedGridAutoRows: window.getComputedStyle(parent).gridAutoRows,
      parentComputedAlignContent: window.getComputedStyle(parent).alignContent,
      parentComputedAlignItems: window.getComputedStyle(parent).alignItems,
    };
  });

  console.log(JSON.stringify(debug, null, 2));
  await browser.close();
})();
