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
// Export for use in dev-screen.html
// ============================================================================

export { SimulationEngine, createMockSession };
export type {
  SimulationConfig,
  SessionSimulationResult,
  SimulationResult,
};
