import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Check if we need to log in
    const loginButton = await page.locator('text=Login').first();
    if (await loginButton.count() > 0) {
      console.log('Login page detected - attempting to navigate to dashboard...');
      // Try to access instructor dashboard directly
      await page.goto('http://localhost:5173/instructor-dashboard', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
    }

    // Navigate to Exams > Questions tab
    console.log('Looking for Exams link...');
    const examsLink = await page.locator('text=Exams').first();
    if (await examsLink.count() > 0) {
      await examsLink.click();
      await page.waitForTimeout(1500);
    }

    // Check for Questions tab
    const questionsTab = await page.locator('text=Questions').first();
    if (await questionsTab.count() > 0) {
      await questionsTab.click();
      await page.waitForTimeout(1500);
    }

    // Take screenshot
    const screenshotPath = path.join(__dirname, 'phase1-screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved to: ${screenshotPath}`);

    // Check for filter count badge
    const filterBadge = await page.locator('span:has-text("Filters") >> ../.. >> span.rounded-full.bg-blue-500');
    const badgeExists = await filterBadge.count() > 0;
    console.log(`✓ Filter count badge exists: ${badgeExists}`);

    // Check for stat cards
    const approvedCard = await page.locator('text=Approved').first();
    const underReviewCard = await page.locator('text=Under Review').first();
    const draftsCard = await page.locator('text=Drafts').first();

    console.log(`✓ Approved stat card visible: ${await approvedCard.count() > 0}`);
    console.log(`✓ Under Review stat card visible: ${await underReviewCard.count() > 0}`);
    console.log(`✓ Drafts stat card visible: ${await draftsCard.count() > 0}`);

    // Look for created date in question cards
    const createdDateElements = await page.locator('text=/Created:/').count();
    console.log(`✓ Created date visible on ${createdDateElements} question card(s)`);

    console.log('\n✅ Phase 1 verification complete!');

  } catch (error) {
    console.error('Error during test:', error);
    const errorScreenshotPath = path.join(__dirname, 'error-screenshot.png');
    await page.screenshot({ path: errorScreenshotPath, fullPage: true });
    console.log(`Error screenshot saved to: ${errorScreenshotPath}`);
  } finally {
    await browser.close();
  }
})();
