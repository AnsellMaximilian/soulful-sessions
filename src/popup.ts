// Popup script for Soul Shepherd
import {
  GameState,
  SessionResult,
  SessionState,
  Message,
  StubbornSoul,
} from "./types";
import { STUBBORN_SOULS, FORMULAS } from "./constants";

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
  // Stop animations when leaving break view
  if (currentView === ViewState.BREAK && newView !== ViewState.BREAK) {
    stopContentSoulAnimations();
  }

  // Check if animations are enabled
  const animationsEnabled = currentState?.settings.animationsEnabled ?? true;

  if (animationsEnabled) {
    // Fade out current view
    const currentViewElement = getCurrentViewElement();
    if (
      currentViewElement &&
      !currentViewElement.classList.contains("hidden")
    ) {
      currentViewElement.classList.add("fade-out");

      // Wait for fade out, then switch views
      setTimeout(() => {
        // Hide all views
        hide("idle-view");
        hide("focus-session-view");
        hide("reward-view");
        hide("break-view");

        // Remove fade-out class
        currentViewElement.classList.remove("fade-out");

        // Show the requested view with fade-in
        const newViewElement = getViewElement(newView);
        newViewElement.classList.remove("hidden");
        newViewElement.classList.add("fade-in");

        // Remove fade-in class after animation
        setTimeout(() => {
          newViewElement.classList.remove("fade-in");
        }, 300);

        currentView = newView;
      }, 300);
    } else {
      // No current view to fade out, just show new view
      showViewWithFade(newView);
      currentView = newView;
    }
  } else {
    // No animations - instant switch
    hide("idle-view");
    hide("focus-session-view");
    hide("reward-view");
    hide("break-view");

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
}

function getCurrentViewElement(): HTMLElement | null {
  switch (currentView) {
    case ViewState.IDLE:
      return document.getElementById("idle-view");
    case ViewState.FOCUS_SESSION:
      return document.getElementById("focus-session-view");
    case ViewState.REWARD:
      return document.getElementById("reward-view");
    case ViewState.BREAK:
      return document.getElementById("break-view");
    default:
      return null;
  }
}

function getViewElement(view: ViewState): HTMLElement {
  switch (view) {
    case ViewState.IDLE:
      return getElement("idle-view");
    case ViewState.FOCUS_SESSION:
      return getElement("focus-session-view");
    case ViewState.REWARD:
      return getElement("reward-view");
    case ViewState.BREAK:
      return getElement("break-view");
  }
}

