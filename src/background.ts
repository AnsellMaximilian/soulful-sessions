// ============================================================================
// Background Service Worker for Soul Shepherd Extension
// ============================================================================

import { StateManager } from "./StateManager";
import { SessionManager } from "./SessionManager";
import { IdleCollector } from "./IdleCollector";
import { NavigationMonitor } from "./NavigationMonitor";
import {
  GameState,
  Message,
  SessionState,
  BreakState,
  SiteStatus,
  ProgressionState,
  StubbornSoul,
  TaskState,
} from "./types";
import { FORMULAS, STUBBORN_SOULS } from "./constants";

// ============================================================================
// Global State
// ============================================================================

let stateManager: StateManager;
let sessionManager: SessionManager;
let idleCollector: IdleCollector;
let navigationMonitor: NavigationMonitor;

// Idle detection state
let idleDetectionActive = false;
let idleStartTime: number | null = null;

// ============================================================================
// Service Worker Lifecycle
// ============================================================================

/**
 * Initialize extension on install
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log("[Background] Extension installed:", details.reason);

  // Initialize StateManager, SessionManager, IdleCollector, and NavigationMonitor
  stateManager = new StateManager();
  sessionManager = new SessionManager();
  idleCollector = new IdleCollector();
  navigationMonitor = new NavigationMonitor();

  try {
    // Load or create initial state
    await stateManager.loadState();
    console.log("[Background] State initialized successfully");

    // Set up idle collection alarm (every 5 minutes)
    await setupIdleCollectionAlarm();

    // Clear any existing blocking rules
    await updateBlockingRules([]);

    // Request notification permission on first install
    if (details.reason === "install") {
      console.log(
        "[Background] First install - requesting notification permission"
      );
      // Chrome extensions with notifications permission in manifest.json
      // automatically have permission granted, no need to explicitly request
      // Just verify we have permission
      const permission = await chrome.permissions.contains({
        permissions: ["notifications"],
      });
      console.log("[Background] Notification permission granted:", permission);
    }
  } catch (error) {
    console.error("[Background] Failed to initialize state:", error);
  }
});

/**
 * Initialize extension on startup (browser restart)
 */
chrome.runtime.onStartup.addListener(async () => {
  console.log("[Background] Extension starting up");

  // Initialize StateManager, SessionManager, IdleCollector, and NavigationMonitor
  stateManager = new StateManager();
  sessionManager = new SessionManager();
  idleCollector = new IdleCollector();
  navigationMonitor = new NavigationMonitor();

  try {
    // Load existing state
    await stateManager.loadState();
    console.log("[Background] State loaded on startup");

    // Set up idle collection alarm (every 5 minutes)
    await setupIdleCollectionAlarm();

    // Collect any idle souls accumulated while browser was closed
    await handleIdleCollectionAlarm();

    // Check for missed alarms/timers
    await checkForMissedTimersOnStartup();
  } catch (error) {
    console.error("[Background] Failed to load state on startup:", error);
  }
});

// ============================================================================
// Alarm Handling
// ============================================================================

/**
 * Handle chrome.alarms events for session and break timers
 */
chrome.alarms.onAlarm.addListener(async (alarm) => {
  console.log("[Background] Alarm fired:", alarm.name);

  try {
    // Ensure state is loaded
    if (!stateManager) {
      stateManager = new StateManager();
      await stateManager.loadState();
    }

    if (!sessionManager) {
      sessionManager = new SessionManager();
    }

    if (!idleCollector) {
      idleCollector = new IdleCollector();
    }

    if (!navigationMonitor) {
      navigationMonitor = new NavigationMonitor();
    }

    switch (alarm.name) {
      case "soulShepherd_sessionEnd":
        await handleSessionAlarm();
        break;

      case "soulShepherd_breakEnd":
        await handleBreakAlarm();
        break;

      case "soulShepherd_idleCollection":
        await handleIdleCollectionAlarm();
        break;

      default:
        console.warn("[Background] Unknown alarm:", alarm.name);
    }
  } catch (error) {
    console.error(`[Background] Error handling ${alarm.name} alarm:`, error);
  }
});

/**
 * Handle session end alarm
 */
async function handleSessionAlarm(): Promise<void> {
  console.log("[Background] Session timer expired");

  try {
    const currentState = stateManager.getState();

    if (!currentState.session || !currentState.session.isActive) {
      console.warn(
        "[Background] Session alarm fired but no active session found"
      );
      return;
    }

    // End the session
    await handleEndSession();
  } catch (error) {
    console.error("[Background] Error handling session alarm:", error);
  }
}

/**
 * Set up periodic idle collection alarm (every 5 minutes)
 */
async function setupIdleCollectionAlarm(): Promise<void> {
  try {
    // Clear any existing idle collection alarm
    await chrome.alarms.clear("soulShepherd_idleCollection");

    // Create periodic alarm (every 5 minutes)
    await chrome.alarms.create("soulShepherd_idleCollection", {
      periodInMinutes: FORMULAS.IDLE_COLLECTION_INTERVAL,
    });

    console.log(
      `[Background] Idle collection alarm set up (every ${FORMULAS.IDLE_COLLECTION_INTERVAL} minutes)`
    );
  } catch (error) {
    console.error(
      "[Background] Failed to set up idle collection alarm:",
      error
    );
  }
}

/**
 * Handle break end alarm
 */
async function handleBreakAlarm(): Promise<void> {
  console.log("[Background] Break timer expired");

  try {
    const currentState = stateManager.getState();

    if (!currentState.break || !currentState.break.isActive) {
      console.warn("[Background] Break alarm fired but no active break found");
      return;
    }

    // Clear break state
    await stateManager.updateState({
      break: null,
    });

    console.log("[Background] Break ended");

    // Send notification if enabled
    if (currentState.settings.notificationsEnabled) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: chrome.runtime.getURL("assets/sprites/sprite_classic_shepherd.png"),
        title: "Soul Shepherd",
        message: "Break complete. Ready for another session?",
      });
    }

    // Broadcast break ended to all clients
    broadcastMessage({
      type: "BREAK_ENDED",
      payload: {
        autoStartEnabled: currentState.settings.autoStartNextSession,
      },
    });

    // Get updated state
    const updatedState = stateManager.getState();
    broadcastMessage({
      type: "STATE_UPDATE",
      payload: { state: updatedState },
    });

    console.log("[Background] Break end flow complete");
  } catch (error) {
    console.error("[Background] Error handling break alarm:", error);
  }
}

/**
 * Handle idle collection alarm
 */
async function handleIdleCollectionAlarm(): Promise<void> {
  console.log("[Background] Idle collection alarm fired");

  try {
    // Ensure state is loaded
    if (!stateManager) {
      stateManager = new StateManager();
      await stateManager.loadState();
    }

    const currentState = stateManager.getState();
    const { lastCollectionTime, accumulatedSouls } =
      currentState.progression.idleState;
    const soulflow = currentState.player.stats.soulflow;

    // Collect idle souls
    const { soulsCollected, embersEarned, newCollectionTime } =
      idleCollector.collectIdleSouls(lastCollectionTime, soulflow);

    // Update state with new collection time and rewards
    await stateManager.updateState({
      progression: {
        ...currentState.progression,
        idleState: {
          lastCollectionTime: newCollectionTime,
          accumulatedSouls: accumulatedSouls + soulsCollected,
        },
      },
      player: {
        ...currentState.player,
        soulEmbers: currentState.player.soulEmbers + embersEarned,
      },
      statistics: {
        ...currentState.statistics,
        totalIdleSoulsCollected:
          currentState.statistics.totalIdleSoulsCollected + soulsCollected,
        totalSoulEmbersEarned:
          currentState.statistics.totalSoulEmbersEarned + embersEarned,
      },
    });

    console.log(
      `[Background] Idle collection complete: ${soulsCollected} souls, ${embersEarned} embers`
    );

    // Broadcast idle collection to all clients
    broadcastMessage({
      type: "IDLE_SOULS_COLLECTED",
      payload: {
        soulsCollected,
        embersEarned,
      },
    });
  } catch (error) {
    console.error("[Background] Error handling idle collection alarm:", error);
  }
}

