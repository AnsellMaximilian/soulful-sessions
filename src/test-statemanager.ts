/**
 * Manual test file for StateManager
 * This can be run in the browser console to verify StateManager functionality
 */

import { StateManager } from "./StateManager";

async function testStateManager() {
  console.log("=== Testing StateManager ===");

  const stateManager = new StateManager();

  try {
    // Test 1: Load state (should create default for new user)
    console.log("\n1. Testing loadState()...");
    const state = await stateManager.loadState();
    console.log("✓ State loaded:", state);
    console.assert(state.player.level === 1, "Default level should be 1");
    console.assert(state.player.soulEmbers === 0, "Default embers should be 0");
    console.assert(state.session === null, "Default session should be null");

    // Test 2: Get state
    console.log("\n2. Testing getState()...");
    const currentState = stateManager.getState();
    console.log("✓ Current state retrieved");
    console.assert(
      currentState === state,
      "getState should return same reference"
    );

    // Test 3: Update state
    console.log("\n3. Testing updateState()...");
    await stateManager.updateState({
      player: {
        ...state.player,
        soulEmbers: 100,
        level: 2,
      },
    });
    const updatedState = stateManager.getState();
    console.log("✓ State updated");
    console.assert(
      updatedState.player.soulEmbers === 100,
      "Embers should be updated"
    );
    console.assert(updatedState.player.level === 2, "Level should be updated");

    // Test 4: Verify persistence
    console.log("\n4. Testing persistence...");
    const newStateManager = new StateManager();
    const loadedState = await newStateManager.loadState();
    console.log("✓ State persisted and reloaded");
    console.assert(
      loadedState.player.soulEmbers === 100,
      "Persisted embers should be 100"
    );
    console.assert(
      loadedState.player.level === 2,
      "Persisted level should be 2"
    );

    // Test 5: State validation (corrupt data)
    console.log("\n5. Testing state validation...");
    await chrome.storage.local.set({
      soulShepherdGameState: {
        player: { level: "invalid" }, // Invalid type
        // Missing other required fields
      },
    });
    const repairedStateManager = new StateManager();
    const repairedState = await repairedStateManager.loadState();
    console.log("✓ Corrupted state repaired");
    console.assert(
      repairedState.player.level === 1,
      "Invalid level should be repaired"
    );
    console.assert(
      repairedState.settings !== undefined,
      "Missing settings should be added"
    );

    console.log("\n=== All tests passed! ===");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Export for use in background script or console
export { testStateManager };
