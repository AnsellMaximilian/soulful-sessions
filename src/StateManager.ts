import {
  GameState,
  PlayerState,
  ProgressionState,
  TaskState,
  SettingsState,
  StatisticsState,
} from "./types";
import {
  DEFAULT_PLAYER_STATE,
  DEFAULT_PROGRESSION_STATE,
  DEFAULT_TASK_STATE,
  DEFAULT_SETTINGS,
  DEFAULT_STATISTICS,
  STUBBORN_SOULS,
} from "./constants";

// ============================================================================
// StateManager Class
// ============================================================================

/**
 * StateManager handles all game state persistence and retrieval.
 * Implements retry logic for storage operations and state validation.
 */
export class StateManager {
  private state: GameState | null = null;
  private readonly STORAGE_KEY = "soulShepherdGameState";
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 100;

  /**
   * Load game state from chrome.storage.local
   * Initializes default state for new users
   * Validates and repairs corrupted state
   */
  async loadState(): Promise<GameState> {
    try {
      const result = await this.retryStorageOperation(() =>
        chrome.storage.local.get(this.STORAGE_KEY)
      );

      if (result[this.STORAGE_KEY]) {
        const loadedState = result[this.STORAGE_KEY] as GameState;

        // Validate and repair state
        const validatedState = this.validateAndRepairState(loadedState);
        this.state = validatedState;

        console.log("[StateManager] State loaded successfully");
        return validatedState;
      } else {
        // New user - initialize default state
        console.log(
          "[StateManager] No existing state found, initializing defaults"
        );
        const defaultState = this.createDefaultState();
        this.state = defaultState;

        // Save default state
        await this.saveState(defaultState);
        return defaultState;
      }
    } catch (error) {
      console.error("[StateManager] Failed to load state:", error);

      // Fallback to default state
      const defaultState = this.createDefaultState();
      this.state = defaultState;

      // Notify user of issue
      if (chrome.notifications) {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "soul_shepherd.png",
          title: "Soul Shepherd",
          message: "Failed to load saved progress. Starting fresh.",
        });
      }

