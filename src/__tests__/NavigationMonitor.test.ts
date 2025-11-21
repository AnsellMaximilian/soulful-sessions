import { NavigationMonitor } from "../NavigationMonitor";
import { SiteStatus } from "../types";

describe("NavigationMonitor", () => {
  let monitor: NavigationMonitor;

  beforeEach(() => {
    monitor = new NavigationMonitor();
  });

  describe("checkUrl", () => {
    const discouragedSites = ["reddit.com", "twitter.com", "youtube.com"];
    const blockedSites = ["facebook.com", "instagram.com"];

    it("should return ALLOWED for non-listed sites", () => {
      const status = monitor.checkUrl(
        "https://github.com",
        discouragedSites,
        blockedSites,
        false
      );
      expect(status).toBe(SiteStatus.ALLOWED);
    });

    it("should return DISCOURAGED for discouraged sites", () => {
      const status = monitor.checkUrl(
        "https://reddit.com/r/programming",
        discouragedSites,
        blockedSites,
        false
      );
      expect(status).toBe(SiteStatus.DISCOURAGED);
    });

    it("should return BLOCKED for blocked sites when strict mode enabled", () => {
      const status = monitor.checkUrl(
        "https://facebook.com",
        discouragedSites,
        blockedSites,
        true
      );
      expect(status).toBe(SiteStatus.BLOCKED);
    });

    it("should return ALLOWED for blocked sites when strict mode disabled", () => {
      const status = monitor.checkUrl(
        "https://facebook.com",
        discouragedSites,
        blockedSites,
        false
      );
      expect(status).toBe(SiteStatus.ALLOWED);
    });

    it("should match subdomains of discouraged sites", () => {
      const status = monitor.checkUrl(
        "https://old.reddit.com",
        discouragedSites,
        blockedSites,
        false
      );
      expect(status).toBe(SiteStatus.DISCOURAGED);
    });

    it("should match subdomains of blocked sites", () => {
      const status = monitor.checkUrl(
        "https://www.facebook.com",
        discouragedSites,
        blockedSites,
        true
      );
      expect(status).toBe(SiteStatus.BLOCKED);
    });

    it("should handle www prefix correctly", () => {
      const status = monitor.checkUrl(
        "https://www.reddit.com",
        discouragedSites,
        blockedSites,
        false
      );
      expect(status).toBe(SiteStatus.DISCOURAGED);
    });

    it("should handle wildcard patterns", () => {
      const wildcardSites = ["*.example.com"];
      const status = monitor.checkUrl(
        "https://sub.example.com",
        wildcardSites,
        [],
        false
      );
      expect(status).toBe(SiteStatus.DISCOURAGED);
    });

    it("should match exact domain with wildcard pattern", () => {
      const wildcardSites = ["*.example.com"];
      const status = monitor.checkUrl(
        "https://example.com",
        wildcardSites,
        [],
        false
      );
      expect(status).toBe(SiteStatus.DISCOURAGED);
    });

    it("should handle URLs with paths", () => {
      const status = monitor.checkUrl(
        "https://reddit.com/r/programming/comments/123",
        discouragedSites,
        blockedSites,
        false
      );
      expect(status).toBe(SiteStatus.DISCOURAGED);
    });

    it("should handle URLs with query parameters", () => {
      const status = monitor.checkUrl(
        "https://youtube.com/watch?v=abc123",
        discouragedSites,
        blockedSites,
        false
      );
      expect(status).toBe(SiteStatus.DISCOURAGED);
    });

    it("should prioritize BLOCKED over DISCOURAGED when both match", () => {
      const bothLists = ["reddit.com"];
      const status = monitor.checkUrl(
        "https://reddit.com",
        bothLists,
        bothLists,
        true
      );
      expect(status).toBe(SiteStatus.BLOCKED);
    });

    it("should handle invalid URLs gracefully", () => {
      const status = monitor.checkUrl(
        "not-a-valid-url",
        discouragedSites,
        blockedSites,
        false
      );
      expect(status).toBe(SiteStatus.ALLOWED);
    });

    it("should handle empty site lists", () => {
      const status = monitor.checkUrl("https://reddit.com", [], [], false);
      expect(status).toBe(SiteStatus.ALLOWED);
    });

    it("should be case-insensitive for domains", () => {
      const status = monitor.checkUrl(
        "https://REDDIT.COM",
        discouragedSites,
        blockedSites,
        false
      );
      expect(status).toBe(SiteStatus.DISCOURAGED);
    });

    it("should handle multiple subdomain levels", () => {
      const status = monitor.checkUrl(
        "https://api.v2.reddit.com",
        discouragedSites,
        blockedSites,
        false
      );
      expect(status).toBe(SiteStatus.DISCOURAGED);
    });

    it("should not match partial domain names", () => {
      const status = monitor.checkUrl(
        "https://notreddit.com",
        discouragedSites,
        blockedSites,
        false
      );
      expect(status).toBe(SiteStatus.ALLOWED);
    });

    it("should handle URLs with ports", () => {
      const status = monitor.checkUrl(
        "https://reddit.com:8080",
        discouragedSites,
        blockedSites,
        false
      );
      expect(status).toBe(SiteStatus.DISCOURAGED);
    });

    it("should handle http and https protocols", () => {
      const httpStatus = monitor.checkUrl(
        "http://reddit.com",
        discouragedSites,
        blockedSites,
        false
      );
      const httpsStatus = monitor.checkUrl(
        "https://reddit.com",
        discouragedSites,
        blockedSites,
        false
      );

      expect(httpStatus).toBe(SiteStatus.DISCOURAGED);
      expect(httpsStatus).toBe(SiteStatus.DISCOURAGED);
    });
  });

  describe("isCurrentlyMonitoring", () => {
    it("should return false initially", () => {
      expect(monitor.isCurrentlyMonitoring()).toBe(false);
    });
  });
});
