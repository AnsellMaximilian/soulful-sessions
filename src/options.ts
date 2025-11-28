// ============================================================================
// Soul Shepherd Options Page
// ============================================================================

import {
  GameState,
  SettingsState,
  Goal,
  Task,
  Subtask,
  TaskState,
  StubbornSoul,
} from "./types";
import { COSMETIC_THEMES, COSMETIC_SPRITES, STUBBORN_SOULS } from "./constants";
import { PlayerCardManager } from "./PlayerCardManager";

// ============================================================================
// State Management
// ============================================================================

let currentState: GameState | null = null;

// Modal state
let currentModalMode: "add" | "edit" = "add";
let currentEditingId: string | null = null;
let currentParentId: string | null = null;

// ============================================================================
// Initialization
// ============================================================================

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[Options] Initializing options page");

  // Set up tab navigation
  setupTabs();

  // Load current state from background
  await loadSettings();

  // Set up event listeners
  setupEventListeners();

  // Handle URL parameters for deep linking
  handleURLParameters();

  console.log("[Options] Options page initialized");
});

// ============================================================================
// Tab Navigation
// ============================================================================

function setupTabs(): void {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabName = button.getAttribute("data-tab");

      // Remove active class from all tabs
      tabButtons.forEach((btn) => {
        btn.classList.remove("active");
        btn.setAttribute("aria-selected", "false");
      });
      tabContents.forEach((content) => content.classList.remove("active"));

      // Add active class to clicked tab
      button.classList.add("active");
      button.setAttribute("aria-selected", "true");
      const targetContent = document.getElementById(`${tabName}-section`);
      if (targetContent) {
        targetContent.classList.add("active");
      }

      // Hide player card modal when switching away from statistics tab
      if (tabName !== "statistics") {
        PlayerCardManager.hideCardModal();
      }
    });
  });
}

/**
 * Switch to a specific tab programmatically
 * Used for URL parameter handling
 */
function switchToTab(tabName: string): void {
  const tabButton = document.querySelector(
    `.tab-button[data-tab="${tabName}"]`
  ) as HTMLButtonElement;
  
  if (tabButton) {
    tabButton.click();
  }
}

/**
 * Handle URL parameters on page load
 * Supports deep linking to specific tabs and boss detail views
 * Requirements: 1.3, 1.4
 */
function handleURLParameters(): void {
  const urlParams = new URLSearchParams(window.location.search);
  const tab = urlParams.get('tab');
  const bossIdStr = urlParams.get('boss');

  // Switch to guided-souls tab if specified
  if (tab === 'guided-souls') {
    switchToTab('guided-souls');

    // Show detail view if valid boss ID is present
    if (bossIdStr !== null && bossIdStr !== '') {
      const bossId = parseInt(bossIdStr);
      if (!isNaN(bossId) && bossId >= 0 && bossId <= 9) {
        // Note: showDetailView will be implemented in a future task
        // For now, we just validate and prepare the boss ID
        console.log(`[Options] URL parameter: boss=${bossId}`);
        // TODO: Call showDetailView(bossId) when implemented
      }
    }
  }
}

// ============================================================================
// Gallery View Rendering
// ============================================================================

/**
 * Render the gallery view showing all Stubborn Souls
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
 */
function renderGalleryView(): void {
  if (!currentState) {
    console.error('[Options] Cannot render gallery: state not loaded');
    return;
  }

  const gallery = document.getElementById('souls-gallery');
  if (!gallery) {
    console.error('[Options] Gallery container not found');
    return;
  }

  // Clear existing content
  gallery.innerHTML = '';

  const currentBossId = currentState.progression.currentBossIndex;
  const defeatedBosses = currentState.progression.defeatedBosses;
  const playerLevel = currentState.player.level;

  // Render each boss card
  STUBBORN_SOULS.forEach((soul) => {
    const isLocked = playerLevel < soul.unlockLevel;
    const isCurrent = soul.id === currentBossId;
    const isDefeated = defeatedBosses.includes(soul.id);

    const card = createSoulCard(soul, isLocked, isCurrent, isDefeated);
    gallery.appendChild(card);
  });

  console.log('[Options] Gallery view rendered');
}

/**
 * Create a boss card element for the gallery
 * Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
 */
function createSoulCard(
  soul: StubbornSoul,
  isLocked: boolean,
  isCurrent: boolean,
  isDefeated: boolean
): HTMLElement {
  const card = document.createElement('div');
  card.className = 'soul-card';
  card.setAttribute('role', 'listitem');

  // Apply state classes
  if (isLocked) {
    card.classList.add('locked');
    card.setAttribute('aria-label', `${soul.name}, locked, requires level ${soul.unlockLevel}`);
  } else if (isCurrent) {
    card.classList.add('unlocked', 'current');
    card.setAttribute('aria-label', `${soul.name}, current boss, click to view details`);
  } else if (isDefeated) {
    card.classList.add('defeated');
    card.setAttribute('aria-label', `${soul.name}, guided, click to view story`);
  } else {
    card.classList.add('unlocked');
    card.setAttribute('aria-label', `${soul.name}, unlocked, click to view details`);
  }

  // Create sprite container
  const spriteContainer = document.createElement('div');
  spriteContainer.className = 'soul-sprite-container';

  // Create sprite image
  const sprite = document.createElement('img');
  sprite.className = 'soul-sprite';
  sprite.src = `assets/sprites/${soul.sprite}`;
  sprite.alt = soul.name;
  spriteContainer.appendChild(sprite);

  // Add unlock level overlay for locked bosses
  if (isLocked) {
    const overlay = document.createElement('div');
    overlay.className = 'unlock-level-overlay';
    overlay.textContent = soul.unlockLevel.toString();
    overlay.setAttribute('aria-hidden', 'true');
    spriteContainer.appendChild(overlay);
  }

  // Add "Guided" badge for defeated bosses
  if (isDefeated) {
    const badge = document.createElement('div');
    badge.className = 'guided-badge';
    badge.textContent = 'Guided';
    badge.setAttribute('aria-hidden', 'true');
    spriteContainer.appendChild(badge);
  }

  card.appendChild(spriteContainer);

  // Add boss name
  const name = document.createElement('div');
  name.className = 'soul-card-name';
  name.textContent = soul.name;
  card.appendChild(name);

  // Add click handler only for unlocked/defeated bosses
  // Requirements: 2.3, 2.7
  if (!isLocked) {
    card.style.cursor = 'pointer';
    card.setAttribute('tabindex', '0');
    
    const clickHandler = () => {
      // TODO: Implement showDetailView in future task
      console.log(`[Options] Boss card clicked: ${soul.name} (id: ${soul.id})`);
    };

    card.addEventListener('click', clickHandler);
    card.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        clickHandler();
      }
    });
  } else {
    // Locked bosses should not be interactive
    card.style.cursor = 'not-allowed';
    card.removeAttribute('tabindex');
  }

  return card;
}