function showViewWithFade(view: ViewState): void {
  const viewElement = getViewElement(view);
  viewElement.classList.remove("hidden");
  viewElement.classList.add("fade-in");

  setTimeout(() => {
    viewElement.classList.remove("fade-in");
  }, 300);
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
    return response.data || response;
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

async function upgradeStat(statName: string): Promise<void> {
  try {
    await sendMessage({
      type: "UPGRADE_STAT",
      payload: { statName },
    });
  } catch (error) {
    console.error("Failed to upgrade stat:", error);
    throw error;
  }
}

async function allocateSkillPoint(statName: string): Promise<void> {
  try {
    await sendMessage({
      type: "ALLOCATE_SKILL_POINT",
      payload: { statName },
    });
  } catch (error) {
    console.error("Failed to allocate skill point:", error);
    throw error;
  }
}

async function purchaseCosmetic(
  type: "theme" | "sprite",
  itemId: string
): Promise<void> {
  try {
    await sendMessage({
      type: "PURCHASE_COSMETIC",
      payload: { type, itemId },
    });
  } catch (error) {
    console.error("Failed to purchase cosmetic:", error);
    throw error;
  }
}

async function applyCosmetic(
  type: "theme" | "sprite",
  itemId: string
): Promise<void> {
  try {
    await sendMessage({
      type: "APPLY_COSMETIC",
      payload: { type, itemId },
    });
  } catch (error) {
    console.error("Failed to apply cosmetic:", error);
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

  // Smooth transition for XP bar
  const xpBar = getElement("xp-bar");
  if (state.settings.animationsEnabled) {
    xpBar.style.transition = "width 0.5s ease";
  } else {
    xpBar.style.transition = "none";
  }

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

    // Add animation class if animations enabled
    const resolveBar = getElement("resolve-bar");
    if (state.settings.animationsEnabled) {
      resolveBar.classList.add("animate");
      setTimeout(() => {
        resolveBar.classList.remove("animate");
      }, 1200);
    }

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

  // Apply active theme
  applyTheme(state.player.cosmetics.activeTheme);

  // Apply active sprite
  applySprite(state.player.cosmetics.activeSprite);
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

  // Update Soul Embers display
  setText("break-soul-embers", state.player.soulEmbers.toString());

  // Update skill points display
  setText("skill-points-value", state.player.skillPoints.toString());

  // Check if we should animate skill points (from level-up)
  const shouldAnimateSkillPoints = sessionStorage.getItem(
    "pendingSkillPointAnimation"
  );
  if (shouldAnimateSkillPoints === "true" && state.player.skillPoints > 0) {
    // Trigger animation
    const skillPointsElement = getElement("skill-points-value");
    skillPointsElement.classList.add("animate");

    // Remove animation class after it completes
    setTimeout(() => {
      skillPointsElement.classList.remove("animate");
    }, 600);

    // Clear the flag
    sessionStorage.removeItem("pendingSkillPointAnimation");
  }

  // Update upgrade costs and button states
  updateUpgradeButtons(state);

  // Update skill point allocation button states
  updateSkillPointButtons(state);

  // Update boss card
  const boss = getCurrentBoss(state);
  if (boss) {
    setText("break-boss-name", boss.name);
    setText("break-boss-backstory", boss.backstory);

    const resolvePercentage =
      (state.progression.currentBossResolve / boss.initialResolve) * 100;

    // Add animation class if animations enabled
    const resolveBar = getElement("break-resolve-bar");
    if (state.settings.animationsEnabled) {
      resolveBar.classList.add("animate");
      setTimeout(() => {
        resolveBar.classList.remove("animate");
      }, 1200);
    }

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

  // Update shop
  updateShop(state);

  // Apply active theme
  applyTheme(state.player.cosmetics.activeTheme);

  // Apply active sprite
  applySprite(state.player.cosmetics.activeSprite);

  // Start Content Soul animations during break
  startContentSoulAnimations(state.player.stats.soulflow);
}

function updateUpgradeButtons(state: GameState): void {
  // Calculate costs for each stat
  const spiritCost = calculateUpgradeCost(state.player.stats.spirit);
  const harmonyCost = calculateUpgradeCost(state.player.stats.harmony * 100); // Convert to whole number for cost calculation
  const soulflowCost = calculateUpgradeCost(state.player.stats.soulflow);

  // Update cost displays
  setText("upgrade-spirit-cost", spiritCost.toString());
  setText("upgrade-harmony-cost", harmonyCost.toString());
  setText("upgrade-soulflow-cost", soulflowCost.toString());

  // Enable/disable buttons based on available Soul Embers
  const spiritBtn = getElement<HTMLButtonElement>("upgrade-spirit-btn");
  const harmonyBtn = getElement<HTMLButtonElement>("upgrade-harmony-btn");
  const soulflowBtn = getElement<HTMLButtonElement>("upgrade-soulflow-btn");

  spiritBtn.disabled = state.player.soulEmbers < spiritCost;
  harmonyBtn.disabled = state.player.soulEmbers < harmonyCost;
  soulflowBtn.disabled = state.player.soulEmbers < soulflowCost;
}

function updateSkillPointButtons(state: GameState): void {
  // Enable/disable skill point allocation buttons based on available skill points
  const allocateSpiritBtn = getElement<HTMLButtonElement>(
    "allocate-spirit-btn"
  );
  const allocateHarmonyBtn = getElement<HTMLButtonElement>(
    "allocate-harmony-btn"
  );
  const allocateSoulflowBtn = getElement<HTMLButtonElement>(
    "allocate-soulflow-btn"
  );

  const hasSkillPoints = state.player.skillPoints > 0;

  allocateSpiritBtn.disabled = !hasSkillPoints;
  allocateHarmonyBtn.disabled = !hasSkillPoints;
  allocateSoulflowBtn.disabled = !hasSkillPoints;
}

function updateRewardView(result: SessionResult): void {
  const animationsEnabled = currentState?.settings.animationsEnabled ?? true;

  if (animationsEnabled) {
    // Animate reward values with count-up
    animateRewardValue("reward-soul-insight", 0, result.soulInsight, 1000);
    animateRewardValue("reward-soul-embers", 0, result.soulEmbers, 1000, 100);
    animateRewardValue("reward-boss-damage", 0, result.bossProgress, 1000, 200);
  } else {
    // No animations - instant update
    setText("reward-soul-insight", result.soulInsight.toFixed(0));
    setText("reward-soul-embers", result.soulEmbers.toFixed(0));
    setText("reward-boss-damage", result.bossProgress.toFixed(0));
  }

  // Boss resolve will be updated from state
  if (currentState) {
    setText(
      "reward-boss-resolve",
      currentState.progression.currentBossResolve.toString()
    );

    // Animate XP bar with the new total
    if (animationsEnabled) {
      animateXPBar(
        currentState.player.soulInsight,
        currentState.player.soulInsightToNextLevel,
        result.soulInsight
      );
    } else {
      // No animation - just set the bar
      const xpPercentage =
        (currentState.player.soulInsight /
          currentState.player.soulInsightToNextLevel) *
        100;
      setProgress("reward-xp-bar", xpPercentage);
      setText(
        "reward-xp-text",
        `${currentState.player.soulInsight} / ${currentState.player.soulInsightToNextLevel}`
      );
    }
  }

  // Show/hide critical indicator with animation
  if (result.wasCritical) {
    show("critical-indicator");
    if (animationsEnabled) {
      const criticalEl = getElement("critical-indicator");
      criticalEl.classList.add("animate");
      setTimeout(() => {
        criticalEl.classList.remove("animate");
      }, 1500);
    }
  } else {
    hide("critical-indicator");
  }

  // Show/hide compromise warning with animation
  if (result.wasCompromised) {
    show("compromise-warning");
    if (animationsEnabled) {
      const warningEl = getElement("compromise-warning");
      warningEl.classList.add("animate");
      setTimeout(() => {
        warningEl.classList.remove("animate");
      }, 500);
    }
  } else {
    hide("compromise-warning");
  }

  // Update time breakdown
  const activeMinutes = Math.floor(result.activeTime / 60);
  const idleMinutes = Math.floor(result.idleTime / 60);
  setText("active-time", `${activeMinutes}m`);
  setText("idle-time", `${idleMinutes}m`);
}

function animateRewardValue(
  elementId: string,
  start: number,
  end: number,
  duration: number,
  delay: number = 0
): void {
  const element = getElement(elementId);

  // Add animate class
  element.classList.add("animate");

  setTimeout(() => {
    animateCounter(start, end, duration, (value) => {
      setText(elementId, value.toFixed(0));
    });

    // Remove animate class after animation
    setTimeout(() => {
      element.classList.remove("animate");
    }, duration);
  }, delay);
}

function animateXPBar(
  currentXP: number,
  xpToNextLevel: number,
  earnedXP: number
): void {
  const xpBar = getElement("reward-xp-bar");
  const xpText = getElement("reward-xp-text");

  // Calculate the starting and ending percentages
  const startXP = currentXP - earnedXP;
  const startPercentage = Math.max(0, (startXP / xpToNextLevel) * 100);
  const endPercentage = Math.min(100, (currentXP / xpToNextLevel) * 100);

  // Set initial state
  xpBar.style.width = `${startPercentage}%`;
  setText("reward-xp-text", `${startXP.toFixed(0)} / ${xpToNextLevel}`);

  // Remove any existing animation class
  xpBar.classList.remove("animate");

  // Trigger reflow to restart animation
  void xpBar.offsetWidth;

  // Start animation after a short delay
  setTimeout(() => {
    xpBar.style.width = `${endPercentage}%`;

    // Animate the text counter
    animateCounter(startXP, currentXP, 1500, (value) => {
      setText("reward-xp-text", `${value.toFixed(0)} / ${xpToNextLevel}`);
    });
  }, 100);
}

function animateCounter(
  start: number,
  end: number,
  duration: number,
  callback: (value: number) => void
): void {
  const startTime = Date.now();
  const difference = end - start;

  const step = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const current = start + difference * easeOutQuart;

    callback(current);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      callback(end); // Ensure we end at the exact value
    }
  };

  requestAnimationFrame(step);
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

function updateFocusSessionTimer(
  startTime: number,
  duration: number,
  showTimer: boolean
): void {
  const timeRemainingElement = getElement("time-remaining");

  // Hide timer if setting is disabled
  if (!showTimer) {
    timeRemainingElement.style.display = "none";
    return;
  }

  // Show timer if setting is enabled
  timeRemainingElement.style.display = "block";

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

function calculateUpgradeCost(currentStatValue: number): number {
  return Math.floor(
    FORMULAS.STAT_UPGRADE_BASE_COST *
      Math.pow(FORMULAS.STAT_UPGRADE_COST_MULTIPLIER, currentStatValue)
  );
}

// ============================================================================
// Shop Functions
// ============================================================================

function updateShop(state: GameState): void {
  // Import cosmetic catalogs dynamically
  import("./constants").then(({ COSMETIC_THEMES, COSMETIC_SPRITES }) => {
    renderThemesList(state, COSMETIC_THEMES);
    renderSpritesList(state, COSMETIC_SPRITES);
  });
}

function renderThemesList(state: GameState, themes: any[]): void {
  const themesList = getElement("themes-list");
  themesList.innerHTML = "";

  themes.forEach((theme) => {
    const isOwned = state.player.cosmetics.ownedThemes.includes(theme.id);
    const isActive = state.player.cosmetics.activeTheme === theme.id;
    const canAfford = state.player.soulEmbers >= theme.cost;

    const itemDiv = document.createElement("div");
    itemDiv.className = `cosmetic-item ${isOwned ? "owned" : ""} ${
      isActive ? "active" : ""
    }`;

    // Create theme preview
    const previewDiv = document.createElement("div");
    previewDiv.className = "theme-preview";
    previewDiv.style.background = theme.colors.backgroundGradient;

    const contentDiv = document.createElement("div");
    contentDiv.className = "cosmetic-item-with-preview";

    const infoDiv = document.createElement("div");
    infoDiv.className = "cosmetic-info";

    const nameDiv = document.createElement("div");
    nameDiv.className = "cosmetic-name";
    nameDiv.textContent = theme.name;

    const descDiv = document.createElement("div");
    descDiv.className = "cosmetic-description";
    descDiv.textContent = theme.description;

    infoDiv.appendChild(nameDiv);
    infoDiv.appendChild(descDiv);

    if (isActive) {
      const statusDiv = document.createElement("div");
      statusDiv.className = "cosmetic-status";
      statusDiv.textContent = "Active";
      infoDiv.appendChild(statusDiv);
    } else if (isOwned) {
      const statusDiv = document.createElement("div");
      statusDiv.className = "cosmetic-status";
      statusDiv.textContent = "Owned";
      infoDiv.appendChild(statusDiv);
    }

    contentDiv.appendChild(previewDiv);
    contentDiv.appendChild(infoDiv);

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "cosmetic-actions";

    if (!isOwned && theme.cost > 0) {
      const costDiv = document.createElement("div");
      costDiv.className = "cosmetic-cost";
      costDiv.textContent = `${theme.cost} Embers`;
      actionsDiv.appendChild(costDiv);

      const purchaseBtn = document.createElement("button");
      purchaseBtn.className = "cosmetic-button purchase";
      purchaseBtn.textContent = "Purchase";
      purchaseBtn.disabled = !canAfford;
      purchaseBtn.addEventListener("click", async () => {
        try {
          await purchaseCosmetic("theme", theme.id);
        } catch (error: any) {
          alert(error.message || "Failed to purchase theme");
        }
      });
      actionsDiv.appendChild(purchaseBtn);
    } else if (isOwned && !isActive) {
      const applyBtn = document.createElement("button");
      applyBtn.className = "cosmetic-button apply";
      applyBtn.textContent = "Apply";
      applyBtn.addEventListener("click", async () => {
        try {
          await applyCosmetic("theme", theme.id);
        } catch (error: any) {
          alert(error.message || "Failed to apply theme");
        }
      });
      actionsDiv.appendChild(applyBtn);
    }

    itemDiv.appendChild(contentDiv);
    itemDiv.appendChild(actionsDiv);
    themesList.appendChild(itemDiv);
  });
}

function renderSpritesList(state: GameState, sprites: any[]): void {
  const spritesList = getElement("sprites-list");
  spritesList.innerHTML = "";

  sprites.forEach((sprite) => {
    const isOwned = state.player.cosmetics.ownedSprites.includes(sprite.id);
    const isActive = state.player.cosmetics.activeSprite === sprite.id;
    const canAfford = state.player.soulEmbers >= sprite.cost;

    const itemDiv = document.createElement("div");
    itemDiv.className = `cosmetic-item ${isOwned ? "owned" : ""} ${
      isActive ? "active" : ""
    }`;

    const infoDiv = document.createElement("div");
    infoDiv.className = "cosmetic-info";

    const nameDiv = document.createElement("div");
    nameDiv.className = "cosmetic-name";
    nameDiv.textContent = sprite.name;

    const descDiv = document.createElement("div");
    descDiv.className = "cosmetic-description";
    descDiv.textContent = sprite.description;

    infoDiv.appendChild(nameDiv);
    infoDiv.appendChild(descDiv);

    if (isActive) {
      const statusDiv = document.createElement("div");
      statusDiv.className = "cosmetic-status";
      statusDiv.textContent = "Active";
      infoDiv.appendChild(statusDiv);
    } else if (isOwned) {
      const statusDiv = document.createElement("div");
      statusDiv.className = "cosmetic-status";
      statusDiv.textContent = "Owned";
      infoDiv.appendChild(statusDiv);
    }

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "cosmetic-actions";

    if (!isOwned && sprite.cost > 0) {
      const costDiv = document.createElement("div");
      costDiv.className = "cosmetic-cost";
      costDiv.textContent = `${sprite.cost} Embers`;
      actionsDiv.appendChild(costDiv);

      const purchaseBtn = document.createElement("button");
      purchaseBtn.className = "cosmetic-button purchase";
      purchaseBtn.textContent = "Purchase";
      purchaseBtn.disabled = !canAfford;
      purchaseBtn.addEventListener("click", async () => {
        try {
          await purchaseCosmetic("sprite", sprite.id);
        } catch (error: any) {
          alert(error.message || "Failed to purchase sprite");
        }
      });
      actionsDiv.appendChild(purchaseBtn);
    } else if (isOwned && !isActive) {
      const applyBtn = document.createElement("button");
      applyBtn.className = "cosmetic-button apply";
      applyBtn.textContent = "Apply";
      applyBtn.addEventListener("click", async () => {
        try {
          await applyCosmetic("sprite", sprite.id);
        } catch (error: any) {
          alert(error.message || "Failed to apply sprite");
        }
      });
      actionsDiv.appendChild(applyBtn);
    }

    itemDiv.appendChild(infoDiv);
    itemDiv.appendChild(actionsDiv);
    spritesList.appendChild(itemDiv);
  });
}

function applyTheme(themeId: string): void {
  import("./constants").then(({ COSMETIC_THEMES }) => {
    const theme = COSMETIC_THEMES.find((t) => t.id === themeId);
    if (!theme) return;

    // Apply theme colors to CSS variables
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

    // Apply background gradient to body
    document.body.style.background = theme.colors.backgroundGradient;
  });
}

function applySprite(spriteId: string): void {
  import("./constants").then(({ COSMETIC_SPRITES }) => {
    const sprite = COSMETIC_SPRITES.find((s) => s.id === spriteId);
    if (!sprite) return;

    // Update character sprites (currently not in popup, but keeping for future use)
    const idleSprite = document.getElementById(
      "character-sprite"
    ) as HTMLImageElement;
    const breakSprite = document.getElementById(
      "break-character-sprite"
    ) as HTMLImageElement;

    if (idleSprite) {
      idleSprite.src = sprite.imagePath;
    }
    if (breakSprite) {
      breakSprite.src = sprite.imagePath;
    }
  });
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

  // Upgrade buttons
  const upgradeSpiritBtn = getElement<HTMLButtonElement>("upgrade-spirit-btn");
  upgradeSpiritBtn.addEventListener("click", async () => {
    try {
      await upgradeStat("spirit");
      // State will be updated via message listener
    } catch (error) {
      console.error("Failed to upgrade spirit:", error);
      alert("Failed to upgrade stat. Please try again.");
    }
  });

  const upgradeHarmonyBtn = getElement<HTMLButtonElement>(
    "upgrade-harmony-btn"
  );
  upgradeHarmonyBtn.addEventListener("click", async () => {
    try {
      await upgradeStat("harmony");
      // State will be updated via message listener
    } catch (error) {
      console.error("Failed to upgrade harmony:", error);
      alert("Failed to upgrade stat. Please try again.");
    }
  });

  const upgradeSoulflowBtn = getElement<HTMLButtonElement>(
    "upgrade-soulflow-btn"
  );
  upgradeSoulflowBtn.addEventListener("click", async () => {
    try {
      await upgradeStat("soulflow");
      // State will be updated via message listener
    } catch (error) {
      console.error("Failed to upgrade soulflow:", error);
      alert("Failed to upgrade stat. Please try again.");
    }
  });

  // Skill point allocation buttons
  const allocateSpiritBtn = getElement<HTMLButtonElement>(
    "allocate-spirit-btn"
  );
  allocateSpiritBtn.addEventListener("click", async () => {
    try {
      await allocateSkillPoint("spirit");
      // State will be updated via message listener
    } catch (error) {
      console.error("Failed to allocate skill point to spirit:", error);
      alert("Failed to allocate skill point. Please try again.");
    }
  });

  const allocateHarmonyBtn = getElement<HTMLButtonElement>(
    "allocate-harmony-btn"
  );
  allocateHarmonyBtn.addEventListener("click", async () => {
    try {
      await allocateSkillPoint("harmony");
      // State will be updated via message listener
    } catch (error) {
      console.error("Failed to allocate skill point to harmony:", error);
      alert("Failed to allocate skill point. Please try again.");
    }
  });

  const allocateSoulflowBtn = getElement<HTMLButtonElement>(
    "allocate-soulflow-btn"
  );
  allocateSoulflowBtn.addEventListener("click", async () => {
    try {
      await allocateSkillPoint("soulflow");
      // State will be updated via message listener
    } catch (error) {
      console.error("Failed to allocate skill point to soulflow:", error);
      alert("Failed to allocate skill point. Please try again.");
    }
  });

  // Shop tab switching
  const themesTab = getElement<HTMLButtonElement>("themes-tab");
  const spritesTab = getElement<HTMLButtonElement>("sprites-tab");
  const themesShop = getElement("themes-shop");
  const spritesShop = getElement("sprites-shop");

  themesTab.addEventListener("click", () => {
    themesTab.classList.add("active");
    spritesTab.classList.remove("active");
    themesShop.classList.remove("hidden");
    spritesShop.classList.add("hidden");
  });

  spritesTab.addEventListener("click", () => {
    spritesTab.classList.add("active");
    themesTab.classList.remove("active");
    spritesShop.classList.remove("hidden");
    themesShop.classList.add("hidden");
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
          const session: SessionState = message.payload;
          switchView(ViewState.FOCUS_SESSION);
          if (session && currentState) {
            updateFocusSessionTimer(
              session.startTime,
              session.duration,
              currentState.settings.showSessionTimer
            );
          }
          break;

        case "SESSION_ENDED":
          const result: SessionResult = message.payload.result;
          switchView(ViewState.REWARD);
          updateRewardView(result);

          // Show level-up notification if applicable
          if (message.payload.leveledUp) {
            console.log(
              `Level up! New level: ${message.payload.newLevel}, Skill points: ${message.payload.skillPointsGranted}`
            );
            // Store level-up info for animation when switching to break view
            if (message.payload.skillPointsGranted > 0) {
              sessionStorage.setItem("pendingSkillPointAnimation", "true");
            }
          }

          // Show boss defeated notification if applicable
          if (message.payload.bossDefeated) {
            console.log("Boss defeated!", message.payload.nextBoss);
            showBossDefeatedNotification(message.payload.nextBoss);
          }
          break;

        case "BREAK_STARTED":
          // Reward view is already showing, user will click to continue
          break;

        case "BREAK_ENDED":
          handleBreakEnded(message.payload.autoStartEnabled);
          break;

        case "LEVEL_UP":
          // Show level-up notification
          showLevelUpNotification(
            message.payload.newLevel,
            message.payload.skillPointsGranted,
            message.payload.unlockedBoss
          );
          break;

        case "IDLE_SOULS_COLLECTED":
          // Update Soul Embers display if we're in break view
          if (currentState && message.payload.embersEarned > 0) {
            currentState.player.soulEmbers += message.payload.embersEarned;
            if (currentView === ViewState.BREAK) {
              setText(
                "break-soul-embers",
                currentState.player.soulEmbers.toString()
              );
              // Show increment notification
              showEmbersIncrement(message.payload.embersEarned);
            }
          }
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
      updateFocusSessionTimer(
        state.session.startTime,
        state.session.duration,
        state.settings.showSessionTimer
      );
    }
  } else if (state.break?.isActive) {
    if (currentView !== ViewState.BREAK && currentView !== ViewState.REWARD) {
      switchView(ViewState.BREAK);
      updateBreakView(state);
    } else if (currentView === ViewState.BREAK) {
      // Update break view if already showing
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

function handleBreakEnded(autoStartEnabled: boolean): void {
  console.log("Break ended, autoStartEnabled:", autoStartEnabled);

  // Switch to idle view
  if (currentState) {
    switchView(ViewState.IDLE);
    updateIdleView(currentState);
  }

  // If auto-start is enabled, show prompt to start next session
  if (autoStartEnabled) {
    showAutoStartPrompt();
  }
}

function showAutoStartPrompt(): void {
  // Create a simple prompt overlay
  const promptOverlay = document.createElement("div");
  promptOverlay.id = "auto-start-prompt";
  promptOverlay.className = "auto-start-prompt";
  promptOverlay.innerHTML = `
    <div class="auto-start-content">
      <h3>Ready for your next session?</h3>
      <p>Your break is complete. Start another focus session to continue guiding souls.</p>
      <div class="auto-start-buttons">
        <button id="auto-start-yes" class="btn btn-primary">Start Session</button>
        <button id="auto-start-no" class="btn btn-secondary">Not Yet</button>
      </div>
    </div>
  `;

  document.body.appendChild(promptOverlay);

  // Add event listeners
  const yesBtn = document.getElementById("auto-start-yes");
  const noBtn = document.getElementById("auto-start-no");

  if (yesBtn) {
    yesBtn.addEventListener("click", () => {
      document.body.removeChild(promptOverlay);
      // Focus on the start session button
      const startBtn = getElement<HTMLButtonElement>("start-session-btn");
      startBtn.focus();
    });
  }

  if (noBtn) {
    noBtn.addEventListener("click", () => {
      document.body.removeChild(promptOverlay);
    });
  }
}

function showLevelUpNotification(
  newLevel: number,
  skillPointsGranted: number,
  unlockedBoss?: StubbornSoul
): void {
  // Create level-up overlay
  const levelUpOverlay = document.createElement("div");
  levelUpOverlay.id = "level-up-overlay";
  levelUpOverlay.className = "level-up-overlay";

  let content = `
    <div class="level-up-content">
      <div class="level-up-icon">⭐</div>
      <h2>Level Up!</h2>
      <p class="level-up-message">You have reached level ${newLevel}</p>
      <div class="level-up-rewards">
        <p class="skill-points-granted">+${skillPointsGranted} Skill Point${
    skillPointsGranted > 1 ? "s" : ""
  }</p>
        <p class="skill-points-hint">Allocate your skill points during your break to enhance your stats.</p>
      </div>
  `;

  // If a boss was unlocked, show that information
  if (unlockedBoss) {
    content += `
      <div class="boss-unlocked">
        <h3>New Soul Unlocked!</h3>
        <div class="unlocked-boss-card">
          <h4>${unlockedBoss.name}</h4>
          <p class="unlocked-boss-backstory">${unlockedBoss.backstory}</p>
          <p class="unlocked-boss-resolve">Resolve: ${unlockedBoss.initialResolve}</p>
        </div>
      </div>
    `;
  }

  content += `
      <button id="level-up-continue" class="btn btn-primary">Continue</button>
    </div>
  `;

  levelUpOverlay.innerHTML = content;
  document.body.appendChild(levelUpOverlay);

  // Add animation class after a brief delay
  setTimeout(() => {
    levelUpOverlay.classList.add("show");
  }, 50);

  // Add event listener to continue button
  const continueBtn = document.getElementById("level-up-continue");
  if (continueBtn) {
    continueBtn.addEventListener("click", () => {
      levelUpOverlay.classList.remove("show");
      setTimeout(() => {
        document.body.removeChild(levelUpOverlay);
      }, 300);
    });
  }
}

function showBossDefeatedNotification(nextBoss?: StubbornSoul): void {
  // Create boss defeat overlay
  const defeatOverlay = document.createElement("div");
  defeatOverlay.id = "boss-defeat-overlay";
  defeatOverlay.className = "boss-defeat-overlay";

  let content = "";

  if (nextBoss) {
    // Check if player level meets unlock requirement
    const playerLevel = currentState?.player.level || 1;
    const isLocked = playerLevel < nextBoss.unlockLevel;

    if (isLocked) {
      // Boss is locked - show lock message
      content = `
        <div class="boss-defeat-content">
          <div class="boss-defeat-icon">🔒</div>
          <h2>Stubborn Soul Guided!</h2>
          <p class="boss-defeat-message">The soul has found peace and moved on.</p>
          <div class="next-boss-locked">
            <h3>Next Soul: ${nextBoss.name}</h3>
            <p class="lock-message">Boss locked until level ${nextBoss.unlockLevel}</p>
            <p class="lock-hint">You are level ${playerLevel}. Keep completing sessions to level up!</p>
          </div>
          <button id="boss-defeat-continue" class="btn btn-primary">Continue</button>
        </div>
      `;
    } else {
      // Boss is unlocked - show celebration
      content = `
        <div class="boss-defeat-content">
          <div class="boss-defeat-icon">✨</div>
          <h2>Stubborn Soul Guided!</h2>
          <p class="boss-defeat-message">The soul has found peace and moved on.</p>
          <div class="next-boss-unlocked">
            <h3>Next Soul Awaits</h3>
            <div class="next-boss-card">
              <h4>${nextBoss.name}</h4>
              <p class="next-boss-backstory">${nextBoss.backstory}</p>
              <p class="next-boss-resolve">Resolve: ${nextBoss.initialResolve}</p>
            </div>
          </div>
          <button id="boss-defeat-continue" class="btn btn-primary">Continue</button>
        </div>
      `;
    }
  } else {
    // All bosses defeated - campaign complete!
    content = `
      <div class="boss-defeat-content">
        <div class="boss-defeat-icon">🎉</div>
        <h2>Campaign Complete!</h2>
        <p class="boss-defeat-message">You have guided all the Stubborn Souls to peace.</p>
        <p class="campaign-complete-message">The Soul Shepherd's work is never truly done. Continue your focus sessions to grow stronger and collect more souls.</p>
        <button id="boss-defeat-continue" class="btn btn-primary">Continue</button>
      </div>
    `;
  }

  defeatOverlay.innerHTML = content;
  document.body.appendChild(defeatOverlay);

  // Add animation class after a brief delay
  setTimeout(() => {
    defeatOverlay.classList.add("show");
  }, 50);

  // Add event listener to continue button
  const continueBtn = document.getElementById("boss-defeat-continue");
  if (continueBtn) {
    continueBtn.addEventListener("click", () => {
      defeatOverlay.classList.remove("show");
      setTimeout(() => {
        document.body.removeChild(defeatOverlay);
      }, 300);
    });
  }
}

// ============================================================================
// Content Soul Animations
// ============================================================================

let soulAnimationInterval: number | null = null;
let idleCollectionInterval: number | null = null;

function startContentSoulAnimations(soulflow: number): void {
  // Stop any existing animations
  stopContentSoulAnimations();

  if (!currentState || !currentState.settings.animationsEnabled) {
    // Show idle collection counter instead
    showIdleCollectionCounter();
    return;
  }

  // Hide idle collection counter
  hideIdleCollectionCounter();

  // Calculate spawn rate based on Soulflow stat
  // Higher soulflow = more frequent souls
  const baseInterval = 3000; // 3 seconds base
  const spawnInterval = Math.max(1000, baseInterval / (1 + soulflow * 0.5));

  // Start spawning souls at intervals
  soulAnimationInterval = window.setInterval(() => {
    spawnContentSoul();
  }, spawnInterval);

  // Also check for idle collection periodically
  startIdleCollectionCheck();
}

function stopContentSoulAnimations(): void {
  if (soulAnimationInterval !== null) {
    clearInterval(soulAnimationInterval);
    soulAnimationInterval = null;
  }

  if (idleCollectionInterval !== null) {
    clearInterval(idleCollectionInterval);
    idleCollectionInterval = null;
  }

  // Clear any existing souls
  const container = document.getElementById("content-souls-container");
  if (container) {
    container.innerHTML = "";
  }

  hideIdleCollectionCounter();
}

function spawnContentSoul(): void {
  const container = document.getElementById("content-souls-container");
  if (!container) return;

  // Create soul element
  const soul = document.createElement("div");
  soul.className = "content-soul";
  
  // Randomly choose between soul_ember.png and soul_insight.png
  const soulImage = document.createElement("img");
  soulImage.src = Math.random() < 0.5 ? "soul_ember.png" : "soul_insight.png";
  soulImage.alt = "";
  soulImage.style.width = "100%";
  soulImage.style.height = "100%";
  soul.appendChild(soulImage);

  // Random horizontal position
  const randomX = Math.random() * (400 - 32); // 400px popup width - 32px soul width
  soul.style.left = `${randomX}px`;
  soul.style.bottom = "0px";

  // Random horizontal drift (-50px to +50px)
  const drift = (Math.random() - 0.5) * 100;
  soul.style.setProperty("--drift", `${drift}px`);

  // Add to container
  container.appendChild(soul);

  // Start floating animation
  setTimeout(() => {
    soul.classList.add("floating");
  }, 50);

  // When animation completes, trigger collection
  setTimeout(() => {
    collectSoul(soul);
  }, 8000); // Match animation duration
}

function collectSoul(soulElement: HTMLElement): void {
  // Change to collection animation
  soulElement.classList.remove("floating");
  soulElement.classList.add("collecting");

  // Calculate Soul Embers earned (5 per soul)
  const embersEarned = 5;

  // Show increment notification
  showEmbersIncrement(embersEarned);

  // Remove soul element after collection animation
  setTimeout(() => {
    soulElement.remove();
  }, 500);

  // Update state in background (this will be handled by idle collection)
}

function showEmbersIncrement(amount: number): void {
  const incrementEl = document.getElementById("embers-increment");
  if (!incrementEl) return;

  incrementEl.textContent = `+${amount} Soul Embers`;
  incrementEl.classList.remove("show");

  // Trigger reflow
  void incrementEl.offsetWidth;

  incrementEl.classList.add("show");

  // Remove class after animation
  setTimeout(() => {
    incrementEl.classList.remove("show");
  }, 1000);
}

function startIdleCollectionCheck(): void {
  // Check for idle collection every 30 seconds
  idleCollectionInterval = window.setInterval(async () => {
    if (currentState && currentState.break?.isActive) {
      // Request idle collection from background
      try {
        await sendMessage({ type: "COLLECT_IDLE_SOULS" });
      } catch (error) {
        console.error("Failed to collect idle souls:", error);
      }
    }
  }, 30000); // 30 seconds
}

function showIdleCollectionCounter(): void {
  const counter = document.getElementById("idle-collection-counter");
  if (counter && currentState) {
    counter.style.display = "flex";
    updateIdleCollectionCounter();

    // Update counter periodically
    idleCollectionInterval = window.setInterval(() => {
      updateIdleCollectionCounter();
    }, 5000); // Update every 5 seconds
  }
}

function hideIdleCollectionCounter(): void {
  const counter = document.getElementById("idle-collection-counter");
  if (counter) {
    counter.style.display = "none";
  }
}

function updateIdleCollectionCounter(): void {
  if (!currentState) return;

  const counterValue = document.getElementById("idle-counter-value");
  if (counterValue) {
    // Calculate accumulated souls based on time since last collection
    const now = Date.now();
    const lastCollection =
      currentState.progression.idleState.lastCollectionTime;
    const elapsedMinutes = (now - lastCollection) / (1000 * 60);

    // Idle collection rate: 1 soul per 5 minutes * (1 + soulflow * 0.1)
    const soulflow = currentState.player.stats.soulflow;
    const rate = (1 / 5) * (1 + soulflow * 0.1);
    const accumulatedSouls = Math.floor(elapsedMinutes * rate);

    counterValue.textContent = accumulatedSouls.toString();
  }
}

// ============================================================================
// Timer Error Handling
// ============================================================================

/**
 * Check for missed or late timers on popup open
 * Handles cases where alarms didn't fire or fired late
 */
async function checkForMissedTimers(state: GameState): Promise<void> {
  const now = Date.now();
  let hasTimerError = false;
  let errorMessage = "";

  try {
    // Check if session should have ended
    if (state.session?.isActive) {
      const sessionEndTime =
        state.session.startTime + state.session.duration * 60 * 1000;
      const missedTime = now - sessionEndTime;

      if (missedTime > 0) {
        // Session should have ended
        const missedMinutes = Math.floor(missedTime / (1000 * 60));

        if (missedMinutes > 0) {
          hasTimerError = true;
          errorMessage = `Session timer was delayed by ${missedMinutes} minute${
            missedMinutes > 1 ? "s" : ""
          }. Applying rewards now.`;

          console.warn(
            `[Popup] Timer error detected: Session should have ended ${missedMinutes} minutes ago`
          );
          console.warn(
            `[Popup] Session start: ${new Date(
              state.session.startTime
            ).toISOString()}, Duration: ${
              state.session.duration
            }m, Expected end: ${new Date(sessionEndTime).toISOString()}`
          );

          // Notify background to end session retroactively
          await sendMessage({
            type: "END_SESSION_RETROACTIVE",
            payload: {
              actualEndTime: sessionEndTime,
              detectedAt: now,
            },
          });
        }
      }
    }

    // Check if break should have ended
    if (state.break?.isActive) {
      const breakEndTime =
        state.break.startTime + state.break.duration * 60 * 1000;
      const missedTime = now - breakEndTime;

      if (missedTime > 0) {
        // Break should have ended
        const missedMinutes = Math.floor(missedTime / (1000 * 60));

        if (missedMinutes > 0) {
          hasTimerError = true;
          errorMessage = `Break timer was delayed by ${missedMinutes} minute${
            missedMinutes > 1 ? "s" : ""
          }. Ending break now.`;

          console.warn(
            `[Popup] Timer error detected: Break should have ended ${missedMinutes} minutes ago`
          );
          console.warn(
            `[Popup] Break start: ${new Date(
              state.break.startTime
            ).toISOString()}, Duration: ${
              state.break.duration
            }m, Expected end: ${new Date(breakEndTime).toISOString()}`
          );

          // Notify background to end break retroactively
          await sendMessage({
            type: "END_BREAK_RETROACTIVE",
            payload: {
              actualEndTime: breakEndTime,
              detectedAt: now,
            },
          });
        }
      }
    }

    // Show notification if significant time discrepancy detected (> 1 minute)
    if (hasTimerError && errorMessage) {
      showTimerErrorNotification(errorMessage);
    }
  } catch (error) {
    console.error("[Popup] Error checking for missed timers:", error);
  }
}

/**
 * Show notification for timer errors
 */
function showTimerErrorNotification(message: string): void {
  // Create notification overlay
  const notification = document.createElement("div");
  notification.className = "timer-error-notification";
  notification.innerHTML = `
    <div class="timer-error-content">
      <div class="timer-error-icon">⚠️</div>
      <p class="timer-error-message">${message}</p>
      <button id="timer-error-dismiss" class="btn btn-secondary">Dismiss</button>
    </div>
  `;

  document.body.appendChild(notification);

  // Add animation class after a brief delay
  setTimeout(() => {
    notification.classList.add("show");
  }, 50);

  // Add event listener to dismiss button
  const dismissBtn = document.getElementById("timer-error-dismiss");
  if (dismissBtn) {
    dismissBtn.addEventListener("click", () => {
      notification.classList.remove("show");
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    });
  }

  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.classList.remove("show");
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }
  }, 10000);
}

// ============================================================================
// Initialization
// ============================================================================

async function initialize(): Promise<void> {
  try {
    // Request initial state from background
    currentState = await requestState();

    // Check for missed or late timers
    await checkForMissedTimers(currentState);

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
