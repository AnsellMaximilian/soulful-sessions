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
    console.assert(state.version === 1, "Default version should be 1");
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
        version: 1,
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

    // Test 6: State migration (version 0 to version 1)
    console.log("\n6. Testing state migration...");
    await chrome.storage.local.set({
      soulShepherdGameState: {
        // No version field (version 0)
        player: {
          level: 5,
          soulEmbers: 250,
          soulInsight: 500,
          soulInsightToNextLevel: 1000,
          stats: { spirit: 3, harmony: 0.15, soulflow: 2 },
          skillPoints: 2,
          cosmetics: {
            ownedThemes: ["default"],
            ownedSprites: ["default"],
            activeTheme: "default",
            activeSprite: "default",
          },
        },
        session: null,
        break: null,
        progression: {
          currentBossIndex: 1,
          currentBossResolve: 150,
          defeatedBosses: [0],
          idleState: {
            lastCollectionTime: Date.now(),
            accumulatedSouls: 5,
          },
        },
        tasks: { goals: [], nextId: 1 },
        settings: {
          defaultSessionDuration: 25,
          defaultBreakDuration: 5,
          autoStartNextSession: false,
          idleThreshold: 120,
          strictMode: false,
          discouragedSites: [],
          blockedSites: [],
          animationsEnabled: true,
          notificationsEnabled: true,
          soundVolume: 0.5,
          showSessionTimer: true,
        },
        statistics: {
          totalSessions: 10,
          totalFocusTime: 250,
          currentStreak: 3,
          longestStreak: 5,
          lastSessionDate: "2024-01-01",
          bossesDefeated: 1,
          totalSoulInsightEarned: 500,
          totalSoulEmbersEarned: 250,
          totalIdleSoulsCollected: 20,
        },
      },
    });
    const migratedStateManager = new StateManager();
    const migratedState = await migratedStateManager.loadState();
    console.log("✓ State migrated from v0 to v1");
    console.assert(
      migratedState.version === 1,
      "Migrated state should have version 1"
    );
    console.assert(
      migratedState.player.level === 5,
      "Player data should be preserved"
    );
    console.assert(
      migratedState.player.soulEmbers === 250,
      "Player embers should be preserved"
    );
    console.assert(
      migratedState.progression.currentBossIndex === 1,
      "Progression should be preserved"
    );
    console.assert(
      migratedState.statistics.totalSessions === 10,
      "Statistics should be preserved"
    );

    // Test 7: Critical corruption and backup
    console.log("\n7. Testing critical corruption and backup...");
    await chrome.storage.local.set({
      soulShepherdGameState: {
        version: 1,
        // All major sections missing or invalid
        player: null,
        progression: "invalid",
        settings: undefined,
        statistics: 123,
      },
    });
    const corruptedStateManager = new StateManager();
    const resetState = await corruptedStateManager.loadState();
    console.log("✓ Critically corrupted state reset to defaults");
    console.assert(
      resetState.version === 1,
      "Reset state should have current version"
    );
    console.assert(
      resetState.player.level === 1,
      "Reset state should have default player"
    );

    // Check if backup was created
    const backup = await corruptedStateManager.getBackupState();
    console.assert(backup !== null, "Backup should be created");
    console.assert(
      typeof backup?.timestamp === "number",
      "Backup should have timestamp"
    );
    console.log("✓ Backup created successfully");

    // Test 8: Get state version
    console.log("\n8. Testing getStateVersion()...");
    const version = stateManager.getStateVersion();
    console.assert(version === 1, "Current version should be 1");
    console.log("✓ State version retrieved");

    console.log("\n=== All tests passed! ===");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Export for use in background script or console
export { testStateManager };
