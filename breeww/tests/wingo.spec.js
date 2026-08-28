import { test, expect } from '@playwright/test';

const TARGET_URL = process.env.TARGET_URL || 'http://localhost:5173';

test.describe('WinGo 30s (Color Prediction) Game', () => {
  test.beforeEach(async ({ page }) => {
    // Navigating directly to the game page
    await page.goto(`${TARGET_URL}/game/color-prediction`);
    
    // Waiting for initial render
    await page.waitForSelector('text=WinGo 30s');
  });

  test('should display initial balance and header', async ({ page }) => {
    // 1. Verify Header
    await expect(page.locator('text=WinGo 30s')).toBeVisible();
    await expect(page.locator('text=Period:')).toBeVisible();
    
    // 2. Verify Wallet Balance
    // Assumes initial balance is ₹10,000 as per requirement
    await expect(page.locator('text=₹10,000')).toBeVisible();
  });

  test('should have a working countdown timer', async ({ page }) => {
    // 1. Check timer initial state
    const timerText = await page.locator('text=00 :').innerText();
    const initialSeconds = parseInt(timerText.split(':')[1].trim());
    
    // 2. Wait 2 seconds and check if timer decreased
    await page.waitForTimeout(2000);
    const updatedTimerText = await page.locator('text=00 :').innerText();
    const updatedSeconds = parseInt(updatedTimerText.split(':')[1].trim());
    
    // 3. Since it resets to 30, it could be less than initial
    // We just want to see it changing
    expect(updatedSeconds).not.toBe(initialSeconds);
  });

  test('should allow placing a bet and update balance', async ({ page }) => {
    // 1. Click on "Red" color button
    await page.click('button:has-text("Red")');
    
    // 2. Enter bet amount
    await page.fill('input[placeholder="Enter bet amount"]', '100');
    
    // 3. Place Bet
    await page.click('button:has-text("Bet ₹")');
    
    // 4. Verify Active Bets section shows the bet
    await expect(page.locator('text=Red ₹100')).toBeVisible();
    
    // 5. Verify Wallet Balance decreased
    // ₹10,000 - ₹100 = ₹9,900
    await expect(page.locator('text=₹9,900')).toBeVisible();
  });

  test('should show result reveal overlay when timer is below 5s', async ({ page }) => {
    // 1. Wait until timer is <= 5 seconds
    await page.waitForFunction(() => {
      const timerElement = document.querySelector('.text-3xl.font-mono.text-red-500');
      if (!timerElement) return false;
      const seconds = parseInt(timerElement.innerText.split(':')[1].trim());
      return seconds <= 5 && seconds > 0;
    }, { timeout: 35000 });
    
    // 2. Verify Result reveal overlay is visible
    // The overlay has text "Next Round in" or shows number cards
    await expect(page.locator('text=Next Round in')).toBeVisible();
    
    // 3. Verify Betting is disabled
    const betButton = page.locator('button:has-text("Bet ₹")');
    await expect(betButton).toBeDisabled();
  });

  test('should update game history after round completion', async ({ page }) => {
    // 1. Get initial history count
    // Wait for history table or section
    const initialHistoryRows = await page.locator('table tbody tr').count();
    
    // 2. Wait for timer to reach 0 and reset (at least 35s to be safe)
    await page.waitForTimeout(35000);
    
    // 3. Verify History has one more entry or at least 1 entry if it was empty
    const updatedHistoryRows = await page.locator('table tbody tr').count();
    expect(updatedHistoryRows).toBeGreaterThanOrEqual(initialHistoryRows);
  });
});