// ============================================================================
// Load Settings from Background
// ============================================================================

async function loadSettings(): Promise<void> {
  try {
    // Request current state from background
    const response = await chrome.runtime.sendMessage({
      type: "GET_STATE",
    });

    if (response && response.success && response.data) {
      currentState = response.data;
      console.log("[Options] State loaded:", currentState);

      // Populate UI with current settings
      if (currentState) {
        populateSettings(currentState.settings);
        populateStatistics(currentState.statistics);
        populateTaskManagement(currentState.tasks);
        renderGalleryView();
        applyTheme(currentState.player.cosmetics.activeTheme);
        applySprite(currentState.player.cosmetics.activeSprite);
      }
    }
  } catch (error) {
    console.error("[Options] Failed to load settings:", error);
  }
}

// ============================================================================
// Populate Settings UI
// ============================================================================

function populateSettings(settings: SettingsState): void {
  // Session Configuration
  const sessionDurationInput = document.getElementById(
    "default-session-duration"
  ) as HTMLInputElement;
  const breakDurationInput = document.getElementById(
    "default-break-duration"
  ) as HTMLInputElement;
  const autoStartInput = document.getElementById(
    "auto-start-next"
  ) as HTMLInputElement;
  const idleThresholdInput = document.getElementById(
    "idle-threshold"
  ) as HTMLInputElement;

  if (sessionDurationInput)
    sessionDurationInput.value = settings.defaultSessionDuration.toString();
  if (breakDurationInput)
    breakDurationInput.value = settings.defaultBreakDuration.toString();
  if (autoStartInput) autoStartInput.checked = settings.autoStartNextSession;
  
  const autoCompleteTaskInput = document.getElementById(
    "auto-complete-task"
  ) as HTMLInputElement;
  if (autoCompleteTaskInput) autoCompleteTaskInput.checked = settings.autoCompleteTask;
  
  if (idleThresholdInput)
    idleThresholdInput.value = settings.idleThreshold.toString();

  // Distraction Management
  const strictModeInput = document.getElementById(
    "strict-mode"
  ) as HTMLInputElement;
  if (strictModeInput) {
    strictModeInput.checked = settings.strictMode;
    toggleBlockedSitesContainer(settings.strictMode);
  }

  populateSiteList("discouraged-sites-list", settings.discouragedSites);
  populateSiteList("blocked-sites-list", settings.blockedSites);

  // Preferences
  const animationsInput = document.getElementById(
    "animations-enabled"
  ) as HTMLInputElement;
  const notificationsInput = document.getElementById(
    "notifications-enabled"
  ) as HTMLInputElement;
  const showTimerInput = document.getElementById(
    "show-session-timer"
  ) as HTMLInputElement;
  const soundVolumeInput = document.getElementById(
    "sound-volume"
  ) as HTMLInputElement;
  const volumeDisplay = document.getElementById("volume-display");

  if (animationsInput) animationsInput.checked = settings.animationsEnabled;
  if (notificationsInput)
    notificationsInput.checked = settings.notificationsEnabled;
  if (showTimerInput) showTimerInput.checked = settings.showSessionTimer;
  if (soundVolumeInput) {
    soundVolumeInput.value = (settings.soundVolume * 100).toString();
    if (volumeDisplay)
      volumeDisplay.textContent = `${Math.round(settings.soundVolume * 100)}%`;
  }

  // Populate theme selector with unlocked themes
  if (currentState) {
    populateThemeSelector(currentState.player.cosmetics);
  }
}

// ============================================================================
// Populate Statistics UI
// ============================================================================

function populateStatistics(statistics: any): void {
  const totalSessionsEl = document.getElementById("stat-total-sessions");
  const totalTimeEl = document.getElementById("stat-total-time");
  const currentStreakEl = document.getElementById("stat-current-streak");
  const longestStreakEl = document.getElementById("stat-longest-streak");
  const bossesDefeatedEl = document.getElementById("stat-bosses-defeated");
  const currentLevelEl = document.getElementById("stat-current-level");
  const totalInsightEl = document.getElementById("stat-total-insight");
  const totalEmbersEl = document.getElementById("stat-total-embers");
  const spiritEl = document.getElementById("stat-spirit");
  const harmonyEl = document.getElementById("stat-harmony");
  const soulflowEl = document.getElementById("stat-soulflow");

  // Display total sessions completed
  if (totalSessionsEl) {
    totalSessionsEl.textContent = statistics.totalSessions.toString();
  }

  // Display total focus time formatted as hours and minutes
  if (totalTimeEl) {
    const hours = Math.floor(statistics.totalFocusTime / 60);
    const minutes = statistics.totalFocusTime % 60;
    totalTimeEl.textContent = `${hours}h ${minutes}m`;
  }

  // Display current streak and longest streak
  if (currentStreakEl) {
    currentStreakEl.textContent = statistics.currentStreak.toString();
  }
  if (longestStreakEl) {
    longestStreakEl.textContent = statistics.longestStreak.toString();
  }

  // Display bosses defeated count
  if (bossesDefeatedEl) {
    bossesDefeatedEl.textContent = statistics.bossesDefeated.toString();
  }

  // Display current level and stat values from player state
  if (currentState) {
    if (currentLevelEl) {
      currentLevelEl.textContent = currentState.player.level.toString();
    }

    // Display current stat values
    if (spiritEl) {
      spiritEl.textContent = currentState.player.stats.spirit.toFixed(1);
    }
    if (harmonyEl) {
      // Display harmony as percentage for better readability
      const harmonyPercent = (currentState.player.stats.harmony * 100).toFixed(
        1
      );
      harmonyEl.textContent = `${harmonyPercent}%`;
    }
    if (soulflowEl) {
      soulflowEl.textContent = currentState.player.stats.soulflow.toFixed(1);
    }
  }

  // Display total Soul Insight and Soul Embers earned (lifetime)
  if (totalInsightEl) {
    totalInsightEl.textContent =
      statistics.totalSoulInsightEarned.toLocaleString();
  }
  if (totalEmbersEl) {
    totalEmbersEl.textContent =
      statistics.totalSoulEmbersEarned.toLocaleString();
  }

  // Update Show Player Card button with current sprite
  const showPlayerCardBtn = document.getElementById("show-player-card-btn");
  if (currentState && showPlayerCardBtn) {
    const state = currentState; // Store in local variable for type narrowing
    const sprite = COSMETIC_SPRITES.find(
      (s) => s.id === state.player.cosmetics.activeSprite
    );
    
    if (sprite) {
      // Set button background to current sprite
      showPlayerCardBtn.style.backgroundImage = `url('${sprite.imagePath}')`;
    }
  }
}

// ============================================================================
// Populate Task Management UI
// ============================================================================

