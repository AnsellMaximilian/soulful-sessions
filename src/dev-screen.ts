// ============================================================================
// Dev Screen - Development Tool for Testing Reward Calculations
// ============================================================================

import { RewardCalculator } from "./RewardCalculator";
import { ProgressionManager } from "./ProgressionManager";
import { FORMULAS, STUBBORN_SOULS } from "./constants";
import {
  SessionState,
  PlayerStats,
  StubbornSoul,
  SessionResult,
} from "./types";

// ============================================================================
// Simulation Interfaces
// ============================================================================

interface SimulationConfig {
  sessionDuration: number; // Minutes
  sessionCount: number;
  playerStats: PlayerStats;
  startingLevel: number;
  startingSoulInsight: number;
  currentBossIndex: number;
  isCompromised: boolean;
}

interface SessionSimulationResult {
  sessionNumber: number;
  duration: number;
  soulInsight: number;
  soulEmbers: number;
  bossProgress: number;
  wasCritical: boolean;
  wasCompromised: boolean;
  calculationDetails: {
    baseSoulInsight: number;
    spiritBonus: number;
    baseSoulEmbers: number;
    soulflowBonus: number;
    criticalMultiplier: number;
    compromisePenalty: number;
  };
}

interface SimulationResult {
  sessions: SessionSimulationResult[];
  totals: {
    soulInsight: number;
    soulEmbers: number;
    bossProgress: number;
    criticalHits: number;
  };
  progression: {
    startLevel: number;
    endLevel: number;
    levelsGained: number;
    skillPointsEarned: number;
    finalSoulInsight: number;
  };
  boss: {
    startingResolve: number;
    remainingResolve: number;
    wasDefeated: boolean;
    nextBoss?: StubbornSoul;
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a mock SessionState object for simulation purposes
 * @param duration Session duration in minutes
 * @param isCompromised Whether the session should be marked as compromised
 * @returns Mock SessionState object
 */
function createMockSession(
  duration: number,
  isCompromised: boolean
): SessionState {
  const now = Date.now();
  const durationMs = duration * 60 * 1000;

  return {
    startTime: now - durationMs, // Simulate completed session
    duration: duration,
    taskId: "dev-screen-simulation",
    isActive: false,
    isPaused: false,
    isCompromised: isCompromised,
    idleTime: 0, // No idle time in simulations
    activeTime: duration * 60, // Full duration is active time (in seconds)
  };
}

// ============================================================================
// Validation Functions
// ============================================================================

interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  warningMessage?: string;
}

/**
 * Validate session duration
 * @param duration Session duration in minutes
 * @returns Validation result
 */
function validateSessionDuration(duration: number): ValidationResult {
  if (isNaN(duration) || duration < 5 || duration > 120) {
    return {
      isValid: false,
      errorMessage: "Session duration must be between 5 and 120 minutes",
    };
  }
  return { isValid: true };
}

/**
 * Validate session count
 * @param count Session count
 * @returns Validation result
 */
function validateSessionCount(count: number): ValidationResult {
  if (isNaN(count) || count < 1 || !Number.isInteger(count)) {
    return {
      isValid: false,
      errorMessage: "Session count must be a positive integer",
    };
  }
  return { isValid: true };
}

/**
 * Validate stat value
 * @param statValue Stat value
 * @param statName Name of the stat for error message
 * @returns Validation result
 */
function validateStatValue(statValue: number, statName: string): ValidationResult {
  if (isNaN(statValue) || statValue < 0) {
    return {
      isValid: false,
      errorMessage: `${statName} stat cannot be negative`,
    };
  }
  return { isValid: true };
}

/**
 * Validate level
 * @param level Character level
 * @returns Validation result
 */
function validateLevel(level: number): ValidationResult {
  if (isNaN(level) || level < 1 || !Number.isInteger(level)) {
    return {
      isValid: false,
      errorMessage: "Level must be a positive integer",
    };
  }
  return { isValid: true };
}

/**
 * Check for harmony warning
 * @param harmony Harmony stat value
 * @returns Validation result with warning if applicable
 */
function checkHarmonyWarning(harmony: number): ValidationResult {
  if (harmony > 1.0) {
    return {
      isValid: true,
      warningMessage: "Warning: Harmony > 1.0 means critical hit chance exceeds 100%",
    };
  }
  return { isValid: true };
}

// ============================================================================
// SimulationEngine Class
// ============================================================================

/**
 * SimulationEngine orchestrates session simulations using production calculation classes
 */
class SimulationEngine {
  private rewardCalculator: RewardCalculator;
  private progressionManager: ProgressionManager;

  constructor() {
    this.rewardCalculator = new RewardCalculator();
    this.progressionManager = new ProgressionManager();
  }

