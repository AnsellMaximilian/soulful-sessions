// Manual test for skill point allocation system
// This file is for manual testing only - not part of the build

import { FORMULAS } from "./constants";

/**
 * Calculate level threshold for a given level
 */
function calculateLevelThreshold(level: number): number {
  return Math.floor(
    FORMULAS.LEVEL_THRESHOLD_BASE *
      Math.pow(level, FORMULAS.LEVEL_THRESHOLD_EXPONENT)
  );
}

/**
 * Test skill point allocation
 */
function testSkillPointAllocation(): void {
  console.log("=== Skill Point Allocation Tests ===\n");

  console.log("Formula: 1 skill point per level gained");
  console.log(
    `Level Threshold Formula: ${FORMULAS.LEVEL_THRESHOLD_BASE} * (level ^ ${FORMULAS.LEVEL_THRESHOLD_EXPONENT})\n`
  );

  // Test level progression and skill points
  console.log("=== Level Progression ===");
  const levels = [1, 2, 3, 4, 5, 10, 15, 20];

  levels.forEach((level) => {
    const threshold = calculateLevelThreshold(level);
    console.log(`Level ${level}: ${threshold} Soul Insight required`);
  });

  console.log("\n=== Skill Point Grant Simulation ===");
  console.log("Starting at Level 1 with 0 Soul Insight\n");

  let currentLevel = 1;
  let totalSoulInsight = 0;
  let skillPoints = 0;

  // Simulate earning Soul Insight from sessions
  const sessionRewards = [250, 300, 350, 400, 450, 500, 550, 600];

  sessionRewards.forEach((reward, index) => {
    totalSoulInsight += reward;
    let leveledUp = false;
    let pointsGranted = 0;

    // Check for level-ups
    while (totalSoulInsight >= calculateLevelThreshold(currentLevel)) {
      currentLevel++;
      pointsGranted += FORMULAS.SKILL_POINTS_PER_LEVEL;
      leveledUp = true;
    }

    if (leveledUp) {
      skillPoints += pointsGranted;
      console.log(
        `Session ${
          index + 1
        }: +${reward} SI -> Level ${currentLevel}! (+${pointsGranted} skill points)`
      );
      console.log(
        `  Total SI: ${totalSoulInsight}, Skill Points: ${skillPoints}`
      );
    } else {
      console.log(
        `Session ${index + 1}: +${reward} SI (Total: ${totalSoulInsight})`
      );
    }
  });

  console.log(`\nFinal Level: ${currentLevel}`);
  console.log(`Total Soul Insight: ${totalSoulInsight}`);
  console.log(`Available Skill Points: ${skillPoints}`);
  console.log(`Next Level Threshold: ${calculateLevelThreshold(currentLevel)}`);

  console.log("\n=== Skill Point Allocation Simulation ===");
  console.log(`Starting with ${skillPoints} skill points\n`);

  // Simulate allocating skill points
  let spirit = 1;
  let harmony = 0.05; // 5%
  let soulflow = 1;
  let remainingPoints = skillPoints;

  console.log("Initial Stats:");
  console.log(`  Spirit: ${spirit}`);
  console.log(`  Harmony: ${(harmony * 100).toFixed(0)}%`);
  console.log(`  Soulflow: ${soulflow}`);

  // Allocate points
  const allocations = [
    { stat: "spirit", name: "Spirit" },
    { stat: "harmony", name: "Harmony" },
    { stat: "soulflow", name: "Soulflow" },
    { stat: "spirit", name: "Spirit" },
    { stat: "soulflow", name: "Soulflow" },
  ];

  console.log("\nAllocating skill points:");
  allocations.forEach((allocation, index) => {
    if (remainingPoints > 0) {
      if (allocation.stat === "spirit") {
        spirit += 1;
      } else if (allocation.stat === "harmony") {
        harmony += 0.01;
      } else if (allocation.stat === "soulflow") {
        soulflow += 1;
      }
      remainingPoints--;

      console.log(
        `  ${index + 1}. Allocate to ${
          allocation.name
        } (${remainingPoints} points remaining)`
      );
    }
  });

  console.log("\nFinal Stats:");
  console.log(`  Spirit: ${spirit} (+${spirit - 1})`);
  console.log(
    `  Harmony: ${(harmony * 100).toFixed(0)}% (+${(
      (harmony - 0.05) *
      100
    ).toFixed(0)}%)`
  );
  console.log(`  Soulflow: ${soulflow} (+${soulflow - 1})`);
  console.log(`  Remaining Skill Points: ${remainingPoints}`);

  console.log("\n=== Skill Point vs Soul Ember Upgrades ===");
  console.log("Skill Points:");
  console.log("  - Free (earned from leveling up)");
  console.log("  - +1 to stat per point");
  console.log("  - Limited by level progression");
  console.log("\nSoul Ember Upgrades:");
  console.log("  - Cost increases exponentially");
  console.log("  - +1 to stat per upgrade");
  console.log("  - Unlimited (if you have embers)");
  console.log("\nBoth methods stack - use skill points first!");
}

// Run tests
testSkillPointAllocation();

/**
 * EXPECTED BEHAVIOR:
 *
 * 1. Skill point grant on level-up:
 *    - 1 skill point per level gained
 *    - Can level up multiple times in one session
 *    - Skill points accumulate if not spent
 *
 * 2. Skill point allocation:
 *    - Deduct 1 skill point
 *    - Increment stat by 1 (or 0.01 for Harmony)
 *    - No cost in Soul Embers
 *    - Buttons disabled when no skill points available
 *
 * 3. Level thresholds:
 *    - Level 1: 100 Soul Insight
 *    - Level 2: 282 Soul Insight
 *    - Level 3: 519 Soul Insight
 *    - Level 5: 1118 Soul Insight
 *    - Level 10: 3162 Soul Insight
 *
 * 4. Requirements verification:
 *    ✓ Display available skill points in Break View
 *    ✓ Add skill point allocation buttons next to each stat
 *    ✓ Implement allocation: deduct skill point, increment stat by 1
 *    ✓ Disable allocation if no skill points available
 *    ✓ Show skill point grant animation on level-up
 */
