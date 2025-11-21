// Manual test for cosmetics system
// This file is for manual testing only - not part of the build

import { COSMETIC_THEMES, COSMETIC_SPRITES } from "./constants";

/**
 * Test cosmetic catalog
 */
function testCosmeticCatalog(): void {
  console.log("=== Cosmetic Catalog Tests ===\n");

  console.log("--- Themes ---");
  console.log(`Total themes: ${COSMETIC_THEMES.length}\n`);

  COSMETIC_THEMES.forEach((theme) => {
    console.log(`Theme: ${theme.name} (${theme.id})`);
    console.log(`  Description: ${theme.description}`);
    console.log(`  Cost: ${theme.cost} Soul Embers`);
    console.log(`  Colors:`);
    console.log(`    Primary: ${theme.colors.primary}`);
    console.log(`    Secondary: ${theme.colors.secondary}`);
    console.log(`    Accent: ${theme.colors.accent}`);
    console.log(`    Background: ${theme.colors.background}`);
    console.log("");
  });

  console.log("\n--- Sprites ---");
  console.log(`Total sprites: ${COSMETIC_SPRITES.length}\n`);

  COSMETIC_SPRITES.forEach((sprite) => {
    console.log(`Sprite: ${sprite.name} (${sprite.id})`);
    console.log(`  Description: ${sprite.description}`);
    console.log(`  Cost: ${sprite.cost} Soul Embers`);
    console.log(`  Image: ${sprite.imagePath}`);
    console.log("");
  });
}

/**
 * Test cosmetic purchase logic
 */
function testCosmeticPurchase(): void {
  console.log("\n=== Cosmetic Purchase Tests ===\n");

  // Simulate player state
  let soulEmbers = 500;
  const ownedThemes = ["default"];
  const ownedSprites = ["default"];

  console.log(`Starting Soul Embers: ${soulEmbers}`);
  console.log(`Owned Themes: ${ownedThemes.join(", ")}`);
  console.log(`Owned Sprites: ${ownedSprites.join(", ")}\n`);

  // Test purchasing themes
  console.log("--- Attempting Theme Purchases ---\n");

  COSMETIC_THEMES.forEach((theme) => {
    if (theme.id === "default") {
      console.log(`${theme.name}: Already owned (default)`);
      return;
    }

    const canAfford = soulEmbers >= theme.cost;
    const alreadyOwned = ownedThemes.indexOf(theme.id) !== -1;

    if (alreadyOwned) {
      console.log(`${theme.name}: Already owned`);
    } else if (!canAfford) {
      console.log(
        `${theme.name}: Cannot afford (need ${theme.cost}, have ${soulEmbers})`
      );
    } else {
      soulEmbers -= theme.cost;
      ownedThemes.push(theme.id);
      console.log(
        `${theme.name}: Purchased for ${theme.cost} embers (remaining: ${soulEmbers})`
      );
    }
  });

  console.log(`\nFinal Soul Embers: ${soulEmbers}`);
  console.log(`Owned Themes: ${ownedThemes.join(", ")}`);
}

/**
 * Test theme application
 */
function testThemeApplication(): void {
  console.log("\n=== Theme Application Tests ===\n");

  const testTheme = COSMETIC_THEMES[2]; // Emerald Grove

  console.log(`Applying theme: ${testTheme.name}\n`);
  console.log("CSS Variables to set:");
  console.log(`  --theme-primary: ${testTheme.colors.primary}`);
  console.log(`  --theme-secondary: ${testTheme.colors.secondary}`);
  console.log(`  --theme-accent: ${testTheme.colors.accent}`);
  console.log(`  --theme-background: ${testTheme.colors.background}`);
  console.log(`\nBody background: ${testTheme.colors.backgroundGradient}`);
}

/**
 * Test cosmetic pricing progression
 */
function testCosmeticPricing(): void {
  console.log("\n=== Cosmetic Pricing Analysis ===\n");

  const themeCosts = COSMETIC_THEMES.filter((t) => t.cost > 0).map(
    (t) => t.cost
  );
  const spriteCosts = COSMETIC_SPRITES.filter((s) => s.cost > 0).map(
    (s) => s.cost
  );

  console.log("Theme Costs:");
  themeCosts.forEach((cost, index) => {
    console.log(`  Theme ${index + 1}: ${cost} Soul Embers`);
  });

  console.log("\nSprite Costs:");
  spriteCosts.forEach((cost, index) => {
    console.log(`  Sprite ${index + 1}: ${cost} Soul Embers`);
  });

  const totalThemeCost = themeCosts.reduce((sum, cost) => sum + cost, 0);
  const totalSpriteCost = spriteCosts.reduce((sum, cost) => sum + cost, 0);
  const totalCost = totalThemeCost + totalSpriteCost;

  console.log(`\nTotal cost for all themes: ${totalThemeCost} Soul Embers`);
  console.log(`Total cost for all sprites: ${totalSpriteCost} Soul Embers`);
  console.log(`Total cost for all cosmetics: ${totalCost} Soul Embers`);

  // Calculate how many sessions needed
  const avgEmbersPerSession = 50; // Rough estimate
  const sessionsNeeded = Math.ceil(totalCost / avgEmbersPerSession);
  console.log(
    `\nEstimated sessions to unlock all: ~${sessionsNeeded} (at ${avgEmbersPerSession} embers/session)`
  );
}

// Run all tests
testCosmeticCatalog();
testCosmeticPurchase();
testThemeApplication();
testCosmeticPricing();

/**
 * EXPECTED BEHAVIOR:
 *
 * 1. Cosmetic Catalog:
 *    ✓ 6 themes total (including default)
 *    ✓ 4 sprites total (including default)
 *    ✓ Each has unique ID, name, description, and cost
 *    ✓ Default items have 0 cost
 *
 * 2. Purchase Logic:
 *    ✓ Check if user has enough Soul Embers
 *    ✓ Check if item is already owned
 *    ✓ Deduct cost from Soul Embers
 *    ✓ Add item to owned list
 *    ✓ Persist to chrome.storage.sync
 *
 * 3. Theme Application:
 *    ✓ Set CSS variables for colors
 *    ✓ Apply background gradient to body
 *    ✓ All themed UI elements update automatically
 *
 * 4. Sprite Application:
 *    ✓ Update character sprite images
 *    ✓ Apply to both idle and break views
 *
 * 5. Requirements Verification:
 *    ✓ 15.1: Maintain catalog of unlockable cosmetics
 *    ✓ 15.2: Display shop interface during breaks
 *    ✓ 15.3: Purchase cosmetics with Soul Embers
 *    ✓ 15.4: Apply selected theme/sprite to UI
 *    ✓ 15.5: Persist to chrome.storage.sync for cross-device
 *
 * MANUAL TESTING STEPS:
 *
 * 1. Start extension and complete a few sessions to earn Soul Embers
 * 2. During break, open the shop section
 * 3. Verify all themes and sprites are listed
 * 4. Verify purchase buttons are disabled if insufficient embers
 * 5. Purchase a theme and verify:
 *    - Soul Embers deducted
 *    - Theme marked as "Owned"
 *    - "Apply" button appears
 * 6. Click "Apply" and verify:
 *    - Theme colors change throughout UI
 *    - Theme marked as "Active"
 * 7. Repeat for sprites
 * 8. Close and reopen extension - verify cosmetics persist
 * 9. Test on different device - verify sync works
 */
