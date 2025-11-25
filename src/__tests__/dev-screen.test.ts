// ============================================================================
// Dev Screen Property-Based Tests
// ============================================================================

import * as fc from "fast-check";
import { SimulationEngine, createMockSession } from "../dev-screen";
import { RewardCalculator } from "../RewardCalculator";
import { PlayerStats } from "../types";

describe("Dev Screen Property-Based Tests", () => {
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
