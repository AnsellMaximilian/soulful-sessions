import { SessionState, SessionResult } from "./types";

// ============================================================================
// SessionManager Class
// ============================================================================

/**
 * SessionManager handles focus session lifecycle and state tracking.
 * Manages session timers using chrome.alarms API and prevents concurrent sessions.
 */
export class SessionManager {
  private readonly SESSION_ALARM_NAME = "soulShepherd_sessionEnd";

  /**
   * Start a new focus session
   * @param duration Session duration in minutes
   * @param taskId ID of the task being worked on
   * @param autoCompleteTask Whether to mark task complete when session ends
   * @param currentSession Current session state (null if no active session)
   * @returns New session state
   * @throws Error if a session is already active
   */
  async startSession(
    duration: number,
    taskId: string,
    autoCompleteTask: boolean,
    currentSession: SessionState | null
  ): Promise<SessionState> {
    // Validate no concurrent sessions
    if (currentSession && currentSession.isActive) {
      throw new Error(
        "Cannot start a new session while another session is active"
      );
    }

    // Validate duration
    if (duration < 5 || duration > 120) {
      throw new Error("Session duration must be between 5 and 120 minutes");
    }

    // Create new session state
    const newSession: SessionState = {
      startTime: Date.now(),
      duration: duration,
      taskId: taskId,
      autoCompleteTask: autoCompleteTask,
      isActive: true,
      isPaused: false,
      isCompromised: false,
      idleTime: 0,
      activeTime: 0,
    };

    // Create alarm for session end
    await this.createSessionAlarm(duration);

    console.log(
      `[SessionManager] Session started: ${duration} minutes, task: ${taskId}, autoComplete: ${autoCompleteTask}`
    );

    return newSession;
  }

  /**
   * End the current focus session
   * @param session Current session state
   * @returns Session result with timing information
   * @throws Error if no active session
   */
  endSession(session: SessionState | null): SessionResult {
    if (!session || !session.isActive) {
      throw new Error("No active session to end");
    }

    // Calculate actual elapsed time
    const elapsedMs = Date.now() - session.startTime;
    const elapsedMinutes = elapsedMs / (1000 * 60);

    // Calculate active time (total time minus idle time)
    const totalSeconds = elapsedMinutes * 60;
    const activeSeconds = totalSeconds - session.idleTime;

    // Clear the session alarm
    this.clearSessionAlarm();

    console.log(
      `[SessionManager] Session ended: ${elapsedMinutes.toFixed(
        2
      )} minutes elapsed, ${session.idleTime}s idle, ${activeSeconds.toFixed(
        0
      )}s active`
    );

    // Return session result (rewards will be calculated by RewardCalculator)
    const result: SessionResult = {
      soulInsight: 0, // To be calculated by RewardCalculator
      soulEmbers: 0, // To be calculated by RewardCalculator
      bossProgress: 0, // To be calculated by RewardCalculator
      wasCritical: false, // To be determined by RewardCalculator
      wasCompromised: session.isCompromised,
      idleTime: session.idleTime,
      activeTime: activeSeconds,
    };

    return result;
  }

  /**
   * Pause the current session (user went idle)
   * @param session Current session state
   * @returns Updated session state
   * @throws Error if no active session or session already paused
   */
  pauseSession(session: SessionState | null): SessionState {
    if (!session || !session.isActive) {
      throw new Error("No active session to pause");
    }

    if (session.isPaused) {
      throw new Error("Session is already paused");
    }

    console.log("[SessionManager] Session paused (user idle detected)");

    return {
      ...session,
      isPaused: true,
    };
  }

  /**
   * Resume a paused session (user returned from idle)
   * @param session Current session state
   * @param idleSeconds Number of seconds user was idle
   * @returns Updated session state
   * @throws Error if no active session or session not paused
   */
  resumeSession(
    session: SessionState | null,
    idleSeconds: number
  ): SessionState {
    if (!session || !session.isActive) {
      throw new Error("No active session to resume");
    }

    if (!session.isPaused) {
      throw new Error("Session is not paused");
    }

    // Add idle time to session tracking
    const updatedIdleTime = session.idleTime + idleSeconds;

    // Calculate if session should be compromised due to excessive idle time
    const totalSessionSeconds = session.duration * 60;
    const idlePercentage = (updatedIdleTime / totalSessionSeconds) * 100;

    const isCompromised = session.isCompromised || idlePercentage > 25;

    if (idlePercentage > 25 && !session.isCompromised) {
      console.log(
        `[SessionManager] Session marked as compromised due to excessive idle time (${idlePercentage.toFixed(
          1
        )}%)`
      );
    }

    console.log(
      `[SessionManager] Session resumed after ${idleSeconds}s idle (total idle: ${updatedIdleTime}s)`
    );

    return {
      ...session,
      isPaused: false,
      idleTime: updatedIdleTime,
      isCompromised: isCompromised,
    };
  }

  /**
   * Get current session state
   * @param session Current session state
   * @returns Session state or null
   */
  getCurrentSession(session: SessionState | null): SessionState | null {
    return session;
  }

  /**
   * Mark session as compromised (e.g., visited discouraged site)
   * @param session Current session state
   * @returns Updated session state
   */
  markSessionCompromised(session: SessionState | null): SessionState {
    if (!session || !session.isActive) {
      throw new Error("No active session to mark as compromised");
    }

    console.log("[SessionManager] Session marked as compromised");

    return {
      ...session,
      isCompromised: true,
    };
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Create chrome.alarms timer for session end
   */
  private async createSessionAlarm(durationMinutes: number): Promise<void> {
    try {
      // Clear any existing session alarm first
      await chrome.alarms.clear(this.SESSION_ALARM_NAME);

      // Create new alarm
      await chrome.alarms.create(this.SESSION_ALARM_NAME, {
        delayInMinutes: durationMinutes,
      });

      console.log(
        `[SessionManager] Session alarm created for ${durationMinutes} minutes`
      );
    } catch (error) {
      console.error("[SessionManager] Failed to create session alarm:", error);
      throw new Error("Failed to create session timer");
    }
  }

  /**
   * Clear session alarm
   */
  private async clearSessionAlarm(): Promise<void> {
    try {
      const wasCleared = await chrome.alarms.clear(this.SESSION_ALARM_NAME);
      if (wasCleared) {
        console.log("[SessionManager] Session alarm cleared");
      }
    } catch (error) {
      console.error("[SessionManager] Failed to clear session alarm:", error);
      // Don't throw - this is cleanup, not critical
    }
  }
}
