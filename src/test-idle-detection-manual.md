# Manual Test: Idle Detection During Focus Sessions

## Purpose

Test that the chrome.idle API correctly detects when the user goes idle during a focus session, pauses the session, tracks idle time, and resumes when the user returns.

## Prerequisites

- Extension must be loaded in Chrome
- Build the extension: `npm run build`
- Reload the extension in Chrome

## Test Procedure

### Test 1: Basic Idle Detection

1. **Start a focus session**

   - Open the extension popup
   - Select a task (or leave blank)
   - Set duration to 10 minutes
   - Click "Start Focus Session"
   - Verify the focus session view is displayed

2. **Trigger idle state**

   - Wait for 2 minutes (default idle threshold is 120 seconds)
   - Do not touch the mouse or keyboard during this time
   - The system should detect you as idle

3. **Check background logs**

   - Open Chrome DevTools for the service worker (chrome://extensions → Details → Service Worker → Inspect)
   - Look for logs:
     - `[Background] Idle state changed: idle`
     - `[Background] Session paused due to idle detection`
     - `[SessionManager] Session paused (user idle detected)`

4. **Return to active state**

   - Move the mouse or press a key
   - Check background logs for:
     - `[Background] Idle state changed: active`
     - `[Background] Session resumed after Xs idle`
     - `[SessionManager] Session resumed after Xs idle (total idle: Xs)`

5. **Complete the session**
   - Wait for the session to complete (or reduce duration for faster testing)
   - Check the reward view displays:
     - Active Time: Should show time minus idle time
     - Idle Time: Should show the time you were idle

### Test 2: Excessive Idle Time (>25% of session)

1. **Start a 5-minute focus session**

   - Set duration to 5 minutes
   - Click "Start Focus Session"

2. **Go idle for more than 75 seconds (25% of 5 minutes = 75 seconds)**

   - Wait for 2 minutes to trigger idle detection
   - Stay idle for at least 90 seconds total

3. **Return to active**

   - Move mouse/keyboard to resume

4. **Check for compromise warning**
   - When session completes, check background logs:
     - `[SessionManager] Session marked as compromised due to excessive idle time (XX.X%)`
   - Verify the reward view shows:
     - Compromise warning is displayed
     - Rewards are reduced (0.7x multiplier)
     - Idle time breakdown shows the excessive idle time

### Test 3: Multiple Idle Periods

1. **Start a 10-minute session**

2. **Go idle multiple times**

   - Go idle for 2 minutes (wait 2 min without input)
   - Return active (move mouse)
   - Work for 1 minute
   - Go idle again for 2 minutes
   - Return active

3. **Verify cumulative idle time**
   - Check that idle time accumulates across multiple idle periods
   - When session completes, verify total idle time is sum of all idle periods

### Test 4: Screen Lock Detection

1. **Start a focus session**

2. **Lock your screen**

   - Windows: Win+L
   - Mac: Cmd+Ctrl+Q

3. **Wait 30 seconds**

4. **Unlock screen**

5. **Check logs**
   - Should see `[Background] Session paused due to screen lock`
   - Should see session resume when unlocked

### Test 5: Idle Threshold Configuration

1. **Open Options page**

   - Right-click extension icon → Options
   - Or go to chrome://extensions and click "Options"

2. **Change idle threshold**

   - Find "Idle Detection Sensitivity" setting
   - Change from default 120 seconds to 60 seconds
   - Save settings

3. **Start a new session**

4. **Go idle for 60 seconds**

   - Should trigger idle detection after 60 seconds instead of 120

5. **Verify new threshold works**
   - Check logs show idle detection at the new threshold

## Expected Results

✅ Session pauses when user is idle for configured threshold (default 120s)
✅ Session resumes when user returns to active state
✅ Idle time is tracked separately from active time
✅ Multiple idle periods accumulate correctly
✅ Session is marked as compromised if idle time exceeds 25% of total duration
✅ Compromised sessions show warning and reduced rewards (0.7x)
✅ Idle/active time breakdown is displayed in reward view
✅ Screen lock is treated as idle state
✅ Idle threshold can be configured in options

## Troubleshooting

**Idle detection not triggering:**

- Check that the idle permission is in manifest.json
- Verify the service worker is running (check chrome://extensions)
- Check console logs for errors
- Try reloading the extension

**Idle time not accumulating:**

- Check SessionManager.resumeSession is being called with correct idleSeconds
- Verify idleStartTime is being set when going idle
- Check logs for idle duration calculation

**Session not marked as compromised:**

- Verify idle time exceeds 25% of session duration
- Check SessionManager.resumeSession logic for compromise calculation
- Ensure session duration is long enough to test (5 min = 75s idle needed)

## Notes

- The chrome.idle API detection interval is set via `chrome.idle.setDetectionInterval()`
- The API checks idle state at the specified interval, so there may be a slight delay
- Idle state includes: no mouse movement, no keyboard input, no user interaction
- Screen lock automatically triggers idle state
- The idle detection only runs during active focus sessions
- Idle detection is stopped when session ends or is paused manually