// ============================================================================
// Message Handling
// ============================================================================

/**
 * Message router for communication with popup and options
 */
chrome.runtime.onMessage.addListener(
  (
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) => {
    console.log("[Background] Received message:", message.type, message);

    // Handle message asynchronously
    handleMessage(message, sender)
      .then((response) => {
        sendResponse({ success: true, data: response });
      })
      .catch((error) => {
        console.error("[Background] Message handler error:", error);
        sendResponse({ success: false, error: error.message });
      });

    // Return true to indicate async response
    return true;
  }
);

/**
 * Main message handler with routing
 */
async function handleMessage(
  message: Message,
  sender: chrome.runtime.MessageSender
): Promise<any> {
  // Ensure state is loaded
  if (!stateManager) {
    stateManager = new StateManager();
    await stateManager.loadState();
  }

  // Ensure other managers are initialized
  if (!sessionManager) {
    sessionManager = new SessionManager();
  }

  if (!idleCollector) {
    idleCollector = new IdleCollector();
  }

  if (!navigationMonitor) {
    navigationMonitor = new NavigationMonitor();
  }

  // Route message to appropriate handler
  switch (message.type) {
    case "GET_STATE":
      return handleGetState();

    case "UPDATE_STATE":
      return handleUpdateState(message.payload);

    // Session management messages (to be implemented in Phase 2)
    case "START_SESSION":
      return handleStartSession(message.payload);

    case "END_SESSION":
      return handleEndSession();

    case "END_SESSION_RETROACTIVE":
      return handleEndSessionRetroactive(message.payload);

    case "END_BREAK_RETROACTIVE":
      return handleEndBreakRetroactive(message.payload);

    case "PAUSE_SESSION":
      return handlePauseSession();

    case "RESUME_SESSION":
      return handleResumeSession(message.payload);

    // Settings management messages
    case "UPDATE_SETTINGS":
      return handleUpdateSettings(message.payload);

    // Task management messages
    case "UPDATE_TASKS":
      return handleUpdateTasks(message.payload);

    // Stats upgrade messages (to be implemented in Phase 8)
    case "UPGRADE_STAT":
      return handleUpgradeStat(message.payload);

    case "ALLOCATE_SKILL_POINT":
      return handleAllocateSkillPoint(message.payload);

    // Cosmetics messages (to be implemented in Phase 13)
    case "PURCHASE_COSMETIC":
      return handlePurchaseCosmetic(message.payload);

    case "APPLY_COSMETIC":
      return handleApplyCosmetic(message.payload);

    // Navigation monitoring messages (to be implemented in Phase 6)
    case "CHECK_URL":
      return handleCheckUrl(message.payload);

    case "SITE_VISITED":
      return handleSiteVisited(message.payload);

    // Emergency session end (strict mode)
    case "EMERGENCY_END_SESSION":
      return handleEmergencyEndSession();

    // Idle soul collection (manual trigger from popup)
    case "COLLECT_IDLE_SOULS":
      return handleIdleCollectionAlarm();

    default:
      throw new Error(`Unknown message type: ${message.type}`);
  }
}

// ============================================================================
// Message Handlers
// ============================================================================

/**
 * Get current game state
 */
async function handleGetState(): Promise<GameState> {
  return stateManager.getState();
}

/**
 * Update game state with partial changes
 */
async function handleUpdateState(partial: Partial<GameState>): Promise<void> {
  await stateManager.updateState(partial);
}

/**
 * Start a focus session
 */
async function handleStartSession(payload: {
  duration: number;
  taskId: string;
  autoCompleteTask: boolean;
}): Promise<SessionState> {
  console.log(
    `[Background] Starting session: ${payload.duration} minutes, task: ${payload.taskId}, autoComplete: ${payload.autoCompleteTask}`
  );

  const currentState = stateManager.getState();

  // Ensure navigation monitor is initialized
  if (!navigationMonitor) {
    navigationMonitor = new NavigationMonitor();
  }

  // Start session using SessionManager
  const newSession = await sessionManager.startSession(
    payload.duration,
    payload.taskId,
    payload.autoCompleteTask,
    currentState.session
  );

  // Update state with new session
  await stateManager.updateState({
    session: newSession,
  });

  // Start navigation monitoring
  navigationMonitor.startMonitoring();
  console.log("[Background] Navigation monitoring started for session");

  // Start idle detection
  startIdleDetection(currentState.settings.idleThreshold);
  console.log("[Background] Idle detection started for session");

  // If strict mode is enabled, activate blocking rules
  if (currentState.settings.strictMode) {
    await updateBlockingRules(currentState.settings.blockedSites);
    console.log("[Background] Strict mode blocking activated");
  }

  // Get updated state
  const updatedState = stateManager.getState();

  // Broadcast session started to all clients
  broadcastMessage({
    type: "SESSION_STARTED",
    payload: newSession,
  });

  // Also broadcast state update so popup has latest state
  broadcastMessage({
    type: "STATE_UPDATE",
    payload: { state: updatedState },
  });

  return newSession;
}

/**
 * Handle boss defeat and unlock logic
 */
function handleBossDefeat(
  bossResult: any,
  updatedProgression: ProgressionState,
  playerLevel: number,
  progressionManager: any
): ProgressionState {
  if (!bossResult.wasDefeated) {
    return updatedProgression;
  }

  console.log("[Background] Boss defeated!");

  if (bossResult.nextBoss) {
    console.log(
      `[Background] Next boss available: ${bossResult.nextBoss.name}`
    );

    // Check if player level meets unlock requirement
    if (playerLevel >= bossResult.nextBoss.unlockLevel) {
      // Player level is sufficient - unlock next boss
      const newProgression = progressionManager.unlockNextBoss(
        updatedProgression,
        playerLevel
      );
      console.log(`[Background] Boss unlocked: ${bossResult.nextBoss.name}`);
      return newProgression;
    } else {
      // Player level is too low - boss remains locked
      console.log(
        `[Background] Boss locked: ${bossResult.nextBoss.name} requires level ${bossResult.nextBoss.unlockLevel}, player is level ${playerLevel}`
      );
      return updatedProgression;
    }
  } else {
    console.log("[Background] All bosses defeated - campaign complete!");
    return updatedProgression;
  }
}

/**
 * Handle level-up and check for boss unlocks
 */
function handleLevelUp(
  levelResult: any,
  currentPlayerLevel: number,
  currentBossIndex: number
): void {
  if (!levelResult.leveledUp) {
    return;
  }

  console.log(
    `[Background] Player leveled up to level ${levelResult.newLevel}!`
  );

  // Check if new level unlocks next boss
  const nextBossIndex = currentBossIndex + 1;
  let unlockedBoss: StubbornSoul | undefined = undefined;

  if (nextBossIndex < STUBBORN_SOULS.length) {
    const potentialNextBoss = STUBBORN_SOULS[nextBossIndex];
    // Check if this boss was previously locked but is now unlocked
    if (
      potentialNextBoss.unlockLevel <= levelResult.newLevel &&
      potentialNextBoss.unlockLevel > currentPlayerLevel
    ) {
      unlockedBoss = potentialNextBoss;
      console.log(
        `[Background] Level-up unlocked new boss: ${unlockedBoss.name}`
      );
    }
  }

  // Broadcast level-up message
  broadcastMessage({
    type: "LEVEL_UP",
    payload: {
      newLevel: levelResult.newLevel,
      skillPointsGranted: levelResult.skillPointsGranted,
      unlockedBoss,
    },
  });
}

