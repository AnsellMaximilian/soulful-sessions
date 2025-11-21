// ============================================================================
// Content Script for Soul Shepherd Extension
// Handles discouraged site warnings during focus sessions
// ============================================================================

import { SiteStatus } from "./types";

// ============================================================================
// Global State
// ============================================================================

let overlayElement: HTMLElement | null = null;
let isDismissed = false;
let currentUrl = "";

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize content script on page load
 */
async function init(): Promise<void> {
  console.log("[Content] Content script loaded on:", window.location.href);

  currentUrl = window.location.href;

  // Check if this URL should show a warning
  await checkCurrentUrl();

  // Listen for navigation events (for single-page apps)
  observeUrlChanges();
}

// ============================================================================
// URL Checking
// ============================================================================

/**
 * Check current URL with background worker
 */
async function checkCurrentUrl(): Promise<void> {
  try {
    const response = await chrome.runtime.sendMessage({
      type: "CHECK_URL",
      payload: { url: currentUrl },
    });

    if (!response || !response.success) {
      console.error("[Content] Failed to check URL:", response?.error);
      return;
    }

    const { status, domain } = response.data;

    console.log(`[Content] URL status: ${status}, domain: ${domain}`);

    // If discouraged, notify background and potentially show overlay
    if (status === SiteStatus.DISCOURAGED) {
      // Notify background of visit
      chrome.runtime.sendMessage({
        type: "SITE_VISITED",
        payload: { url: currentUrl },
      });

      // Request current session state to determine if we should show overlay
      const stateResponse = await chrome.runtime.sendMessage({
        type: "GET_STATE",
      });

      if (stateResponse?.success) {
        const state = stateResponse.data;

        // Only show overlay if there's an active session
        if (state.session && state.session.isActive) {
          showWarningOverlay(domain);
        }
      }
    } else if (status === SiteStatus.BLOCKED) {
      // Blocked sites are handled by declarativeNetRequest
      // This shouldn't normally be reached, but notify background anyway
      chrome.runtime.sendMessage({
        type: "SITE_VISITED",
        payload: { url: currentUrl },
      });
    }
  } catch (error) {
    console.error("[Content] Error checking URL:", error);
  }
}

/**
 * Observe URL changes for single-page applications
 */
function observeUrlChanges(): void {
  // Listen for history API changes
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    handleUrlChange();
  };

  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    handleUrlChange();
  };

  // Listen for popstate (back/forward buttons)
  window.addEventListener("popstate", handleUrlChange);

  // Listen for hashchange
  window.addEventListener("hashchange", handleUrlChange);
}

/**
 * Handle URL change event
 */
function handleUrlChange(): void {
  const newUrl = window.location.href;

  if (newUrl !== currentUrl) {
    console.log("[Content] URL changed:", newUrl);
    currentUrl = newUrl;
    isDismissed = false; // Reset dismissal on navigation
    removeOverlay(); // Remove old overlay
    checkCurrentUrl(); // Check new URL
  }
}

// ============================================================================
// Overlay Management
// ============================================================================

/**
 * Show warning overlay for discouraged site
 */
function showWarningOverlay(domain: string | null): void {
  // Don't show if already dismissed
  if (isDismissed) {
    console.log("[Content] Overlay dismissed, not showing");
    return;
  }

  // Don't show if overlay already exists
  if (overlayElement) {
    console.log("[Content] Overlay already exists");
    return;
  }

  console.log("[Content] Showing warning overlay for domain:", domain);

  // Create overlay container
  overlayElement = document.createElement("div");
  overlayElement.id = "soul-shepherd-warning-overlay";
  overlayElement.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 2147483647;
    background: linear-gradient(135deg, rgba(139, 69, 19, 0.95), rgba(101, 67, 33, 0.95));
    color: #f5e6d3;
    padding: 16px 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 16px;
    line-height: 1.5;
    animation: slideDown 0.3s ease-out;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  `;

  // Create message container
  const messageContainer = document.createElement("div");
  messageContainer.style.cssText = `
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
  `;

  // Create icon
  const icon = document.createElement("span");
  icon.textContent = "⚠️";
  icon.style.cssText = `
    font-size: 24px;
    flex-shrink: 0;
  `;

  // Create text
  const text = document.createElement("span");
  text.textContent =
    "The Soul Shepherd senses this realm drains your Spirit. Return to your task.";
  text.style.cssText = `
    font-weight: 500;
  `;

  // Create dismiss button
  const dismissButton = document.createElement("button");
  dismissButton.textContent = "Dismiss";
  dismissButton.style.cssText = `
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: #f5e6d3;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    flex-shrink: 0;
  `;

  dismissButton.addEventListener("mouseenter", () => {
    dismissButton.style.background = "rgba(255, 255, 255, 0.3)";
  });

  dismissButton.addEventListener("mouseleave", () => {
    dismissButton.style.background = "rgba(255, 255, 255, 0.2)";
  });

  dismissButton.addEventListener("click", () => {
    isDismissed = true;
    removeOverlay();
  });

  // Assemble overlay
  messageContainer.appendChild(icon);
  messageContainer.appendChild(text);
  overlayElement.appendChild(messageContainer);
  overlayElement.appendChild(dismissButton);

  // Add animation keyframes
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideDown {
      from {
        transform: translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);

  // Insert overlay at the beginning of body
  if (document.body) {
    document.body.insertBefore(overlayElement, document.body.firstChild);
  } else {
    // If body doesn't exist yet, wait for it
    const observer = new MutationObserver(() => {
      if (document.body && overlayElement) {
        document.body.insertBefore(overlayElement, document.body.firstChild);
        observer.disconnect();
      }
    });
    observer.observe(document.documentElement, { childList: true });
  }

  console.log("[Content] Warning overlay displayed");
}

/**
 * Remove warning overlay
 */
function removeOverlay(): void {
  if (overlayElement) {
    overlayElement.remove();
    overlayElement = null;
    console.log("[Content] Warning overlay removed");
  }
}

// ============================================================================
// Message Handling
// ============================================================================

/**
 * Listen for messages from background worker
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[Content] Received message:", message.type);

  switch (message.type) {
    case "SESSION_STARTED":
      // Session started, check if we should show overlay
      isDismissed = false;
      checkCurrentUrl();
      break;

    case "SESSION_ENDED":
    case "BREAK_STARTED":
      // Session ended or break started, remove overlay
      removeOverlay();
      isDismissed = false;
      break;

    case "SHOW_WARNING":
      // Background explicitly requests showing warning
      if (message.payload?.domain) {
        showWarningOverlay(message.payload.domain);
      }
      break;

    case "HIDE_WARNING":
      // Background explicitly requests hiding warning
      removeOverlay();
      break;
  }

  sendResponse({ success: true });
  return true;
});

// ============================================================================
// Start
// ============================================================================

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
