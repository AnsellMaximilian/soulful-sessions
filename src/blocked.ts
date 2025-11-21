// ============================================================================
// Blocked Page Script
// Displays when user tries to access blocked site during strict mode session
// ============================================================================

import { GameState, StubbornSoul } from "./types";
import { STUBBORN_SOULS } from "./constants";

// ============================================================================
// DOM Elements
// ============================================================================

const bossNameEl = document.getElementById("bossName") as HTMLDivElement;
const timeRemainingEl = document.getElementById(
  "timeRemaining"
) as HTMLDivElement;
const endSessionBtn = document.getElementById(
  "endSessionBtn"
) as HTMLButtonElement;
const blockedUrlEl = document.getElementById("blockedUrl") as HTMLDivElement;

// ============================================================================
// State
// ============================================================================

let updateInterval: number | null = null;

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize blocked page
 */
async function init(): Promise<void> {
  console.log("[Blocked] Initializing blocked page");

  // Display blocked URL
  const url = new URL(window.location.href);
  const blockedUrl = url.searchParams.get("url") || "this site";
  blockedUrlEl.textContent = `Blocked: ${blockedUrl}`;

  // Get current state from background
  try {
    const response = await chrome.runtime.sendMessage({ type: "GET_STATE" });

    if (response.success) {
      const state: GameState = response.data;
      updateUI(state);

      // Start update interval
      updateInterval = window.setInterval(() => {
        updateTimer(state);
      }, 1000);
    } else {
      console.error("[Blocked] Failed to get state:", response.error);
      showError();
    }
  } catch (error) {
    console.error("[Blocked] Error getting state:", error);
    showError();
  }

  // Set up end session button
  endSessionBtn.addEventListener("click", handleEndSession);

  // Listen for state updates from background
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "STATE_UPDATE") {
      updateUI(message.payload.state);
    } else if (message.type === "SESSION_ENDED") {
      // Session ended, redirect to popup or close
      window.close();
    }
  });
}

// ============================================================================
// UI Updates
// ============================================================================

/**
 * Update UI with current state
 */
function updateUI(state: GameState): void {
  // Update boss name
  const currentBoss: StubbornSoul =
    STUBBORN_SOULS[state.progression.currentBossIndex];
  if (currentBoss) {
    bossNameEl.textContent = currentBoss.name;
  } else {
    bossNameEl.textContent = "Unknown Soul";
  }

  // Update timer
  updateTimer(state);
}

/**
 * Update remaining time display
 */
function updateTimer(state: GameState): void {
  if (!state.session || !state.session.isActive) {
    timeRemainingEl.textContent = "No Active Session";
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }
    return;
  }

  const now = Date.now();
  const sessionEnd =
    state.session.startTime + state.session.duration * 60 * 1000;
  const remainingMs = Math.max(0, sessionEnd - now);

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);

  timeRemainingEl.textContent = `${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  // If session ended, stop updating
  if (remainingMs === 0 && updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
}

/**
 * Show error state
 */
function showError(): void {
  bossNameEl.textContent = "Error Loading Session";
  timeRemainingEl.textContent = "--:--";
  endSessionBtn.disabled = true;
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Handle end session button click
 */
async function handleEndSession(): Promise<void> {
  console.log("[Blocked] User requested emergency session end");

  // Confirm with user
  const confirmed = confirm(
    "Are you sure you want to end this session early? You will receive only 50% of the normal rewards."
  );

  if (!confirmed) {
    return;
  }

  // Disable button to prevent double-clicks
  endSessionBtn.disabled = true;
  endSessionBtn.textContent = "Ending Session...";

  try {
    // Send emergency end session message
    const response = await chrome.runtime.sendMessage({
      type: "EMERGENCY_END_SESSION",
    });

    if (response.success) {
      console.log("[Blocked] Session ended successfully");
      // Close this tab or redirect
      setTimeout(() => {
        window.close();
      }, 1000);
    } else {
      console.error("[Blocked] Failed to end session:", response.error);
      alert("Failed to end session. Please try again.");
      endSessionBtn.disabled = false;
      endSessionBtn.textContent = "End Session Early (Penalty Applied)";
    }
  } catch (error) {
    console.error("[Blocked] Error ending session:", error);
    alert("Failed to end session. Please try again.");
    endSessionBtn.disabled = false;
    endSessionBtn.textContent = "End Session Early (Penalty Applied)";
  }
}

// ============================================================================
// Start
// ============================================================================

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