/**
 * End current focus session
 */
async function handleEndSession(): Promise<void> {
  console.log("[Background] Ending session");

  const currentState = stateManager.getState();

  if (!currentState.session || !currentState.session.isActive) {
    console.warn("[Background] No active session to end");
    return;
  }

  // Ensure managers are initialized
  if (!sessionManager) {
    sessionManager = new SessionManager();
  }

  if (!navigationMonitor) {
    navigationMonitor = new NavigationMonitor();
  }

  // Stop navigation monitoring
  navigationMonitor.stopMonitoring();
  console.log("[Background] Navigation monitoring stopped");

  // Stop idle detection
  stopIdleDetection();
  console.log("[Background] Idle detection stopped");

  // Clear blocking rules
  await updateBlockingRules([]);
  console.log("[Background] Blocking rules cleared");

  // Import RewardCalculator and ProgressionManager
  const { RewardCalculator } = await import("./RewardCalculator");
  const { ProgressionManager } = await import("./ProgressionManager");

  const rewardCalculator = new RewardCalculator();
  const progressionManager = new ProgressionManager();

  // End session using SessionManager
  const sessionResult = sessionManager.endSession(currentState.session);

  // Calculate rewards using RewardCalculator
  const rewards = rewardCalculator.calculateRewards(
    currentState.session,
    currentState.player.stats
  );

  // Update session result with calculated rewards
  sessionResult.soulInsight = rewards.soulInsight;
  sessionResult.soulEmbers = rewards.soulEmbers;
  sessionResult.bossProgress = rewards.bossProgress;
  sessionResult.wasCritical = rewards.wasCritical;

  console.log("[Background] Rewards calculated:", rewards);

  // Apply boss damage using ProgressionManager
  const bossResult = progressionManager.damageBoss(
    rewards.bossProgress,
    currentState.progression,
    currentState.player.level
  );

  console.log("[Background] Boss damage applied:", bossResult);

  // Add experience using ProgressionManager
  const levelResult = progressionManager.addExperience(
    rewards.soulInsight,
    currentState.player
  );

  console.log("[Background] Experience added:", levelResult);

  // Calculate new XP to next level
  const newXPToNextLevel = progressionManager.calculateLevelThreshold(
    levelResult.newLevel
  );

  // Handle level-up and check for boss unlocks
  handleLevelUp(
    levelResult,
    currentState.player.level,
    currentState.progression.currentBossIndex
  );

  // Update progression state
  let updatedProgression = {
    ...currentState.progression,
    currentBossResolve: bossResult.remainingResolve,
  };

  // Handle boss defeat and unlock logic
  updatedProgression = handleBossDefeat(
    bossResult,
    updatedProgression,
    levelResult.newLevel,
    progressionManager
  );

  // Update player state with rewards and progression
  const updatedPlayer = {
    ...currentState.player,
    level: levelResult.newLevel,
    soulInsight: currentState.player.soulInsight + rewards.soulInsight,
    soulInsightToNextLevel: newXPToNextLevel,
    soulEmbers: currentState.player.soulEmbers + rewards.soulEmbers,
    skillPoints:
      currentState.player.skillPoints + levelResult.skillPointsGranted,
  };

  // Update statistics
  const updatedStatistics = {
    ...currentState.statistics,
    totalSessions: currentState.statistics.totalSessions + 1,
    totalFocusTime:
      currentState.statistics.totalFocusTime + currentState.session.duration,
    totalSoulInsightEarned:
      currentState.statistics.totalSoulInsightEarned + rewards.soulInsight,
    totalSoulEmbersEarned:
      currentState.statistics.totalSoulEmbersEarned + rewards.soulEmbers,
    bossesDefeated: bossResult.wasDefeated
      ? currentState.statistics.bossesDefeated + 1
      : currentState.statistics.bossesDefeated,
    lastSessionDate: new Date().toISOString().split("T")[0],
  };

  // Update streak logic
  const today = new Date().toISOString().split("T")[0];
  const lastSessionDate = currentState.statistics.lastSessionDate;

  if (lastSessionDate) {
    const lastDate = new Date(lastSessionDate);
    const todayDate = new Date(today);
    const daysDiff = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      // Consecutive day - increment streak
      updatedStatistics.currentStreak =
        currentState.statistics.currentStreak + 1;
      updatedStatistics.longestStreak = Math.max(
        updatedStatistics.currentStreak,
        currentState.statistics.longestStreak
      );
    } else if (daysDiff > 1) {
      // Skipped days - reset streak
      updatedStatistics.currentStreak = 1;
    }
    // If daysDiff === 0, it's the same day, don't change streak
  } else {
    // First session ever
    updatedStatistics.currentStreak = 1;
    updatedStatistics.longestStreak = 1;
  }

  // Handle task completion if auto-complete is enabled
  let updatedTasks = currentState.tasks;
  console.log(
    `[Background] Checking task auto-complete: autoComplete=${currentState.session.autoCompleteTask}, taskId=${currentState.session.taskId}`
  );
  
  if (currentState.session.autoCompleteTask && currentState.session.taskId) {
    console.log(
      `[Background] Auto-completing task: ${currentState.session.taskId}`
    );
    updatedTasks = completeTask(
      currentState.tasks,
      currentState.session.taskId
    );
    console.log(
      `[Background] Task auto-completed successfully: ${currentState.session.taskId}`
    );
  } else {
    console.log(
      `[Background] Task auto-complete skipped (not enabled or no task selected)`
    );
  }

  // Start break timer
  const breakDuration = currentState.settings.defaultBreakDuration;
  const breakState: BreakState = {
    startTime: Date.now(),
    duration: breakDuration,
    isActive: true,
  };

  // Create break alarm
  await chrome.alarms.create("soulShepherd_breakEnd", {
    delayInMinutes: breakDuration,
  });

  console.log(`[Background] Break timer started: ${breakDuration} minutes`);

  // Update state with all changes
  await stateManager.updateState({
    session: null,
    break: breakState,
    player: updatedPlayer,
    progression: updatedProgression,
    statistics: updatedStatistics,
    tasks: updatedTasks,
  });

  // Send notification if enabled
  if (currentState.settings.notificationsEnabled) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: chrome.runtime.getURL("assets/sprites/sprite_classic_shepherd.png"),
      title: "Soul Shepherd",
      message: "Your ritual is complete. Souls await you.",
    });
  }

  // Broadcast session ended to all clients with results
  broadcastMessage({
    type: "SESSION_ENDED",
    payload: {
      result: sessionResult,
      leveledUp: levelResult.leveledUp,
      newLevel: levelResult.newLevel,
      skillPointsGranted: levelResult.skillPointsGranted,
      bossDefeated: bossResult.wasDefeated,
      nextBoss: bossResult.nextBoss,
      playerLevel: levelResult.newLevel,
    },
  });

  // Broadcast state update so popup has latest state
  const updatedState = stateManager.getState();
  broadcastMessage({
    type: "STATE_UPDATE",
    payload: { state: updatedState },
  });

  console.log("[Background] Session end flow complete");
}

/**
 * End session retroactively (for missed/late alarms)
 * Applies rewards based on actual elapsed time
 */
