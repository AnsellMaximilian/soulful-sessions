import {
  BossResult,
  LevelResult,
  StubbornSoul,
  PlayerState,
  ProgressionState,
} from "./types";
import { STUBBORN_SOULS, FORMULAS } from "./constants";

// ============================================================================
// ProgressionManager Class
// ============================================================================

/**
 * ProgressionManager handles boss progression, level-up calculations,
 * and skill point allocation for the Soul Shepherd game.
 */
export class ProgressionManager {
  /**
   * Apply damage to the current boss and check for defeat
   * @param damage - Amount of damage to deal to boss Resolve
   * @param currentState - Current progression state
   * @param playerLevel - Current player level (for unlock checks)
   * @returns BossResult with updated Resolve and defeat status
   */
  damageBoss(
    damage: number,
    currentState: ProgressionState,
    playerLevel: number
  ): BossResult {
    const currentBoss = this.getCurrentBoss(currentState);

    // Reduce boss Resolve by damage amount
    const newResolve = Math.max(0, currentState.currentBossResolve - damage);

    // Check if boss was defeated
    const wasDefeated = newResolve === 0;

    let nextBoss: StubbornSoul | undefined = undefined;

    if (wasDefeated) {
      // Boss defeated - check if there's a next boss
      const nextBossIndex = currentState.currentBossIndex + 1;

      if (nextBossIndex < STUBBORN_SOULS.length) {
        nextBoss = STUBBORN_SOULS[nextBossIndex];

        // Check if player level meets unlock requirement
        if (playerLevel < nextBoss.unlockLevel) {
          console.log(
            `[ProgressionManager] Next boss "${nextBoss.name}" requires level ${nextBoss.unlockLevel}, player is level ${playerLevel}`
          );
        }
      } else {
        console.log(
          "[ProgressionManager] All bosses defeated! Player has completed the campaign."
        );
      }
    }

    return {
      remainingResolve: newResolve,
      wasDefeated,
      nextBoss,
    };
  }

  /**
   * Get the current Stubborn Soul boss
   * @param currentState - Current progression state
   * @returns Current StubbornSoul
   */
  getCurrentBoss(currentState: ProgressionState): StubbornSoul {
    const bossIndex = Math.max(
      0,
      Math.min(currentState.currentBossIndex, STUBBORN_SOULS.length - 1)
    );
    return STUBBORN_SOULS[bossIndex];
  }

  /**
   * Unlock the next boss in the sequence
   * Updates progression state to move to next boss
   * @param currentState - Current progression state
   * @param playerLevel - Current player level (for validation)
   * @returns Updated ProgressionState with next boss
   */
  unlockNextBoss(
    currentState: ProgressionState,
    playerLevel: number
  ): ProgressionState {
    const currentBossId = currentState.currentBossIndex;
    const nextBossIndex = currentBossId + 1;

    // Check if there is a next boss
    if (nextBossIndex >= STUBBORN_SOULS.length) {
      console.warn(
        "[ProgressionManager] Cannot unlock next boss - already at final boss"
      );
      return currentState;
    }

    const nextBoss = STUBBORN_SOULS[nextBossIndex];

    // Validate player level meets unlock requirement
    if (playerLevel < nextBoss.unlockLevel) {
      console.warn(
        `[ProgressionManager] Cannot unlock boss "${nextBoss.name}" - requires level ${nextBoss.unlockLevel}, player is level ${playerLevel}`
      );
      return currentState;
    }

    // Add current boss to defeated list
    const updatedDefeatedBosses = [
      ...currentState.defeatedBosses,
      currentBossId,
    ];

    console.log(
      `[ProgressionManager] Unlocking next boss: "${nextBoss.name}" (ID: ${nextBoss.id})`
    );

    return {
      ...currentState,
      currentBossIndex: nextBossIndex,
      currentBossResolve: nextBoss.initialResolve,
      defeatedBosses: updatedDefeatedBosses,
    };
  }

  /**
   * Add Soul Insight experience and check for level-up
   * Formula: Level threshold = 100 * (level ^ 1.5)
   * @param soulInsight - Amount of Soul Insight to add
   * @param currentPlayer - Current player state
   * @returns LevelResult with new level and skill points granted
   */
  addExperience(soulInsight: number, currentPlayer: PlayerState): LevelResult {
    const newTotalSoulInsight = currentPlayer.soulInsight + soulInsight;
    let currentLevel = currentPlayer.level;
    let skillPointsGranted = 0;
    let leveledUp = false;

    // Calculate how much XP is needed for next level
    let xpToNextLevel = this.calculateLevelThreshold(currentLevel);

    // Check for level-ups (can level up multiple times in one session)
    while (newTotalSoulInsight >= xpToNextLevel) {
      currentLevel++;
      skillPointsGranted += FORMULAS.SKILL_POINTS_PER_LEVEL;
      leveledUp = true;

      console.log(
        `[ProgressionManager] Level up! New level: ${currentLevel}, Skill points granted: ${FORMULAS.SKILL_POINTS_PER_LEVEL}`
      );

      // Calculate next level threshold
      xpToNextLevel = this.calculateLevelThreshold(currentLevel);
    }

    return {
      newLevel: currentLevel,
      leveledUp,
      skillPointsGranted,
    };
  }

  /**
   * Calculate the Soul Insight threshold for a given level
   * Formula: 100 * (level ^ 1.5)
   * @param level - Target level
   * @returns Soul Insight required to reach that level
   */
  calculateLevelThreshold(level: number): number {
    return Math.floor(
      FORMULAS.LEVEL_THRESHOLD_BASE *
        Math.pow(level, FORMULAS.LEVEL_THRESHOLD_EXPONENT)
    );
  }

  /**
   * Grant skill points to the player
   * @param currentSkillPoints - Current skill points
   * @param amount - Number of skill points to grant
   * @returns Updated skill point total
   */
  grantSkillPoints(currentSkillPoints: number, amount: number): number {
    return currentSkillPoints + amount;
  }
}
