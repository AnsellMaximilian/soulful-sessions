// ============================================================================
// Background Service Worker for Soul Shepherd Extension
// ============================================================================

import { StateManager } from "./StateManager";
import { SessionManager } from "./SessionManager";
import { IdleCollector } from "./IdleCollector";
import { GameState, Message, SessionState } from "./types";
import { FORMULAS } from "./constants";

// ============================================================================
// Global State
// ============================================================================

let stateManager: StateManager;
let sessionManager: SessionManager;
let idleCollector: IdleCollector;

// ============================================================================
// Service Worker Lifecycle
// ============================================================================

/**
 * Initialize extension on install
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log("[Background] Extension installed:", details.reason);

  // Initialize StateManager, SessionManager, and IdleCollector
  stateManager = new StateManager();
  sessionManager = new SessionManager();
  idleCollector = new IdleCollector();

  try {
    // Load or create initial state
    await stateManager.loadState();
    console.log("[Background] State initialized successfully");

    // Set up idle collection alarm (every 5 minutes)
    await setupIdleCollectionAlarm();

    // Request notification permission
    if (details.reason === "install") {
      console.log(
        "[Background] First install - requesting notification permission"
      );
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

  // Initialize StateManager, SessionManager, and IdleCollector
  stateManager = new StateManager();
  sessionManager = new SessionManager();
  idleCollector = new IdleCollector();

  try {
    // Load existing state
    await stateManager.loadState();
    console.log("[Background] State loaded on startup");

    // Set up idle collection alarm (every 5 minutes)
    await setupIdleCollectionAlarm();

    // Collect any idle souls accumulated while browser was closed
    await handleIdleCollectionAlarm();

    // TODO: Check for missed alarms/timers (Phase 2)
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

  switch (alarm.name) {
    case "soulShepherd_sessionEnd":
      await handleSessionAlarm();
      break;

    case "soulShepherd_breakEnd":
      // TODO: Implement in Task 15
      console.log("[Background] Break alarm fired (not yet implemented)");
      break;

    case "soulShepherd_idleCollection":
      await handleIdleCollectionAlarm();
      break;

    default:
      console.warn("[Background] Unknown alarm:", alarm.name);
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
 * Handle idle collection alarm
 */
async function handleIdleCollectionAlarm(): Promise<void> {
  console.log("[Background] Idle collection alarm fired");

  try {
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
}): Promise<SessionState> {
  console.log(
    `[Background] Starting session: ${payload.duration} minutes, task: ${payload.taskId}`
  );

  const currentState = stateManager.getState();

  // Start session using SessionManager
  const newSession = await sessionManager.startSession(
    payload.duration,
    payload.taskId,
    currentState.session
  );

  // Update state with new session
  await stateManager.updateState({
    session: newSession,
  });

  // Broadcast session started to all clients
  broadcastMessage({
    type: "SESSION_STARTED",
    payload: newSession,
  });

  return newSession;
}

/**
 * End current focus session
 */
async function handleEndSession(): Promise<void> {
  console.log("[Background] Ending session");

  const currentState = stateManager.getState();

  // End session using SessionManager
  const sessionResult = sessionManager.endSession(currentState.session);

  // Clear session from state
  await stateManager.updateState({
    session: null,
  });

  console.log("[Background] Session ended, result:", sessionResult);

  // TODO: Calculate rewards using RewardCalculator (Task 5)
  // TODO: Apply progression using ProgressionManager (Task 6)
  // TODO: Start break timer (Task 15)

  // Broadcast session ended to all clients
  broadcastMessage({
    type: "SESSION_ENDED",
    payload: sessionResult,
  });
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
  await stateManager.updateState({
    settings: {
      ...currentState.settings,
      ...settings,
    },
  });
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
 * TODO: Implement in Phase 8 (Task 23)
 */
async function handleUpgradeStat(payload: { stat: string }): Promise<void> {
  console.log("[Background] UPGRADE_STAT called (not yet implemented)");
  throw new Error("Stat upgrade not yet implemented");
}

/**
 * Allocate skill point to a stat
 * TODO: Implement in Phase 8 (Task 24)
 */
async function handleAllocateSkillPoint(payload: {
  stat: string;
}): Promise<void> {
  console.log("[Background] ALLOCATE_SKILL_POINT called (not yet implemented)");
  throw new Error("Skill point allocation not yet implemented");
}

/**
 * Purchase cosmetic item
 * TODO: Implement in Phase 13 (Task 29)
 */
async function handlePurchaseCosmetic(payload: {
  itemId: string;
}): Promise<void> {
  console.log("[Background] PURCHASE_COSMETIC called (not yet implemented)");
  throw new Error("Cosmetic purchase not yet implemented");
}

/**
 * Apply cosmetic item
 * TODO: Implement in Phase 13 (Task 29)
 */
async function handleApplyCosmetic(payload: {
  type: string;
  itemId: string;
}): Promise<void> {
  console.log("[Background] APPLY_COSMETIC called (not yet implemented)");
  throw new Error("Cosmetic application not yet implemented");
}

/**
 * Check if URL is discouraged or blocked
 * TODO: Implement in Phase 6 (Task 20)
 */
async function handleCheckUrl(payload: { url: string }): Promise<any> {
  console.log("[Background] CHECK_URL called (not yet implemented)");
  throw new Error("URL checking not yet implemented");
}

/**
 * Handle discouraged site visit during session
 * TODO: Implement in Phase 6 (Task 20)
 */
async function handleSiteVisited(payload: { url: string }): Promise<void> {
  console.log("[Background] SITE_VISITED called (not yet implemented)");
  throw new Error("Site visit handling not yet implemented");
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
 * Export for use in other modules
 */
export { stateManager, broadcastMessage };