async function handleEndSessionRetroactive(payload: {
  actualEndTime: number;
  detectedAt: number;
}): Promise<void> {
  console.log(
    "[Background] Ending session retroactively - alarm was late or missed"
  );
  console.log(
    `[Background] Actual end time: ${new Date(
      payload.actualEndTime
    ).toISOString()}, Detected at: ${new Date(
      payload.detectedAt
    ).toISOString()}`
  );

  const currentState = stateManager.getState();

  if (!currentState.session || !currentState.session.isActive) {
    console.warn(
      "[Background] No active session to end retroactively - may have already been processed"
    );
    return;
  }

  // Calculate how late the alarm was
  const delayMs = payload.detectedAt - payload.actualEndTime;
  const delayMinutes = Math.floor(delayMs / (1000 * 60));

  console.log(
    `[Background] Timer was delayed by ${delayMinutes} minute(s) (${delayMs}ms)`
  );

  // Ensure managers are initialized
  if (!sessionManager) {
    sessionManager = new SessionManager();
  }

  if (!navigationMonitor) {
    navigationMonitor = new NavigationMonitor();
  }

  // Stop navigation monitoring
  navigationMonitor.stopMonitoring();
  console.log("[Background] Navigation monitoring stopped");

  // Stop idle detection
  stopIdleDetection();
  console.log("[Background] Idle detection stopped");

  // Clear blocking rules
  await updateBlockingRules([]);
  console.log("[Background] Blocking rules cleared");

  // Import RewardCalculator and ProgressionManager
  const { RewardCalculator } = await import("./RewardCalculator");
  const { ProgressionManager } = await import("./ProgressionManager");

  const rewardCalculator = new RewardCalculator();
  const progressionManager = new ProgressionManager();

  // Create a modified session state with the actual end time for accurate calculations
  const adjustedSession = {
    ...currentState.session,
    // Calculate actual active time based on when session should have ended
    activeTime: Math.max(
      0,
      (payload.actualEndTime - currentState.session.startTime) / 1000 -
        currentState.session.idleTime
    ),
  };

  // End session using SessionManager (this clears the alarm)
  const sessionResult = sessionManager.endSession(currentState.session);

  // Calculate rewards using the adjusted session state for accurate timing
  const rewards = rewardCalculator.calculateRewards(
    adjustedSession,
    currentState.player.stats
  );

  // Update session result with calculated rewards
  sessionResult.soulInsight = rewards.soulInsight;
  sessionResult.soulEmbers = rewards.soulEmbers;
  sessionResult.bossProgress = rewards.bossProgress;
  sessionResult.wasCritical = rewards.wasCritical;
  sessionResult.activeTime = adjustedSession.activeTime;

  console.log(
    "[Background] Rewards calculated (retroactive with actual timing):",
    rewards
  );

  // Apply boss damage using ProgressionManager
  const bossResult = progressionManager.damageBoss(
    rewards.bossProgress,
    currentState.progression,
    currentState.player.level
  );

  console.log("[Background] Boss damage applied:", bossResult);

  // Add experience using ProgressionManager
  const levelResult = progressionManager.addExperience(
    rewards.soulInsight,
    currentState.player
  );

  console.log("[Background] Experience added:", levelResult);

  // Calculate new XP to next level
  const newXPToNextLevel = progressionManager.calculateLevelThreshold(
    levelResult.newLevel
  );

  // Handle level-up and check for boss unlocks
  handleLevelUp(
    levelResult,
    currentState.player.level,
    currentState.progression.currentBossIndex
  );

  // Update progression state
  let updatedProgression = {
    ...currentState.progression,
    currentBossResolve: bossResult.remainingResolve,
  };

  // Handle boss defeat and unlock logic
  updatedProgression = handleBossDefeat(
    bossResult,
    updatedProgression,
    levelResult.newLevel,
    progressionManager
  );

  // Update player state with rewards and progression
  const updatedPlayer = {
    ...currentState.player,
    level: levelResult.newLevel,
    soulInsight: currentState.player.soulInsight + rewards.soulInsight,
    soulInsightToNextLevel: newXPToNextLevel,
    soulEmbers: currentState.player.soulEmbers + rewards.soulEmbers,
    skillPoints:
      currentState.player.skillPoints + levelResult.skillPointsGranted,
  };

  // Update statistics
  const updatedStatistics = {
    ...currentState.statistics,
    totalSessions: currentState.statistics.totalSessions + 1,
    totalFocusTime:
      currentState.statistics.totalFocusTime + currentState.session.duration,
    totalSoulInsightEarned:
      currentState.statistics.totalSoulInsightEarned + rewards.soulInsight,
    totalSoulEmbersEarned:
      currentState.statistics.totalSoulEmbersEarned + rewards.soulEmbers,
    bossesDefeated: bossResult.wasDefeated
      ? currentState.statistics.bossesDefeated + 1
      : currentState.statistics.bossesDefeated,
    lastSessionDate: new Date().toISOString().split("T")[0],
  };

  // Update streak logic
  const today = new Date().toISOString().split("T")[0];
  const lastSessionDate = currentState.statistics.lastSessionDate;

  if (lastSessionDate) {
    const lastDate = new Date(lastSessionDate);
    const todayDate = new Date(today);
    const daysDiff = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      // Consecutive day - increment streak
      updatedStatistics.currentStreak =
        currentState.statistics.currentStreak + 1;
      updatedStatistics.longestStreak = Math.max(
        updatedStatistics.currentStreak,
        currentState.statistics.longestStreak
      );
    } else if (daysDiff > 1) {
      // Skipped days - reset streak
      updatedStatistics.currentStreak = 1;
    }
    // If daysDiff === 0, it's the same day, don't change streak
  } else {
    // First session ever
    updatedStatistics.currentStreak = 1;
    updatedStatistics.longestStreak = 1;
  }

  // Start break timer using the actual end time as the start
  const breakDuration = currentState.settings.defaultBreakDuration;
  const breakState: BreakState = {
    startTime: payload.actualEndTime, // Use actual end time, not current time
    duration: breakDuration,
    isActive: true,
  };

  // Calculate remaining break time
  const breakEndTime = payload.actualEndTime + breakDuration * 60 * 1000;
  const remainingBreakMs = breakEndTime - payload.detectedAt;
  const remainingBreakMinutes = Math.max(0, remainingBreakMs / (1000 * 60));

  if (remainingBreakMinutes > 0) {
    // Create break alarm for remaining time
    await chrome.alarms.create("soulShepherd_breakEnd", {
      delayInMinutes: remainingBreakMinutes,
    });

    console.log(
      `[Background] Break timer started with ${remainingBreakMinutes.toFixed(
        1
      )} minutes remaining (adjusted for delay)`
    );
  } else {
    // Break should have already ended - end it immediately
    console.log(
      "[Background] Break time has already elapsed - ending break immediately"
    );
    breakState.isActive = false;
  }

  // Update state with all changes
  await stateManager.updateState({
    session: null,
    break: breakState.isActive ? breakState : null,
    player: updatedPlayer,
    progression: updatedProgression,
    statistics: updatedStatistics,
  });

  // Send notification if enabled
  if (currentState.settings.notificationsEnabled) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: chrome.runtime.getURL("assets/sprites/sprite_classic_shepherd.png"),
      title: "Soul Shepherd",
      message: "Your ritual is complete. Souls await you.",
    });
  }

  // Broadcast session ended to all clients with results
  broadcastMessage({
    type: "SESSION_ENDED",
    payload: {
      result: sessionResult,
      leveledUp: levelResult.leveledUp,
      newLevel: levelResult.newLevel,
      skillPointsGranted: levelResult.skillPointsGranted,
      bossDefeated: bossResult.wasDefeated,
      nextBoss: bossResult.nextBoss,
      playerLevel: levelResult.newLevel,
      retroactive: true,
      delayMinutes: delayMinutes,
    },
  });

  // Broadcast state update so popup has latest state
  const updatedState = stateManager.getState();
  broadcastMessage({
    type: "STATE_UPDATE",
    payload: { state: updatedState },
  });

  console.log(
    "[Background] Retroactive session end flow complete (delay: " +
      delayMinutes +
      " minutes)"
  );
}

