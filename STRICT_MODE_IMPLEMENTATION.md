# Strict Mode Blocking Implementation

## Overview

This document summarizes the implementation of Task 22: Strict Mode Blocking for the Soul Shepherd extension.

## Files Created

### 1. blocked.html

- Full-page blocking interface displayed when user tries to access blocked sites
- Shows Soul Shepherd character (👻 emoji placeholder)
- Displays message: "This realm is sealed while your Soul Shepherd works."
- Shows current Stubborn Soul name
- Displays countdown timer for remaining session time
- Includes "End Session Early (Penalty Applied)" button
- Styled with gradient background and glassmorphism effects

### 2. src/blocked.ts

- TypeScript script for blocked.html page
- Fetches current game state from background worker
- Updates timer in real-time (every second)
- Handles emergency session end button click
- Confirms with user before ending session early
- Displays blocked URL in footer
- Listens for state updates and session end messages

### 3. src/test-strictmode-manual.md

- Comprehensive manual testing guide
- 10 main test scenarios
- 4 edge case tests
- Step-by-step instructions for each test
- Expected results documented

## Files Modified

### 1. manifest.json

- Added `declarativeNetRequestWithHostAccess` permission
- Added `web_accessible_resources` section for blocked.html and blocked.js
- Allows extension to redirect blocked sites to custom page

### 2. src/background.ts

#### New Functions Added:

**updateBlockingRules(blockedSites: string[])**

- Manages declarativeNetRequest dynamic rules
- Removes all existing rules
- Creates new redirect rules for each blocked site
- Uses wildcard pattern `*://*.domain.com/*` to catch all subdomains
- Redirects to blocked.html with URL parameter

**handleEmergencyEndSession()**

- Handles emergency session end from blocked page
- Applies 50% penalty to all rewards (Soul Insight, Soul Embers, boss damage)
- Marks session as compromised
- Follows normal session end flow with reduced rewards
- Clears blocking rules
- Sends notification about reduced rewards

#### Modified Functions:

**chrome.runtime.onInstalled**

- Added call to clear blocking rules on install

**handleMessage()**

- Added case for "EMERGENCY_END_SESSION" message type

**handleStartSession()**

- Added logic to activate blocking rules when strict mode is enabled
- Calls `updateBlockingRules()` with blocked sites list

**handleEndSession()**

- Added call to clear blocking rules when session ends normally

**handleUpdateSettings()**

- Added logic to update blocking rules when settings change
- Activates rules if strict mode enabled during active session
- Clears rules if strict mode disabled or no active session
- Handles changes to blocked sites list dynamically

## How It Works

### Session Start Flow (Strict Mode Enabled)

1. User starts focus session
2. Background checks if strict mode is enabled
3. If enabled, creates declarativeNetRequest rules for all blocked sites
4. Rules redirect matching URLs to blocked.html

### Blocked Site Access Flow

1. User navigates to blocked site
2. Chrome intercepts navigation via declarativeNetRequest
3. User is redirected to blocked.html with URL parameter
4. blocked.ts loads and fetches current game state
5. Page displays current boss name and remaining time
6. Timer updates every second

### Emergency End Flow

1. User clicks "End Session Early" button on blocked page
2. Confirmation dialog appears
3. If confirmed, sends EMERGENCY_END_SESSION message to background
4. Background calculates rewards with 50% penalty
5. Session ends, break starts, blocking rules cleared
6. Blocked page closes

### Session End Flow (Normal)

1. Session timer expires or user ends session normally
2. Background clears all blocking rules
3. Blocked sites become accessible again

### Settings Update Flow

1. User changes blocked sites list or strict mode toggle
2. Options page sends UPDATE_SETTINGS message
3. Background updates settings in state
4. If active session and strict mode enabled, updates blocking rules
5. If strict mode disabled or no session, clears blocking rules

## Technical Details

### declarativeNetRequest Rules

- Each blocked site gets a unique rule ID (1, 2, 3, ...)
- Priority: 1 (standard priority)
- Action: REDIRECT to blocked.html
- Condition: URL filter with wildcard pattern
- Resource type: MAIN_FRAME only (doesn't block subresources)

### Penalty Calculation

```typescript
const penaltyMultiplier = 0.5;
rewards.soulInsight = Math.floor(rewards.soulInsight * penaltyMultiplier);
rewards.soulEmbers = Math.floor(rewards.soulEmbers * penaltyMultiplier);
rewards.bossProgress = Math.floor(rewards.bossProgress * penaltyMultiplier);
```

### URL Pattern Matching

- Pattern: `*://*.domain.com/*`
- Matches: http and https protocols
- Matches: all subdomains (www, subdomain, etc.)
- Matches: all paths

## Requirements Satisfied

✅ **Requirement 7.3**: Intercept navigation attempts to blocked domains during strict mode

- Implemented via declarativeNetRequest dynamic rules
- Rules created when session starts with strict mode enabled

✅ **Requirement 7.4**: Redirect to custom blocked page

- Created blocked.html with Soul Shepherd character and message
- Shows current Stubborn Soul name and remaining time
- Displays blocked URL

✅ **Requirement 7.5**: Emergency session end with penalty

- Implemented "End Session Early" button
- Applies 50% reduction to all rewards
- Marks session as compromised
- Follows normal session end flow

## Testing

See `src/test-strictmode-manual.md` for comprehensive testing guide.

### Key Test Scenarios:

1. Enable strict mode and add blocked sites
2. Start session and verify blocking
3. Verify timer updates on blocked page
4. Test emergency session end
5. Verify blocking rules clear after session
6. Test multiple blocked sites
7. Test strict mode disable
8. Test settings update during session
9. Test subdomain blocking
10. Verify penalty applied

## Future Enhancements

Potential improvements for future iterations:

- Custom character sprites instead of emoji
- Sound effects when blocked site accessed
- Statistics tracking for blocked site attempts
- Whitelist for specific paths on blocked domains
- Temporary "allow once" option with penalty
- Visual feedback when blocking rules activate
- Import/export blocked sites lists
- Preset blocked site categories (social media, news, etc.)

## Notes

- Blocking only occurs during active sessions with strict mode enabled
- Rules are cleared when session ends (normal or emergency)
- Emergency end still counts as a completed session for statistics
- Penalty applies to all reward types equally (50% reduction)
- Blocked page requires active session to display properly
- Settings changes take effect immediately during active sessions