  /**
   * Simulate a single session and return detailed results
   * @param config Simulation configuration
   * @returns Session simulation result with calculation details
   */
  simulateSingleSession(
    config: SimulationConfig,
    sessionNumber: number = 1
  ): SessionSimulationResult {
    // Create mock session state
    const mockSession = createMockSession(
      config.sessionDuration,
      config.isCompromised
    );

    // Calculate base values before any multipliers
    const baseSoulInsight =
      config.sessionDuration *
      FORMULAS.SOUL_INSIGHT_BASE_MULTIPLIER *
      (1 + config.playerStats.spirit * FORMULAS.SOUL_INSIGHT_SPIRIT_BONUS);

    const baseSoulEmbers =
      config.sessionDuration *
      FORMULAS.SOUL_EMBERS_BASE_MULTIPLIER *
      (1 + config.playerStats.soulflow * FORMULAS.SOUL_EMBERS_SOULFLOW_BONUS);

    // Calculate rewards using production RewardCalculator
    const result: SessionResult = this.rewardCalculator.calculateRewards(
      mockSession,
      config.playerStats
    );

    // Capture calculation details for display
    const calculationDetails = {
      baseSoulInsight: Math.round(baseSoulInsight * 100) / 100,
      spiritBonus: config.playerStats.spirit * FORMULAS.SOUL_INSIGHT_SPIRIT_BONUS,
      baseSoulEmbers: Math.round(baseSoulEmbers * 100) / 100,
      soulflowBonus:
        config.playerStats.soulflow * FORMULAS.SOUL_EMBERS_SOULFLOW_BONUS,
      criticalMultiplier: result.wasCritical
        ? FORMULAS.CRITICAL_HIT_MULTIPLIER
        : 1.0,
      compromisePenalty: result.wasCompromised
        ? FORMULAS.COMPROMISE_PENALTY_MULTIPLIER
        : 1.0,
    };

    return {
      sessionNumber: sessionNumber,
      duration: config.sessionDuration,
      soulInsight: result.soulInsight,
      soulEmbers: result.soulEmbers,
      bossProgress: result.bossProgress,
      wasCritical: result.wasCritical,
      wasCompromised: result.wasCompromised,
      calculationDetails: calculationDetails,
    };
  }

  /**
   * Run a full simulation with multiple sessions
   * @param config Simulation configuration
   * @returns Complete simulation result with all sessions and totals
   */
  runSimulation(config: SimulationConfig): SimulationResult {
    const sessions: SessionSimulationResult[] = [];
    
    // Initialize tracking variables
    let cumulativeSoulInsight = config.startingSoulInsight;
    let currentLevel = config.startingLevel;
    let totalSkillPoints = 0;
    
    // Boss tracking
    const currentBoss = STUBBORN_SOULS[config.currentBossIndex];
    let currentBossResolve = currentBoss.initialResolve;
    let bossDefeated = false;
    let nextBoss: StubbornSoul | undefined = undefined;
    
    // Totals tracking
    let totalSoulInsight = 0;
    let totalSoulEmbers = 0;
    let totalBossProgress = 0;
    let totalCriticalHits = 0;
    
    // Run each session
    for (let i = 1; i <= config.sessionCount; i++) {
      // Simulate single session
      const sessionResult = this.simulateSingleSession(config, i);
      sessions.push(sessionResult);
      
      // Update totals
      totalSoulInsight += sessionResult.soulInsight;
      totalSoulEmbers += sessionResult.soulEmbers;
      totalBossProgress += sessionResult.bossProgress;
      if (sessionResult.wasCritical) {
        totalCriticalHits++;
      }
      
      // Update cumulative Soul Insight and check for level-ups
      cumulativeSoulInsight += sessionResult.soulInsight;
      
      // Check for level-ups
      let levelThreshold = this.progressionManager.calculateLevelThreshold(currentLevel);
      while (cumulativeSoulInsight >= levelThreshold) {
        currentLevel++;
        totalSkillPoints += FORMULAS.SKILL_POINTS_PER_LEVEL;
        levelThreshold = this.progressionManager.calculateLevelThreshold(currentLevel);
      }
      
      // Update boss damage
      currentBossResolve = Math.max(0, currentBossResolve - sessionResult.bossProgress);
      
      // Check for boss defeat
      if (currentBossResolve === 0 && !bossDefeated) {
        bossDefeated = true;
        
        // Check if there's a next boss
        const nextBossIndex = config.currentBossIndex + 1;
        if (nextBossIndex < STUBBORN_SOULS.length) {
          nextBoss = STUBBORN_SOULS[nextBossIndex];
        }
      }
    }
    
    // Build final result
    const result: SimulationResult = {
      sessions: sessions,
      totals: {
        soulInsight: Math.round(totalSoulInsight * 100) / 100,
        soulEmbers: Math.round(totalSoulEmbers * 100) / 100,
        bossProgress: Math.round(totalBossProgress * 100) / 100,
        criticalHits: totalCriticalHits,
      },
      progression: {
        startLevel: config.startingLevel,
        endLevel: currentLevel,
        levelsGained: currentLevel - config.startingLevel,
        skillPointsEarned: totalSkillPoints,
        finalSoulInsight: Math.round(cumulativeSoulInsight * 100) / 100,
      },
      boss: {
        startingResolve: currentBoss.initialResolve,
        remainingResolve: Math.round(currentBossResolve * 100) / 100,
        wasDefeated: bossDefeated,
        nextBoss: nextBoss,
      },
    };
    
    return result;
  }