/**
 * End break retroactively (for missed/late alarms)
 */
async function handleEndBreakRetroactive(payload: {
  actualEndTime: number;
  detectedAt: number;
}): Promise<void> {
  console.log(
    "[Background] Ending break retroactively - alarm was late or missed"
  );
  console.log(
    `[Background] Actual end time: ${new Date(
      payload.actualEndTime
    ).toISOString()}, Detected at: ${new Date(
      payload.detectedAt
    ).toISOString()}`
  );

  const currentState = stateManager.getState();

  if (!currentState.break || !currentState.break.isActive) {
    console.warn(
      "[Background] No active break to end retroactively - may have already been processed"
    );
    return;
  }

  // Calculate how late the alarm was
  const delayMs = payload.detectedAt - payload.actualEndTime;
  const delayMinutes = Math.floor(delayMs / (1000 * 60));

  console.log(
    `[Background] Break timer was delayed by ${delayMinutes} minute(s) (${delayMs}ms)`
  );

  // Clear break state
  await stateManager.updateState({
    break: null,
  });

  console.log("[Background] Break ended retroactively");

  // Send notification if enabled
  if (currentState.settings.notificationsEnabled) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: chrome.runtime.getURL("assets/sprites/sprite_classic_shepherd.png"),
      title: "Soul Shepherd",
      message: "Break complete. Ready for another session?",
    });
  }

  // Broadcast break ended to all clients
  broadcastMessage({
    type: "BREAK_ENDED",
    payload: {
      autoStartEnabled: currentState.settings.autoStartNextSession,
      retroactive: true,
      delayMinutes: delayMinutes,
    },
  });

  // Get updated state
  const updatedState = stateManager.getState();
  broadcastMessage({
    type: "STATE_UPDATE",
    payload: { state: updatedState },
  });

  console.log(
    "[Background] Retroactive break end flow complete (delay: " +
      delayMinutes +
      " minutes)"
  );
}

/**
 * Pause current session (idle detected)
 */
async function handlePauseSession(): Promise<void> {
  console.log("[Background] Pausing session");

  const currentState = stateManager.getState();

  // Pause session using SessionManager
  const updatedSession = sessionManager.pauseSession(currentState.session);

  // Update state with paused session
  await stateManager.updateState({
    session: updatedSession,
  });

  // Broadcast session paused to all clients
  broadcastMessage({
    type: "SESSION_PAUSED",
    payload: updatedSession,
  });
}

/**
 * Resume paused session
 */
async function handleResumeSession(payload: {
  idleSeconds: number;
}): Promise<void> {
  console.log(
    `[Background] Resuming session after ${payload.idleSeconds}s idle`
  );

  const currentState = stateManager.getState();

  // Resume session using SessionManager
  const updatedSession = sessionManager.resumeSession(
    currentState.session,
    payload.idleSeconds
  );

  // Update state with resumed session
  await stateManager.updateState({
    session: updatedSession,
  });

  // Broadcast session resumed to all clients
  broadcastMessage({
    type: "SESSION_RESUMED",
    payload: updatedSession,
  });
}

/**
 * Update settings
 */
async function handleUpdateSettings(settings: Partial<any>): Promise<void> {
  const currentState = stateManager.getState();
  const updatedSettings = {
    ...currentState.settings,
    ...settings,
  };

  await stateManager.updateState({
    settings: updatedSettings,
  });

  // If blocked sites or strict mode changed, update blocking rules
  if (
    settings.blockedSites !== undefined ||
    settings.strictMode !== undefined
  ) {
    // Only apply blocking rules if there's an active session and strict mode is on
    if (
      currentState.session?.isActive &&
      updatedSettings.strictMode &&
      updatedSettings.blockedSites
    ) {
      await updateBlockingRules(updatedSettings.blockedSites);
      console.log("[Background] Blocking rules updated from settings change");
    } else if (!updatedSettings.strictMode || !currentState.session?.isActive) {
      // Clear rules if strict mode disabled or no active session
      await updateBlockingRules([]);
      console.log("[Background] Blocking rules cleared from settings change");
    }
  }
}

/**
 * Update tasks
 */
async function handleUpdateTasks(tasks: any): Promise<void> {
  const currentState = stateManager.getState();
  await stateManager.updateState({
    tasks: {
      ...currentState.tasks,
      ...tasks,
    },
  });
}

/**
 * Upgrade a stat with Soul Embers
 */
async function handleUpgradeStat(payload: { statName: string }): Promise<void> {
  console.log(`[Background] Upgrading stat: ${payload.statName}`);

  const currentState = stateManager.getState();
  const { statName } = payload;

  // Validate stat name
  if (!["spirit", "harmony", "soulflow"].includes(statName)) {
    throw new Error(`Invalid stat name: ${statName}`);
  }

  // Get current stat value
  let currentStatValue: number;
  if (statName === "harmony") {
    // Harmony is stored as decimal (0.05 = 5%), but we calculate cost based on whole number
    currentStatValue = currentState.player.stats.harmony * 100;
  } else {
    currentStatValue = currentState.player.stats[
      statName as keyof typeof currentState.player.stats
    ] as number;
  }

  // Calculate upgrade cost using formula: baseCost * (1.5 ^ currentStatValue)
  const upgradeCost = Math.floor(
    FORMULAS.STAT_UPGRADE_BASE_COST *
      Math.pow(FORMULAS.STAT_UPGRADE_COST_MULTIPLIER, currentStatValue)
  );

  console.log(
    `[Background] Upgrade cost for ${statName}: ${upgradeCost} (current value: ${currentStatValue})`
  );

  // Check if player has enough Soul Embers
  if (currentState.player.soulEmbers < upgradeCost) {
    throw new Error(
      `Insufficient Soul Embers. Need ${upgradeCost}, have ${currentState.player.soulEmbers}`
    );
  }

  // Deduct Soul Embers and increment stat
  const updatedStats = { ...currentState.player.stats };

  if (statName === "harmony") {
    // Harmony increments by 1% (0.01)
    updatedStats.harmony = currentState.player.stats.harmony + 0.01;
  } else {
    updatedStats[statName as keyof typeof updatedStats] =
      (currentState.player.stats[
        statName as keyof typeof currentState.player.stats
      ] as number) + 1;
  }

  const updatedPlayer = {
    ...currentState.player,
    stats: updatedStats,
    soulEmbers: currentState.player.soulEmbers - upgradeCost,
  };

  // Update state
  await stateManager.updateState({
    player: updatedPlayer,
  });

  console.log(
    `[Background] Stat upgraded: ${statName} = ${
      statName === "harmony"
        ? updatedStats.harmony
        : updatedStats[statName as keyof typeof updatedStats]
    }, Soul Embers remaining: ${updatedPlayer.soulEmbers}`
  );

  // Broadcast state update to all clients
  const updatedState = stateManager.getState();
  broadcastMessage({
    type: "STATE_UPDATE",
    payload: { state: updatedState },
  });

  broadcastMessage({
    type: "STAT_UPGRADED",
    payload: {
      statName,
      newValue:
        statName === "harmony"
          ? updatedStats.harmony
          : updatedStats[statName as keyof typeof updatedStats],
      cost: upgradeCost,
      remainingEmbers: updatedPlayer.soulEmbers,
    },
  });
}

/**
 * Allocate skill point to a stat
 */
