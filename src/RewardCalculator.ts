import { SessionState, SessionResult, PlayerStats } from "./types";
import { FORMULAS } from "./constants";

// ============================================================================
// RewardCalculator Class
// ============================================================================

/**
 * RewardCalculator handles reward calculations for completed focus sessions.
 * Implements formulas for Soul Insight, Soul Embers, critical hits, and boss damage.
 */
export class RewardCalculator {
  /**
   * Calculate rewards for a completed session
   * @param session Session state with timing information
   * @param stats Player stats (spirit, harmony, soulflow)
   * @returns Session result with calculated rewards
   */
  calculateRewards(session: SessionState, stats: PlayerStats): SessionResult {
    // Calculate actual session duration in minutes
    // Use active time (total time minus idle time)
    const elapsedMs = Date.now() - session.startTime;
    const totalMinutes = elapsedMs / (1000 * 60);
    const activeMinutes = totalMinutes - session.idleTime / 60;

    // Use the lesser of planned duration or actual active time
    const effectiveDuration = Math.min(session.duration, activeMinutes);

    // Calculate base Soul Insight
    // Formula: sessionDuration * 10 * (1 + spirit * 0.1)
    const baseSoulInsight =
      effectiveDuration *
      FORMULAS.SOUL_INSIGHT_BASE_MULTIPLIER *
      (1 + stats.spirit * FORMULAS.SOUL_INSIGHT_SPIRIT_BONUS);

    // Calculate base Soul Embers
    // Formula: sessionDuration * 2 * (1 + soulflow * 0.05)
    const baseSoulEmbers =
      effectiveDuration *
      FORMULAS.SOUL_EMBERS_BASE_MULTIPLIER *
      (1 + stats.soulflow * FORMULAS.SOUL_EMBERS_SOULFLOW_BONUS);

    // Check for critical hit
    const wasCritical = this.checkCritical(stats.harmony);

    // Apply critical hit multiplier if applicable
    let finalSoulInsight = baseSoulInsight;
    let finalSoulEmbers = baseSoulEmbers;

    if (wasCritical) {
      finalSoulInsight *= FORMULAS.CRITICAL_HIT_MULTIPLIER;
      finalSoulEmbers *= FORMULAS.CRITICAL_HIT_MULTIPLIER;
      console.log(
        "[RewardCalculator] Critical hit! Rewards multiplied by 1.5x"
      );
    }

    // Apply compromise penalty if session was compromised
    if (session.isCompromised) {
      finalSoulInsight = this.applyCompromisePenalty(finalSoulInsight);
      finalSoulEmbers = this.applyCompromisePenalty(finalSoulEmbers);
      console.log(
        "[RewardCalculator] Session compromised. Rewards reduced by 30%"
      );
    }

    // Calculate boss damage
    // Formula: spirit * sessionDuration * 0.5
    const bossProgress =
      stats.spirit * effectiveDuration * FORMULAS.BOSS_DAMAGE_MULTIPLIER;

    // Round rewards to 2 decimal places for display
    const result: SessionResult = {
      soulInsight: Math.round(finalSoulInsight * 100) / 100,
      soulEmbers: Math.round(finalSoulEmbers * 100) / 100,
      bossProgress: Math.round(bossProgress * 100) / 100,
      wasCritical: wasCritical,
      wasCompromised: session.isCompromised,
      idleTime: session.idleTime,
      activeTime: activeMinutes * 60, // Convert back to seconds
    };

    console.log(
      `[RewardCalculator] Rewards calculated: ${result.soulInsight} Soul Insight, ${result.soulEmbers} Soul Embers, ${result.bossProgress} boss damage`
    );

    return result;
  }

  /**
   * Check if a critical hit occurs based on Harmony stat
   * @param harmony Harmony stat value (represents crit chance)
   * @returns True if critical hit occurs
   */
  checkCritical(harmony: number): boolean {
    // Harmony represents critical hit chance as a decimal (e.g., 0.05 = 5%)
    const randomRoll = Math.random();
    return randomRoll < harmony;
  }

  /**
   * Apply compromise penalty to a reward value
   * @param baseReward Base reward amount before penalty
   * @returns Reduced reward amount (70% of original)
   */
  applyCompromisePenalty(baseReward: number): number {
    return baseReward * FORMULAS.COMPROMISE_PENALTY_MULTIPLIER;
  }
}
