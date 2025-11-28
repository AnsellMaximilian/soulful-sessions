import { RewardCalculator } from "../RewardCalculator";
import { SessionState, PlayerStats } from "../types";

describe("RewardCalculator", () => {
  let calculator: RewardCalculator;

  beforeEach(() => {
    calculator = new RewardCalculator();
  });

  describe("calculateRewards", () => {
    it("should calculate base Soul Insight correctly", () => {
      const session: SessionState = {
        startTime: Date.now() - 25 * 60 * 1000, // 25 minutes ago
        duration: 25,
        taskId: "test-task",
        isActive: true,
        isPaused: false,
        isCompromised: false,
        idleTime: 0,
        activeTime: 25 * 60,
        autoCompleteTask: false,
      };

      const stats: PlayerStats = {
        spirit: 1,
        harmony: 0.05,
        soulflow: 1,
      };

      const result = calculator.calculateRewards(session, stats);

      // Formula: 25 * 10 * (1 + 1 * 0.1) = 25 * 10 * 1.1 = 275
      expect(result.soulInsight).toBe(275);
    });

    it("should calculate base Soul Embers correctly", () => {
      const session: SessionState = {
        startTime: Date.now() - 25 * 60 * 1000,
        duration: 25,
        taskId: "test-task",
        isActive: true,
        isPaused: false,
        isCompromised: false,
        idleTime: 0,
        activeTime: 25 * 60,
        autoCompleteTask: false,
      };

      const stats: PlayerStats = {
        spirit: 1,
        harmony: 0.05,
        soulflow: 1,
      };

      const result = calculator.calculateRewards(session, stats);

      // Formula: 25 * 2 * (1 + 1 * 0.05) = 25 * 2 * 1.05 = 52.5
      expect(result.soulEmbers).toBe(52.5);
    });

    it("should calculate boss damage correctly", () => {
      const session: SessionState = {
        startTime: Date.now() - 25 * 60 * 1000,
        duration: 25,
        taskId: "test-task",
        isActive: true,
        isPaused: false,
        isCompromised: false,
        idleTime: 0,
        activeTime: 25 * 60,
        autoCompleteTask: false,
      };

      const stats: PlayerStats = {
        spirit: 2,
        harmony: 0.05,
        soulflow: 1,
      };

      const result = calculator.calculateRewards(session, stats);

      // Formula: 2 * 25 * 0.5 = 25
      expect(result.bossProgress).toBe(25);
    });

    it("should apply compromise penalty correctly", () => {
      // Mock Math.random to ensure no critical hit
      jest.spyOn(Math, "random").mockReturnValue(0.99);

      const session: SessionState = {
        startTime: Date.now() - 25 * 60 * 1000,
        duration: 25,
        taskId: "test-task",
        isActive: true,
        isPaused: false,
        isCompromised: true,
        idleTime: 0,
        activeTime: 25 * 60,
        autoCompleteTask: false,
      };

      const stats: PlayerStats = {
        spirit: 1,
        harmony: 0.05,
        soulflow: 1,
      };

      const result = calculator.calculateRewards(session, stats);

      // Base: 275, with 0.7x penalty = 192.5
      expect(result.soulInsight).toBe(192.5);
      // Base: 52.5, with 0.7x penalty = 36.75
      expect(result.soulEmbers).toBe(36.75);
      expect(result.wasCompromised).toBe(true);

      jest.spyOn(Math, "random").mockRestore();
    });

    it("should scale rewards with higher stats", () => {
      const session: SessionState = {
        startTime: Date.now() - 25 * 60 * 1000,
        duration: 25,
        taskId: "test-task",
        isActive: true,
        isPaused: false,
        isCompromised: false,
        idleTime: 0,
        activeTime: 25 * 60,
        autoCompleteTask: false,
      };

      const stats: PlayerStats = {
        spirit: 5,
        harmony: 0.05,
        soulflow: 3,
      };

      const result = calculator.calculateRewards(session, stats);

      // Soul Insight: 25 * 10 * (1 + 5 * 0.1) = 25 * 10 * 1.5 = 375
      expect(result.soulInsight).toBe(375);
      // Soul Embers: 25 * 2 * (1 + 3 * 0.05) = 25 * 2 * 1.15 = 57.5
      expect(result.soulEmbers).toBe(57.5);
      // Boss damage: 5 * 25 * 0.5 = 62.5
      expect(result.bossProgress).toBe(62.5);
    });

    it("should handle idle time correctly", () => {
      const session: SessionState = {
        startTime: Date.now() - 30 * 60 * 1000, // 30 minutes ago
        duration: 25,
        taskId: "test-task",
        isActive: true,
        isPaused: false,
        isCompromised: false,
        idleTime: 5 * 60, // 5 minutes idle
        activeTime: 25 * 60,
        autoCompleteTask: false,
      };

      const stats: PlayerStats = {
        spirit: 1,
        harmony: 0.05,
        soulflow: 1,
      };

      const result = calculator.calculateRewards(session, stats);

      // Should use planned duration (25 min) not actual time (30 min)
      expect(result.soulInsight).toBe(275);
      expect(result.idleTime).toBe(300);
    });
  });

  describe("checkCritical", () => {
    it("should return true when random roll is below harmony", () => {
      // Mock Math.random to return 0.04 (below 0.05)
      jest.spyOn(Math, "random").mockReturnValue(0.04);

      const result = calculator.checkCritical(0.05);
      expect(result).toBe(true);

      jest.spyOn(Math, "random").mockRestore();
    });

    it("should return false when random roll is above harmony", () => {
      // Mock Math.random to return 0.06 (above 0.05)
      jest.spyOn(Math, "random").mockReturnValue(0.06);

      const result = calculator.checkCritical(0.05);
      expect(result).toBe(false);

      jest.spyOn(Math, "random").mockRestore();
    });

    it("should handle 0% crit chance", () => {
      const result = calculator.checkCritical(0);
      expect(result).toBe(false);
    });

    it("should handle 100% crit chance", () => {
      const result = calculator.checkCritical(1);
      expect(result).toBe(true);
    });
  });

  describe("applyCompromisePenalty", () => {
    it("should reduce reward by 30%", () => {
      const result = calculator.applyCompromisePenalty(100);
      expect(result).toBe(70);
    });

    it("should handle decimal values", () => {
      const result = calculator.applyCompromisePenalty(52.5);
      expect(result).toBe(36.75);
    });

    it("should handle zero", () => {
      const result = calculator.applyCompromisePenalty(0);
      expect(result).toBe(0);
    });
  });
});