async function handleAllocateSkillPoint(payload: {
  statName: string;
}): Promise<void> {
  console.log(`[Background] Allocating skill point to: ${payload.statName}`);

  const currentState = stateManager.getState();
  const { statName } = payload;

  // Validate stat name
  if (!["spirit", "harmony", "soulflow"].includes(statName)) {
    throw new Error(`Invalid stat name: ${statName}`);
  }

  // Check if player has skill points available
  if (currentState.player.skillPoints <= 0) {
    throw new Error(
      `No skill points available. Current: ${currentState.player.skillPoints}`
    );
  }

  // Increment stat by 1
  const updatedStats = { ...currentState.player.stats };

  if (statName === "harmony") {
    // Harmony increments by 1% (0.01)
    updatedStats.harmony = currentState.player.stats.harmony + 0.01;
  } else {
    updatedStats[statName as keyof typeof updatedStats] =
      (currentState.player.stats[
        statName as keyof typeof currentState.player.stats
      ] as number) + 1;
  }

  // Deduct skill point
  const updatedPlayer = {
    ...currentState.player,
    stats: updatedStats,
    skillPoints: currentState.player.skillPoints - 1,
  };

  // Update state
  await stateManager.updateState({
    player: updatedPlayer,
  });

  console.log(
    `[Background] Skill point allocated: ${statName} = ${
      statName === "harmony"
        ? updatedStats.harmony
        : updatedStats[statName as keyof typeof updatedStats]
    }, Skill points remaining: ${updatedPlayer.skillPoints}`
  );

  // Broadcast state update to all clients
  const updatedState = stateManager.getState();
  broadcastMessage({
    type: "STATE_UPDATE",
    payload: { state: updatedState },
  });

  broadcastMessage({
    type: "SKILL_POINT_ALLOCATED",
    payload: {
      statName,
      newValue:
        statName === "harmony"
          ? updatedStats.harmony
          : updatedStats[statName as keyof typeof updatedStats],
      remainingSkillPoints: updatedPlayer.skillPoints,
    },
  });
}

/**
 * Purchase cosmetic item
 */
async function handlePurchaseCosmetic(payload: {
  type: "theme" | "sprite";
  itemId: string;
}): Promise<void> {
  console.log(
    `[Background] Purchasing cosmetic: ${payload.type} - ${payload.itemId}`
  );

  const state = stateManager.getState();

  // Import cosmetic catalogs
  const { COSMETIC_THEMES, COSMETIC_SPRITES } = await import("./constants");

  // Find the cosmetic item
  let cost = 0;
  let alreadyOwned = false;

  if (payload.type === "theme") {
    const theme = COSMETIC_THEMES.find((t) => t.id === payload.itemId);
    if (!theme) {
      throw new Error(`Theme not found: ${payload.itemId}`);
    }
    cost = theme.cost;
    alreadyOwned = state.player.cosmetics.ownedThemes.includes(payload.itemId);
  } else if (payload.type === "sprite") {
    const sprite = COSMETIC_SPRITES.find((s) => s.id === payload.itemId);
    if (!sprite) {
      throw new Error(`Sprite not found: ${payload.itemId}`);
    }
    cost = sprite.cost;
    alreadyOwned = state.player.cosmetics.ownedSprites.includes(payload.itemId);
  }

  // Check if already owned
  if (alreadyOwned) {
    throw new Error("Cosmetic already owned");
  }

  // Check if user has enough Soul Embers
  if (state.player.soulEmbers < cost) {
    throw new Error("Insufficient Soul Embers");
  }

  // Deduct Soul Embers
  state.player.soulEmbers -= cost;

  // Add to owned cosmetics
  if (payload.type === "theme") {
    state.player.cosmetics.ownedThemes.push(payload.itemId);
  } else if (payload.type === "sprite") {
    state.player.cosmetics.ownedSprites.push(payload.itemId);
  }

  // Save state to both local and sync storage
  await stateManager.saveState(state);

  // Also save cosmetics to sync storage for cross-device availability
  await stateManager.saveCosmeticsToSync(state.player.cosmetics);

  console.log(
    `[Background] Cosmetic purchased: ${payload.type} - ${payload.itemId}`
  );

  // Notify popup of state update
  broadcastMessage({
    type: "STATE_UPDATE",
    payload: { state },
  });
}

/**
 * Apply cosmetic item
 */
async function handleApplyCosmetic(payload: {
  type: "theme" | "sprite";
  itemId: string;
}): Promise<void> {
  console.log(
    `[Background] Applying cosmetic: ${payload.type} - ${payload.itemId}`
  );

  const state = stateManager.getState();

  // Check if user owns the cosmetic
  if (payload.type === "theme") {
    if (!state.player.cosmetics.ownedThemes.includes(payload.itemId)) {
      throw new Error("Theme not owned");
    }
    state.player.cosmetics.activeTheme = payload.itemId;
  } else if (payload.type === "sprite") {
    if (!state.player.cosmetics.ownedSprites.includes(payload.itemId)) {
      throw new Error("Sprite not owned");
    }
    state.player.cosmetics.activeSprite = payload.itemId;
  }

  // Save state to both local and sync storage
  await stateManager.saveState(state);

  // Also save cosmetics to sync storage for cross-device availability
  await stateManager.saveCosmeticsToSync(state.player.cosmetics);

  console.log(
    `[Background] Cosmetic applied: ${payload.type} - ${payload.itemId}`
  );

  // Notify popup of state update
  broadcastMessage({
    type: "STATE_UPDATE",
    payload: { state },
  });
}

/**
 * Check if URL is discouraged or blocked
 */
async function handleCheckUrl(payload: { url: string }): Promise<{
  status: SiteStatus;
  domain: string | null;
}> {
  console.log(`[Background] Checking URL: ${payload.url}`);

  const currentState = stateManager.getState();
  const { discouragedSites, blockedSites, strictMode } = currentState.settings;

  // Ensure navigation monitor is initialized
  if (!navigationMonitor) {
    navigationMonitor = new NavigationMonitor();
  }

  // Check URL status
  const status = navigationMonitor.checkUrl(
    payload.url,
    discouragedSites,
    blockedSites,
    strictMode
  );

  // Extract domain for response
  let domain: string | null = null;
  try {
    const urlObj = new URL(payload.url);
    domain = urlObj.hostname;
    if (domain.startsWith("www.")) {
      domain = domain.substring(4);
    }
  } catch (error) {
    console.error("[Background] Invalid URL:", payload.url);
  }

  return { status, domain };
}

/**
 * Handle discouraged site visit during session
 */
async function handleSiteVisited(payload: { url: string }): Promise<void> {
  console.log(`[Background] Site visited: ${payload.url}`);

  const currentState = stateManager.getState();

  // Only process if there's an active session
  if (!currentState.session || !currentState.session.isActive) {
    console.log("[Background] No active session, ignoring site visit");
    return;
  }

  const { discouragedSites, blockedSites, strictMode } = currentState.settings;

  // Ensure navigation monitor is initialized
  if (!navigationMonitor) {
    navigationMonitor = new NavigationMonitor();
  }

  // Check URL status
  const status = navigationMonitor.checkUrl(
    payload.url,
    discouragedSites,
    blockedSites,
    strictMode
  );

  // If discouraged or blocked, mark session as compromised
  if (status === SiteStatus.DISCOURAGED || status === SiteStatus.BLOCKED) {
    console.log(
      `[Background] ${status} site visited during session, marking as compromised`
    );

    // Ensure session manager is initialized
    if (!sessionManager) {
      sessionManager = new SessionManager();
    }

    // Mark session as compromised
    const updatedSession = sessionManager.markSessionCompromised(
      currentState.session
    );

    // Update state
    await stateManager.updateState({
      session: updatedSession,
    });

    // Broadcast session compromised to all clients
    broadcastMessage({
      type: "SESSION_COMPROMISED",
      payload: {
        url: payload.url,
        status,
      },
    });

    console.log("[Background] Session marked as compromised");
  }
}

/**
 * Handle emergency session end (from blocked page)
 * Applies 50% penalty to rewards
 */
