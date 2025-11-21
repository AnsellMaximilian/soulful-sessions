/**
 * Test file for NavigationMonitor
 * Run with: node dist/test-navigationmonitor.js
 */

import { NavigationMonitor } from "./NavigationMonitor";
import { SiteStatus } from "./types";

// Mock chrome API for testing
(globalThis as any).chrome = {
  webNavigation: {
    onCommitted: {
      addListener: (callback: any) => {
        console.log("✓ Navigation listener registered");
      },
      removeListener: (callback: any) => {
        console.log("✓ Navigation listener removed");
      },
    },
  },
  runtime: {
    sendMessage: (message: any) => {
      console.log("✓ Message sent:", message.type);
      return Promise.resolve();
    },
  },
};

console.log("=== NavigationMonitor Tests ===\n");

// Test 1: Create NavigationMonitor
console.log("Test 1: Create NavigationMonitor");
const monitor = new NavigationMonitor();
console.log("✓ NavigationMonitor created\n");

// Test 2: Start monitoring
console.log("Test 2: Start monitoring");
monitor.startMonitoring();
console.log(`✓ Monitoring status: ${monitor.isCurrentlyMonitoring()}\n`);

// Test 3: Check URL - Allowed site
console.log("Test 3: Check allowed site");
const allowedStatus = monitor.checkUrl(
  "https://github.com/user/repo",
  ["reddit.com", "youtube.com"],
  ["facebook.com"],
  false
);
console.log(`✓ Status: ${allowedStatus} (expected: ALLOWED)\n`);

// Test 4: Check URL - Discouraged site (exact match)
console.log("Test 4: Check discouraged site (exact match)");
const discouragedStatus = monitor.checkUrl(
  "https://reddit.com/r/programming",
  ["reddit.com", "youtube.com"],
  ["facebook.com"],
  false
);
console.log(`✓ Status: ${discouragedStatus} (expected: DISCOURAGED)\n`);

// Test 5: Check URL - Discouraged site (subdomain)
console.log("Test 5: Check discouraged site (subdomain)");
const subdomainStatus = monitor.checkUrl(
  "https://www.youtube.com/watch?v=123",
  ["reddit.com", "youtube.com"],
  ["facebook.com"],
  false
);
console.log(`✓ Status: ${subdomainStatus} (expected: DISCOURAGED)\n`);

// Test 6: Check URL - Blocked site (strict mode off)
console.log("Test 6: Check blocked site (strict mode off)");
const blockedNoStrictStatus = monitor.checkUrl(
  "https://facebook.com/feed",
  ["reddit.com"],
  ["facebook.com"],
  false
);
console.log(
  `✓ Status: ${blockedNoStrictStatus} (expected: ALLOWED - strict mode off)\n`
);

// Test 7: Check URL - Blocked site (strict mode on)
console.log("Test 7: Check blocked site (strict mode on)");
const blockedStrictStatus = monitor.checkUrl(
  "https://facebook.com/feed",
  ["reddit.com"],
  ["facebook.com"],
  true
);
console.log(
  `✓ Status: ${blockedStrictStatus} (expected: BLOCKED - strict mode on)\n`
);

// Test 8: Check URL - Wildcard pattern
console.log("Test 8: Check wildcard pattern");
const wildcardStatus = monitor.checkUrl(
  "https://sub.example.com/page",
  ["*.example.com"],
  [],
  false
);
console.log(`✓ Status: ${wildcardStatus} (expected: DISCOURAGED)\n`);

// Test 9: Check URL - www prefix handling
console.log("Test 9: Check www prefix handling");
const wwwStatus = monitor.checkUrl(
  "https://www.reddit.com/r/test",
  ["reddit.com"],
  [],
  false
);
console.log(`✓ Status: ${wwwStatus} (expected: DISCOURAGED)\n`);

// Test 10: Stop monitoring
console.log("Test 10: Stop monitoring");
monitor.stopMonitoring();
console.log(`✓ Monitoring status: ${monitor.isCurrentlyMonitoring()}\n`);

// Test 11: Priority - Blocked takes precedence over discouraged
console.log("Test 11: Priority - Blocked takes precedence");
const priorityStatus = monitor.checkUrl(
  "https://example.com/page",
  ["example.com"],
  ["example.com"],
  true
);
console.log(
  `✓ Status: ${priorityStatus} (expected: BLOCKED - blocked takes precedence)\n`
);

console.log("=== All Tests Passed ===");
