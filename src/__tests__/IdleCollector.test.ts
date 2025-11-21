import { IdleCollector } from "../IdleCollector";

describe("IdleCollector", () => {
  let collector: IdleCollector;

  beforeEach(() => {
    collector = new IdleCollector();
  });

  describe("calculateIdleRate", () => {
    it("should calculate base rate with soulflow 1", () => {
      // Formula: 1 * (1 + 1 * 0.1) = 1.1
      const rate = collector.calculateIdleRate(1);
      expect(rate).toBe(1.1);
    });

    it("should calculate rate with soulflow 0", () => {
      // Formula: 1 * (1 + 0 * 0.1) = 1
      const rate = collector.calculateIdleRate(0);
      expect(rate).toBe(1);
    });

    it("should scale with higher soulflow", () => {
      // Formula: 1 * (1 + 5 * 0.1) = 1.5
      const rate = collector.calculateIdleRate(5);
      expect(rate).toBe(1.5);
    });

    it("should scale with very high soulflow", () => {
      // Formula: 1 * (1 + 10 * 0.1) = 2
      const rate = collector.calculateIdleRate(10);
      expect(rate).toBe(2);
    });
  });

  describe("collectIdleSouls", () => {
    it("should collect souls after 5 minutes with base soulflow", () => {
      const now = Date.now();
      const fiveMinutesAgo = now - 5 * 60 * 1000;

      const result = collector.collectIdleSouls(fiveMinutesAgo, 1);

      // 1 interval * 1.1 rate = 1 soul (floored)
      expect(result.soulsCollected).toBe(1);
      // 1 soul * 5 embers = 5 embers
      expect(result.embersEarned).toBe(5);
      expect(result.newCollectionTime).toBeGreaterThanOrEqual(now);
    });

    it("should collect souls after 10 minutes", () => {
      const now = Date.now();
      const tenMinutesAgo = now - 10 * 60 * 1000;

      const result = collector.collectIdleSouls(tenMinutesAgo, 1);

      // 2 intervals * 1.1 rate = 2.2 souls (floored to 2)
      expect(result.soulsCollected).toBe(2);
      // 2 souls * 5 embers = 10 embers
      expect(result.embersEarned).toBe(10);
    });

    it("should collect souls after 25 minutes", () => {
      const now = Date.now();
      const twentyFiveMinutesAgo = now - 25 * 60 * 1000;

      const result = collector.collectIdleSouls(twentyFiveMinutesAgo, 1);

      // 5 intervals * 1.1 rate = 5.5 souls (floored to 5)
      expect(result.soulsCollected).toBe(5);
      // 5 souls * 5 embers = 25 embers
      expect(result.embersEarned).toBe(25);
    });

    it("should collect more souls with higher soulflow", () => {
      const now = Date.now();
      const tenMinutesAgo = now - 10 * 60 * 1000;

      const result = collector.collectIdleSouls(tenMinutesAgo, 5);

      // 2 intervals * 1.5 rate = 3 souls
      expect(result.soulsCollected).toBe(3);
      // 3 souls * 5 embers = 15 embers
      expect(result.embersEarned).toBe(15);
    });

    it("should collect zero souls if less than 5 minutes elapsed", () => {
      const now = Date.now();
      const twoMinutesAgo = now - 2 * 60 * 1000;

      const result = collector.collectIdleSouls(twoMinutesAgo, 1);

      // 0.4 intervals * 1.1 rate = 0.44 souls (floored to 0)
      expect(result.soulsCollected).toBe(0);
      expect(result.embersEarned).toBe(0);
    });

    it("should handle long idle periods", () => {
      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;

      const result = collector.collectIdleSouls(oneHourAgo, 1);

      // 12 intervals * 1.1 rate = 13.2 souls (floored to 13)
      expect(result.soulsCollected).toBe(13);
      // 13 souls * 5 embers = 65 embers
      expect(result.embersEarned).toBe(65);
    });

    it("should convert souls to embers at 5:1 ratio", () => {
      const now = Date.now();
      const fifteenMinutesAgo = now - 15 * 60 * 1000;

      const result = collector.collectIdleSouls(fifteenMinutesAgo, 1);

      // 3 intervals * 1.1 rate = 3.3 souls (floored to 3)
      expect(result.soulsCollected).toBe(3);
      // Each soul = 5 embers
      expect(result.embersEarned).toBe(result.soulsCollected * 5);
    });

    it("should update collection time to current time", () => {
      const now = Date.now();
      const fiveMinutesAgo = now - 5 * 60 * 1000;

      const result = collector.collectIdleSouls(fiveMinutesAgo, 1);

      expect(result.newCollectionTime).toBeGreaterThanOrEqual(now);
      expect(result.newCollectionTime).toBeLessThanOrEqual(Date.now());
    });
  });

  describe("getTimeSinceLastCollection", () => {
    it("should calculate elapsed time correctly", () => {
      const now = Date.now();
      const fiveMinutesAgo = now - 5 * 60 * 1000;

      const elapsed = collector.getTimeSinceLastCollection(fiveMinutesAgo);

      expect(elapsed).toBeGreaterThanOrEqual(5 * 60 * 1000);
      expect(elapsed).toBeLessThan(5 * 60 * 1000 + 100); // Allow small margin
    });

    it("should return zero for current time", () => {
      const now = Date.now();

      const elapsed = collector.getTimeSinceLastCollection(now);

      expect(elapsed).toBeLessThan(10); // Should be very close to 0
    });

    it("should handle large time differences", () => {
      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;

      const elapsed = collector.getTimeSinceLastCollection(oneDayAgo);

      expect(elapsed).toBeGreaterThanOrEqual(24 * 60 * 60 * 1000);
    });
  });
});
