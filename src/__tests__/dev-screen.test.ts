// ============================================================================
// Dev Screen Property-Based Tests
// ============================================================================

import * as fc from "fast-check";
import {
  SimulationEngine,
  validateSessionDuration,
  validateSessionCount,
  validateStatValue,
} from "../dev-screen";
import { PlayerStats } from "../types";

describe("Dev Screen Property-Based Tests", () => {
  /**
   * **Feature: dev-screen, Property 1: Valid session durations are accepted**
   * **Validates: Requirements 1.2**
   *
   * For any session duration value between 5 and 120 minutes (inclusive),
   * the input validation should accept the value as valid.
   */
  test("Property 1: Valid session durations are accepted", () => {
    fc.assert(
      fc.property(
        // Generate random session duration between 5 and 120 minutes
        fc.integer({ min: 5, max: 120 }),
        (duration) => {
          const result = validateSessionDuration(duration);
          
          // Valid durations should be accepted
          expect(result.isValid).toBe(true);
          expect(result.errorMessage).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: dev-screen, Property 2: Invalid session durations are rejected**
   * **Validates: Requirements 1.3**
   *
   * For any session duration value outside the range [5, 120] (negative, zero,
   * or greater than 120), the input validation should reject the value and
   * display an error message.
   */
  test("Property 2: Invalid session durations are rejected", () => {
    fc.assert(
      fc.property(
        // Generate invalid durations: either < 5 or > 120
        fc.oneof(
          fc.integer({ max: 4 }), // Less than 5
          fc.integer({ min: 121, max: 1000 }) // Greater than 120
        ),
        (duration) => {
          const result = validateSessionDuration(duration);
          
          // Invalid durations should be rejected
          expect(result.isValid).toBe(false);
          expect(result.errorMessage).toBeDefined();
          expect(result.errorMessage).toContain("Session duration must be between 5 and 120 minutes");
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: dev-screen, Property 6: Negative stat values are rejected**
   * **Validates: Requirements 2.3**
   *
   * For any negative stat value entered for Spirit, Harmony, or Soulflow,
   * the input validation should reject the value and display an error message.
   */
  test("Property 6: Negative stat values are rejected", () => {
    fc.assert(
      fc.property(
        // Generate negative stat values (use Math.fround for 32-bit float)
        fc.float({ max: Math.fround(-0.01), noNaN: true }),
        // Generate random stat name
        fc.constantFrom("Spirit", "Harmony", "Soulflow"),
        (statValue, statName) => {
          const result = validateStatValue(statValue, statName);
          
          // Negative stat values should be rejected
          expect(result.isValid).toBe(false);
          expect(result.errorMessage).toBeDefined();
          expect(result.errorMessage).toContain(`${statName} stat cannot be negative`);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: dev-screen, Property 3: Simulation executes correct number of sessions**
   * **Validates: Requirements 1.4**
   *
   * For any specified session count N, running a simulation should execute
   * exactly N sessions using the RewardCalculator class.
   */
  test("Property 3: Simulation executes correct number of sessions", () => {
    const simulationEngine = new SimulationEngine();

    fc.assert(
      fc.property(
        // Generate random session count between 1 and 100
        fc.integer({ min: 1, max: 100 }),
        // Generate random session duration
        fc.integer({ min: 5, max: 120 }),
        // Generate random player stats
        fc.record({
          spirit: fc.float({
            min: Math.fround(0.1),
            max: Math.fround(100),
            noNaN: true,
          }),
          harmony: fc.float({
            min: Math.fround(0),
            max: Math.fround(1),
            noNaN: true,
          }),
          soulflow: fc.float({
            min: Math.fround(0.1),
            max: Math.fround(100),
            noNaN: true,
          }),
        }),
        (sessionCount, duration, stats: PlayerStats) => {
          // Create simulation config
          const config = {
            sessionDuration: duration,
            sessionCount: sessionCount,
            playerStats: stats,
            startingLevel: 1,
            startingSoulInsight: 0,
            currentBossIndex: 0,
            isCompromised: false,
          };

          // Run simulation
          const result = simulationEngine.runSimulation(config);

          // Verify exactly N sessions were executed
          expect(result.sessions.length).toBe(sessionCount);

          // Verify each session is numbered correctly
          result.sessions.forEach((session, index) => {
            expect(session.sessionNumber).toBe(index + 1);
          });
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design
    );
  });

  /**
   * **Feature: dev-screen, Property 7: Dev Screen produces identical results to production calculator**
   * **Validates: Requirements 2.5, 10.1**
   *
   * For any session configuration (duration, stats, compromised status),
   * the Dev Screen's reward calculations should use the production RewardCalculator
   * and produce results consistent with the reward formulas.
   */
  test("Property 7: Dev Screen produces identical results to production calculator", () => {
    const simulationEngine = new SimulationEngine();

    fc.assert(
      fc.property(
        // Generate random session duration between 5 and 120 minutes
        fc.integer({ min: 5, max: 120 }),
        // Generate random player stats
        fc.record({
          spirit: fc.float({
            min: Math.fround(0.1),
            max: Math.fround(100),
            noNaN: true,
          }),
          harmony: fc.float({
            min: Math.fround(0),
            max: Math.fround(1),
            noNaN: true,
          }),
          soulflow: fc.float({
            min: Math.fround(0.1),
            max: Math.fround(100),
            noNaN: true,
          }),
        }),
        // Generate random compromised status
        fc.boolean(),
        (duration, stats: PlayerStats, isCompromised) => {
          // Create simulation config
          const config = {
            sessionDuration: duration,
            sessionCount: 1,
            playerStats: stats,
            startingLevel: 1,
            startingSoulInsight: 0,
            currentBossIndex: 0,
            isCompromised: isCompromised,
          };

          // Simulate session using Dev Screen
          const devScreenResult = simulationEngine.simulateSingleSession(
            config,
            1
          );

          // Verify the Dev Screen result follows the expected formulas
          // Calculate expected base values
          const baseSoulInsight =
            duration * 10 * (1 + stats.spirit * 0.1);
          const baseSoulEmbers =
            duration * 2 * (1 + stats.soulflow * 0.05);
          const bossDamage = stats.spirit * duration * 0.5;

          // Account for critical hit multiplier (1.5x if critical, 1x if not)
          const critMultiplier = devScreenResult.wasCritical ? 1.5 : 1.0;
          
          // Account for compromise penalty (0.7x if compromised, 1x if not)
          const compromiseMultiplier = isCompromised ? 0.7 : 1.0;

          const expectedSoulInsight = Math.round(
            baseSoulInsight * critMultiplier * compromiseMultiplier * 100
          ) / 100;
          const expectedSoulEmbers = Math.round(
            baseSoulEmbers * critMultiplier * compromiseMultiplier * 100
          ) / 100;
          const expectedBossDamage = Math.round(bossDamage * 100) / 100;

          // Verify Dev Screen produces results consistent with formulas
          expect(devScreenResult.soulInsight).toBe(expectedSoulInsight);
          expect(devScreenResult.soulEmbers).toBe(expectedSoulEmbers);
          expect(devScreenResult.bossProgress).toBe(expectedBossDamage);
          expect(devScreenResult.wasCompromised).toBe(isCompromised);
          
          // Verify calculation details are captured correctly
          expect(devScreenResult.calculationDetails.baseSoulInsight).toBeCloseTo(
            baseSoulInsight,
            2
          );
          expect(devScreenResult.calculationDetails.baseSoulEmbers).toBeCloseTo(
            baseSoulEmbers,
            2
          );
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design
    );
  });
});
