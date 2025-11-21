import { SiteStatus } from "./types";

// ============================================================================
// NavigationMonitor Class
// ============================================================================

/**
 * NavigationMonitor handles URL monitoring during focus sessions.
 * Checks visited sites against discouraged and blocked lists.
 * Communicates with background worker to mark sessions as compromised.
 */
export class NavigationMonitor {
  private isMonitoring: boolean = false;
  private navigationListener:
    | ((
        details: chrome.webNavigation.WebNavigationTransitionCallbackDetails
      ) => void)
    | null = null;

  /**
   * Start monitoring navigation events
   * Registers chrome.webNavigation.onCommitted listener
   */
  startMonitoring(): void {
    if (this.isMonitoring) {
      console.warn("[NavigationMonitor] Already monitoring navigation");
      return;
    }

    // Create listener function
    this.navigationListener = (
      details: chrome.webNavigation.WebNavigationTransitionCallbackDetails
    ) => {
      this.handleNavigation(details);
    };

    // Register listener
    chrome.webNavigation.onCommitted.addListener(this.navigationListener);

    this.isMonitoring = true;
    console.log("[NavigationMonitor] Started monitoring navigation");
  }

  /**
   * Stop monitoring navigation events
   * Removes chrome.webNavigation.onCommitted listener
   */
  stopMonitoring(): void {
    if (!this.isMonitoring || !this.navigationListener) {
      console.warn("[NavigationMonitor] Not currently monitoring navigation");
      return;
    }

    // Remove listener
    chrome.webNavigation.onCommitted.removeListener(this.navigationListener);

    this.navigationListener = null;
    this.isMonitoring = false;
    console.log("[NavigationMonitor] Stopped monitoring navigation");
  }

  /**
   * Check if a URL is discouraged or blocked
   * @param url Full URL to check
   * @param discouragedSites List of discouraged domains
   * @param blockedSites List of blocked domains
   * @param strictMode Whether strict mode is enabled
   * @returns Site status (ALLOWED, DISCOURAGED, or BLOCKED)
   */
  checkUrl(
    url: string,
    discouragedSites: string[],
    blockedSites: string[],
    strictMode: boolean
  ): SiteStatus {
    try {
      // Extract domain from URL
      const domain = this.extractDomain(url);

      if (!domain) {
        return SiteStatus.ALLOWED;
      }

      // Check blocked sites first (only if strict mode is enabled)
      if (strictMode && this.isDomainInList(domain, blockedSites)) {
        console.log(`[NavigationMonitor] Blocked site detected: ${domain}`);
        return SiteStatus.BLOCKED;
      }

      // Check discouraged sites
      if (this.isDomainInList(domain, discouragedSites)) {
        console.log(`[NavigationMonitor] Discouraged site detected: ${domain}`);
        return SiteStatus.DISCOURAGED;
      }

      return SiteStatus.ALLOWED;
    } catch (error) {
      console.error("[NavigationMonitor] Error checking URL:", error);
      return SiteStatus.ALLOWED; // Fail open - don't block on errors
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Handle navigation event
   * Checks URL and sends message to background if discouraged/blocked
   */
  private handleNavigation(
    details: chrome.webNavigation.WebNavigationTransitionCallbackDetails
  ): void {
    // Only process main frame navigations (not iframes)
    if (details.frameId !== 0) {
      return;
    }

    const url = details.url;

    // Skip chrome:// and extension:// URLs
    if (url.startsWith("chrome://") || url.startsWith("chrome-extension://")) {
      return;
    }

    console.log(`[NavigationMonitor] Navigation detected: ${url}`);

    // Send URL to background for checking
    chrome.runtime
      .sendMessage({
        type: "SITE_VISITED",
        payload: { url },
      })
      .catch((error) => {
        // Ignore errors if background is not ready
        if (!error.message.includes("Receiving end does not exist")) {
          console.error("[NavigationMonitor] Error sending message:", error);
        }
      });
  }

  /**
   * Extract domain from URL
   * @param url Full URL
   * @returns Domain (e.g., "example.com") or null if invalid
   */
  private extractDomain(url: string): string | null {
    try {
      const urlObj = new URL(url);
      let hostname = urlObj.hostname;

      // Remove www. prefix if present
      if (hostname.startsWith("www.")) {
        hostname = hostname.substring(4);
      }

      return hostname;
    } catch (error) {
      console.error("[NavigationMonitor] Invalid URL:", url, error);
      return null;
    }
  }

  /**
   * Check if domain matches any entry in the list
   * Supports exact matches and wildcard subdomains
   * @param domain Domain to check (e.g., "example.com")
   * @param list List of domains to check against
   * @returns True if domain matches any entry in list
   */
  private isDomainInList(domain: string, list: string[]): boolean {
    for (const entry of list) {
      // Exact match
      if (domain === entry) {
        return true;
      }

      // Subdomain match (e.g., "example.com" matches "sub.example.com")
      if (domain.endsWith(`.${entry}`)) {
        return true;
      }

      // Wildcard match (e.g., "*.example.com" matches "sub.example.com")
      if (entry.startsWith("*.")) {
        const baseDomain = entry.substring(2);
        if (domain === baseDomain || domain.endsWith(`.${baseDomain}`)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get monitoring status
   * @returns True if currently monitoring
   */
  isCurrentlyMonitoring(): boolean {
    return this.isMonitoring;
  }
}