  /**
   * Reset simulation state
   */
  resetSimulation(): void {
    // Simulation is stateless, so reset is a no-op
    // State is managed by the UI controller
  }
}

// ============================================================================
// UIController Class
// ============================================================================

/**
 * UIController manages DOM interactions, form validation, and result rendering
 */
class UIController {
  private simulationEngine: SimulationEngine;
  private currentResults: SimulationResult | null = null;

  // Form elements
  private sessionDurationInput!: HTMLInputElement;
  private sessionCountInput!: HTMLInputElement;
  private spiritInput!: HTMLInputElement;
  private harmonyInput!: HTMLInputElement;
  private soulflowInput!: HTMLInputElement;
  private levelInput!: HTMLInputElement;
  private soulInsightInput!: HTMLInputElement;
  private bossSelect!: HTMLSelectElement;
  private compromisedCheckbox!: HTMLInputElement;

  // Button elements
  private simulateBtn!: HTMLButtonElement;
  private resetBtn!: HTMLButtonElement;
  private exportBtn!: HTMLButtonElement;
  private importBtn!: HTMLButtonElement;
  private quickLevelButtons!: NodeListOf<HTMLButtonElement>;

  // Message elements
  private errorMessage!: HTMLElement;
  private warningMessage!: HTMLElement;

  // Results elements
  private resultsPanel!: HTMLElement;
  private resultsSummary!: HTMLElement;
  private progressionSummary!: HTMLElement;
  private bossSummary!: HTMLElement;
  private sessionTableContainer!: HTMLElement;

  constructor() {
    this.simulationEngine = new SimulationEngine();
  }