      return defaultState;
    }
  }

  /**
   * Save game state to chrome.storage.local with retry logic
   */
  async saveState(state: GameState): Promise<void> {
    try {
      await this.retryStorageOperation(() =>
        chrome.storage.local.set({ [this.STORAGE_KEY]: state })
      );

      this.state = state;
      console.log("[StateManager] State saved successfully");
    } catch (error) {
      console.error(
        "[StateManager] Failed to save state after retries:",
        error
      );

      // Notify user of save failure
      if (chrome.notifications) {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "soul_shepherd.png",
          title: "Soul Shepherd",
          message: "Failed to save progress. Your changes may be lost.",
        });
      }

      throw error;
    }
  }

  /**
   * Get current in-memory state
   * Throws if state hasn't been loaded yet
   */
  getState(): GameState {
    if (!this.state) {
      throw new Error(
        "[StateManager] State not loaded. Call loadState() first."
      );
    }
    return this.state;
  }

  /**
   * Update state with partial changes and persist
   */
  async updateState(partial: Partial<GameState>): Promise<void> {
    if (!this.state) {
      throw new Error(
        "[StateManager] State not loaded. Call loadState() first."
      );
    }

    // Deep merge partial state
    const updatedState: GameState = {
      ...this.state,
      ...partial,
    };

    await this.saveState(updatedState);
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Create default game state for new users
   */
  private createDefaultState(): GameState {
    return {
      player: { ...DEFAULT_PLAYER_STATE },
      session: null,
      break: null,
      progression: { ...DEFAULT_PROGRESSION_STATE },
      tasks: { ...DEFAULT_TASK_STATE },
      settings: { ...DEFAULT_SETTINGS },
      statistics: { ...DEFAULT_STATISTICS },
    };
  }

  /**
   * Validate state schema and repair missing or corrupted fields
   */
  private validateAndRepairState(state: any): GameState {
    console.log("[StateManager] Validating state...");

    // Check if state is an object
    if (!state || typeof state !== "object") {
      console.warn("[StateManager] Invalid state object, using defaults");
      return this.createDefaultState();
    }

    // Validate and repair each section
    const repairedState: GameState = {
      player: this.validatePlayerState(state.player),
      session: this.validateSessionState(state.session),
      break: this.validateBreakState(state.break),
      progression: this.validateProgressionState(state.progression),
      tasks: this.validateTaskState(state.tasks),
      settings: this.validateSettingsState(state.settings),
      statistics: this.validateStatisticsState(state.statistics),
    };

    return repairedState;
  }

  /**
   * Validate PlayerState
   */
  private validatePlayerState(player: any): PlayerState {
    if (!player || typeof player !== "object") {
      return { ...DEFAULT_PLAYER_STATE };
    }

    return {
      level: typeof player.level === "number" ? player.level : 1,
      soulInsight:
        typeof player.soulInsight === "number" ? player.soulInsight : 0,
      soulInsightToNextLevel:
        typeof player.soulInsightToNextLevel === "number"
          ? player.soulInsightToNextLevel
          : 100,
      soulEmbers: typeof player.soulEmbers === "number" ? player.soulEmbers : 0,
      stats: {
        spirit:
          player.stats?.spirit && typeof player.stats.spirit === "number"
            ? player.stats.spirit
            : 1,
        harmony:
          player.stats?.harmony && typeof player.stats.harmony === "number"
            ? player.stats.harmony
            : 0.05,
        soulflow:
          player.stats?.soulflow && typeof player.stats.soulflow === "number"
            ? player.stats.soulflow
            : 1,
      },
      skillPoints:
        typeof player.skillPoints === "number" ? player.skillPoints : 0,
      cosmetics: {
        ownedThemes: Array.isArray(player.cosmetics?.ownedThemes)
          ? player.cosmetics.ownedThemes
          : ["default"],
        ownedSprites: Array.isArray(player.cosmetics?.ownedSprites)
          ? player.cosmetics.ownedSprites
          : ["default"],
        activeTheme:
          typeof player.cosmetics?.activeTheme === "string"
            ? player.cosmetics.activeTheme
            : "default",
        activeSprite:
          typeof player.cosmetics?.activeSprite === "string"
            ? player.cosmetics.activeSprite
            : "default",
      },
    };
  }

  /**
   * Validate SessionState (can be null)
   */
  private validateSessionState(session: any): any {
    if (!session) return null;

    if (typeof session !== "object") return null;

    return {
      startTime:
        typeof session.startTime === "number" ? session.startTime : Date.now(),
      duration: typeof session.duration === "number" ? session.duration : 25,
      taskId: typeof session.taskId === "string" ? session.taskId : "",
      isActive:
        typeof session.isActive === "boolean" ? session.isActive : false,
      isPaused:
        typeof session.isPaused === "boolean" ? session.isPaused : false,
      isCompromised:
        typeof session.isCompromised === "boolean"
          ? session.isCompromised
          : false,
      idleTime: typeof session.idleTime === "number" ? session.idleTime : 0,
      activeTime:
        typeof session.activeTime === "number" ? session.activeTime : 0,
    };
  }

  /**
   * Validate BreakState (can be null)
   */
  private validateBreakState(breakState: any): any {
    if (!breakState) return null;

    if (typeof breakState !== "object") return null;

    return {
      startTime:
        typeof breakState.startTime === "number"
          ? breakState.startTime
          : Date.now(),
      duration:
        typeof breakState.duration === "number" ? breakState.duration : 5,
      isActive:
        typeof breakState.isActive === "boolean" ? breakState.isActive : false,
    };
  }

  /**
   * Validate ProgressionState
   */
  private validateProgressionState(progression: any): ProgressionState {
    if (!progression || typeof progression !== "object") {
      return { ...DEFAULT_PROGRESSION_STATE };
    }

    const currentBossIndex =
      typeof progression.currentBossIndex === "number"
        ? progression.currentBossIndex
        : 0;

    // Ensure boss index is valid
    const validBossIndex = Math.max(
      0,
      Math.min(currentBossIndex, STUBBORN_SOULS.length - 1)
    );

    return {
      currentBossIndex: validBossIndex,
      currentBossResolve:
        typeof progression.currentBossResolve === "number"
          ? progression.currentBossResolve
          : STUBBORN_SOULS[validBossIndex].initialResolve,
      defeatedBosses: Array.isArray(progression.defeatedBosses)
        ? progression.defeatedBosses
        : [],
      idleState: {
        lastCollectionTime:
          progression.idleState?.lastCollectionTime &&
          typeof progression.idleState.lastCollectionTime === "number"
            ? progression.idleState.lastCollectionTime
            : Date.now(),
        accumulatedSouls:
          progression.idleState?.accumulatedSouls &&
          typeof progression.idleState.accumulatedSouls === "number"
            ? progression.idleState.accumulatedSouls
            : 0,
      },
    };
  }

  /**
   * Validate TaskState
   */
  private validateTaskState(tasks: any): TaskState {
    if (!tasks || typeof tasks !== "object") {
      return { ...DEFAULT_TASK_STATE };
    }

    return {
      goals: Array.isArray(tasks.goals) ? tasks.goals : [],
      nextId: typeof tasks.nextId === "number" ? tasks.nextId : 1,
    };
  }

  /**
   * Validate SettingsState
   */
  private validateSettingsState(settings: any): SettingsState {
    if (!settings || typeof settings !== "object") {
      return { ...DEFAULT_SETTINGS };
    }

    return {
      defaultSessionDuration:
        typeof settings.defaultSessionDuration === "number"
          ? settings.defaultSessionDuration
          : 25,
      defaultBreakDuration:
        typeof settings.defaultBreakDuration === "number"
          ? settings.defaultBreakDuration
          : 5,
      autoStartNextSession:
        typeof settings.autoStartNextSession === "boolean"
          ? settings.autoStartNextSession
          : false,
      idleThreshold:
        typeof settings.idleThreshold === "number"
          ? settings.idleThreshold
          : 120,
      strictMode:
        typeof settings.strictMode === "boolean" ? settings.strictMode : false,
      discouragedSites: Array.isArray(settings.discouragedSites)
        ? settings.discouragedSites
        : [],
      blockedSites: Array.isArray(settings.blockedSites)
        ? settings.blockedSites
        : [],
      animationsEnabled:
        typeof settings.animationsEnabled === "boolean"
          ? settings.animationsEnabled
          : true,
      notificationsEnabled:
        typeof settings.notificationsEnabled === "boolean"
          ? settings.notificationsEnabled
          : true,
      soundVolume:
        typeof settings.soundVolume === "number" ? settings.soundVolume : 0.5,
    };
  }

  /**
   * Validate StatisticsState
   */
  private validateStatisticsState(statistics: any): StatisticsState {
    if (!statistics || typeof statistics !== "object") {
      return { ...DEFAULT_STATISTICS };
    }

    return {
      totalSessions:
        typeof statistics.totalSessions === "number"
          ? statistics.totalSessions
          : 0,
      totalFocusTime:
        typeof statistics.totalFocusTime === "number"
          ? statistics.totalFocusTime
          : 0,
      currentStreak:
        typeof statistics.currentStreak === "number"
          ? statistics.currentStreak
          : 0,
      longestStreak:
        typeof statistics.longestStreak === "number"
          ? statistics.longestStreak
          : 0,
      lastSessionDate:
        typeof statistics.lastSessionDate === "string"
          ? statistics.lastSessionDate
          : "",
      bossesDefeated:
        typeof statistics.bossesDefeated === "number"
          ? statistics.bossesDefeated
          : 0,
      totalSoulInsightEarned:
        typeof statistics.totalSoulInsightEarned === "number"
          ? statistics.totalSoulInsightEarned
          : 0,
      totalSoulEmbersEarned:
        typeof statistics.totalSoulEmbersEarned === "number"
          ? statistics.totalSoulEmbersEarned
          : 0,
      totalIdleSoulsCollected:
        typeof statistics.totalIdleSoulsCollected === "number"
          ? statistics.totalIdleSoulsCollected
          : 0,
    };
  }

  /**
   * Retry storage operation with exponential backoff
   */
  private async retryStorageOperation<T>(
    operation: () => Promise<T>
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(
          `[StateManager] Storage operation failed (attempt ${attempt}/${this.MAX_RETRIES}):`,
          error
        );

        if (attempt < this.MAX_RETRIES) {
          // Exponential backoff: 100ms, 200ms, 400ms
          const delay = this.RETRY_DELAY_MS * Math.pow(2, attempt - 1);
          await this.sleep(delay);
        }
      }
    }

    // All retries failed
    throw new Error(
      `Storage operation failed after ${this.MAX_RETRIES} attempts: ${lastError?.message}`
    );
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