function populateTaskManagement(taskState: TaskState): void {
  const goalsContainer = document.getElementById("goals-container");
  if (!goalsContainer) return;

  goalsContainer.innerHTML = "";

  if (taskState.goals.length === 0) {
    goalsContainer.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #808090;">
        <p>No goals yet. Click "Add Goal" to get started.</p>
      </div>
    `;
    return;
  }

  taskState.goals.forEach((goal: Goal) => {
    const goalCard = createGoalCard(goal);
    goalsContainer.appendChild(goalCard);
  });
}

function createGoalCard(goal: Goal): HTMLElement {
  const card = document.createElement("div");
  card.className = "goal-card";

  const goalHeader = document.createElement("div");
  goalHeader.className = "goal-header";

  const goalInfo = document.createElement("div");
  goalInfo.className = "goal-info";

  const goalTitle = document.createElement("div");
  goalTitle.className = "goal-title";
  goalTitle.textContent = goal.name;
  goalInfo.appendChild(goalTitle);

  if (goal.description) {
    const goalDesc = document.createElement("div");
    goalDesc.className = "goal-description";
    goalDesc.textContent = goal.description;
    goalInfo.appendChild(goalDesc);
  }

  const goalActions = document.createElement("div");
  goalActions.className = "goal-actions";
  goalActions.innerHTML = `
    <button class="btn btn-secondary btn-small btn-edit-goal" data-goal-id="${goal.id}">Edit</button>
    <button class="btn btn-danger btn-small btn-delete-goal" data-goal-id="${goal.id}">Delete</button>
  `;

  goalHeader.appendChild(goalInfo);
  goalHeader.appendChild(goalActions);
  card.appendChild(goalHeader);

  // Tasks container
  const tasksContainer = document.createElement("div");
  tasksContainer.className = "goal-tasks";

  goal.tasks.forEach((task: Task) => {
    const taskElement = createTaskElement(task, goal.id);
    tasksContainer.appendChild(taskElement);
  });

  card.appendChild(tasksContainer);

  // Add task button
  const addTaskBtn = document.createElement("button");
  addTaskBtn.className = "btn btn-secondary btn-add-task";
  addTaskBtn.textContent = "+ Add Task";
  addTaskBtn.setAttribute("data-goal-id", goal.id);
  addTaskBtn.classList.add("btn-add-task-to-goal");
  card.appendChild(addTaskBtn);

  return card;
}

function createTaskElement(task: Task, goalId: string): HTMLElement {
  const taskItem = document.createElement("div");
  taskItem.className = "task-item";

  const taskHeader = document.createElement("div");
  taskHeader.className = "task-header";

  const taskTitleRow = document.createElement("div");
  taskTitleRow.className = "task-title-row";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task-checkbox";
  checkbox.checked = task.isComplete;
  checkbox.setAttribute("data-task-id", task.id);
  checkbox.setAttribute("data-goal-id", goalId);

  const taskName = document.createElement("span");
  taskName.className = "task-name";
  if (task.isComplete) {
    taskName.classList.add("completed");
  }
  taskName.textContent = task.name;

  taskTitleRow.appendChild(checkbox);
  taskTitleRow.appendChild(taskName);

  const taskActions = document.createElement("div");
  taskActions.className = "task-actions";
  taskActions.innerHTML = `
    <button class="btn btn-secondary btn-small btn-edit-task" data-task-id="${task.id}" data-goal-id="${goalId}">Edit</button>
    <button class="btn btn-danger btn-small btn-delete-task" data-task-id="${task.id}" data-goal-id="${goalId}">Delete</button>
  `;

  taskHeader.appendChild(taskTitleRow);
  taskHeader.appendChild(taskActions);
  taskItem.appendChild(taskHeader);

  if (task.description) {
    const taskDesc = document.createElement("div");
    taskDesc.className = "task-description";
    taskDesc.textContent = task.description;
    taskItem.appendChild(taskDesc);
  }

  // Subtasks container
  if (task.subtasks && task.subtasks.length > 0) {
    const subtasksContainer = document.createElement("div");
    subtasksContainer.className = "task-subtasks";

    task.subtasks.forEach((subtask: Subtask) => {
      const subtaskElement = createSubtaskElement(subtask, task.id, goalId);
      subtasksContainer.appendChild(subtaskElement);
    });

    taskItem.appendChild(subtasksContainer);
  }

  // Add subtask button
  const addSubtaskBtn = document.createElement("button");
  addSubtaskBtn.className = "btn btn-secondary btn-add-subtask";
  addSubtaskBtn.textContent = "+ Add Subtask";
  addSubtaskBtn.setAttribute("data-task-id", task.id);
  addSubtaskBtn.setAttribute("data-goal-id", goalId);
  addSubtaskBtn.classList.add("btn-add-subtask-to-task");
  taskItem.appendChild(addSubtaskBtn);

  return taskItem;
}

function createSubtaskElement(
  subtask: Subtask,
  taskId: string,
  goalId: string
): HTMLElement {
  const subtaskItem = document.createElement("div");
  subtaskItem.className = "subtask-item";

  const subtaskInfo = document.createElement("div");
  subtaskInfo.className = "subtask-info";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "subtask-checkbox";
  checkbox.checked = subtask.isComplete;
  checkbox.setAttribute("data-subtask-id", subtask.id);
  checkbox.setAttribute("data-task-id", taskId);
  checkbox.setAttribute("data-goal-id", goalId);

  const subtaskName = document.createElement("span");
  subtaskName.className = "subtask-name";
  if (subtask.isComplete) {
    subtaskName.classList.add("completed");
  }
  subtaskName.textContent = subtask.name;

  const subtaskDuration = document.createElement("span");
  subtaskDuration.className = "subtask-duration";
  subtaskDuration.textContent = `${subtask.estimatedDuration}m`;

  subtaskInfo.appendChild(checkbox);
  subtaskInfo.appendChild(subtaskName);
  subtaskInfo.appendChild(subtaskDuration);

  const subtaskActions = document.createElement("div");
  subtaskActions.className = "subtask-actions";
  subtaskActions.innerHTML = `
    <button class="btn btn-secondary btn-small btn-edit-subtask" data-subtask-id="${subtask.id}" data-task-id="${taskId}" data-goal-id="${goalId}">Edit</button>
    <button class="btn btn-danger btn-small btn-delete-subtask" data-subtask-id="${subtask.id}" data-task-id="${taskId}" data-goal-id="${goalId}">Delete</button>
  `;

  subtaskItem.appendChild(subtaskInfo);
  subtaskItem.appendChild(subtaskActions);

  return subtaskItem;
}

// ============================================================================
// Populate Site Lists
// ============================================================================

function populateSiteList(listId: string, sites: string[]): void {
  const listElement = document.getElementById(listId);
  if (!listElement) return;

  listElement.innerHTML = "";

  if (sites.length === 0) {
    listElement.innerHTML = `
      <li style="text-align: center; padding: 20px; color: #808090;">
        No sites added yet
      </li>
    `;
    return;
  }

  sites.forEach((site) => {
    const listItem = document.createElement("li");
    listItem.className = "site-item";
    listItem.innerHTML = `
      <span class="site-domain">${escapeHtml(site)}</span>
      <button class="btn btn-danger btn-remove-site" data-site="${escapeHtml(
        site
      )}" data-list="${listId}">Remove</button>
    `;
    listElement.appendChild(listItem);
  });
}

// ============================================================================
// Event Listeners
// ============================================================================

function setupEventListeners(): void {
  // Session Configuration
  setupInputListener("default-session-duration", (value) => {
    const input = document.getElementById(
      "default-session-duration"
    ) as HTMLInputElement;
    const numValue = parseInt(value);
    if (numValue >= 5 && numValue <= 120) {
      updateSetting("defaultSessionDuration", numValue);
      if (input) {
        input.setCustomValidity("");
        input.style.borderColor = "";
      }
    } else {
      if (input) {
        input.setCustomValidity(
          "Session duration must be between 5 and 120 minutes"
        );
        input.style.borderColor = "#f87171";
        input.reportValidity();
      }
    }
  });

  setupInputListener("default-break-duration", (value) => {
    const input = document.getElementById(
      "default-break-duration"
    ) as HTMLInputElement;
    const numValue = parseInt(value);
    if (numValue >= 1 && numValue <= 30) {
      updateSetting("defaultBreakDuration", numValue);
      if (input) {
        input.setCustomValidity("");
        input.style.borderColor = "";
      }
    } else {
      if (input) {
        input.setCustomValidity(
          "Break duration must be between 1 and 30 minutes"
        );
        input.style.borderColor = "#f87171";
        input.reportValidity();
      }
    }
  });

  setupCheckboxListener("auto-start-next", (checked) => {
    updateSetting("autoStartNextSession", checked);
  });

  setupCheckboxListener("auto-complete-task", (checked) => {
    updateSetting("autoCompleteTask", checked);
  });

  setupInputListener("idle-threshold", (value) => {
    const input = document.getElementById("idle-threshold") as HTMLInputElement;
    const numValue = parseInt(value);
    if (numValue >= 30 && numValue <= 600) {
      updateSetting("idleThreshold", numValue);
      if (input) {
        input.setCustomValidity("");
        input.style.borderColor = "";
      }
    } else {
      if (input) {
        input.setCustomValidity(
          "Idle threshold must be between 30 and 600 seconds"
        );
        input.style.borderColor = "#f87171";
        input.reportValidity();
      }
    }
  });

  // Distraction Management
  setupCheckboxListener("strict-mode", (checked) => {
    updateSetting("strictMode", checked);
    toggleBlockedSitesContainer(checked);
  });

  // Add discouraged site
  const addDiscouragedBtn = document.getElementById("add-discouraged-site-btn");
  const discouragedInput = document.getElementById(
    "discouraged-site-input"
  ) as HTMLInputElement;
  const discouragedError = document.getElementById("discouraged-site-error");

  if (addDiscouragedBtn && discouragedInput) {
    addDiscouragedBtn.addEventListener("click", () => {
      const domain = discouragedInput.value.trim();
      if (domain) {
        const validation = validateDomain(domain);
        if (validation.isValid) {
          addSiteToList("discouragedSites", validation.normalizedDomain);
          discouragedInput.value = "";
          if (discouragedError) {
            discouragedError.style.display = "none";
          }
        } else {
          if (discouragedError) {
            discouragedError.textContent = validation.error || "Invalid domain";
            discouragedError.style.display = "block";
          }
        }
      }
    });

    // Allow Enter key to add site
    discouragedInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        addDiscouragedBtn.click();
      }
    });

    // Clear error on input
    discouragedInput.addEventListener("input", () => {
      if (discouragedError) {
        discouragedError.style.display = "none";
      }
    });
  }

  // Add blocked site
  const addBlockedBtn = document.getElementById("add-blocked-site-btn");
  const blockedInput = document.getElementById(
    "blocked-site-input"
  ) as HTMLInputElement;
  const blockedError = document.getElementById("blocked-site-error");

  if (addBlockedBtn && blockedInput) {
    addBlockedBtn.addEventListener("click", () => {
      const domain = blockedInput.value.trim();
      if (domain) {
        const validation = validateDomain(domain);
        if (validation.isValid) {
          addSiteToList("blockedSites", validation.normalizedDomain);
          blockedInput.value = "";
          if (blockedError) {
            blockedError.style.display = "none";
          }
        } else {
          if (blockedError) {
            blockedError.textContent = validation.error || "Invalid domain";
            blockedError.style.display = "block";
          }
        }
      }
    });

    // Allow Enter key to add site
    blockedInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        addBlockedBtn.click();
      }
    });

    // Clear error on input
    blockedInput.addEventListener("input", () => {
      if (blockedError) {
        blockedError.style.display = "none";
      }
    });
  }

  // Test URL
  const testUrlBtn = document.getElementById("test-url-btn");
  const testUrlInput = document.getElementById(
    "test-url-input"
  ) as HTMLInputElement;
  const testUrlResult = document.getElementById("test-url-result");

  if (testUrlBtn && testUrlInput && testUrlResult) {
    testUrlBtn.addEventListener("click", () => {
      const url = testUrlInput.value.trim();
      if (url) {
        testUrl(url, testUrlResult);
      }
    });

    // Allow Enter key to test
    testUrlInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        testUrlBtn.click();
      }
    });
  }

  // Remove site buttons (delegated)
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("btn-remove-site")) {
      const site = target.getAttribute("data-site");
      const listId = target.getAttribute("data-list");
      if (site && listId) {
        const settingKey =
          listId === "discouraged-sites-list"
            ? "discouragedSites"
            : "blockedSites";
        removeSiteFromList(settingKey, site);
      }
    }
  });

  // Preferences
  setupCheckboxListener("animations-enabled", (checked) => {
    updateSetting("animationsEnabled", checked);
  });

  setupCheckboxListener("notifications-enabled", (checked) => {
    updateSetting("notificationsEnabled", checked);
  });

  setupCheckboxListener("show-session-timer", (checked) => {
    updateSetting("showSessionTimer", checked);
  });

  const soundVolumeInput = document.getElementById(
    "sound-volume"
  ) as HTMLInputElement;
  const volumeDisplay = document.getElementById("volume-display");
  if (soundVolumeInput && volumeDisplay) {
    soundVolumeInput.addEventListener("input", () => {
      const value = parseInt(soundVolumeInput.value);
      volumeDisplay.textContent = `${value}%`;
      updateSetting("soundVolume", value / 100);
    });
  }

  // Theme selector
  const themeSelector = document.getElementById(
    "theme-selector"
  ) as HTMLSelectElement;
  if (themeSelector) {
    themeSelector.addEventListener("change", () => {
      const themeId = themeSelector.value;
      updateCosmetic("activeTheme", themeId);
      updateThemePreview(themeId);
      applyTheme(themeId);
    });
  }

  // Player Card - Show Player Card button
  const showPlayerCardBtn = document.getElementById("show-player-card-btn");
  if (showPlayerCardBtn) {
    showPlayerCardBtn.addEventListener("click", () => {
      if (currentState) {
        const cardData = PlayerCardManager.generateCardData(currentState);
        PlayerCardManager.showCardModal(cardData);
      }
    });
  }

  // Task Management - Add Goal
  const addGoalBtn = document.getElementById("add-goal-btn");
  if (addGoalBtn) {
    addGoalBtn.addEventListener("click", () => {
      openGoalModal("add", null);
    });
  }

  // Task Management - Delegated event listeners
  document.addEventListener("click", async (e) => {
    const target = e.target as HTMLElement;

    // Edit Goal
    if (target.classList.contains("btn-edit-goal")) {
      const goalId = target.getAttribute("data-goal-id");
      if (goalId) openGoalModal("edit", goalId);
    }

    // Delete Goal
    if (target.classList.contains("btn-delete-goal")) {
      const goalId = target.getAttribute("data-goal-id");
      if (
        goalId &&
        confirm("Are you sure you want to delete this goal and all its tasks?")
      ) {
        await deleteGoal(goalId);
      }
    }

    // Add Task to Goal
    if (target.classList.contains("btn-add-task-to-goal")) {
      const goalId = target.getAttribute("data-goal-id");
      if (goalId) openTaskModal("add", goalId, null);
    }

    // Edit Task
    if (target.classList.contains("btn-edit-task")) {
      const taskId = target.getAttribute("data-task-id");
      const goalId = target.getAttribute("data-goal-id");
      if (taskId && goalId) openTaskModal("edit", goalId, taskId);
    }

    // Delete Task
    if (target.classList.contains("btn-delete-task")) {
      const taskId = target.getAttribute("data-task-id");
      const goalId = target.getAttribute("data-goal-id");
      if (
        taskId &&
        goalId &&
        confirm(
          "Are you sure you want to delete this task and all its subtasks?"
        )
      ) {
        await deleteTask(goalId, taskId);
      }
    }

    // Add Subtask to Task
    if (target.classList.contains("btn-add-subtask-to-task")) {
      const taskId = target.getAttribute("data-task-id");
      const goalId = target.getAttribute("data-goal-id");
      if (taskId && goalId) openSubtaskModal("add", goalId, taskId, null);
    }

    // Edit Subtask
    if (target.classList.contains("btn-edit-subtask")) {
      const subtaskId = target.getAttribute("data-subtask-id");
      const taskId = target.getAttribute("data-task-id");
      const goalId = target.getAttribute("data-goal-id");
      if (subtaskId && taskId && goalId)
        openSubtaskModal("edit", goalId, taskId, subtaskId);
    }

    // Delete Subtask
    if (target.classList.contains("btn-delete-subtask")) {
      const subtaskId = target.getAttribute("data-subtask-id");
      const taskId = target.getAttribute("data-task-id");
      const goalId = target.getAttribute("data-goal-id");
      if (
        subtaskId &&
        taskId &&
        goalId &&
        confirm("Are you sure you want to delete this subtask?")
      ) {
        await deleteSubtask(goalId, taskId, subtaskId);
      }
    }
  });

  // Task/Subtask completion checkboxes
  document.addEventListener("change", async (e) => {
    const target = e.target as HTMLInputElement;

    // Task checkbox
    if (target.classList.contains("task-checkbox")) {
      const taskId = target.getAttribute("data-task-id");
      const goalId = target.getAttribute("data-goal-id");
      if (taskId && goalId) {
        await toggleTaskCompletion(goalId, taskId, target.checked);
      }
    }

    // Subtask checkbox
    if (target.classList.contains("subtask-checkbox")) {
      const subtaskId = target.getAttribute("data-subtask-id");
      const taskId = target.getAttribute("data-task-id");
      const goalId = target.getAttribute("data-goal-id");
      if (subtaskId && taskId && goalId) {
        await toggleSubtaskCompletion(
          goalId,
          taskId,
          subtaskId,
          target.checked
        );
      }
    }
  });

  // Modal event listeners
  setupModalListeners();
}

// ============================================================================
// Modal Management
// ============================================================================

function setupModalListeners(): void {
  // Goal Modal
  const goalModal = document.getElementById("goal-modal");
  const goalModalClose = document.getElementById("goal-modal-close");
  const goalModalCancel = document.getElementById("goal-modal-cancel");
  const goalModalSave = document.getElementById("goal-modal-save");

  if (goalModalClose) {
    goalModalClose.addEventListener("click", () => closeModal("goal-modal"));
  }
  if (goalModalCancel) {
    goalModalCancel.addEventListener("click", () => closeModal("goal-modal"));
  }
  if (goalModalSave) {
    goalModalSave.addEventListener("click", () => saveGoal());
  }
  if (goalModal) {
    goalModal.addEventListener("click", (e) => {
      if (e.target === goalModal) closeModal("goal-modal");
    });
  }

  // Task Modal
  const taskModal = document.getElementById("task-modal");
  const taskModalClose = document.getElementById("task-modal-close");
  const taskModalCancel = document.getElementById("task-modal-cancel");
  const taskModalSave = document.getElementById("task-modal-save");

  if (taskModalClose) {
    taskModalClose.addEventListener("click", () => closeModal("task-modal"));
  }
  if (taskModalCancel) {
    taskModalCancel.addEventListener("click", () => closeModal("task-modal"));
  }
  if (taskModalSave) {
    taskModalSave.addEventListener("click", () => saveTask());
  }
  if (taskModal) {
    taskModal.addEventListener("click", (e) => {
      if (e.target === taskModal) closeModal("task-modal");
    });
  }

  // Subtask Modal
  const subtaskModal = document.getElementById("subtask-modal");
  const subtaskModalClose = document.getElementById("subtask-modal-close");
  const subtaskModalCancel = document.getElementById("subtask-modal-cancel");
  const subtaskModalSave = document.getElementById("subtask-modal-save");

  if (subtaskModalClose) {
    subtaskModalClose.addEventListener("click", () =>
      closeModal("subtask-modal")
    );
  }
  if (subtaskModalCancel) {
    subtaskModalCancel.addEventListener("click", () =>
      closeModal("subtask-modal")
    );
  }
  if (subtaskModalSave) {
    subtaskModalSave.addEventListener("click", () => saveSubtask());
  }
  if (subtaskModal) {
    subtaskModal.addEventListener("click", (e) => {
      if (e.target === subtaskModal) closeModal("subtask-modal");
    });
  }
}

function openGoalModal(mode: "add" | "edit", goalId: string | null): void {
  currentModalMode = mode;
  currentEditingId = goalId;

  const modal = document.getElementById("goal-modal");
  const title = document.getElementById("goal-modal-title");
  const nameInput = document.getElementById("goal-name") as HTMLInputElement;
  const descInput = document.getElementById(
    "goal-description"
  ) as HTMLTextAreaElement;

  if (!modal || !title || !nameInput || !descInput) return;

  if (mode === "edit" && goalId && currentState) {
    const goal = currentState.tasks.goals.find((g) => g.id === goalId);
    if (goal) {
      title.textContent = "Edit Goal";
      nameInput.value = goal.name;
      descInput.value = goal.description || "";
    }
  } else {
    title.textContent = "Add Goal";
    nameInput.value = "";
    descInput.value = "";
  }

  modal.classList.add("active");
  nameInput.focus();
}

function openTaskModal(
  mode: "add" | "edit",
  goalId: string,
  taskId: string | null
): void {
  currentModalMode = mode;
  currentEditingId = taskId;
  currentParentId = goalId;

  const modal = document.getElementById("task-modal");
  const title = document.getElementById("task-modal-title");
  const nameInput = document.getElementById("task-name") as HTMLInputElement;
  const descInput = document.getElementById(
    "task-description"
  ) as HTMLTextAreaElement;

  if (!modal || !title || !nameInput || !descInput) return;

  if (mode === "edit" && taskId && currentState) {
    const goal = currentState.tasks.goals.find((g) => g.id === goalId);
    const task = goal?.tasks.find((t) => t.id === taskId);
    if (task) {
      title.textContent = "Edit Task";
      nameInput.value = task.name;
      descInput.value = task.description || "";
    }
  } else {
    title.textContent = "Add Task";
    nameInput.value = "";
    descInput.value = "";
  }

  modal.classList.add("active");
  nameInput.focus();
}

function openSubtaskModal(
  mode: "add" | "edit",
  goalId: string,
  taskId: string,
  subtaskId: string | null
): void {
  currentModalMode = mode;
  currentEditingId = subtaskId;
  currentParentId = taskId;

  const modal = document.getElementById("subtask-modal");
  const title = document.getElementById("subtask-modal-title");
  const nameInput = document.getElementById("subtask-name") as HTMLInputElement;
  const durationInput = document.getElementById(
    "subtask-duration"
  ) as HTMLInputElement;

  if (!modal || !title || !nameInput || !durationInput) return;

  if (mode === "edit" && subtaskId && currentState) {
    const goal = currentState.tasks.goals.find((g) => g.id === goalId);
    const task = goal?.tasks.find((t) => t.id === taskId);
    const subtask = task?.subtasks.find((s) => s.id === subtaskId);
    if (subtask) {
      title.textContent = "Edit Subtask";
      nameInput.value = subtask.name;
      durationInput.value = subtask.estimatedDuration.toString();
    }
  } else {
    title.textContent = "Add Subtask";
    nameInput.value = "";
    durationInput.value = "25";
  }

  modal.classList.add("active");
  nameInput.focus();
}

function closeModal(modalId: string): void {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("active");
  }
  currentModalMode = "add";
  currentEditingId = null;
  currentParentId = null;
}

// ============================================================================
// Task CRUD Operations
// ============================================================================

async function saveGoal(): Promise<void> {
  const nameInput = document.getElementById("goal-name") as HTMLInputElement;
  const descInput = document.getElementById(
    "goal-description"
  ) as HTMLTextAreaElement;

  if (!nameInput || !currentState) return;

  const name = nameInput.value.trim();
  if (!name) {
    alert("Goal name is required");
    return;
  }

  if (currentModalMode === "add") {
    // Create new goal
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      name,
      description: descInput.value.trim(),
      tasks: [],
      createdAt: Date.now(),
    };

    currentState.tasks.goals.push(newGoal);
  } else if (currentModalMode === "edit" && currentEditingId) {
    // Update existing goal
    const goal = currentState.tasks.goals.find(
      (g) => g.id === currentEditingId
    );
    if (goal) {
      goal.name = name;
      goal.description = descInput.value.trim();
    }
  }

  await updateTaskState(currentState.tasks);
  closeModal("goal-modal");
}

async function saveTask(): Promise<void> {
  const nameInput = document.getElementById("task-name") as HTMLInputElement;
  const descInput = document.getElementById(
    "task-description"
  ) as HTMLTextAreaElement;

  if (!nameInput || !currentState || !currentParentId) return;

  const name = nameInput.value.trim();
  if (!name) {
    alert("Task name is required");
    return;
  }

  const goal = currentState.tasks.goals.find((g) => g.id === currentParentId);
  if (!goal) return;

  if (currentModalMode === "add") {
    // Create new task
    const newTask: Task = {
      id: `task-${Date.now()}`,
      goalId: currentParentId,
      name,
      description: descInput.value.trim(),
      subtasks: [],
      isComplete: false,
      createdAt: Date.now(),
    };

    goal.tasks.push(newTask);
  } else if (currentModalMode === "edit" && currentEditingId) {
    // Update existing task
    const task = goal.tasks.find((t) => t.id === currentEditingId);
    if (task) {
      task.name = name;
      task.description = descInput.value.trim();
    }
  }

  await updateTaskState(currentState.tasks);
  closeModal("task-modal");
}

async function saveSubtask(): Promise<void> {
  const nameInput = document.getElementById("subtask-name") as HTMLInputElement;
  const durationInput = document.getElementById(
    "subtask-duration"
  ) as HTMLInputElement;

  if (!nameInput || !durationInput || !currentState || !currentParentId) return;

  const name = nameInput.value.trim();
  const duration = parseInt(durationInput.value);

  if (!name) {
    alert("Subtask name is required");
    return;
  }

  if (isNaN(duration) || duration < 5 || duration > 120) {
    alert("Duration must be between 5 and 120 minutes");
    return;
  }

  // Find the goal and task
  let goal: Goal | undefined;
  let task: Task | undefined;

  for (const g of currentState.tasks.goals) {
    task = g.tasks.find((t) => t.id === currentParentId);
    if (task) {
      goal = g;
      break;
    }
  }

  if (!goal || !task) return;

  if (currentModalMode === "add") {
    // Create new subtask
    const newSubtask: Subtask = {
      id: `subtask-${Date.now()}`,
      taskId: currentParentId,
      name,
      estimatedDuration: duration,
      isComplete: false,
      createdAt: Date.now(),
    };

    task.subtasks.push(newSubtask);
  } else if (currentModalMode === "edit" && currentEditingId) {
    // Update existing subtask
    const subtask = task.subtasks.find((s) => s.id === currentEditingId);
    if (subtask) {
      subtask.name = name;
      subtask.estimatedDuration = duration;
    }
  }

  await updateTaskState(currentState.tasks);
  closeModal("subtask-modal");
}

async function deleteGoal(goalId: string): Promise<void> {
  if (!currentState) return;

  currentState.tasks.goals = currentState.tasks.goals.filter(
    (g) => g.id !== goalId
  );
  await updateTaskState(currentState.tasks);
}

async function deleteTask(goalId: string, taskId: string): Promise<void> {
  if (!currentState) return;

  const goal = currentState.tasks.goals.find((g) => g.id === goalId);
  if (goal) {
    goal.tasks = goal.tasks.filter((t) => t.id !== taskId);
    await updateTaskState(currentState.tasks);
  }
}

async function deleteSubtask(
  goalId: string,
  taskId: string,
  subtaskId: string
): Promise<void> {
  if (!currentState) return;

  const goal = currentState.tasks.goals.find((g) => g.id === goalId);
  const task = goal?.tasks.find((t) => t.id === taskId);
  if (task) {
    task.subtasks = task.subtasks.filter((s) => s.id !== subtaskId);
    await updateTaskState(currentState.tasks);
  }
}

async function toggleTaskCompletion(
  goalId: string,
  taskId: string,
  isComplete: boolean
): Promise<void> {
  if (!currentState) return;

  const goal = currentState.tasks.goals.find((g) => g.id === goalId);
  const task = goal?.tasks.find((t) => t.id === taskId);
  if (task) {
    task.isComplete = isComplete;
    
    // Cascade completion state to all subtasks
    if (task.subtasks && task.subtasks.length > 0) {
      task.subtasks.forEach((subtask) => {
        subtask.isComplete = isComplete;
      });
    }
    
    await updateTaskState(currentState.tasks);
  }
}

async function toggleSubtaskCompletion(
  goalId: string,
  taskId: string,
  subtaskId: string,
  isComplete: boolean
): Promise<void> {
  if (!currentState) return;

  const goal = currentState.tasks.goals.find((g) => g.id === goalId);
  const task = goal?.tasks.find((t) => t.id === taskId);
  const subtask = task?.subtasks.find((s) => s.id === subtaskId);
  if (subtask) {
    subtask.isComplete = isComplete;
    await updateTaskState(currentState.tasks);
  }
}

async function updateTaskState(taskState: TaskState): Promise<void> {
  try {
    // Send update to background
    await chrome.runtime.sendMessage({
      type: "UPDATE_TASKS",
      payload: taskState,
    });

    // Refresh the UI
    populateTaskManagement(taskState);

    console.log("[Options] Task state updated");
  } catch (error) {
    console.error("[Options] Failed to update task state:", error);
  }
}

// ============================================================================
// Helper Functions for Event Listeners
// ============================================================================

function setupInputListener(
  elementId: string,
  callback: (value: string) => void
): void {
  const element = document.getElementById(elementId) as HTMLInputElement;
  if (element) {
    element.addEventListener("change", () => {
      callback(element.value);
    });
  }
}

function setupCheckboxListener(
  elementId: string,
  callback: (checked: boolean) => void
): void {
  const element = document.getElementById(elementId) as HTMLInputElement;
  if (element) {
    element.addEventListener("change", () => {
      callback(element.checked);
    });
  }
}

// ============================================================================
// Update Settings
// ============================================================================

async function updateSetting(key: string, value: any): Promise<void> {
  if (!currentState) return;

  try {
    // Update local state
    (currentState.settings as any)[key] = value;

    // Send update to background
    await chrome.runtime.sendMessage({
      type: "UPDATE_SETTINGS",
      payload: {
        [key]: value,
      },
    });

    console.log(`[Options] Setting updated: ${key} = ${value}`);
  } catch (error) {
    console.error(`[Options] Failed to update setting ${key}:`, error);
  }
}

async function addSiteToList(
  listKey: "discouragedSites" | "blockedSites",
  site: string
): Promise<void> {
  if (!currentState) return;

  try {
    const currentList = currentState.settings[listKey];
    if (!currentList.includes(site)) {
      const updatedList = [...currentList, site];
      await updateSetting(listKey, updatedList);

      // Refresh the UI
      populateSiteList(
        listKey === "discouragedSites"
          ? "discouraged-sites-list"
          : "blocked-sites-list",
        updatedList
      );
    }
  } catch (error) {
    console.error(`[Options] Failed to add site to ${listKey}:`, error);
  }
}

async function removeSiteFromList(
  listKey: "discouragedSites" | "blockedSites",
  site: string
): Promise<void> {
  if (!currentState) return;

  try {
    const currentList = currentState.settings[listKey];
    const updatedList = currentList.filter((s) => s !== site);
    await updateSetting(listKey, updatedList);

    // Refresh the UI
    populateSiteList(
      listKey === "discouragedSites"
        ? "discouraged-sites-list"
        : "blocked-sites-list",
      updatedList
    );
  } catch (error) {
    console.error(`[Options] Failed to remove site from ${listKey}:`, error);
  }
}

// ============================================================================
// UI Helper Functions
// ============================================================================

function toggleBlockedSitesContainer(show: boolean): void {
  const container = document.getElementById("blocked-sites-container");
  if (container) {
    container.style.display = show ? "block" : "none";
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ============================================================================
// Domain Validation
// ============================================================================

interface DomainValidation {
  isValid: boolean;
  normalizedDomain: string;
  error?: string;
}

function validateDomain(input: string): DomainValidation {
  // Remove whitespace
  let domain = input.trim();

  if (!domain) {
    return {
      isValid: false,
      normalizedDomain: "",
      error: "Domain cannot be empty",
    };
  }

  // Remove protocol if present
  domain = domain.replace(/^https?:\/\//i, "");

  // Remove path, query, and fragment
  domain = domain.split("/")[0];
  domain = domain.split("?")[0];
  domain = domain.split("#")[0];

  // Remove port if present
  domain = domain.split(":")[0];

  // Remove www. prefix (optional normalization)
  domain = domain.replace(/^www\./i, "");

  // Validate domain format
  // Basic domain regex: allows letters, numbers, hyphens, and dots
  const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i;

  if (!domainRegex.test(domain)) {
    return {
      isValid: false,
      normalizedDomain: domain,
      error: "Invalid domain format. Use format: example.com",
    };
  }

  // Check for invalid characters
  if (/[^a-z0-9\-\.]/i.test(domain)) {
    return {
      isValid: false,
      normalizedDomain: domain,
      error: "Domain contains invalid characters",
    };
  }

  // Check if domain already exists in current state
  if (currentState) {
    const allSites = [
      ...currentState.settings.discouragedSites,
      ...currentState.settings.blockedSites,
    ];
    if (allSites.includes(domain)) {
      return {
        isValid: false,
        normalizedDomain: domain,
        error: "This domain is already in your lists",
      };
    }
  }

  return {
    isValid: true,
    normalizedDomain: domain,
  };
}

// ============================================================================
// Test URL Functionality
// ============================================================================

function testUrl(url: string, resultElement: HTMLElement): void {
  if (!currentState) {
    resultElement.textContent = "Error: State not loaded";
    resultElement.className = "test-result";
    resultElement.style.display = "block";
    return;
  }

  // Extract domain from URL
  let domain: string;
  try {
    // Try to parse as full URL
    const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
    domain = urlObj.hostname;
  } catch (e) {
    // If parsing fails, try to extract domain manually
    domain = url.replace(/^https?:\/\//i, "");
    domain = domain.split("/")[0];
    domain = domain.split("?")[0];
    domain = domain.split("#")[0];
    domain = domain.split(":")[0];
  }

  // Remove www. prefix for matching
  const normalizedDomain = domain.replace(/^www\./i, "");

  // Check against discouraged sites
  const isDiscouraged = currentState.settings.discouragedSites.some((site) =>
    domainMatches(normalizedDomain, site)
  );

  // Check against blocked sites
  const isBlocked = currentState.settings.blockedSites.some((site) =>
    domainMatches(normalizedDomain, site)
  );

  // Display result
  resultElement.style.display = "block";

  if (isBlocked) {
    resultElement.className = "test-result blocked";
    resultElement.innerHTML = `
      <strong>🚫 BLOCKED</strong>
      This URL will be completely blocked during focus sessions when strict mode is enabled.
      <br><br>
      <strong>Domain:</strong> ${escapeHtml(normalizedDomain)}
    `;
  } else if (isDiscouraged) {
    resultElement.className = "test-result discouraged";
    resultElement.innerHTML = `
      <strong>⚠️ DISCOURAGED</strong>
      This URL will show a warning during focus sessions and reduce your rewards if visited.
      <br><br>
      <strong>Domain:</strong> ${escapeHtml(normalizedDomain)}
    `;
  } else {
    resultElement.className = "test-result allowed";
    resultElement.innerHTML = `
      <strong>✓ ALLOWED</strong>
      This URL is not in your discouraged or blocked lists. You can visit it freely during focus sessions.
      <br><br>
      <strong>Domain:</strong> ${escapeHtml(normalizedDomain)}
    `;
  }
}

function domainMatches(testDomain: string, listDomain: string): boolean {
  // Exact match
  if (testDomain === listDomain) {
    return true;
  }

  // Subdomain match (e.g., mail.google.com matches google.com)
  if (testDomain.endsWith(`.${listDomain}`)) {
    return true;
  }

  return false;
}

// ============================================================================
// Theme Selector Functions
// ============================================================================

function populateThemeSelector(cosmetics: any): void {
  const themeSelector = document.getElementById(
    "theme-selector"
  ) as HTMLSelectElement;
  if (!themeSelector) return;

  // Clear existing options
  themeSelector.innerHTML = "";

  // Get owned themes
  const ownedThemes = cosmetics.ownedThemes || ["default"];
  const activeTheme = cosmetics.activeTheme || "default";

  // Add options for all themes
  COSMETIC_THEMES.forEach((theme) => {
    const option = document.createElement("option");
    option.value = theme.id;
    option.textContent = theme.name;

    // Disable if not owned
    if (!ownedThemes.includes(theme.id)) {
      option.disabled = true;
      option.textContent = `${theme.name} (Locked - ${theme.cost} Soul Embers)`;
    }

    // Select if active
    if (theme.id === activeTheme) {
      option.selected = true;
    }

    themeSelector.appendChild(option);
  });

  // Show preview for active theme
  updateThemePreview(activeTheme);
}

function updateThemePreview(themeId: string): void {
  const previewContainer = document.getElementById("theme-preview");
  if (!previewContainer) return;

  const theme = COSMETIC_THEMES.find((t) => t.id === themeId);
  if (!theme) return;

  // Show preview
  previewContainer.classList.add("active");
  previewContainer.innerHTML = `
    <div class="theme-preview-header">
      <div class="theme-preview-name">${escapeHtml(theme.name)}</div>
      ${
        theme.cost > 0
          ? `<div class="theme-preview-cost">${theme.cost} Soul Embers</div>`
          : ""
      }
    </div>
    <div class="theme-preview-description">${escapeHtml(
      theme.description
    )}</div>
    <div class="theme-preview-colors">
      <div class="theme-color-swatch" style="background: ${
        theme.colors.primary
      };" title="Primary"></div>
      <div class="theme-color-swatch" style="background: ${
        theme.colors.secondary
      };" title="Secondary"></div>
      <div class="theme-color-swatch" style="background: ${
        theme.colors.accent
      };" title="Accent"></div>
      <div class="theme-color-swatch" style="background: ${
        theme.colors.background
      };" title="Background"></div>
    </div>
  `;
}

async function updateCosmetic(key: string, value: string): Promise<void> {
  if (!currentState) return;

  try {
    // Determine cosmetic type based on key
    const type = key === "activeTheme" ? "theme" : "sprite";

    // Send update to background
    await chrome.runtime.sendMessage({
      type: "APPLY_COSMETIC",
      payload: {
        type: type,
        itemId: value,
      },
    });

    // Update local state
    (currentState.player.cosmetics as any)[key] = value;

    console.log(`[Options] Cosmetic updated: ${key} = ${value}`);
  } catch (error) {
    console.error(`[Options] Failed to update cosmetic ${key}:`, error);
  }
}

// ============================================================================
// Theme Application
// ============================================================================

function applyTheme(themeId: string): void {
  const theme = COSMETIC_THEMES.find((t) => t.id === themeId);
  if (!theme) return;

  // Apply theme colors to CSS variables (same as popup)
  document.documentElement.style.setProperty(
    "--theme-primary",
    theme.colors.primary
  );
  document.documentElement.style.setProperty(
    "--theme-secondary",
    theme.colors.secondary
  );
  document.documentElement.style.setProperty(
    "--theme-accent",
    theme.colors.accent
  );
  document.documentElement.style.setProperty(
    "--theme-background",
    theme.colors.background
  );

  console.log(`[Options] Theme applied: ${themeId}`);
}

// ============================================================================
// Sprite Application
// ============================================================================

function applySprite(spriteId: string): void {
  const sprite = COSMETIC_SPRITES.find((s) => s.id === spriteId);
  if (!sprite) return;

  // Update statistics sprite
  const statisticsSprite = document.getElementById(
    "statistics-character-sprite"
  ) as HTMLImageElement;

  if (statisticsSprite) {
    statisticsSprite.src = sprite.imagePath;
  }
}
