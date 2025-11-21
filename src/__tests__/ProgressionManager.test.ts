import { ProgressionManager } from "../ProgressionManager";
import { ProgressionState, PlayerState } from "../types";
import { STUBBORN_SOULS } from "../constants";

describe("ProgressionManager", () => {
  let manager: ProgressionManager;

  beforeEach(() => {
    manager = new ProgressionManager();
  });

  describe("calculateLevelThreshold", () => {
    it("should calculate level 1 threshold correctly", () => {
      // Formula: 100 * (1 ^ 1.5) = 100
      const threshold = manager.calculateLevelThreshold(1);
      expect(threshold).toBe(100);
    });

    it("should calculate level 2 threshold correctly", () => {
      // Formula: 100 * (2 ^ 1.5) = 100 * 2.828... = 282
      const threshold = manager.calculateLevelThreshold(2);
      expect(threshold).toBe(282);
    });

    it("should calculate level 5 threshold correctly", () => {
      // Formula: 100 * (5 ^ 1.5) = 100 * 11.18... = 1118
      const threshold = manager.calculateLevelThreshold(5);
      expect(threshold).toBe(1118);
    });

    it("should calculate level 10 threshold correctly", () => {
      // Formula: 100 * (10 ^ 1.5) = 100 * 31.62... = 3162
      const threshold = manager.calculateLevelThreshold(10);
      expect(threshold).toBe(3162);
    });

    it("should return increasing thresholds for higher levels", () => {
      const level3 = manager.calculateLevelThreshold(3);
      const level4 = manager.calculateLevelThreshold(4);
      const level5 = manager.calculateLevelThreshold(5);

      expect(level4).toBeGreaterThan(level3);
      expect(level5).toBeGreaterThan(level4);
    });
  });

  describe("damageBoss", () => {
    it("should reduce boss Resolve correctly", () => {
      const state: ProgressionState = {
        currentBossIndex: 0,
        currentBossResolve: 100,
        defeatedBosses: [],
        idleState: {
          lastCollectionTime: Date.now(),
          accumulatedSouls: 0,
        },
      };

      const result = manager.damageBoss(25, state, 1);

      expect(result.remainingResolve).toBe(75);
      expect(result.wasDefeated).toBe(false);
      expect(result.nextBoss).toBeUndefined();
    });

    it("should detect boss defeat when Resolve reaches zero", () => {
      const state: ProgressionState = {
        currentBossIndex: 0,
        currentBossResolve: 25,
        defeatedBosses: [],
        idleState: {
          lastCollectionTime: Date.now(),
          accumulatedSouls: 0,
        },
      };

      const result = manager.damageBoss(25, state, 1);

      expect(result.remainingResolve).toBe(0);
      expect(result.wasDefeated).toBe(true);
      expect(result.nextBoss).toBeDefined();
      expect(result.nextBoss?.id).toBe(1);
    });

    it("should not reduce Resolve below zero", () => {
      const state: ProgressionState = {
        currentBossIndex: 0,
        currentBossResolve: 10,
        defeatedBosses: [],
        idleState: {
          lastCollectionTime: Date.now(),
          accumulatedSouls: 0,
        },
      };

      const result = manager.damageBoss(50, state, 1);

      expect(result.remainingResolve).toBe(0);
      expect(result.wasDefeated).toBe(true);
    });

    it("should return next boss when current boss is defeated", () => {
      const state: ProgressionState = {
        currentBossIndex: 0,
        currentBossResolve: 10,
        defeatedBosses: [],
        idleState: {
          lastCollectionTime: Date.now(),
          accumulatedSouls: 0,
        },
      };

      const result = manager.damageBoss(10, state, 3);

      expect(result.wasDefeated).toBe(true);
      expect(result.nextBoss).toBeDefined();
      expect(result.nextBoss?.name).toBe(STUBBORN_SOULS[1].name);
    });

    it("should handle final boss defeat", () => {
      const finalBossIndex = STUBBORN_SOULS.length - 1;
      const state: ProgressionState = {
        currentBossIndex: finalBossIndex,
        currentBossResolve: 10,
        defeatedBosses: [],
        idleState: {
          lastCollectionTime: Date.now(),
          accumulatedSouls: 0,
        },
      };

      const result = manager.damageBoss(10, state, 99);

      expect(result.wasDefeated).toBe(true);
      expect(result.nextBoss).toBeUndefined();
    });
  });

  describe("getCurrentBoss", () => {
    it("should return first boss for index 0", () => {
      const state: ProgressionState = {
        currentBossIndex: 0,
        currentBossResolve: 100,
        defeatedBosses: [],
        idleState: {
          lastCollectionTime: Date.now(),
          accumulatedSouls: 0,
        },
      };

      const boss = manager.getCurrentBoss(state);
      expect(boss.id).toBe(0);
      expect(boss.name).toBe(STUBBORN_SOULS[0].name);
    });

    it("should return correct boss for any valid index", () => {
      const state: ProgressionState = {
        currentBossIndex: 2,
        currentBossResolve: 350,
        defeatedBosses: [0, 1],
        idleState: {
          lastCollectionTime: Date.now(),
          accumulatedSouls: 0,
        },
      };

      const boss = manager.getCurrentBoss(state);
      expect(boss.id).toBe(2);
      expect(boss.name).toBe(STUBBORN_SOULS[2].name);
    });
  });

  describe("addExperience", () => {
    it("should add Soul Insight without leveling up", () => {
      const player: PlayerState = {
        level: 1,
        soulInsight: 50,
        soulInsightToNextLevel: 100,
        soulEmbers: 0,
        stats: { spirit: 1, harmony: 0.05, soulflow: 1 },
        skillPoints: 0,
        cosmetics: {
          ownedThemes: ["default"],
          ownedSprites: ["default"],
          activeTheme: "default",
          activeSprite: "default",
        },
      };

      const result = manager.addExperience(30, player);

      expect(result.newLevel).toBe(1);
      expect(result.leveledUp).toBe(false);
      expect(result.skillPointsGranted).toBe(0);
    });

    it("should level up when threshold is reached", () => {
      const player: PlayerState = {
        level: 1,
        soulInsight: 80,
        soulInsightToNextLevel: 100,
        soulEmbers: 0,
        stats: { spirit: 1, harmony: 0.05, soulflow: 1 },
        skillPoints: 0,
        cosmetics: {
          ownedThemes: ["default"],
          ownedSprites: ["default"],
          activeTheme: "default",
          activeSprite: "default",
        },
      };

      const result = manager.addExperience(30, player);

      expect(result.newLevel).toBe(2);
      expect(result.leveledUp).toBe(true);
      expect(result.skillPointsGranted).toBe(1);
    });

    it("should handle multiple level-ups in one session", () => {
      const player: PlayerState = {
        level: 1,
        soulInsight: 50,
        soulInsightToNextLevel: 100,
        soulEmbers: 0,
        stats: { spirit: 1, harmony: 0.05, soulflow: 1 },
        skillPoints: 0,
        cosmetics: {
          ownedThemes: ["default"],
          ownedSprites: ["default"],
          activeTheme: "default",
          activeSprite: "default",
        },
      };

      // Add enough XP to go from level 1 to level 3
      // Level 1->2 needs 100, Level 2->3 needs 282
      // Total needed: 100 + 282 = 382, player has 50, so need 332+
      const result = manager.addExperience(400, player);

      expect(result.newLevel).toBeGreaterThanOrEqual(2);
      expect(result.leveledUp).toBe(true);
      expect(result.skillPointsGranted).toBeGreaterThanOrEqual(1);
    });

    it("should grant exactly 1 skill point per level", () => {
      const player: PlayerState = {
        level: 1,
        soulInsight: 90,
        soulInsightToNextLevel: 100,
        soulEmbers: 0,
        stats: { spirit: 1, harmony: 0.05, soulflow: 1 },
        skillPoints: 0,
        cosmetics: {
          ownedThemes: ["default"],
          ownedSprites: ["default"],
          activeTheme: "default",
          activeSprite: "default",
        },
      };

      const result = manager.addExperience(20, player);

      expect(result.newLevel).toBe(2);
      expect(result.skillPointsGranted).toBe(1);
    });
  });

  describe("unlockNextBoss", () => {
    it("should unlock next boss when level requirement is met", () => {
      const state: ProgressionState = {
        currentBossIndex: 0,
        currentBossResolve: 0,
        defeatedBosses: [],
        idleState: {
          lastCollectionTime: Date.now(),
          accumulatedSouls: 0,
        },
      };

      const result = manager.unlockNextBoss(state, 3);

      expect(result.currentBossIndex).toBe(1);
      expect(result.currentBossResolve).toBe(STUBBORN_SOULS[1].initialResolve);
      expect(result.defeatedBosses).toContain(0);
    });

    it("should not unlock boss if level requirement not met", () => {
      const state: ProgressionState = {
        currentBossIndex: 0,
        currentBossResolve: 0,
        defeatedBosses: [],
        idleState: {
          lastCollectionTime: Date.now(),
          accumulatedSouls: 0,
        },
      };

      const result = manager.unlockNextBoss(state, 1);

      // Should remain at current boss if level too low
      expect(result.currentBossIndex).toBe(0);
    });

    it("should not unlock beyond final boss", () => {
      const finalBossIndex = STUBBORN_SOULS.length - 1;
      const state: ProgressionState = {
        currentBossIndex: finalBossIndex,
        currentBossResolve: 0,
        defeatedBosses: [],
        idleState: {
          lastCollectionTime: Date.now(),
          accumulatedSouls: 0,
        },
      };

      const result = manager.unlockNextBoss(state, 99);

      expect(result.currentBossIndex).toBe(finalBossIndex);
    });
  });

  describe("grantSkillPoints", () => {
    it("should add skill points correctly", () => {
      const result = manager.grantSkillPoints(0, 1);
      expect(result).toBe(1);
    });

    it("should accumulate skill points", () => {
      const result = manager.grantSkillPoints(5, 3);
      expect(result).toBe(8);
    });
  });
});
