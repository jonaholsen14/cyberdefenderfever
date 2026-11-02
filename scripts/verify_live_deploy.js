const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  console.log('Navigating to live site: https://cyber-trainer.web.app ...');
  const response = await page.goto('https://cyber-trainer.web.app', { waitUntil: 'networkidle' });
  console.log('HTTP status:', response.status());

  const title = await page.title();
  console.log('Page title:', title);

  // Take screenshot of live homepage
  const destPath = 'C:\\Users\\jjols\\.gemini\\antigravity\\brain\\bccbaa5f-ec55-4c80-9b33-6a95cd39fbf2\\live_deployed_site.png';
  await page.screenshot({ path: destPath });
  console.log('Captured live_deployed_site.png');

  // Open Trophy Room on live site to verify
  await page.click('button:has-text("Trophy Room")');
  await page.waitForTimeout(600);
  const trophyPath = 'C:\\Users\\jjols\\.gemini\\antigravity\\brain\\bccbaa5f-ec55-4c80-9b33-6a95cd39fbf2\\live_trophy_room.png';
  await page.screenshot({ path: trophyPath });
  console.log('Captured live_trophy_room.png');

  await browser.close();
})();
