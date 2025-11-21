// ============================================================================
// IdleCollector Module
// ============================================================================

import { FORMULAS } from "./constants";

/**
 * IdleCollector handles passive Content Soul collection over time.
 * Implements idle collection formula and conversion to Soul Embers.
 */
export class IdleCollector {
  /**
   * Collect idle souls based on time elapsed since last collection
   * Formula: 1 soul per 5 minutes * (1 + soulflow * 0.1)
   * Converts Content Souls to Soul Embers at 5 embers per soul
   *
   * @param lastCollectionTime - Timestamp of last collection
   * @param soulflow - Player's soulflow stat
   * @returns Object with souls collected and embers earned
   */
  collectIdleSouls(
    lastCollectionTime: number,
    soulflow: number
  ): {
    soulsCollected: number;
    embersEarned: number;
    newCollectionTime: number;
  } {
    const now = Date.now();
    const elapsedMs = now - lastCollectionTime;
    const elapsedMinutes = elapsedMs / (1000 * 60);

    // Calculate idle collection rate based on soulflow
    const idleRate = this.calculateIdleRate(soulflow);

    // Calculate number of collection intervals (5 minutes each)
    const intervals = elapsedMinutes / FORMULAS.IDLE_COLLECTION_INTERVAL;

    // Calculate souls collected
    const soulsCollected = Math.floor(intervals * idleRate);

    // Convert to Soul Embers
    const embersEarned = soulsCollected * FORMULAS.CONTENT_SOUL_TO_EMBERS;

    console.log(
      `[IdleCollector] Collected ${soulsCollected} souls (${embersEarned} embers) over ${elapsedMinutes.toFixed(
        1
      )} minutes`
    );

    return {
      soulsCollected,
      embersEarned,
      newCollectionTime: now,
    };
  }

  /**
   * Calculate idle collection rate based on soulflow stat
   * Formula: 1 soul per 5 minutes * (1 + soulflow * 0.1)
   *
   * @param soulflow - Player's soulflow stat
   * @returns Collection rate (souls per interval)
   */
  calculateIdleRate(soulflow: number): number {
    const rate =
      FORMULAS.IDLE_COLLECTION_BASE_RATE *
      (1 + soulflow * FORMULAS.IDLE_COLLECTION_SOULFLOW_BONUS);

    return rate;
  }

  /**
   * Get time elapsed since last collection in milliseconds
   *
   * @param lastCollectionTime - Timestamp of last collection
   * @returns Elapsed time in milliseconds
   */
  getTimeSinceLastCollection(lastCollectionTime: number): number {
    return Date.now() - lastCollectionTime;
  }
}
