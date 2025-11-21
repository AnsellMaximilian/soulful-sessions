// Popup script for Soul Shepherd
import { GameState, SessionResult, Message, StubbornSoul } from "./types";
import { STUBBORN_SOULS } from "./constants";

// ============================================================================
// View State Management
// ============================================================================

enum ViewState {
  IDLE = "idle",
  FOCUS_SESSION = "focusSession",
  REWARD = "reward",
  BREAK = "break",
}

let currentView: ViewState = ViewState.IDLE;
let currentState: GameState | null = null;

// ============================================================================
// DOM Utility Functions
// ============================================================================

function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Element with id "${id}" not found`);
  }
  return element as T;
}

function setText(id: string, text: string): void {
  const element = getElement(id);
  element.textContent = text;
}

function setHTML(id: string, html: string): void {
  const element = getElement(id);
  element.innerHTML = html;
}

function show(id: string): void {
  const element = getElement(id);
  element.classList.remove("hidden");
}

function hide(id: string): void {
  const element = getElement(id);
  element.classList.add("hidden");
}

function setProgress(barId: string, percentage: number): void {
  const bar = getElement(barId);
  bar.style.width = `${Math.max(0, Math.min(100, percentage))}%`;
}

// ============================================================================
// View Switching
// ============================================================================

function switchView(newView: ViewState): void {
  // Hide all views
  hide("idle-view");
  hide("focus-session-view");
  hide("reward-view");
  hide("break-view");

  // Show the requested view
  switch (newView) {
    case ViewState.IDLE:
      show("idle-view");
      break;
    case ViewState.FOCUS_SESSION:
      show("focus-session-view");
      break;
    case ViewState.REWARD:
      show("reward-view");
      break;
    case ViewState.BREAK:
      show("break-view");
      break;
  }

  currentView = newView;
}

// ============================================================================
// Message Passing
// ============================================================================

function sendMessage(message: Message): Promise<any> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

async function requestState(): Promise<GameState> {
  try {
    const response = await sendMessage({ type: "GET_STATE" });
    return response.state;
  } catch (error) {
    console.error("Failed to request state:", error);
    throw error;
  }
}

async function startSession(duration: number, taskId: string): Promise<void> {
  try {
    await sendMessage({
      type: "START_SESSION",
      payload: { duration, taskId },
    });
  } catch (error) {
    console.error("Failed to start session:", error);
    throw error;
  }
}

// ============================================================================
// UI Update Functions
// ============================================================================

function updateIdleView(state: GameState): void {
  // Update stats
  setText("stat-spirit", state.player.stats.spirit.toString());
  setText("stat-harmony", `${(state.player.stats.harmony * 100).toFixed(0)}%`);
  setText("stat-soulflow", state.player.stats.soulflow.toString());
  setText("stat-level", state.player.level.toString());

  // Update currency
  setText("soul-embers", state.player.soulEmbers.toString());

  // Update XP bar
  const xpPercentage =
    (state.player.soulInsight / state.player.soulInsightToNextLevel) * 100;
  setProgress("xp-bar", xpPercentage);
  setText(
    "xp-text",
    `${state.player.soulInsight} / ${state.player.soulInsightToNextLevel}`
  );

  // Update boss card
  const boss = getCurrentBoss(state);
  if (boss) {
    setText("boss-name", boss.name);
    setText("boss-backstory", boss.backstory);

    const resolvePercentage =
      (state.progression.currentBossResolve / boss.initialResolve) * 100;
    setProgress("resolve-bar", resolvePercentage);
    setText(
      "resolve-text",
      `${state.progression.currentBossResolve} / ${boss.initialResolve}`
    );
  }

  // Update task selector
  updateTaskSelector(state);

  // Update duration input with default
  const durationInput = getElement<HTMLInputElement>("duration-input");
  durationInput.value = state.settings.defaultSessionDuration.toString();
}

function updateBreakView(state: GameState): void {
  // Update stats
  setText("break-stat-spirit", state.player.stats.spirit.toString());
  setText(
    "break-stat-harmony",
    `${(state.player.stats.harmony * 100).toFixed(0)}%`
  );
  setText("break-stat-soulflow", state.player.stats.soulflow.toString());
  setText("break-stat-level", state.player.level.toString());

  // Update boss card
  const boss = getCurrentBoss(state);
  if (boss) {
    setText("break-boss-name", boss.name);
    setText("break-boss-backstory", boss.backstory);

    const resolvePercentage =
      (state.progression.currentBossResolve / boss.initialResolve) * 100;
    setProgress("break-resolve-bar", resolvePercentage);
    setText(
      "break-resolve-text",
      `${state.progression.currentBossResolve} / ${boss.initialResolve}`
    );
  }

  // Update break timer if break is active
  if (state.break) {
    updateBreakTimer(state.break.startTime, state.break.duration);
  }
}

function updateRewardView(result: SessionResult): void {
  // Update reward values
  setText("reward-soul-insight", result.soulInsight.toFixed(0));
  setText("reward-soul-embers", result.soulEmbers.toFixed(0));
  setText("reward-boss-damage", result.bossProgress.toFixed(0));

  // Boss resolve will be updated from state
  if (currentState) {
    setText(
      "reward-boss-resolve",
      currentState.progression.currentBossResolve.toString()
    );
  }

  // Show/hide critical indicator
  if (result.wasCritical) {
    show("critical-indicator");
  } else {
    hide("critical-indicator");
  }

  // Show/hide compromise warning
  if (result.wasCompromised) {
    show("compromise-warning");
  } else {
    hide("compromise-warning");
  }

  // Update time breakdown
  const activeMinutes = Math.floor(result.activeTime / 60);
  const idleMinutes = Math.floor(result.idleTime / 60);
  setText("active-time", `${activeMinutes}m`);
  setText("idle-time", `${idleMinutes}m`);
}

function updateTaskSelector(state: GameState): void {
  const selector = getElement<HTMLSelectElement>("task-selector");

  // Clear existing options except the first one
  selector.innerHTML = '<option value="">Select a task...</option>';

  // Add tasks from goals
  state.tasks.goals.forEach((goal) => {
    goal.tasks.forEach((task) => {
      if (!task.isComplete) {
        const option = document.createElement("option");
        option.value = task.id;
        option.textContent = `${goal.name} - ${task.name}`;
        selector.appendChild(option);

        // Add subtasks
        task.subtasks.forEach((subtask) => {
          if (!subtask.isComplete) {
            const subOption = document.createElement("option");
            subOption.value = subtask.id;
            subOption.textContent = `  └─ ${subtask.name}`;
            selector.appendChild(subOption);
          }
        });
      }
    });
  });
}

function updateBreakTimer(startTime: number, duration: number): void {
  const updateTimer = () => {
    const elapsed = Date.now() - startTime;
    const remaining = duration * 60 * 1000 - elapsed;

    if (remaining <= 0) {
      setText("break-countdown", "0:00");
      return;
    }

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    setText(
      "break-countdown",
      `${minutes}:${seconds.toString().padStart(2, "0")}`
    );

    setTimeout(updateTimer, 1000);
  };

  updateTimer();
}

function updateFocusSessionTimer(startTime: number, duration: number): void {
  const updateTimer = () => {
    const elapsed = Date.now() - startTime;
    const remaining = duration * 60 * 1000 - elapsed;

    if (remaining <= 0) {
      setText("time-remaining", "");
      return;
    }

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    setText(
      "time-remaining",
      `${minutes}:${seconds.toString().padStart(2, "0")}`
    );

    setTimeout(updateTimer, 1000);
  };

  updateTimer();
}

// ============================================================================
// Helper Functions
// ============================================================================

function getCurrentBoss(state: GameState): StubbornSoul {
  return STUBBORN_SOULS[state.progression.currentBossIndex];
}

// ============================================================================
// Event Handlers
// ============================================================================

function setupEventHandlers(): void {
  // Start Session button
  const startSessionBtn = getElement<HTMLButtonElement>("start-session-btn");
  startSessionBtn.addEventListener("click", async () => {
    const durationInput = getElement<HTMLInputElement>("duration-input");
    const taskSelector = getElement<HTMLSelectElement>("task-selector");

    const duration = parseInt(durationInput.value, 10);
    const taskId = taskSelector.value;

    if (duration < 5 || duration > 120) {
      alert("Duration must be between 5 and 120 minutes");
      return;
    }

    try {
      await startSession(duration, taskId);
      // State will be updated via message listener
    } catch (error) {
      console.error("Failed to start session:", error);
      alert("Failed to start session. Please try again.");
    }
  });

  // Continue to Break button
  const continueBreakBtn = getElement<HTMLButtonElement>("continue-break-btn");
  continueBreakBtn.addEventListener("click", () => {
    if (currentState) {
      switchView(ViewState.BREAK);
      updateBreakView(currentState);
    }
  });

  // Start Next Session button
  const startNextSessionBtn = getElement<HTMLButtonElement>(
    "start-next-session-btn"
  );
  startNextSessionBtn.addEventListener("click", () => {
    switchView(ViewState.IDLE);
    if (currentState) {
      updateIdleView(currentState);
    }
  });
}

// ============================================================================
// Message Listeners
// ============================================================================

function setupMessageListeners(): void {
  chrome.runtime.onMessage.addListener(
    (message: Message, sender, sendResponse) => {
      switch (message.type) {
        case "STATE_UPDATE":
          currentState = message.payload.state;
          if (currentState) {
            handleStateUpdate(currentState);
          }
          break;

        case "SESSION_STARTED":
          switchView(ViewState.FOCUS_SESSION);
          if (currentState?.session) {
            updateFocusSessionTimer(
              currentState.session.startTime,
              currentState.session.duration
            );
          }
          break;

        case "SESSION_ENDED":
          const result: SessionResult = message.payload.result;
          switchView(ViewState.REWARD);
          updateRewardView(result);
          break;

        case "BREAK_STARTED":
          // Reward view is already showing, user will click to continue
          break;

        case "BREAK_ENDED":
          // Could show notification or auto-switch to idle
          break;
      }
    }
  );
}

function handleStateUpdate(state: GameState): void {
  // Determine which view to show based on state
  if (state.session?.isActive) {
    if (currentView !== ViewState.FOCUS_SESSION) {
      switchView(ViewState.FOCUS_SESSION);
      updateFocusSessionTimer(state.session.startTime, state.session.duration);
    }
  } else if (state.break?.isActive) {
    if (currentView !== ViewState.BREAK && currentView !== ViewState.REWARD) {
      switchView(ViewState.BREAK);
      updateBreakView(state);
    }
  } else {
    if (currentView !== ViewState.IDLE) {
      switchView(ViewState.IDLE);
      updateIdleView(state);
    } else {
      // Just update the current view
      updateIdleView(state);
    }
  }
}

// ============================================================================
// Initialization
// ============================================================================

async function initialize(): Promise<void> {
  try {
    // Request initial state from background
    currentState = await requestState();

    // Set up event handlers
    setupEventHandlers();

    // Set up message listeners
    setupMessageListeners();

    // Update UI based on initial state
    handleStateUpdate(currentState);
  } catch (error) {
    console.error("Failed to initialize popup:", error);
    // Show error state
    setText("idle-view", "Failed to load. Please try reopening the popup.");
  }
}

// Start when DOM is ready
document.addEventListener("DOMContentLoaded", initialize);
