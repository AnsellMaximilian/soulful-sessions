// ============================================================================
// Background Service Worker for Soul Shepherd Extension
// ============================================================================

import { StateManager } from "./StateManager";
import { GameState, Message } from "./types";

// ============================================================================
// Global State
// ============================================================================

let stateManager: StateManager;

// ============================================================================
// Service Worker Lifecycle
// ============================================================================

/**
 * Initialize extension on install
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log("[Background] Extension installed:", details.reason);

  // Initialize StateManager
  stateManager = new StateManager();

  try {
    // Load or create initial state
    await stateManager.loadState();
    console.log("[Background] State initialized successfully");

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

  // Initialize StateManager
  stateManager = new StateManager();

  try {
    // Load existing state
    await stateManager.loadState();
    console.log("[Background] State loaded on startup");

    // TODO: Check for missed alarms/timers (Phase 2)
    // TODO: Resume idle collection (Phase 4)
  } catch (error) {
    console.error("[Background] Failed to load state on startup:", error);
  }
});

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
      return handleResumeSession();

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
 * TODO: Implement in Phase 2 (Task 4)
 */
async function handleStartSession(payload: {
  duration: number;
  taskId: string;
}): Promise<void> {
  console.log("[Background] START_SESSION called (not yet implemented)");
  throw new Error("Session management not yet implemented");
}

/**
 * End current focus session
 * TODO: Implement in Phase 2 (Task 4)
 */
async function handleEndSession(): Promise<void> {
  console.log("[Background] END_SESSION called (not yet implemented)");
  throw new Error("Session management not yet implemented");
}

/**
 * Pause current session (idle detected)
 * TODO: Implement in Phase 2 (Task 4)
 */
async function handlePauseSession(): Promise<void> {
  console.log("[Background] PAUSE_SESSION called (not yet implemented)");
  throw new Error("Session management not yet implemented");
}

/**
 * Resume paused session
 * TODO: Implement in Phase 2 (Task 4)
 */
async function handleResumeSession(): Promise<void> {
  console.log("[Background] RESUME_SESSION called (not yet implemented)");
  throw new Error("Session management not yet implemented");
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
