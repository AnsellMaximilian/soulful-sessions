# Manual Test Guide: Strict Mode Blocking

This document provides step-by-step instructions to manually test the strict mode blocking feature.

## Prerequisites

1. Build the extension: `npm run build`
2. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extension directory

## Test Scenarios

### Test 1: Enable Strict Mode and Add Blocked Sites

1. Click the extension icon to open the popup
2. Click "Options" or right-click the extension icon and select "Options"
3. Navigate to the "Distraction Management" section
4. Enable the "Strict Mode" toggle
5. Add a test site to the blocked sites list (e.g., "reddit.com")
6. Save the settings

**Expected Result:** Settings should be saved successfully

### Test 2: Start Session and Verify Blocking

1. Open the extension popup
2. Start a focus session (any duration)
3. Try to navigate to the blocked site (e.g., https://reddit.com)

**Expected Result:**

- You should be redirected to the blocked.html page
- The page should display:
  - "This realm is sealed while your Soul Shepherd works."
  - Current Stubborn Soul name
  - Remaining session time (counting down)
  - "End Session Early (Penalty Applied)" button

### Test 3: Verify Timer Updates

1. While on the blocked page, observe the timer
2. Wait for 1-2 minutes

**Expected Result:**

- Timer should count down in real-time
- Format should be MM:SS (e.g., "24:30")

### Test 4: Test Emergency Session End

1. While on the blocked page, click "End Session Early (Penalty Applied)"
2. Confirm the dialog

**Expected Result:**

- Confirmation dialog should appear warning about 50% penalty
- After confirming:
  - Session should end
  - Rewards should be calculated with 50% reduction
  - Break should start
  - Blocked page should close or redirect

### Test 5: Verify Blocking Rules Clear After Session

1. Complete or end a session
2. Try to navigate to the previously blocked site

**Expected Result:**

- Site should be accessible (not blocked)
- No redirect to blocked.html

### Test 6: Test Multiple Blocked Sites

1. In options, add multiple sites to blocked list:
   - "reddit.com"
   - "youtube.com"
   - "twitter.com"
2. Start a new session
3. Try to access each blocked site

**Expected Result:**

- All sites should be blocked
- Each should redirect to blocked.html with the appropriate URL shown

### Test 7: Test Strict Mode Disable

1. While a session is NOT active, disable strict mode in options
2. Start a new session
3. Try to access a site in the blocked list

**Expected Result:**

- Site should be accessible (not blocked)
- Strict mode is disabled, so no blocking occurs

### Test 8: Test Settings Update During Session

1. Start a session with strict mode enabled and one blocked site
2. Open options in a new tab
3. Add another site to the blocked list
4. Try to access the newly added site

**Expected Result:**

- Newly added site should be blocked immediately
- Blocking rules update dynamically

### Test 9: Test Subdomain Blocking

1. Add "example.com" to blocked sites
2. Start a session
3. Try to access:
   - https://example.com
   - https://www.example.com
   - https://subdomain.example.com

**Expected Result:**

- All variations should be blocked
- Wildcard pattern `*://*.example.com/*` should catch all subdomains

### Test 10: Verify Penalty Applied

1. Start a 25-minute session
2. Navigate to a blocked site
3. Click "End Session Early"
4. Check the reward screen

**Expected Result:**

- Rewards should show reduced amounts
- Session should be marked as compromised
- Notification should mention "reduced rewards"

## Edge Cases to Test

### Edge Case 1: No Active Session

- Navigate to blocked.html directly (without active session)
- **Expected:** Should show "No Active Session" or error state

### Edge Case 2: Session Ends While on Blocked Page

- Be on blocked page when session timer naturally expires
- **Expected:** Page should update or close, normal session end flow

### Edge Case 3: Browser Restart

- Start session with strict mode
- Close browser
- Reopen browser
- Try to access blocked site
- **Expected:** Blocking should not be active (session ended)

### Edge Case 4: Invalid Domain

- Try to add invalid domain to blocked list (e.g., "not a domain")
- **Expected:** Validation should prevent or handle gracefully

## Cleanup

After testing:

1. Disable strict mode
2. Clear all blocked sites
3. End any active sessions
4. Verify extension returns to normal state

## Notes

- The blocked.html page uses the Soul Shepherd character (👻 emoji as placeholder)
- The 50% penalty applies to both Soul Insight and Soul Embers
- Emergency end still marks session as compromised
- Blocking rules are cleared when session ends (normal or emergency)
