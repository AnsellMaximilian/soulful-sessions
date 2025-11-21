import { StateManager } from "../StateManager";
import { GameState } from "../types";

// Mock chrome.storage API
const mockStorage = {
  local: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
  sync: {
    get: jest.fn(),
    set: jest.fn(),
  },
};

const mockNotifications = {
  create: jest.fn(),
};

// Setup global chrome mock
(globalThis as any).chrome = {
  storage: mockStorage,
  notifications: mockNotifications,
};

describe("StateManager", () => {
  let manager: StateManager;

  beforeEach(() => {
    manager = new StateManager();
    jest.clearAllMocks();
  });

  describe("loadState", () => {
    it("should create default state for new users", async () => {
      mockStorage.local.get.mockResolvedValue({});
      mockStorage.sync.get.mockResolvedValue({});
      mockStorage.local.set.mockResolvedValue(undefined);

      const state = await manager.loadState();

      expect(state.player.level).toBe(1);
      expect(state.player.soulInsight).toBe(0);
      expect(state.player.stats.spirit).toBe(1);
      expect(state.progression.currentBossIndex).toBe(0);
      expect(mockStorage.local.set).toHaveBeenCalled();
    });

    it("should load existing state", async () => {
      const existingState: GameState = {
        version: 1,
        player: {
          level: 5,
          soulInsight: 500,
          soulInsightToNextLevel: 1118,
          soulEmbers: 100,
          stats: { spirit: 3, harmony: 0.1, soulflow: 2 },
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
          totalSoulEmbersEarned: 100,
          totalIdleSoulsCollected: 20,
        },
      };

      mockStorage.local.get.mockResolvedValue({
        soulShepherdGameState: existingState,
      });
      mockStorage.sync.get.mockResolvedValue({});

      const state = await manager.loadState();

      expect(state.player.level).toBe(5);
      expect(state.player.soulEmbers).toBe(100);
      expect(state.progression.currentBossIndex).toBe(1);
      expect(state.statistics.totalSessions).toBe(10);
    });

    it("should validate and repair corrupted state", async () => {
      const corruptedState = {
        version: 1,
        player: {
          level: "invalid", // Should be number
          soulInsight: 100,
          stats: { spirit: 1 }, // Missing harmony and soulflow
        },
        // Missing other required fields
      };

      mockStorage.local.get.mockResolvedValue({
        soulShepherdGameState: corruptedState,
      });
      mockStorage.sync.get.mockResolvedValue({});

      const state = await manager.loadState();

      // Should repair to valid state
      expect(typeof state.player.level).toBe("number");
      expect(state.player.stats.harmony).toBeDefined();
      expect(state.player.stats.soulflow).toBeDefined();
      expect(state.progression).toBeDefined();
      expect(state.settings).toBeDefined();
    });

    it("should handle storage errors gracefully", async () => {
      mockStorage.local.get.mockRejectedValue(new Error("Storage error"));
      mockStorage.sync.get.mockResolvedValue({});

      const state = await manager.loadState();

      // Should return default state
      expect(state.player.level).toBe(1);
      expect(mockNotifications.create).toHaveBeenCalled();
    });

    it("should migrate state from older versions", async () => {
      const oldState = {
        // No version field (version 0)
        player: {
          level: 3,
          soulInsight: 300,
          soulInsightToNextLevel: 519,
          soulEmbers: 50,
          stats: { spirit: 2, harmony: 0.05, soulflow: 1 },
          skillPoints: 1,
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
          currentBossIndex: 0,
          currentBossResolve: 50,
          defeatedBosses: [],
          idleState: {
            lastCollectionTime: Date.now(),
            accumulatedSouls: 0,
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
          totalSessions: 5,
          totalFocusTime: 125,
          currentStreak: 2,
          longestStreak: 3,
          lastSessionDate: "2024-01-01",
          bossesDefeated: 0,
          totalSoulInsightEarned: 300,
          totalSoulEmbersEarned: 50,
          totalIdleSoulsCollected: 10,
        },
      };

      mockStorage.local.get.mockResolvedValue({
        soulShepherdGameState: oldState,
      });
      mockStorage.sync.get.mockResolvedValue({});

      const state = await manager.loadState();

      // Should have version field after migration
      expect(state.version).toBeDefined();
      expect(typeof state.version).toBe("number");
      // Data should be preserved
      expect(state.player.level).toBe(3);
      expect(state.player.soulEmbers).toBe(50);
    });
  });

  describe("saveState", () => {
    it("should save state to storage", async () => {
      mockStorage.local.get.mockResolvedValue({});
      mockStorage.sync.get.mockResolvedValue({});
      mockStorage.local.set.mockResolvedValue(undefined);

      await manager.loadState();
      const state = manager.getState();

      state.player.level = 10;
      await manager.saveState(state);

      expect(mockStorage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({
          soulShepherdGameState: expect.objectContaining({
            player: expect.objectContaining({ level: 10 }),
          }),
        })
      );
    });

    it("should handle save errors with notification", async () => {
      mockStorage.local.get.mockResolvedValue({});
      mockStorage.sync.get.mockResolvedValue({});
      mockStorage.local.set.mockRejectedValue(new Error("Save failed"));

      await manager.loadState();
      const state = manager.getState();

      await expect(manager.saveState(state)).rejects.toThrow();
      expect(mockNotifications.create).toHaveBeenCalled();
    });
  });

  describe("getState", () => {
    it("should return current state after loading", async () => {
      mockStorage.local.get.mockResolvedValue({});
      mockStorage.sync.get.mockResolvedValue({});
      mockStorage.local.set.mockResolvedValue(undefined);

      await manager.loadState();
      const state = manager.getState();

      expect(state).toBeDefined();
      expect(state.player).toBeDefined();
      expect(state.progression).toBeDefined();
    });

    it("should throw error if state not loaded", () => {
      expect(() => manager.getState()).toThrow();
    });
  });

  describe("updateState", () => {
    it("should update partial state", async () => {
      mockStorage.local.get.mockResolvedValue({});
      mockStorage.sync.get.mockResolvedValue({});
      mockStorage.local.set.mockResolvedValue(undefined);

      await manager.loadState();

      await manager.updateState({
        player: {
          ...manager.getState().player,
          level: 15,
        },
      });

      const state = manager.getState();
      expect(state.player.level).toBe(15);
    });

    it("should persist changes to storage", async () => {
      mockStorage.local.get.mockResolvedValue({});
      mockStorage.sync.get.mockResolvedValue({});
      mockStorage.local.set.mockResolvedValue(undefined);

      await manager.loadState();

      await manager.updateState({
        player: {
          ...manager.getState().player,
          soulEmbers: 500,
        },
      });

      expect(mockStorage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({
          soulShepherdGameState: expect.objectContaining({
            player: expect.objectContaining({ soulEmbers: 500 }),
          }),
        })
      );
    });
  });

  describe("state validation", () => {
    it("should repair missing player stats", async () => {
      const invalidState = {
        version: 1,
        player: {
          level: 5,
          soulInsight: 100,
          soulInsightToNextLevel: 1118,
          soulEmbers: 50,
          stats: {}, // Missing all stats
          skillPoints: 0,
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
          currentBossIndex: 0,
          currentBossResolve: 100,
          defeatedBosses: [],
          idleState: {
            lastCollectionTime: Date.now(),
            accumulatedSouls: 0,
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
          totalSessions: 0,
          totalFocusTime: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastSessionDate: "",
          bossesDefeated: 0,
          totalSoulInsightEarned: 0,
          totalSoulEmbersEarned: 0,
          totalIdleSoulsCollected: 0,
        },
      };

      mockStorage.local.get.mockResolvedValue({
        soulShepherdGameState: invalidState,
      });
      mockStorage.sync.get.mockResolvedValue({});

      const state = await manager.loadState();

      expect(state.player.stats.spirit).toBe(1);
      expect(state.player.stats.harmony).toBe(0.05);
      expect(state.player.stats.soulflow).toBe(1);
    });

    it("should handle null session state", async () => {
      const stateWithNullSession = {
        version: 1,
        player: {
          level: 1,
          soulInsight: 0,
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
        },
        session: null,
        break: null,
        progression: {
          currentBossIndex: 0,
          currentBossResolve: 100,
          defeatedBosses: [],
          idleState: {
            lastCollectionTime: Date.now(),
            accumulatedSouls: 0,
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
          totalSessions: 0,
          totalFocusTime: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastSessionDate: "",
          bossesDefeated: 0,
          totalSoulInsightEarned: 0,
          totalSoulEmbersEarned: 0,
          totalIdleSoulsCollected: 0,
        },
      };

      mockStorage.local.get.mockResolvedValue({
        soulShepherdGameState: stateWithNullSession,
      });
      mockStorage.sync.get.mockResolvedValue({});

      const state = await manager.loadState();

      expect(state.session).toBeNull();
      expect(state.break).toBeNull();
    });
  });
});
