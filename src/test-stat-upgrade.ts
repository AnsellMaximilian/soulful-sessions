// Manual test for stat upgrade system
// This file is for manual testing only - not part of the build

import { FORMULAS } from "./constants";

/**
 * Calculate upgrade cost for a stat
 */
function calculateUpgradeCost(currentStatValue: number): number {
  return Math.floor(
    FORMULAS.STAT_UPGRADE_BASE_COST *
      Math.pow(FORMULAS.STAT_UPGRADE_COST_MULTIPLIER, currentStatValue)
  );
}

/**
 * Test upgrade cost calculation
 */
function testUpgradeCosts(): void {
  console.log("=== Stat Upgrade Cost Tests ===\n");

  // Test costs for different stat values
  const testValues = [1, 2, 3, 5, 10, 15, 20];

  console.log("Formula: baseCost * (1.5 ^ currentStatValue)");
  console.log(`Base Cost: ${FORMULAS.STAT_UPGRADE_BASE_COST}`);
  console.log(`Multiplier: ${FORMULAS.STAT_UPGRADE_COST_MULTIPLIER}\n`);

  testValues.forEach((value) => {
    const cost = calculateUpgradeCost(value);
    console.log(`Stat Value ${value} -> Upgrade Cost: ${cost} Soul Embers`);
  });

  console.log("\n=== Harmony Special Case ===");
  console.log("Harmony is stored as decimal (0.05 = 5%)");
  console.log("Cost calculation uses whole number (5 instead of 0.05)");

  const harmonyValues = [0.05, 0.06, 0.07, 0.1, 0.15];
  harmonyValues.forEach((value) => {
    const wholeNumber = value * 100;
    const cost = calculateUpgradeCost(wholeNumber);
    console.log(
      `Harmony ${(value * 100).toFixed(
        0
      )}% (${value}) -> Upgrade Cost: ${cost} Soul Embers`
    );
  });

  console.log("\n=== Upgrade Progression Example ===");
  console.log("Starting with Spirit = 1, Soul Embers = 1000\n");

  let spirit = 1;
  let embers = 1000;
  let upgradeCount = 0;

  while (embers >= calculateUpgradeCost(spirit)) {
    const cost = calculateUpgradeCost(spirit);
    embers -= cost;
    spirit += 1;
    upgradeCount++;
    console.log(
      `Upgrade ${upgradeCount}: Spirit ${
        spirit - 1
      } -> ${spirit}, Cost: ${cost}, Remaining: ${embers}`
    );
  }

  console.log(`\nTotal upgrades possible: ${upgradeCount}`);
  console.log(`Final Spirit: ${spirit}`);
  console.log(`Remaining Soul Embers: ${embers}`);
  console.log(`Next upgrade would cost: ${calculateUpgradeCost(spirit)}`);
}

// Run tests
testUpgradeCosts();

/**
 * EXPECTED BEHAVIOR:
 *
 * 1. Upgrade cost formula: baseCost * (1.5 ^ currentStatValue)
 *    - Base cost: 10 Soul Embers
 *    - Multiplier: 1.5
 *
 * 2. Cost progression:
 *    - Spirit 1 -> 2: 10 * (1.5^1) = 15 embers
 *    - Spirit 2 -> 3: 10 * (1.5^2) = 22 embers
 *    - Spirit 3 -> 4: 10 * (1.5^3) = 33 embers
 *    - Spirit 5 -> 6: 10 * (1.5^5) = 75 embers
 *    - Spirit 10 -> 11: 10 * (1.5^10) = 576 embers
 *
 * 3. Harmony special handling:
 *    - Stored as decimal (0.05 = 5% crit chance)
 *    - Cost calculated using whole number (5)
 *    - Increments by 0.01 (1%) per upgrade
 *
 * 4. Requirements verification:
 *    ✓ Create upgrade cost formula: baseCost * (1.5 ^ currentStatValue)
 *    ✓ Add upgrade buttons to Break View stats panel
 *    ✓ Display upgrade cost next to each stat
 *    ✓ Handle upgrade purchase: deduct Soul Embers, increment stat, update cost
 *    ✓ Disable upgrade button if insufficient Soul Embers
 *    ✓ Persist stat changes to storage
 */
