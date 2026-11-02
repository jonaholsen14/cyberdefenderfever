const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  console.log('Navigating to live production site: https://cyber-trainer.web.app ...');
  await page.goto('https://cyber-trainer.web.app', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  console.log('Opening Trophy Room on live production site...');
  await page.click('button:has-text("Trophy Room")');
  await page.waitForSelector('text=Trophy Room & Profile', { timeout: 10000 });
  await page.waitForTimeout(500);

  const counterText = await page.textContent('div:has-text("Chievos")');
  console.log('Live Chievos counter:', counterText.match(/\d+\s*\/\s*\d+/)?.[0]);

  const liveTrophyPath = path.resolve('C:/Users/jjols/.gemini/antigravity/brain/bccbaa5f-ec55-4c80-9b33-6a95cd39fbf2/live_trophy_room_100.png');
  await page.screenshot({ path: liveTrophyPath });
  console.log('Captured live production screenshot:', liveTrophyPath);

  await browser.close();
  console.log('Live verification complete!');
})();