async function handleEmergencyEndSession(): Promise<void> {
  console.log("[Background] Emergency session end requested");

  const currentState = stateManager.getState();

  if (!currentState.session || !currentState.session.isActive) {
    console.warn("[Background] No active session to end");
    return;
  }

  // Ensure managers are initialized
  if (!sessionManager) {
    sessionManager = new SessionManager();
  }

  if (!navigationMonitor) {
    navigationMonitor = new NavigationMonitor();
  }

  // Stop navigation monitoring
  navigationMonitor.stopMonitoring();
  console.log("[Background] Navigation monitoring stopped");

  // Stop idle detection
  stopIdleDetection();
  console.log("[Background] Idle detection stopped");

  // Stop blocking rules
  await updateBlockingRules([]);

  // Import RewardCalculator and ProgressionManager
  const { RewardCalculator } = await import("./RewardCalculator");
  const { ProgressionManager } = await import("./ProgressionManager");

  const rewardCalculator = new RewardCalculator();
  const progressionManager = new ProgressionManager();

  // End session using SessionManager
  const sessionResult = sessionManager.endSession(currentState.session);

  // Calculate rewards using RewardCalculator
  const rewards = rewardCalculator.calculateRewards(
    currentState.session,
    currentState.player.stats
  );

  // Apply 50% penalty for emergency end
  const penaltyMultiplier = 0.5;
  rewards.soulInsight = Math.floor(rewards.soulInsight * penaltyMultiplier);
  rewards.soulEmbers = Math.floor(rewards.soulEmbers * penaltyMultiplier);
  rewards.bossProgress = Math.floor(rewards.bossProgress * penaltyMultiplier);

  console.log("[Background] Emergency end - rewards reduced by 50%:", rewards);

  // Update session result with calculated rewards
  sessionResult.soulInsight = rewards.soulInsight;
  sessionResult.soulEmbers = rewards.soulEmbers;
  sessionResult.bossProgress = rewards.bossProgress;
  sessionResult.wasCritical = rewards.wasCritical;
  sessionResult.wasCompromised = true; // Mark as compromised

  // Apply boss damage using ProgressionManager
  const bossResult = progressionManager.damageBoss(
    rewards.bossProgress,
    currentState.progression,
    currentState.player.level
  );

  console.log("[Background] Boss damage applied:", bossResult);

  // Add experience using ProgressionManager
  const levelResult = progressionManager.addExperience(
    rewards.soulInsight,
    currentState.player
  );

  console.log("[Background] Experience added:", levelResult);

  // Calculate new XP to next level
  const newXPToNextLevel = progressionManager.calculateLevelThreshold(
    levelResult.newLevel
  );

  // Handle level-up and check for boss unlocks
  handleLevelUp(
    levelResult,
    currentState.player.level,
    currentState.progression.currentBossIndex
  );

  // Update progression state
  let updatedProgression = {
    ...currentState.progression,
    currentBossResolve: bossResult.remainingResolve,
  };

  // Handle boss defeat and unlock logic
  updatedProgression = handleBossDefeat(
    bossResult,
    updatedProgression,
    levelResult.newLevel,
    progressionManager
  );

  // Update player state with rewards and progression
  const updatedPlayer = {
    ...currentState.player,
    level: levelResult.newLevel,
    soulInsight: currentState.player.soulInsight + rewards.soulInsight,
    soulInsightToNextLevel: newXPToNextLevel,
    soulEmbers: currentState.player.soulEmbers + rewards.soulEmbers,
    skillPoints:
      currentState.player.skillPoints + levelResult.skillPointsGranted,
  };

  // Update statistics
  const updatedStatistics = {
    ...currentState.statistics,
    totalSessions: currentState.statistics.totalSessions + 1,
    totalFocusTime:
      currentState.statistics.totalFocusTime + currentState.session.duration,
    totalSoulInsightEarned:
      currentState.statistics.totalSoulInsightEarned + rewards.soulInsight,
    totalSoulEmbersEarned:
      currentState.statistics.totalSoulEmbersEarned + rewards.soulEmbers,
    bossesDefeated: bossResult.wasDefeated
      ? currentState.statistics.bossesDefeated + 1
      : currentState.statistics.bossesDefeated,
    lastSessionDate: new Date().toISOString().split("T")[0],
  };

  // Update streak logic
  const today = new Date().toISOString().split("T")[0];
  const lastSessionDate = currentState.statistics.lastSessionDate;

  if (lastSessionDate) {
    const lastDate = new Date(lastSessionDate);
    const todayDate = new Date(today);
    const daysDiff = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      updatedStatistics.currentStreak =
        currentState.statistics.currentStreak + 1;
      updatedStatistics.longestStreak = Math.max(
        updatedStatistics.currentStreak,
        currentState.statistics.longestStreak
      );
    } else if (daysDiff > 1) {
      updatedStatistics.currentStreak = 1;
    }
  } else {
    updatedStatistics.currentStreak = 1;
    updatedStatistics.longestStreak = 1;
  }

  // Start break timer
  const breakDuration = currentState.settings.defaultBreakDuration;
  const breakState: BreakState = {
    startTime: Date.now(),
    duration: breakDuration,
    isActive: true,
  };

  // Create break alarm
  await chrome.alarms.create("soulShepherd_breakEnd", {
    delayInMinutes: breakDuration,
  });

  console.log(`[Background] Break timer started: ${breakDuration} minutes`);

  // Update state with all changes
  await stateManager.updateState({
    session: null,
    break: breakState,
    player: updatedPlayer,
    progression: updatedProgression,
    statistics: updatedStatistics,
  });

  // Send notification if enabled
  if (currentState.settings.notificationsEnabled) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: chrome.runtime.getURL("assets/sprites/sprite_classic_shepherd.png"),
      title: "Soul Shepherd",
      message: "Session ended early. Reduced rewards applied.",
    });
  }

  // Broadcast session ended to all clients with results
  broadcastMessage({
    type: "SESSION_ENDED",
    payload: {
      result: sessionResult,
      leveledUp: levelResult.leveledUp,
      newLevel: levelResult.newLevel,
      skillPointsGranted: levelResult.skillPointsGranted,
      bossDefeated: bossResult.wasDefeated,
      nextBoss: bossResult.nextBoss,
      playerLevel: levelResult.newLevel,
      emergencyEnd: true,
    },
  });

  // Broadcast state update so popup has latest state
  const updatedState = stateManager.getState();
  broadcastMessage({
    type: "STATE_UPDATE",
    payload: { state: updatedState },
  });

  console.log("[Background] Emergency session end flow complete");
}

// ============================================================================
// Strict Mode Blocking
// ============================================================================

/**
 * Update declarativeNetRequest rules for blocked sites
 */
