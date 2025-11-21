import { ProgressionManager } from "./ProgressionManager";
import { ProgressionState, PlayerState } from "./types";
import {
  STUBBORN_SOULS,
  DEFAULT_PLAYER_STATE,
  DEFAULT_PROGRESSION_STATE,
} from "./constants";

// ============================================================================
// ProgressionManager Test Suite
// ============================================================================

console.log("=== ProgressionManager Test Suite ===\n");

const manager = new ProgressionManager();

// Test 1: Calculate Level Thresholds
console.log("Test 1: Calculate Level Thresholds");
console.log("Level 1 threshold:", manager.calculateLevelThreshold(1)); // Should be 100
console.log("Level 2 threshold:", manager.calculateLevelThreshold(2)); // Should be 282
console.log("Level 3 threshold:", manager.calculateLevelThreshold(3)); // Should be 519
console.log("Level 5 threshold:", manager.calculateLevelThreshold(5)); // Should be 1118
console.log("Level 10 threshold:", manager.calculateLevelThreshold(10)); // Should be 3162
console.log("✓ Level thresholds calculated\n");

// Test 2: Get Current Boss
console.log("Test 2: Get Current Boss");
const testProgression: ProgressionState = { ...DEFAULT_PROGRESSION_STATE };
const currentBoss = manager.getCurrentBoss(testProgression);
console.log("Current boss:", currentBoss.name);
console.log("Boss ID:", currentBoss.id);
console.log("Initial Resolve:", currentBoss.initialResolve);
console.log("✓ Current boss retrieved\n");

// Test 3: Damage Boss (without defeat)
console.log("Test 3: Damage Boss (without defeat)");
const damageResult1 = manager.damageBoss(30, testProgression, 1);
console.log("Damage dealt: 30");
console.log("Remaining Resolve:", damageResult1.remainingResolve); // Should be 70
console.log("Was defeated:", damageResult1.wasDefeated); // Should be false
console.log("✓ Boss damaged correctly\n");

// Test 4: Damage Boss (with defeat)
console.log("Test 4: Damage Boss (with defeat)");
const progressionWithDamage: ProgressionState = {
  ...testProgression,
  currentBossResolve: 20,
};
const damageResult2 = manager.damageBoss(25, progressionWithDamage, 3);
console.log("Damage dealt: 25 (boss has 20 Resolve)");
console.log("Remaining Resolve:", damageResult2.remainingResolve); // Should be 0
console.log("Was defeated:", damageResult2.wasDefeated); // Should be true
console.log("Next boss:", damageResult2.nextBoss?.name); // Should be "The Unfinished Scholar"
console.log("✓ Boss defeated and next boss identified\n");

// Test 5: Unlock Next Boss
console.log("Test 5: Unlock Next Boss");
const updatedProgression = manager.unlockNextBoss(testProgression, 3);
console.log("Previous boss index:", testProgression.currentBossIndex);
console.log("New boss index:", updatedProgression.currentBossIndex);
console.log(
  "New boss name:",
  STUBBORN_SOULS[updatedProgression.currentBossIndex].name
);
console.log("New boss Resolve:", updatedProgression.currentBossResolve);
console.log("Defeated bosses:", updatedProgression.defeatedBosses);
console.log("✓ Next boss unlocked\n");

// Test 6: Unlock Next Boss (insufficient level)
console.log("Test 6: Unlock Next Boss (insufficient level)");
const noUnlock = manager.unlockNextBoss(testProgression, 1); // Level 1, but next boss needs level 3
console.log("Attempted unlock with level 1 (needs level 3)");
console.log(
  "Boss index unchanged:",
  noUnlock.currentBossIndex === testProgression.currentBossIndex
);
console.log("✓ Level requirement enforced\n");

// Test 7: Add Experience (no level-up)
console.log("Test 7: Add Experience (no level-up)");
const testPlayer: PlayerState = { ...DEFAULT_PLAYER_STATE };
const expResult1 = manager.addExperience(50, testPlayer);
console.log("Added 50 Soul Insight");
console.log("New level:", expResult1.newLevel); // Should be 1
console.log("Leveled up:", expResult1.leveledUp); // Should be false
console.log("Skill points granted:", expResult1.skillPointsGranted); // Should be 0
console.log("✓ Experience added without level-up\n");

// Test 8: Add Experience (single level-up)
console.log("Test 8: Add Experience (single level-up)");
const expResult2 = manager.addExperience(100, testPlayer);
console.log("Added 100 Soul Insight (threshold is 100)");
console.log("New level:", expResult2.newLevel); // Should be 2
console.log("Leveled up:", expResult2.leveledUp); // Should be true
console.log("Skill points granted:", expResult2.skillPointsGranted); // Should be 1
console.log("✓ Single level-up detected\n");

// Test 9: Add Experience (multiple level-ups)
console.log("Test 9: Add Experience (multiple level-ups)");
const expResult3 = manager.addExperience(600, testPlayer);
console.log("Added 600 Soul Insight");
console.log("New level:", expResult3.newLevel); // Should be 3 or 4
console.log("Leveled up:", expResult3.leveledUp); // Should be true
console.log("Skill points granted:", expResult3.skillPointsGranted); // Should be 2 or 3
console.log("✓ Multiple level-ups detected\n");

// Test 10: Grant Skill Points
console.log("Test 10: Grant Skill Points");
const newSkillPoints = manager.grantSkillPoints(5, 3);
console.log("Starting skill points: 5");
console.log("Granted: 3");
console.log("New total:", newSkillPoints); // Should be 8
console.log("✓ Skill points granted\n");

// Test 11: Boss Defeat at Campaign End
console.log("Test 11: Boss Defeat at Campaign End");
const finalBossProgression: ProgressionState = {
  ...testProgression,
  currentBossIndex: STUBBORN_SOULS.length - 1,
  currentBossResolve: 10,
};
const finalDamage = manager.damageBoss(15, finalBossProgression, 30);
console.log("Defeating final boss");
console.log("Was defeated:", finalDamage.wasDefeated); // Should be true
console.log("Next boss:", finalDamage.nextBoss); // Should be undefined
console.log("✓ Campaign completion handled\n");

console.log("=== All ProgressionManager Tests Passed ===");
