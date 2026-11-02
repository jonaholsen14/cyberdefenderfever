const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('http://localhost:3000');
  await page.click('button:has-text("Trophy Room")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("LEGENDARY")');
  await page.waitForTimeout(500);

  const cardInfo = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.rainbow-border'));
    return cards.map(c => {
      const parentRect = c.getBoundingClientRect();
      const child = c.firstElementChild;
      const childRect = child ? child.getBoundingClientRect() : null;
      const computedParent = window.getComputedStyle(c);
      const computedChild = child ? window.getComputedStyle(child) : null;
      return {
        className: c.className,
        childClassName: child ? child.className : '',
        parentRect: { width: parentRect.width, height: parentRect.height, top: parentRect.top, left: parentRect.left },
        childRect: childRect ? { width: childRect.width, height: childRect.height, top: childRect.top, left: childRect.left } : null,
        parentPadding: computedParent.padding,
        diff: childRect ? {
          top: childRect.top - parentRect.top,
          left: childRect.left - parentRect.left,
          right: parentRect.right - childRect.right,
          bottom: parentRect.bottom - childRect.bottom,
        } : null
      };
    });
  });

  console.log(JSON.stringify(cardInfo[0], null, 2));
  await browser.close();
})();