async function updateBlockingRules(blockedSites: string[]): Promise<void> {
  try {
    console.log("[Background] ========== UPDATING BLOCKING RULES ==========");
    console.log("[Background] Blocked sites:", blockedSites);

    // Remove all existing rules
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    console.log("[Background] Existing rules before removal:", existingRules);
    const ruleIdsToRemove = existingRules.map((rule) => rule.id);

    if (ruleIdsToRemove.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ruleIdsToRemove,
      });
      console.log(
        `[Background] Removed ${ruleIdsToRemove.length} existing rules`
      );
    }

    // If no sites to block, we're done
    if (blockedSites.length === 0) {
      console.log("[Background] No sites to block, rules cleared");
      console.log("[Background] ========================================");
      return;
    }

    // Create new rules for blocked sites
    // We need TWO rules per domain to catch both bare domain and subdomains
    const newRules: chrome.declarativeNetRequest.Rule[] = [];
    let ruleId = 1;

    blockedSites.forEach((domain) => {
      // Rule 1: Block bare domain (e.g., "x.com")
      newRules.push({
        id: ruleId++,
        priority: 1,
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
          redirect: {
            url: chrome.runtime.getURL(
              `blocked.html?url=${encodeURIComponent(domain)}`
            ),
          },
        },
        condition: {
          urlFilter: `*://${domain}/*`,
          resourceTypes: [
            chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
          ],
        },
      });

      // Rule 2: Block subdomains (e.g., "www.x.com", "api.x.com")
      newRules.push({
        id: ruleId++,
        priority: 1,
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
          redirect: {
            url: chrome.runtime.getURL(
              `blocked.html?url=${encodeURIComponent(domain)}`
            ),
          },
        },
        condition: {
          urlFilter: `*://*.${domain}/*`,
          resourceTypes: [
            chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
          ],
        },
      });
    });

    // Add new rules
    console.log("[Background] Creating rules:", JSON.stringify(newRules, null, 2));
    
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: newRules,
    });

    console.log(`[Background] Successfully added ${newRules.length} blocking rules`);
    
    // Verify rules were added
    const verifyRules = await chrome.declarativeNetRequest.getDynamicRules();
    console.log("[Background] Active rules after update:", verifyRules);
    console.log("[Background] ========================================");
  } catch (error) {
    console.error("[Background] Failed to update blocking rules:", error);
    console.error("[Background] Error details:", error);
  }
}

// ============================================================================
// Idle Detection
// ============================================================================

/**
 * Start idle detection for active session
 */
function startIdleDetection(idleThreshold: number): void {
  if (idleDetectionActive) {
    console.warn("[Background] Idle detection already active");
    return;
  }

  // Set idle detection interval (in seconds)
  chrome.idle.setDetectionInterval(idleThreshold);

  // Register idle state change listener
  chrome.idle.onStateChanged.addListener(handleIdleStateChange);

  idleDetectionActive = true;
  idleStartTime = null;

  console.log(
    `[Background] Idle detection started with threshold: ${idleThreshold}s`
  );
}

/**
 * Stop idle detection
 */
function stopIdleDetection(): void {
  if (!idleDetectionActive) {
    return;
  }

  // Remove idle state change listener
  chrome.idle.onStateChanged.removeListener(handleIdleStateChange);

  idleDetectionActive = false;
  idleStartTime = null;

  console.log("[Background] Idle detection stopped");
}

/**
 * Handle idle state changes
 */
async function handleIdleStateChange(
  newState: chrome.idle.IdleState
): Promise<void> {
  console.log(`[Background] Idle state changed: ${newState}`);

  // Ensure state manager is loaded
  if (!stateManager) {
    stateManager = new StateManager();
    await stateManager.loadState();
  }

  if (!sessionManager) {
    sessionManager = new SessionManager();
  }

  const currentState = stateManager.getState();

  // Only process if there's an active session
  if (!currentState.session || !currentState.session.isActive) {
    console.log("[Background] No active session, ignoring idle state change");
    return;
  }

  switch (newState) {
    case "idle":
      // User went idle
      if (!currentState.session.isPaused) {
        idleStartTime = Date.now();
        await handlePauseSession();
        console.log("[Background] Session paused due to idle detection");
      }
      break;

    case "active":
      // User returned from idle
      if (currentState.session.isPaused && idleStartTime !== null) {
        const idleSeconds = Math.floor((Date.now() - idleStartTime) / 1000);
        await handleResumeSession({ idleSeconds });
        console.log(`[Background] Session resumed after ${idleSeconds}s idle`);
        idleStartTime = null;
      }
      break;

    case "locked":
      // Screen locked - treat as idle
      if (!currentState.session.isPaused) {
        idleStartTime = Date.now();
        await handlePauseSession();
        console.log("[Background] Session paused due to screen lock");
      }
      break;
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Send message to all connected clients (popup, options)
 */
function broadcastMessage(message: Message): void {
  chrome.runtime.sendMessage(message).catch((error) => {
    // Ignore errors if no receivers are listening
    if (!error.message.includes("Receiving end does not exist")) {
      console.error("[Background] Broadcast error:", error);
    }
  });
}

/**
 * Check for missed timers on startup (browser restart)
 * Handles sessions or breaks that should have ended while browser was closed
 */
async function checkForMissedTimersOnStartup(): Promise<void> {
  console.log("[Background] Checking for missed timers on startup");

  const currentState = stateManager.getState();
  const now = Date.now();

  try {
    // Check if session should have ended
    if (currentState.session?.isActive) {
      const sessionEndTime =
        currentState.session.startTime +
        currentState.session.duration * 60 * 1000;
      const missedTime = now - sessionEndTime;

      if (missedTime > 0) {
        const missedMinutes = Math.floor(missedTime / (1000 * 60));
        console.log(
          `[Background] Missed session end detected on startup: ${missedMinutes} minutes late`
        );
        console.log(
          `[Background] Session should have ended at: ${new Date(
            sessionEndTime
          ).toISOString()}`
        );

        // End session retroactively
        await handleEndSessionRetroactive({
          actualEndTime: sessionEndTime,
          detectedAt: now,
        });
      }
    }

    // Check if break should have ended
    if (currentState.break?.isActive) {
      const breakEndTime =
        currentState.break.startTime + currentState.break.duration * 60 * 1000;
      const missedTime = now - breakEndTime;

      if (missedTime > 0) {
        const missedMinutes = Math.floor(missedTime / (1000 * 60));
        console.log(
          `[Background] Missed break end detected on startup: ${missedMinutes} minutes late`
        );
        console.log(
          `[Background] Break should have ended at: ${new Date(
            breakEndTime
          ).toISOString()}`
        );

        // End break retroactively
        await handleEndBreakRetroactive({
          actualEndTime: breakEndTime,
          detectedAt: now,
        });
      }
    }

    console.log("[Background] Missed timer check complete");
  } catch (error) {
    console.error("[Background] Error checking for missed timers:", error);
  }
}

// ============================================================================
// Task Completion Helper
// ============================================================================

/**
 * Complete a task or subtask by ID
 * Cascades completion to all subtasks if completing a task
 */
function completeTask(taskState: TaskState, taskId: string): TaskState {
  console.log(`[completeTask] Starting task completion for ID: ${taskId}`);
  console.log(`[completeTask] Total goals: ${taskState.goals.length}`);
  
  let taskFound = false;
  
  const updatedGoals = taskState.goals.map((goal) => {
    const updatedTasks = goal.tasks.map((task) => {
      // Check if this is the task to complete
      if (task.id === taskId) {
        console.log(`[completeTask] Found matching task: ${task.name} (ID: ${task.id})`);
        console.log(`[completeTask] Marking task and ${task.subtasks.length} subtasks as complete`);
        taskFound = true;
        
        // Complete the task and cascade to all subtasks
        return {
          ...task,
          isComplete: true,
          subtasks: task.subtasks.map((subtask) => ({
            ...subtask,
            isComplete: true,
          })),
        };
      }

      // Check if this is a subtask to complete
      const updatedSubtasks = task.subtasks.map((subtask) => {
        if (subtask.id === taskId) {
          console.log(`[completeTask] Found matching subtask: ${subtask.name} (ID: ${subtask.id})`);
          taskFound = true;
          
          return {
            ...subtask,
            isComplete: true,
          };
        }
        return subtask;
      });

      return {
        ...task,
        subtasks: updatedSubtasks,
      };
    });

    return {
      ...goal,
      tasks: updatedTasks,
    };
  });

  if (!taskFound) {
    console.warn(`[completeTask] WARNING: Task/subtask with ID ${taskId} not found!`);
  } else {
    console.log(`[completeTask] Task completion successful`);
  }

  return {
    ...taskState,
    goals: updatedGoals,
  };
}

/**
 * Export for use in other modules
 */
export { stateManager, broadcastMessage };
