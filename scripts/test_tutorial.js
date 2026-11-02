const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(1000);

  // Take screenshot of main menu to verify HOW TO PLAY button
  const menuScreenshot = path.resolve('C:/Users/jjols/.gemini/antigravity/brain/bccbaa5f-ec55-4c80-9b33-6a95cd39fbf2/main_menu_with_tutorial_btn.png');
  await page.screenshot({ path: menuScreenshot });
  console.log('Main menu screenshot saved to', menuScreenshot);

  console.log('Clicking HOW TO PLAY (BRIEFING)...');
  await page.click('button:has-text("HOW TO PLAY (BRIEFING)")');
  await page.waitForTimeout(1000);

  // Wait for VERB_SLAM to finish
  await page.waitForSelector('text=SECURE CHANNEL // PROTOCOL OVERVIEW', { timeout: 10000 });
  await page.waitForTimeout(500);

  const manualScreenshot = path.resolve('C:/Users/jjols/.gemini/antigravity/brain/bccbaa5f-ec55-4c80-9b33-6a95cd39fbf2/manual_briefing_standalone.png');
  await page.screenshot({ path: manualScreenshot });
  console.log('Manual briefing screenshot saved to', manualScreenshot);

  // Check that the button says RETURN TO BASE
  const buttonText = await page.textContent('button:has-text("RETURN TO BASE")');
  console.log('Button text found:', buttonText);

  // Click RETURN TO BASE
  await page.click('button:has-text("RETURN TO BASE")');
  await page.waitForTimeout(1500);

  // Verify we are back on MAIN_MENU
  await page.waitForSelector('text=Cyber Defender Fever', { timeout: 5000 });
  console.log('Successfully returned to Main Menu!');

  await browser.close();
  console.log('ALL QA CHECKS PASSED!');
})();
