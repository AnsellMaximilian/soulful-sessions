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

    // Compromised checkbox
    this.compromisedCheckbox.addEventListener("change", () => {
      // No automatic re-simulation, user must click simulate again
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
    // Implementation will be added in task 4.1
    console.log("Rendering results:", result);
    this.resultsPanel.classList.add("show");
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
