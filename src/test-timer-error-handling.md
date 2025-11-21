# Timer Error Handling Test Plan

## Overview

This document describes the timer error handling implementation for task 34, which detects and handles missed or late alarms for sessions and breaks.

## Implementation Details

### 1. Popup-Side Detection (popup.ts)

- **Function**: `checkForMissedTimers(state: GameState)`
- **When**: Called on popup initialization
- **What it does**:
  - Checks if active session should have ended
  - Checks if active break should have ended
  - Calculates missed time in minutes
  - Sends retroactive end messages to background
  - Shows user notification if delay > 1 minute

### 2. Background-Side Handlers (background.ts)

- **Function**: `handleEndSessionRetroactive(payload)`
  - Ends session using actual end time for calculations
  - Applies rewards based on actual elapsed time (not delayed time)
  - Adjusts break timer to account for delay
  - Logs all timing information
- **Function**: `handleEndBreakRetroactive(payload)`

  - Ends break immediately
  - Logs delay information
  - Notifies user

- **Function**: `checkForMissedTimersOnStartup()`
  - Called on browser startup
  - Checks for missed timers while browser was closed
  - Handles retroactive endings

### 3. User Notifications

- **Timer Error Notification**: Shows warning overlay with delay information
- **Auto-dismiss**: After 10 seconds
- **Manual dismiss**: User can click dismiss button

## Test Scenarios

### Scenario 1: Session Alarm Fires Late

**Setup**:

1. Start a 5-minute session
2. Simulate alarm delay (e.g., system sleep, high CPU)

**Expected Behavior**:

- When popup opens, detects session should have ended
- Calculates rewards based on actual 5-minute duration
- Shows notification: "Session timer was delayed by X minutes"
- Applies rewards retroactively
- Starts break with adjusted remaining time

**Verification**:

- Check console logs for timing information
- Verify rewards match 5-minute session (not delayed time)
- Verify break timer shows correct remaining time

### Scenario 2: Break Alarm Fires Late

**Setup**:

1. Complete a session to start break
2. Simulate alarm delay

**Expected Behavior**:

- When popup opens, detects break should have ended
- Shows notification: "Break timer was delayed by X minutes"
- Ends break immediately
- Returns to idle view

**Verification**:

- Check console logs for timing information
- Verify break ends immediately
- Verify idle view is shown

### Scenario 3: Browser Restart During Session

**Setup**:

1. Start a session
2. Close browser before session ends
3. Reopen browser after session should have ended

**Expected Behavior**:

- On startup, background detects missed session end
- Calculates rewards based on actual session duration
- Ends session retroactively
- Starts break (or ends it if break time also elapsed)

**Verification**:

- Check console logs on startup
- Verify rewards were applied
- Verify state is correct (session ended, break started/ended)

### Scenario 4: Browser Restart During Break

**Setup**:

1. Complete session to start break
2. Close browser during break
3. Reopen browser after break should have ended

**Expected Behavior**:

- On startup, background detects missed break end
- Ends break retroactively
- Returns to idle state

**Verification**:

- Check console logs on startup
- Verify break ended
- Verify idle state

### Scenario 5: No Timer Issues

**Setup**:

1. Start and complete session normally
2. Open popup during active session

**Expected Behavior**:

- No timer error detected
- No notification shown
- Normal flow continues

**Verification**:

- No error messages in console
- No notification overlay
- Session continues normally

## Manual Testing Steps

### Test 1: Simulate Late Session Alarm

1. Start a 5-minute session
2. Wait for session to complete
3. Before opening popup, wait 2-3 additional minutes
4. Open popup
5. Verify notification appears
6. Check console for timing logs
7. Verify rewards are correct

### Test 2: Simulate Late Break Alarm

1. Complete a session to start break
2. Wait for break to complete
3. Before opening popup, wait 2-3 additional minutes
4. Open popup
5. Verify notification appears
6. Check console for timing logs
7. Verify break ended

### Test 3: Browser Restart Test

1. Start a 5-minute session
2. Close browser completely
3. Wait 10 minutes
4. Reopen browser
5. Check background console logs
6. Verify session was ended retroactively
7. Check player stats for rewards

## Console Log Examples

### Session Retroactive End:

```
[Popup] Timer error detected: Session should have ended 3 minutes ago
[Popup] Session start: 2024-01-01T10:00:00.000Z, Duration: 5m, Expected end: 2024-01-01T10:05:00.000Z
[Background] Ending session retroactively - alarm was late or missed
[Background] Actual end time: 2024-01-01T10:05:00.000Z, Detected at: 2024-01-01T10:08:00.000Z
[Background] Timer was delayed by 3 minute(s) (180000ms)
[Background] Rewards calculated (retroactive with actual timing): {...}
[Background] Retroactive session end flow complete (delay: 3 minutes)
```

### Break Retroactive End:

```
[Popup] Timer error detected: Break should have ended 2 minutes ago
[Popup] Break start: 2024-01-01T10:05:00.000Z, Duration: 5m, Expected end: 2024-01-01T10:10:00.000Z
[Background] Ending break retroactively - alarm was late or missed
[Background] Actual end time: 2024-01-01T10:10:00.000Z, Detected at: 2024-01-01T10:12:00.000Z
[Background] Break timer was delayed by 2 minute(s) (120000ms)
[Background] Retroactive break end flow complete (delay: 2 minutes)
```

### Startup Check:

```
[Background] Extension starting up
[Background] State loaded on startup
[Background] Checking for missed timers on startup
[Background] Missed session end detected on startup: 15 minutes late
[Background] Session should have ended at: 2024-01-01T10:05:00.000Z
[Background] Ending session retroactively - alarm was late or missed
[Background] Missed timer check complete
```

## Edge Cases Handled

1. **Session already ended**: If session was already processed, logs warning and returns
2. **Break already ended**: If break was already processed, logs warning and returns
3. **Break time fully elapsed**: If break should have ended before detection, ends immediately
4. **Negative remaining time**: Uses Math.max(0, ...) to prevent negative durations
5. **Multiple detections**: State checks prevent duplicate processing

## Requirements Satisfied

✅ On popup open, check if session/break should have ended
✅ Calculate missed time if alarm fired late
✅ Apply rewards retroactively based on actual elapsed time
✅ Notify user if significant time discrepancy detected
✅ Log timer errors to console

## Files Modified

1. `src/popup.ts`:

   - Added `checkForMissedTimers()` function
   - Added `showTimerErrorNotification()` function
   - Integrated check into `initialize()` function

2. `src/background.ts`:

   - Added `handleEndSessionRetroactive()` function
   - Added `handleEndBreakRetroactive()` function
   - Added `checkForMissedTimersOnStartup()` function
   - Added message routing for retroactive end messages
   - Updated `onStartup` listener to check for missed timers

3. `popup.css`:
   - Added `.timer-error-notification` styles
   - Added animation keyframes
   - Added responsive styling

## Notes

- Timer errors are logged with detailed timing information for debugging
- Rewards are calculated using actual session duration, not delayed time
- Break timers are adjusted to account for delays
- User notifications are shown for delays > 1 minute
- All retroactive operations are idempotent (safe to call multiple times)
