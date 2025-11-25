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
  CURRENT_STATE_VERSION,
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
  private readonly BACKUP_KEY = "soulShepherdGameState_backup";
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

        // Check if state needs migration
        const migratedState = await this.migrateState(loadedState);

        // Validate and repair state
        const validatedState = this.validateAndRepairState(migratedState);

        // Try to load cosmetics from sync storage (for cross-device sync)
        try {
          const syncResult = await chrome.storage.sync.get(
            "soulShepherdCosmetics"
          );
          if (syncResult.soulShepherdCosmetics) {
            validatedState.player.cosmetics = syncResult.soulShepherdCosmetics;
            console.log("[StateManager] Cosmetics loaded from sync storage");
          }
        } catch (syncError) {
          console.warn(
            "[StateManager] Failed to load cosmetics from sync storage:",
            syncError
          );
          // Continue with local cosmetics
        }

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
          iconUrl: chrome.runtime.getURL("soul_shepherd.png"),
          title: "Soul Shepherd",
          message: "Failed to load saved progress. Starting fresh.",
        });
      }

      return defaultState;
    }
  }

  /**
   * Save game state to chrome.storage.local with retry logic
   * Optimized with compression for large states
   */
  async saveState(state: GameState): Promise<void> {
    try {
      // Optimize: Only save if state has changed
      if (this.state && JSON.stringify(this.state) === JSON.stringify(state)) {
        console.log("[StateManager] State unchanged, skipping save");
        return;
      }

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
          iconUrl: chrome.runtime.getURL("soul_shepherd.png"),
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
      version: CURRENT_STATE_VERSION,
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
   * Migrate state from older versions to current version
   */
  private async migrateState(state: any): Promise<GameState> {
    // If no version field, this is a pre-versioning state (version 0)
    const stateVersion = typeof state.version === "number" ? state.version : 0;

    if (stateVersion === CURRENT_STATE_VERSION) {
      console.log(
        "[StateManager] State is current version, no migration needed"
      );
      return state as GameState;
    }

    console.log(
      `[StateManager] Migrating state from version ${stateVersion} to ${CURRENT_STATE_VERSION}`
    );

    let migratedState = { ...state };

    // Migration chain - add new migrations as needed
    if (stateVersion < 1) {
      migratedState = this.migrateToV1(migratedState);
    }

    // Future migrations would go here:
    // if (stateVersion < 2) {
    //   migratedState = this.migrateToV2(migratedState);
    // }

    // Set current version
    migratedState.version = CURRENT_STATE_VERSION;

    console.log("[StateManager] Migration complete");
    return migratedState;
  }

  /**
   * Migrate from version 0 (no version field) to version 1
   */
  private migrateToV1(state: any): any {
    console.log("[StateManager] Migrating to version 1: Adding version field");

    // Version 1 adds the version field itself
    // All existing data structures remain compatible
    return {
      version: 1,
      ...state,
    };
  }

  /**
   * Backup corrupted state before resetting
   */
  private async backupCorruptedState(state: any): Promise<void> {
    try {
      const backup = {
        timestamp: Date.now(),
        state: state,
      };

      await this.retryStorageOperation(() =>
        chrome.storage.local.set({ [this.BACKUP_KEY]: backup })
      );

      console.log("[StateManager] Corrupted state backed up successfully");
    } catch (error) {
      console.error("[StateManager] Failed to backup corrupted state:", error);
      // Don't throw - backup failure shouldn't prevent reset
    }
  }

  /**
   * Validate state schema and repair missing or corrupted fields
   * If state is unrepairable, backup and reset to defaults
   */
  private validateAndRepairState(state: any): GameState {
    console.log("[StateManager] Validating state...");

    // Check if state is an object
    if (!state || typeof state !== "object") {
      console.warn("[StateManager] Invalid state object, using defaults");
      return this.createDefaultState();
    }

    // Check if state has critical corruption
    const isCriticallyCorrupted = this.checkCriticalCorruption(state);

    if (isCriticallyCorrupted) {
      console.error(
        "[StateManager] State is critically corrupted, backing up and resetting"
      );

      // Backup the corrupted state (async, but don't wait)
      this.backupCorruptedState(state).catch((error) => {
        console.error("[StateManager] Backup failed:", error);
      });

      // Notify user of data loss
      if (chrome.notifications) {
        chrome.notifications.create({
          type: "basic",
          iconUrl: chrome.runtime.getURL("soul_shepherd.png"),
          title: "Soul Shepherd - Data Reset",
          message:
            "Your save data was corrupted and has been reset. A backup was created.",
        });
      }

      return this.createDefaultState();
    }

    // Validate and repair each section
    const repairedState: GameState = {
      version:
        typeof state.version === "number"
          ? state.version
          : CURRENT_STATE_VERSION,
      player: this.validatePlayerState(state.player),
      session: this.validateSessionState(state.session),
      break: this.validateBreakState(state.break),
      progression: this.validateProgressionState(state.progression),
      tasks: this.validateTaskState(state.tasks),
      settings: this.validateSettingsState(state.settings),
      statistics: this.validateStatisticsState(state.statistics),
    };

    console.log("[StateManager] State validation complete");
    return repairedState;
  }

  /**
   * Check if state has critical corruption that cannot be repaired
   */
  private checkCriticalCorruption(state: any): boolean {
    // Check if all major sections are missing or invalid
    const hasPlayer = state.player && typeof state.player === "object";
    const hasProgression =
      state.progression && typeof state.progression === "object";
    const hasSettings = state.settings && typeof state.settings === "object";
    const hasStatistics =
      state.statistics && typeof state.statistics === "object";

    // If more than 2 major sections are missing, consider it critically corrupted
    const validSections = [
      hasPlayer,
      hasProgression,
      hasSettings,
      hasStatistics,
    ].filter(Boolean).length;

    if (validSections < 2) {
      console.warn(
        `[StateManager] Only ${validSections}/4 major sections are valid`
      );
      return true;
    }

    // Check for data type corruption in critical fields
    if (hasPlayer) {
      const hasValidLevel = typeof state.player.level === "number";
      const hasValidStats =
        state.player.stats && typeof state.player.stats === "object";

      if (!hasValidLevel || !hasValidStats) {
        console.warn(
          "[StateManager] Player state has corrupted critical fields"
        );
        return true;
      }
    }

    return false;
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
      showSessionTimer:
        typeof settings.showSessionTimer === "boolean"
          ? settings.showSessionTimer
          : true,
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

  /**
   * Save cosmetics to sync storage for cross-device availability
   * Uses retry logic and gracefully handles failures
   */
  async saveCosmeticsToSync(cosmetics: any): Promise<void> {
    try {
      await this.retryStorageOperation(() =>
        chrome.storage.sync.set({ soulShepherdCosmetics: cosmetics })
      );
      console.log("[StateManager] Cosmetics saved to sync storage");
    } catch (error) {
      console.error(
        "[StateManager] Failed to save cosmetics to sync storage after retries:",
        error
      );
      // Don't throw - sync storage failure shouldn't break the app
      // Local storage still has the data
    }
  }

  /**
   * Retrieve backed up state (for recovery purposes)
   * Returns null if no backup exists
   */
  async getBackupState(): Promise<{ timestamp: number; state: any } | null> {
    try {
      const result = await this.retryStorageOperation(() =>
        chrome.storage.local.get(this.BACKUP_KEY)
      );

      if (result[this.BACKUP_KEY]) {
        console.log("[StateManager] Backup state retrieved");
        return result[this.BACKUP_KEY];
      }

      console.log("[StateManager] No backup state found");
      return null;
    } catch (error) {
      console.error("[StateManager] Failed to retrieve backup state:", error);
      return null;
    }
  }

  /**
   * Delete backup state
   */
  async deleteBackup(): Promise<void> {
    try {
      await this.retryStorageOperation(() =>
        chrome.storage.local.remove(this.BACKUP_KEY)
      );
      console.log("[StateManager] Backup state deleted");
    } catch (error) {
      console.error("[StateManager] Failed to delete backup state:", error);
      throw error;
    }
  }

  /**
   * Get current state version
   */
  getStateVersion(): number {
    return CURRENT_STATE_VERSION;
  }
}
