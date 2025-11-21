// ============================================================================
// IdleCollector Test Suite
// ============================================================================

import { IdleCollector } from "./IdleCollector";
import { FORMULAS } from "./constants";

/**
 * Test suite for IdleCollector module
 */
function runIdleCollectorTests(): void {
  console.log("=== IdleCollector Test Suite ===\n");

  const idleCollector = new IdleCollector();

  // Test 1: Calculate idle rate with base soulflow
  console.log("Test 1: Calculate idle rate with base soulflow (1)");
  const baseRate = idleCollector.calculateIdleRate(1);
  const expectedBaseRate = 1 * (1 + 1 * 0.1); // 1.1
  console.log(`  Expected: ${expectedBaseRate}`);
  console.log(`  Actual: ${baseRate}`);
  console.log(`  Result: ${baseRate === expectedBaseRate ? "PASS" : "FAIL"}\n`);

  // Test 2: Calculate idle rate with higher soulflow
  console.log("Test 2: Calculate idle rate with soulflow = 5");
  const highRate = idleCollector.calculateIdleRate(5);
  const expectedHighRate = 1 * (1 + 5 * 0.1); // 1.5
  console.log(`  Expected: ${expectedHighRate}`);
  console.log(`  Actual: ${highRate}`);
  console.log(`  Result: ${highRate === expectedHighRate ? "PASS" : "FAIL"}\n`);

  // Test 3: Collect souls after 5 minutes (1 interval)
  console.log("Test 3: Collect souls after 5 minutes with base soulflow");
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;
  const result1 = idleCollector.collectIdleSouls(fiveMinutesAgo, 1);
  console.log(`  Elapsed: 5 minutes`);
  console.log(`  Soulflow: 1`);
  console.log(
    `  Expected souls: 1 (rate 1.1 * 1 interval = 1.1, floored to 1)`
  );
  console.log(`  Actual souls: ${result1.soulsCollected}`);
  console.log(`  Expected embers: ${1 * FORMULAS.CONTENT_SOUL_TO_EMBERS}`);
  console.log(`  Actual embers: ${result1.embersEarned}`);
  console.log(
    `  Result: ${
      result1.soulsCollected === 1 && result1.embersEarned === 5
        ? "PASS"
        : "FAIL"
    }\n`
  );

  // Test 4: Collect souls after 10 minutes (2 intervals)
  console.log("Test 4: Collect souls after 10 minutes with base soulflow");
  const tenMinutesAgo = now - 10 * 60 * 1000;
  const result2 = idleCollector.collectIdleSouls(tenMinutesAgo, 1);
  console.log(`  Elapsed: 10 minutes`);
  console.log(`  Soulflow: 1`);
  console.log(
    `  Expected souls: 2 (rate 1.1 * 2 intervals = 2.2, floored to 2)`
  );
  console.log(`  Actual souls: ${result2.soulsCollected}`);
  console.log(`  Expected embers: ${2 * FORMULAS.CONTENT_SOUL_TO_EMBERS}`);
  console.log(`  Actual embers: ${result2.embersEarned}`);
  console.log(
    `  Result: ${
      result2.soulsCollected === 2 && result2.embersEarned === 10
        ? "PASS"
        : "FAIL"
    }\n`
  );

  // Test 5: Collect souls after 25 minutes with higher soulflow
  console.log("Test 5: Collect souls after 25 minutes with soulflow = 5");
  const twentyFiveMinutesAgo = now - 25 * 60 * 1000;
  const result3 = idleCollector.collectIdleSouls(twentyFiveMinutesAgo, 5);
  console.log(`  Elapsed: 25 minutes`);
  console.log(`  Soulflow: 5`);
  console.log(`  Rate: 1.5 souls per interval`);
  console.log(`  Intervals: 5`);
  console.log(`  Expected souls: 7 (1.5 * 5 = 7.5, floored to 7)`);
  console.log(`  Actual souls: ${result3.soulsCollected}`);
  console.log(`  Expected embers: ${7 * FORMULAS.CONTENT_SOUL_TO_EMBERS}`);
  console.log(`  Actual embers: ${result3.embersEarned}`);
  console.log(
    `  Result: ${
      result3.soulsCollected === 7 && result3.embersEarned === 35
        ? "PASS"
        : "FAIL"
    }\n`
  );

  // Test 6: No collection if less than 5 minutes elapsed
  console.log("Test 6: No collection if less than 5 minutes elapsed");
  const twoMinutesAgo = now - 2 * 60 * 1000;
  const result4 = idleCollector.collectIdleSouls(twoMinutesAgo, 1);
  console.log(`  Elapsed: 2 minutes`);
  console.log(`  Expected souls: 0 (less than 1 interval)`);
  console.log(`  Actual souls: ${result4.soulsCollected}`);
  console.log(`  Expected embers: 0`);
  console.log(`  Actual embers: ${result4.embersEarned}`);
  console.log(
    `  Result: ${
      result4.soulsCollected === 0 && result4.embersEarned === 0
        ? "PASS"
        : "FAIL"
    }\n`
  );

  // Test 7: Get time since last collection
  console.log("Test 7: Get time since last collection");
  const thirtyMinutesAgo = now - 30 * 60 * 1000;
  const timeSince = idleCollector.getTimeSinceLastCollection(thirtyMinutesAgo);
  const expectedTime = 30 * 60 * 1000;
  const tolerance = 100; // 100ms tolerance
  const withinTolerance = Math.abs(timeSince - expectedTime) < tolerance;
  console.log(`  Expected: ~${expectedTime}ms (30 minutes)`);
  console.log(`  Actual: ${timeSince}ms`);
  console.log(`  Result: ${withinTolerance ? "PASS" : "FAIL"}\n`);

  // Test 8: Verify conversion rate (5 embers per soul)
  console.log("Test 8: Verify conversion rate (5 embers per soul)");
  const oneHourAgo = now - 60 * 60 * 1000;
  const result5 = idleCollector.collectIdleSouls(oneHourAgo, 1);
  const expectedRatio = FORMULAS.CONTENT_SOUL_TO_EMBERS;
  const actualRatio =
    result5.soulsCollected > 0
      ? result5.embersEarned / result5.soulsCollected
      : 0;
  console.log(`  Souls collected: ${result5.soulsCollected}`);
  console.log(`  Embers earned: ${result5.embersEarned}`);
  console.log(`  Expected ratio: ${expectedRatio} embers per soul`);
  console.log(`  Actual ratio: ${actualRatio} embers per soul`);
  console.log(`  Result: ${actualRatio === expectedRatio ? "PASS" : "FAIL"}\n`);

  console.log("=== Test Suite Complete ===");
}

// Run tests
runIdleCollectorTests();
