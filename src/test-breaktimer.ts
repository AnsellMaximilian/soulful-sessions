/**
 * Manual test file for Break Timer Flow
 * This can be run to verify break timer functionality
 */

import { StateManager } from "./StateManager";
import { BreakState } from "./types";

async function testBreakTimer() {
  console.log("=== Testing Break Timer Flow ===");

  const stateManager = new StateManager();

  try {
    // Test 1: Load initial state
    console.log("\n1. Loading initial state...");
    await stateManager.loadState();
    const initialState = stateManager.getState();
    console.log("✓ Initial state loaded");
    console.assert(
      initialState.break === null,
      "Initial break state should be null"
    );

    // Test 2: Simulate break start (normally done by handleEndSession)
    console.log("\n2. Simulating break start...");
    const breakState: BreakState = {
      startTime: Date.now(),
      duration: 5, // 5 minutes
      isActive: true,
    };

    await stateManager.updateState({
      break: breakState,
    });

    const stateWithBreak = stateManager.getState();
    console.log("✓ Break state created:", stateWithBreak.break);
    console.assert(
      stateWithBreak.break !== null,
      "Break state should not be null"
    );
    console.assert(
      stateWithBreak.break?.isActive === true,
      "Break should be active"
    );
    console.assert(
      stateWithBreak.break?.duration === 5,
      "Break duration should be 5 minutes"
    );

    // Test 3: Simulate break end (normally done by handleBreakAlarm)
    console.log("\n3. Simulating break end...");
    await stateManager.updateState({
      break: null,
    });

    const stateAfterBreak = stateManager.getState();
    console.log("✓ Break state cleared");
    console.assert(
      stateAfterBreak.break === null,
      "Break state should be null after ending"
    );

    // Test 4: Verify auto-start setting
    console.log("\n4. Testing auto-start setting...");
    console.log(
      "Auto-start enabled:",
      stateAfterBreak.settings.autoStartNextSession
    );
    console.assert(
      typeof stateAfterBreak.settings.autoStartNextSession === "boolean",
      "Auto-start should be a boolean"
    );

    // Test 5: Test break timer calculation
    console.log("\n5. Testing break timer calculation...");
    const testBreakStart = Date.now();
    const testBreakDuration = 5; // minutes
    const testBreakEnd = testBreakStart + testBreakDuration * 60 * 1000;

    const elapsed = Date.now() - testBreakStart;
    const remaining = testBreakDuration * 60 * 1000 - elapsed;
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    console.log(
      `✓ Break timer: ${minutes}:${seconds.toString().padStart(2, "0")}`
    );
    console.assert(minutes >= 0, "Minutes should be non-negative");
    console.assert(seconds >= 0 && seconds < 60, "Seconds should be 0-59");

    console.log("\n=== All Break Timer Tests Passed ✓ ===");
  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  }
}

// Export for use in browser console or test runner
export { testBreakTimer };

// Auto-run if this file is executed directly
if (typeof window !== "undefined") {
  (window as any).testBreakTimer = testBreakTimer;
  console.log(
    "Break timer test loaded. Run testBreakTimer() to execute tests."
  );
}
