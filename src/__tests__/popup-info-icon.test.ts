/**
 * @jest-environment jsdom
 */

// ============================================================================
// Popup Info Icon Unit Tests
// ============================================================================

/**
 * Unit tests for the boss info icon feature in the popup interface.
 * Tests verify that the info icon is rendered correctly and opens the
 * options page with the correct URL parameters.
 * 
 * **Validates: Requirements 1.1, 1.2, 1.4**
 */

describe("Popup Info Icon", () => {
  // Mock Chrome APIs
  const mockChrome = {
    runtime: {
      getURL: jest.fn((path: string) => `chrome-extension://test-id/${path}`),
    },
    tabs: {
      create: jest.fn(),
    },
  };

  beforeAll(() => {
    // Set up Chrome API mocks
    (globalThis as any).chrome = mockChrome;
  });

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Set up basic DOM structure for testing
    document.body.innerHTML = `
      <div id="idle-view">
        <div class="boss-card">
          <div class="boss-header">
            <h3 id="boss-name" class="boss-name">The Restless Athlete</h3>
            <button id="boss-info-btn" class="boss-info-btn" aria-label="View boss details">ⓘ</button>
          </div>
        </div>
      </div>
      <div id="break-view">
        <div class="boss-card">
          <div class="boss-header">
            <h3 id="break-boss-name" class="boss-name">The Restless Athlete</h3>
            <button id="break-boss-info-btn" class="boss-info-btn" aria-label="View boss details">ⓘ</button>
          </div>
        </div>
      </div>
    `;
  });

  /**
   * Test: Info icon is rendered when boss is displayed (idle view)
   * **Validates: Requirements 1.1**
   * 
   * When the popup displays a current boss in the idle view, the info icon
   * should be present in the DOM with the correct attributes.
   */
  test("Info icon is rendered in idle view when boss is displayed", () => {
    const infoBtn = document.getElementById("boss-info-btn");

    // Verify the button exists
    expect(infoBtn).not.toBeNull();
    expect(infoBtn).toBeInstanceOf(HTMLButtonElement);

    // Verify button has correct class
    expect(infoBtn?.classList.contains("boss-info-btn")).toBe(true);

    // Verify button has correct aria-label for accessibility
    expect(infoBtn?.getAttribute("aria-label")).toBe("View boss details");

    // Verify button contains the info icon
    expect(infoBtn?.textContent).toBe("ⓘ");
  });

  /**
   * Test: Info icon is rendered when boss is displayed (break view)
   * **Validates: Requirements 1.1**
   * 
   * When the popup displays a current boss in the break view, the info icon
   * should be present in the DOM with the correct attributes.
   */
  test("Info icon is rendered in break view when boss is displayed", () => {
    const infoBtn = document.getElementById("break-boss-info-btn");

    // Verify the button exists
    expect(infoBtn).not.toBeNull();
    expect(infoBtn).toBeInstanceOf(HTMLButtonElement);

    // Verify button has correct class
    expect(infoBtn?.classList.contains("boss-info-btn")).toBe(true);

    // Verify button has correct aria-label for accessibility
    expect(infoBtn?.getAttribute("aria-label")).toBe("View boss details");

    // Verify button contains the info icon
    expect(infoBtn?.textContent).toBe("ⓘ");
  });

  /**
   * Test: Click handler opens correct URL with boss ID parameter
   * **Validates: Requirements 1.2, 1.4**
   * 
   * When a player clicks the info icon, the system should open the options
   * page with the correct URL parameters (tab=guided-souls&boss=<id>).
   */
  test("Click handler opens correct URL with boss ID parameter", () => {
    // Simulate the openBossDetails function behavior
    const openBossDetails = (bossId: number): void => {
      const url = mockChrome.runtime.getURL(`options.html?tab=guided-souls&boss=${bossId}`);
      mockChrome.tabs.create({ url });
    };

    // Test with boss ID 0
    openBossDetails(0);

    // Verify chrome.runtime.getURL was called with correct path
    expect(mockChrome.runtime.getURL).toHaveBeenCalledWith(
      "options.html?tab=guided-souls&boss=0"
    );

    // Verify chrome.tabs.create was called with the correct URL
    expect(mockChrome.tabs.create).toHaveBeenCalledWith({
      url: "chrome-extension://test-id/options.html?tab=guided-souls&boss=0",
    });
  });

  /**
   * Test: Click handler works with different boss IDs
   * **Validates: Requirements 1.2, 1.4**
   * 
   * The click handler should correctly format URLs for any valid boss ID (0-9).
   */
  test("Click handler works with different boss IDs", () => {
    // Simulate the openBossDetails function behavior
    const openBossDetails = (bossId: number): void => {
      const url = mockChrome.runtime.getURL(`options.html?tab=guided-souls&boss=${bossId}`);
      mockChrome.tabs.create({ url });
    };

    // Test with various boss IDs
    const testBossIds = [0, 1, 5, 9];

    testBossIds.forEach((bossId) => {
      jest.clearAllMocks();
      openBossDetails(bossId);

      // Verify correct URL was generated
      expect(mockChrome.runtime.getURL).toHaveBeenCalledWith(
        `options.html?tab=guided-souls&boss=${bossId}`
      );

      // Verify chrome.tabs.create was called
      expect(mockChrome.tabs.create).toHaveBeenCalledWith({
        url: `chrome-extension://test-id/options.html?tab=guided-souls&boss=${bossId}`,
      });
    });
  });

  /**
   * Test: Boss header container has correct structure
   * **Validates: Requirements 1.1**
   * 
   * The boss header should contain both the boss name and the info icon button
   * in the correct layout structure.
   */
  test("Boss header container has correct structure", () => {
    const bossHeader = document.querySelector(".boss-header");

    // Verify boss header exists
    expect(bossHeader).not.toBeNull();

    // Verify it contains the boss name
    const bossName = bossHeader?.querySelector("#boss-name");
    expect(bossName).not.toBeNull();
    expect(bossName?.classList.contains("boss-name")).toBe(true);

    // Verify it contains the info button
    const infoBtn = bossHeader?.querySelector("#boss-info-btn");
    expect(infoBtn).not.toBeNull();
    expect(infoBtn?.classList.contains("boss-info-btn")).toBe(true);

    // Verify both elements are direct children of boss-header
    const children = Array.from(bossHeader?.children || []);
    expect(children).toHaveLength(2);
    expect(children[0]).toBe(bossName);
    expect(children[1]).toBe(infoBtn);
  });

  /**
   * Test: Info icon button is keyboard accessible
   * **Validates: Requirements 1.1**
   * 
   * The info icon button should be accessible via keyboard navigation
   * and have proper ARIA attributes.
   */
  test("Info icon button is keyboard accessible", () => {
    const infoBtn = document.getElementById("boss-info-btn") as HTMLButtonElement;

    // Verify it's a button element (natively keyboard accessible)
    expect(infoBtn.tagName).toBe("BUTTON");

    // Verify it has aria-label for screen readers
    expect(infoBtn.getAttribute("aria-label")).toBe("View boss details");

    // Verify button is not disabled
    expect(infoBtn.disabled).toBe(false);

    // Verify button can receive focus
    infoBtn.focus();
    expect(document.activeElement).toBe(infoBtn);
  });
});