  /**
   * Initialize the form and set up event listeners
   */
  initializeForm(): void {
    // Get form elements
    this.sessionDurationInput = document.getElementById(
      "session-duration"
    ) as HTMLInputElement;
    this.sessionCountInput = document.getElementById(
      "session-count"
    ) as HTMLInputElement;
    this.spiritInput = document.getElementById("spirit") as HTMLInputElement;
    this.harmonyInput = document.getElementById("harmony") as HTMLInputElement;
    this.soulflowInput = document.getElementById("soulflow") as HTMLInputElement;
    this.levelInput = document.getElementById("level") as HTMLInputElement;
    this.soulInsightInput = document.getElementById(
      "soul-insight"
    ) as HTMLInputElement;
    this.bossSelect = document.getElementById("boss-select") as HTMLSelectElement;
    this.compromisedCheckbox = document.getElementById(
      "compromised"
    ) as HTMLInputElement;

    // Get button elements
    this.simulateBtn = document.getElementById(
      "simulate-btn"
    ) as HTMLButtonElement;
    this.resetBtn = document.getElementById("reset-btn") as HTMLButtonElement;
    this.exportBtn = document.getElementById("export-btn") as HTMLButtonElement;
    this.importBtn = document.getElementById("import-btn") as HTMLButtonElement;
    this.quickLevelButtons = document.querySelectorAll(
      ".quick-level"
    ) as NodeListOf<HTMLButtonElement>;

    // Get message elements
    this.errorMessage = document.getElementById("error-message") as HTMLElement;
    this.warningMessage = document.getElementById(
      "warning-message"
    ) as HTMLElement;

    // Get results elements
    this.resultsPanel = document.getElementById("results") as HTMLElement;
    this.resultsSummary = document.getElementById(
      "results-summary"
    ) as HTMLElement;
    this.progressionSummary = document.getElementById(
      "progression-summary"
    ) as HTMLElement;
    this.bossSummary = document.getElementById("boss-summary") as HTMLElement;
    this.sessionTableContainer = document.getElementById(
      "session-table-container"
    ) as HTMLElement;

    // Populate boss dropdown
    this.populateBossDropdown();

    // Set default values
    this.setDefaultValues();

    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Populate the boss dropdown with STUBBORN_SOULS data
   */
  private populateBossDropdown(): void {
    this.bossSelect.innerHTML = "";
    STUBBORN_SOULS.forEach((boss, index) => {
      const option = document.createElement("option");
      option.value = index.toString();
      option.textContent = `${boss.name} (Resolve: ${boss.initialResolve}, Level ${boss.unlockLevel})`;
      this.bossSelect.appendChild(option);
    });
  }

  /**
   * Set default values for all form inputs
   */
  private setDefaultValues(): void {
    this.sessionDurationInput.value = "25";
    this.sessionCountInput.value = "1";
    this.spiritInput.value = "1";
    this.harmonyInput.value = "0.05";
    this.soulflowInput.value = "1";
    this.levelInput.value = "1";
    this.soulInsightInput.value = "0";
    this.bossSelect.selectedIndex = 0;
    this.compromisedCheckbox.checked = false;
  }

  /**
   * Set up event listeners for all interactive elements
   */
  private setupEventListeners(): void {
    // Simulate button
    this.simulateBtn.addEventListener("click", () => this.handleSimulateClick());

    // Reset button
    this.resetBtn.addEventListener("click", () => this.handleResetClick());

    // Export button
    this.exportBtn.addEventListener("click", () => this.handleExportClick());

    // Import button
    this.importBtn.addEventListener("click", () => this.handleImportClick());

    // Quick level buttons
    this.quickLevelButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const level = parseInt(button.dataset.level || "1", 10);
        this.handleQuickLevelClick(level);
      });
    });

    // Compromised checkbox - automatically re-run simulation when toggled
    this.compromisedCheckbox.addEventListener("change", () => {
      // Only re-run if we have previous results
      if (this.currentResults) {
        this.handleSimulateClick();
      }
    });
  }

  /**
   * Handle simulate button click
   */
  handleSimulateClick(): void {
    // Clear previous messages
    this.hideError();
    this.hideWarning();

    // Validate inputs
    if (!this.validateInputs()) {
      return;
    }

    try {
      // Gather simulation config from form
      const config: SimulationConfig = {
        sessionDuration: parseFloat(this.sessionDurationInput.value),
        sessionCount: parseInt(this.sessionCountInput.value, 10),
        playerStats: {
          spirit: parseFloat(this.spiritInput.value),
          harmony: parseFloat(this.harmonyInput.value),
          soulflow: parseFloat(this.soulflowInput.value),
        },
        startingLevel: parseInt(this.levelInput.value, 10),
        startingSoulInsight: parseFloat(this.soulInsightInput.value),
        currentBossIndex: parseInt(this.bossSelect.value, 10),
        isCompromised: this.compromisedCheckbox.checked,
      };

      // Run simulation
      const results = this.simulationEngine.runSimulation(config);
      this.currentResults = results;

      // Render results
      this.renderResults(results);
    } catch (error) {
      this.showError(
        `Simulation error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      console.error("Simulation error:", error);
    }
  }

  /**
   * Handle reset button click
   */
  handleResetClick(): void {
    this.setDefaultValues();
    this.hideError();
    this.hideWarning();
    this.hideResults();
    this.currentResults = null;
  }

  /**
   * Handle quick level button click
   */
  handleQuickLevelClick(level: number): void {
    // Implementation will be added in task 6.3
    console.log(`Quick level ${level} clicked - not yet implemented`);
  }

  /**
   * Handle export button click
   */
  handleExportClick(): void {
    // Implementation will be added in task 8.2
    console.log("Export clicked - not yet implemented");
  }

  /**
   * Handle import button click
   */
  handleImportClick(): void {
    // Implementation will be added in task 8.4
    console.log("Import clicked - not yet implemented");
  }

  /**
   * Validate all form inputs
   * @returns true if all inputs are valid, false otherwise
   */
  validateInputs(): boolean {
    // Get input values
    const sessionDuration = parseFloat(this.sessionDurationInput.value);
    const sessionCount = parseInt(this.sessionCountInput.value, 10);
    const spirit = parseFloat(this.spiritInput.value);
    const harmony = parseFloat(this.harmonyInput.value);
    const soulflow = parseFloat(this.soulflowInput.value);
    const level = parseInt(this.levelInput.value, 10);

    // Validate session duration
    const durationResult = validateSessionDuration(sessionDuration);
    if (!durationResult.isValid) {
      this.showError(durationResult.errorMessage!);
      return false;
    }

    // Validate session count
    const countResult = validateSessionCount(sessionCount);
    if (!countResult.isValid) {
      this.showError(countResult.errorMessage!);
      return false;
    }

    // Validate spirit stat
    const spiritResult = validateStatValue(spirit, "Spirit");
    if (!spiritResult.isValid) {
      this.showError(spiritResult.errorMessage!);
      return false;
    }

    // Validate harmony stat
    const harmonyResult = validateStatValue(harmony, "Harmony");
    if (!harmonyResult.isValid) {
      this.showError(harmonyResult.errorMessage!);
      return false;
    }

    // Validate soulflow stat
    const soulflowResult = validateStatValue(soulflow, "Soulflow");
    if (!soulflowResult.isValid) {
      this.showError(soulflowResult.errorMessage!);
      return false;
    }

    // Validate level
    const levelResult = validateLevel(level);
    if (!levelResult.isValid) {
      this.showError(levelResult.errorMessage!);
      return false;
    }

    // Check for harmony warning
    const harmonyWarning = checkHarmonyWarning(harmony);
    if (harmonyWarning.warningMessage) {
      this.showWarning(harmonyWarning.warningMessage);
    }

    return true;
  }

  /**
   * Render simulation results
   */
  renderResults(result: SimulationResult): void {
    // Clear previous results
    this.resultsSummary.innerHTML = "";
    this.progressionSummary.innerHTML = "";
    this.bossSummary.innerHTML = "";
    this.sessionTableContainer.innerHTML = "";

    // Render totals summary
    this.renderTotalsSummary(result.totals);

    // Render progression summary
    this.renderProgressionSummary(result.progression);

    // Render boss summary
    this.renderBossSummary(result.boss);

    // Render session table
    this.renderSessionTable(result.sessions);

    // Show results panel
    this.resultsPanel.classList.add("show");
  }

  /**
   * Render totals summary cards
   */
  private renderTotalsSummary(totals: SimulationResult["totals"]): void {
    const cards = [
      {
        label: "Total Soul Insight",
        value: totals.soulInsight.toFixed(2),
      },
      {
        label: "Total Soul Embers",
        value: totals.soulEmbers.toFixed(2),
      },
      {
        label: "Total Boss Damage",
        value: totals.bossProgress.toFixed(2),
      },
      {
        label: "Critical Hits",
        value: totals.criticalHits.toString(),
      },
    ];

    cards.forEach((card) => {
      const cardElement = document.createElement("div");
      cardElement.className = "stat-card";
      cardElement.innerHTML = `
        <div class="stat-label">${card.label}</div>
        <div class="stat-value">${card.value}</div>
      `;
      this.resultsSummary.appendChild(cardElement);
    });
  }

  /**
   * Render progression summary
   */
  private renderProgressionSummary(
    progression: SimulationResult["progression"]
  ): void {
    const summaryDiv = document.createElement("div");
    summaryDiv.style.marginBottom = "20px";
    summaryDiv.style.padding = "15px";
    summaryDiv.style.background = "#1e1e2e";
    summaryDiv.style.borderRadius = "8px";
    summaryDiv.style.border = "2px solid #4a4a6a";

    let html = `<h3 style="color: #a78bfa; margin-bottom: 15px;">Level Progression</h3>`;
    html += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">`;

    // Starting level
    html += `
      <div>
        <div style="color: #9ca3af; font-size: 0.9em;">Starting Level</div>
        <div style="color: #e0e0e0; font-size: 1.5em; font-weight: bold;">${progression.startLevel}</div>
      </div>
    `;

    // Ending level
    html += `
      <div>
        <div style="color: #9ca3af; font-size: 0.9em;">Ending Level</div>
        <div style="color: #e0e0e0; font-size: 1.5em; font-weight: bold;">${progression.endLevel}</div>
      </div>
    `;

    // Levels gained
    if (progression.levelsGained > 0) {
      html += `
        <div>
          <div style="color: #9ca3af; font-size: 0.9em;">Levels Gained</div>
          <div style="color: #10b981; font-size: 1.5em; font-weight: bold;">+${progression.levelsGained}</div>
        </div>
      `;

      // Skill points earned
      html += `
        <div>
          <div style="color: #9ca3af; font-size: 0.9em;">Skill Points Earned</div>
          <div style="color: #a78bfa; font-size: 1.5em; font-weight: bold;">+${progression.skillPointsEarned}</div>
        </div>
      `;
    }

    // Final Soul Insight
    html += `
      <div>
        <div style="color: #9ca3af; font-size: 0.9em;">Final Soul Insight</div>
        <div style="color: #e0e0e0; font-size: 1.5em; font-weight: bold;">${progression.finalSoulInsight.toFixed(2)}</div>
      </div>
    `;

    html += `</div>`;

    // Show level-up events if any
    if (progression.levelsGained > 0) {
      html += `<div style="margin-top: 15px; padding: 10px; background: #2d2d44; border-radius: 6px;">`;
      html += `<div style="color: #c4b5fd; font-weight: 600; margin-bottom: 8px;">Level-Up Events:</div>`;
      
      for (let i = 0; i < progression.levelsGained; i++) {
        const levelReached = progression.startLevel + i + 1;
        const threshold = this.simulationEngine["progressionManager"].calculateLevelThreshold(
          levelReached - 1
        );
        html += `<div style="color: #e0e0e0; margin-bottom: 4px;">`;
        html += `🎉 Reached Level ${levelReached} (Required: ${threshold.toFixed(2)} Soul Insight)`;
        html += `</div>`;
      }
      
      html += `</div>`;
    }

    summaryDiv.innerHTML = html;
    this.progressionSummary.appendChild(summaryDiv);
  }

  /**
   * Render boss summary
   */
  private renderBossSummary(boss: SimulationResult["boss"]): void {
    const summaryDiv = document.createElement("div");
    summaryDiv.style.marginBottom = "20px";
    summaryDiv.style.padding = "15px";
    summaryDiv.style.background = "#1e1e2e";
    summaryDiv.style.borderRadius = "8px";
    summaryDiv.style.border = "2px solid #4a4a6a";

    let html = `<h3 style="color: #a78bfa; margin-bottom: 15px;">Boss Status</h3>`;
    html += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">`;

    // Starting Resolve
    html += `
      <div>
        <div style="color: #9ca3af; font-size: 0.9em;">Starting Resolve</div>
        <div style="color: #e0e0e0; font-size: 1.5em; font-weight: bold;">${boss.startingResolve.toFixed(2)}</div>
      </div>
    `;

    // Remaining Resolve
    html += `
      <div>
        <div style="color: #9ca3af; font-size: 0.9em;">Remaining Resolve</div>
        <div style="color: ${boss.wasDefeated ? "#10b981" : "#e0e0e0"}; font-size: 1.5em; font-weight: bold;">
          ${boss.remainingResolve.toFixed(2)}
          ${boss.wasDefeated ? ' <span class="defeated-badge">DEFEATED</span>' : ""}
        </div>
      </div>
    `;

    // Damage dealt
    const damageDealt = boss.startingResolve - boss.remainingResolve;
    html += `
      <div>
        <div style="color: #9ca3af; font-size: 0.9em;">Damage Dealt</div>
        <div style="color: #ef4444; font-size: 1.5em; font-weight: bold;">${damageDealt.toFixed(2)}</div>
      </div>
    `;

    html += `</div>`;

    // Show overflow damage if boss was defeated
    if (boss.wasDefeated && boss.remainingResolve === 0) {
      const overflowDamage = damageDealt - boss.startingResolve;
      if (overflowDamage > 0) {
        html += `<div style="margin-top: 15px; padding: 10px; background: #065f46; border-radius: 6px; color: #d1fae5;">`;
        html += `⚔️ Boss defeated with ${overflowDamage.toFixed(2)} overflow damage!`;
        html += `</div>`;
      }
    }

    // Show next boss if available
    if (boss.nextBoss) {
      html += `<div style="margin-top: 15px; padding: 10px; background: #2d2d44; border-radius: 6px;">`;
      html += `<div style="color: #c4b5fd; font-weight: 600; margin-bottom: 8px;">Next Boss:</div>`;
      html += `<div style="color: #e0e0e0;">`;
      html += `${boss.nextBoss.name} (Resolve: ${boss.nextBoss.initialResolve}, Unlock Level: ${boss.nextBoss.unlockLevel})`;
      html += `</div>`;
      html += `</div>`;
    }

    summaryDiv.innerHTML = html;
    this.bossSummary.appendChild(summaryDiv);
  }

  /**
   * Render session results table
   */
  private renderSessionTable(sessions: SessionSimulationResult[]): void {
    if (sessions.length === 0) {
      return;
    }

    const tableContainer = document.createElement("div");
    tableContainer.style.marginTop = "20px";

    let html = `<h3 style="color: #a78bfa; margin-bottom: 15px;">Session Details</h3>`;
    html += `<p style="color: #9ca3af; font-size: 0.9em; margin-bottom: 10px;">Click on a row to view detailed calculation breakdown</p>`;
    
    // Create scrollable container for large result sets
    const scrollContainer = document.createElement("div");
    scrollContainer.style.overflowX = "auto";
    scrollContainer.style.maxHeight = sessions.length > 20 ? "600px" : "none";
    scrollContainer.style.overflowY = sessions.length > 20 ? "auto" : "visible";

    html += `
      <table id="session-table">
        <thead>
          <tr>
            <th>Session #</th>
            <th>Duration (min)</th>
            <th>Soul Insight</th>
            <th>Soul Embers</th>
            <th>Boss Damage</th>
            <th>Critical</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
    `;

    sessions.forEach((session) => {
      const rowClass = session.wasCritical ? "critical-hit" : "";
      const criticalIcon = session.wasCritical ? "⚡" : "";
      const compromisedClass = session.wasCompromised ? "compromised-session" : "";
      const compromisedIcon = session.wasCompromised ? "⚠️" : "";
      const compromisedText = session.wasCompromised
        ? '<span class="compromised">Compromised</span>'
        : "Normal";

      // Calculate base rewards (before compromise penalty) for display
      const baseSoulInsight = session.wasCompromised
        ? Math.round((session.soulInsight / 0.7) * 100) / 100
        : session.soulInsight;
      const baseSoulEmbers = session.wasCompromised
        ? Math.round((session.soulEmbers / 0.7) * 100) / 100
        : session.soulEmbers;

      // Format reward display with base and penalized values for compromised sessions
      const soulInsightDisplay = session.wasCompromised
        ? `<span style="text-decoration: line-through; color: #9ca3af;">${baseSoulInsight.toFixed(2)}</span> → <span style="color: #ef4444;">${session.soulInsight.toFixed(2)}</span>`
        : session.soulInsight.toFixed(2);
      
      const soulEmbersDisplay = session.wasCompromised
        ? `<span style="text-decoration: line-through; color: #9ca3af;">${baseSoulEmbers.toFixed(2)}</span> → <span style="color: #ef4444;">${session.soulEmbers.toFixed(2)}</span>`
        : session.soulEmbers.toFixed(2);

      html += `
        <tr class="${rowClass} ${compromisedClass} session-row" data-session="${session.sessionNumber}" style="cursor: pointer;">
          <td>${session.sessionNumber}</td>
          <td>${session.duration}</td>
          <td class="tooltip-trigger" data-tooltip-type="soulInsight" data-session-num="${session.sessionNumber}" style="cursor: help;">${compromisedIcon} ${soulInsightDisplay}</td>
          <td class="tooltip-trigger" data-tooltip-type="soulEmbers" data-session-num="${session.sessionNumber}" style="cursor: help;">${compromisedIcon} ${soulEmbersDisplay}</td>
          <td class="tooltip-trigger" data-tooltip-type="bossProgress" data-session-num="${session.sessionNumber}" style="cursor: help;">${session.bossProgress.toFixed(2)}</td>
          <td>${criticalIcon} ${session.wasCritical ? "Yes" : "No"}</td>
          <td>${compromisedText}</td>
        </tr>
        <tr class="session-details" id="details-${session.sessionNumber}" style="display: none;">
          <td colspan="7" style="background: #1e1e2e; padding: 15px;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
              <div>
                <div style="color: #c4b5fd; font-weight: 600; margin-bottom: 8px;">Soul Insight Calculation</div>
                <div style="color: #e0e0e0; font-size: 0.9em;">
                  Base: ${session.calculationDetails.baseSoulInsight.toFixed(2)}<br>
                  Spirit Bonus: ${(session.calculationDetails.spiritBonus * 100).toFixed(1)}%<br>
                  Critical Multiplier: ${session.calculationDetails.criticalMultiplier}x<br>
                  Compromise Penalty: ${session.calculationDetails.compromisePenalty}x<br>
                  <strong>Final: ${session.soulInsight.toFixed(2)}</strong>
                </div>
              </div>
              <div>
                <div style="color: #c4b5fd; font-weight: 600; margin-bottom: 8px;">Soul Embers Calculation</div>
                <div style="color: #e0e0e0; font-size: 0.9em;">
                  Base: ${session.calculationDetails.baseSoulEmbers.toFixed(2)}<br>
                  Soulflow Bonus: ${(session.calculationDetails.soulflowBonus * 100).toFixed(1)}%<br>
                  Critical Multiplier: ${session.calculationDetails.criticalMultiplier}x<br>
                  Compromise Penalty: ${session.calculationDetails.compromisePenalty}x<br>
                  <strong>Final: ${session.soulEmbers.toFixed(2)}</strong>
                </div>
              </div>
              <div>
                <div style="color: #c4b5fd; font-weight: 600; margin-bottom: 8px;">Boss Damage Calculation</div>
                <div style="color: #e0e0e0; font-size: 0.9em;">
                  Formula: spirit × duration × 0.5<br>
                  <strong>Damage: ${session.bossProgress.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    scrollContainer.innerHTML = html;
    tableContainer.innerHTML = `<h3 style="color: #a78bfa; margin-bottom: 15px;">Session Details</h3>`;
    tableContainer.innerHTML += `<p style="color: #9ca3af; font-size: 0.9em; margin-bottom: 10px;">Click on a row to view detailed calculation breakdown</p>`;
    tableContainer.appendChild(scrollContainer);
    this.sessionTableContainer.appendChild(tableContainer);

    // Add click event listeners to session rows
    const sessionRows = tableContainer.querySelectorAll(".session-row");
    sessionRows.forEach((row) => {
      row.addEventListener("click", (e) => {
        // Don't toggle if clicking on a tooltip trigger
        if ((e.target as HTMLElement).classList.contains("tooltip-trigger")) {
          return;
        }
        
        const sessionNumber = row.getAttribute("data-session");
        const detailsRow = document.getElementById(`details-${sessionNumber}`);
        
        if (detailsRow) {
          // Toggle visibility
          if (detailsRow.style.display === "none") {
            detailsRow.style.display = "table-row";
          } else {
            detailsRow.style.display = "none";
          }
        }
      });
    });

    // Add tooltip event listeners
    const tooltipTriggers = tableContainer.querySelectorAll(".tooltip-trigger");
    tooltipTriggers.forEach((trigger) => {
      trigger.addEventListener("mouseenter", () => {
        const sessionNum = parseInt(trigger.getAttribute("data-session-num") || "0", 10);
        const tooltipType = trigger.getAttribute("data-tooltip-type");
        const session = sessions.find((s) => s.sessionNumber === sessionNum);
        
        if (session && tooltipType) {
          let tooltipContent = "";
          
          if (tooltipType === "soulInsight") {
            // Calculate pre-penalty value for compromised sessions
            const prePenaltyValue = session.wasCompromised
              ? Math.round((session.soulInsight / 0.7) * 100) / 100
              : session.soulInsight;
            
            tooltipContent = `
              <div style="font-weight: 600; margin-bottom: 8px; color: #a78bfa;">Soul Insight Formula</div>
              <div style="margin-bottom: 4px;">duration × 10 × (1 + spirit × 0.1)</div>
              <div style="margin-bottom: 8px; font-size: 0.85em; color: #9ca3af;">
                ${session.duration} × 10 × (1 + ${session.calculationDetails.spiritBonus.toFixed(2)})
              </div>
              <div style="margin-bottom: 4px;">Base: ${session.calculationDetails.baseSoulInsight.toFixed(2)}</div>
              <div style="margin-bottom: 4px;">Critical: ×${session.calculationDetails.criticalMultiplier}</div>
              ${session.wasCompromised ? `<div style="margin-bottom: 4px; color: #9ca3af;">Before Penalty: ${prePenaltyValue.toFixed(2)}</div>` : ''}
              <div style="margin-bottom: 4px; ${session.wasCompromised ? 'color: #ef4444;' : ''}">Compromise: ×${session.calculationDetails.compromisePenalty}${session.wasCompromised ? ' (30% reduction)' : ''}</div>
              <div style="font-weight: 600; margin-top: 8px;">Final: ${session.soulInsight.toFixed(2)}</div>
            `;
          } else if (tooltipType === "soulEmbers") {
            // Calculate pre-penalty value for compromised sessions
            const prePenaltyValue = session.wasCompromised
              ? Math.round((session.soulEmbers / 0.7) * 100) / 100
              : session.soulEmbers;
            
            tooltipContent = `
              <div style="font-weight: 600; margin-bottom: 8px; color: #a78bfa;">Soul Embers Formula</div>
              <div style="margin-bottom: 4px;">duration × 2 × (1 + soulflow × 0.05)</div>
              <div style="margin-bottom: 8px; font-size: 0.85em; color: #9ca3af;">
                ${session.duration} × 2 × (1 + ${session.calculationDetails.soulflowBonus.toFixed(2)})
              </div>
              <div style="margin-bottom: 4px;">Base: ${session.calculationDetails.baseSoulEmbers.toFixed(2)}</div>
              <div style="margin-bottom: 4px;">Critical: ×${session.calculationDetails.criticalMultiplier}</div>
              ${session.wasCompromised ? `<div style="margin-bottom: 4px; color: #9ca3af;">Before Penalty: ${prePenaltyValue.toFixed(2)}</div>` : ''}
              <div style="margin-bottom: 4px; ${session.wasCompromised ? 'color: #ef4444;' : ''}">Compromise: ×${session.calculationDetails.compromisePenalty}${session.wasCompromised ? ' (30% reduction)' : ''}</div>
              <div style="font-weight: 600; margin-top: 8px;">Final: ${session.soulEmbers.toFixed(2)}</div>
            `;
          } else if (tooltipType === "bossProgress") {
            tooltipContent = `
              <div style="font-weight: 600; margin-bottom: 8px; color: #a78bfa;">Boss Damage Formula</div>
              <div style="margin-bottom: 4px;">spirit × duration × 0.5</div>
              <div style="margin-bottom: 8px; font-size: 0.85em; color: #9ca3af;">
                (calculated from player stats)
              </div>
              <div style="font-weight: 600;">Damage: ${session.bossProgress.toFixed(2)}</div>
            `;
          }
          
          this.showTooltip(trigger as HTMLElement, tooltipContent);
        }
      });
    });
  }

  /**
   * Show error message
   */
  showError(message: string): void {
    this.errorMessage.textContent = message;
    this.errorMessage.classList.add("show");
  }

  /**
   * Hide error message
   */
  private hideError(): void {
    this.errorMessage.classList.remove("show");
  }

  /**
   * Show warning message
   */
  showWarning(message: string): void {
    this.warningMessage.textContent = message;
    this.warningMessage.classList.add("show");
  }

  /**
   * Hide warning message
   */
  private hideWarning(): void {
    this.warningMessage.classList.remove("show");
  }

  /**
   * Hide results panel
   */
  private hideResults(): void {
    this.resultsPanel.classList.remove("show");
  }

  /**
   * Show tooltip with calculation details
   * @param element Element to attach tooltip to
   * @param content Tooltip content
   */
  showTooltip(element: HTMLElement, content: string): void {
    // Create tooltip element
    const tooltip = document.createElement("div");
    tooltip.className = "calculation-tooltip";
    tooltip.innerHTML = content;
    tooltip.style.position = "absolute";
    tooltip.style.background = "#1e1e2e";
    tooltip.style.border = "2px solid #a78bfa";
    tooltip.style.borderRadius = "8px";
    tooltip.style.padding = "12px";
    tooltip.style.color = "#e0e0e0";
    tooltip.style.fontSize = "0.9em";
    tooltip.style.zIndex = "1000";
    tooltip.style.maxWidth = "300px";
    tooltip.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
    tooltip.style.pointerEvents = "none";

    // Position tooltip near the element
    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.left}px`;
    tooltip.style.top = `${rect.bottom + 5}px`;

    // Add tooltip to document
    document.body.appendChild(tooltip);

    // Remove tooltip on mouse leave
    const removeTooltip = () => {
      if (tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
      }
      element.removeEventListener("mouseleave", removeTooltip);
    };

    element.addEventListener("mouseleave", removeTooltip);
  }
}

// ============================================================================
// Initialize on page load
// ============================================================================

// Only initialize if we're in a browser environment (not in tests)
if (typeof document !== "undefined") {
  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      const uiController = new UIController();
      uiController.initializeForm();
    });
  } else {
    // DOM is already ready
    const uiController = new UIController();
    uiController.initializeForm();
  }
}

// ============================================================================
// Export for use in dev-screen.html
// ============================================================================

export {
  SimulationEngine,
  UIController,
  createMockSession,
  validateSessionDuration,
  validateSessionCount,
  validateStatValue,
  validateLevel,
  checkHarmonyWarning,
};
export type {
  SimulationConfig,
  SessionSimulationResult,
  SimulationResult,
  ValidationResult,
};
