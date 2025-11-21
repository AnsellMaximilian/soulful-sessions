# Soul Shepherd - Manual Testing Guide

## Overview

This guide provides step-by-step instructions for manually testing all features of the Soul Shepherd Chrome extension.

## Prerequisites

- Chrome browser installed
- Extension built and ready to load (`npm run build`)
- Clean browser profile recommended for initial state testing

## Test Environment Setup

### Loading the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `dist` folder from the project directory
5. Verify extension icon appears in toolbar

---

## Test Suite

### Test 1: Initial State Verification

**Objective**: Verify the extension initializes with correct default values

**Steps**:

1. Load the extension for the first time
2. Click the extension icon to open popup
3. Verify the following:
   - [ ] Soul Shepherd character is displayed
   - [ ] Level shows as 1
   - [ ] Soul Insight shows 0/100
   - [ ] Soul Embers shows 0
   - [ ] Stats show default values (Spirit: 1, Harmony: 5%, Soulflow: 1)
   - [ ] Current boss is "The Restless Athlete"
   - [ ] Boss Resolve bar shows 100/100
   - [ ] "Start Focus Session" button is visible
   - [ ] Task dropdown is empty (no tasks created yet)
   - [ ] Duration input shows default (25 minutes)

**Expected Result**: All default values match the design specification

---

### Test 2: Options Page - Task Management

**Objective**: Test CRUD operations for goals, tasks, and subtasks

**Steps**:

1. Right-click extension icon → "Options"
2. Navigate to Task Management section

**Create Operations**: 3. Click "Add Goal"

- [ ] Modal appears
- [ ] Enter name: "Work Projects"
- [ ] Enter description: "Professional work tasks"
- [ ] Click Save
- [ ] Goal appears in list

4. Click "Add Task" under "Work Projects"

   - [ ] Modal appears
   - [ ] Enter name: "Complete Report"
   - [ ] Enter description: "Q4 financial report"
   - [ ] Click Save
   - [ ] Task appears under goal

5. Click "Add Subtask" under "Complete Report"
   - [ ] Modal appears
   - [ ] Enter name: "Gather data"
   - [ ] Enter estimated duration: 30 minutes
   - [ ] Click Save
   - [ ] Subtask appears under task

**Read Operations**: 6. Verify all created items display correctly

- [ ] Goal name and description visible
- [ ] Task name and description visible
- [ ] Subtask name and duration visible

**Update Operations**: 7. Click "Edit" on "Work Projects" goal

- [ ] Modal pre-fills with current values
- [ ] Change description to "Updated description"
- [ ] Click Save
- [ ] Description updates in list

8. Click "Edit" on "Complete Report" task
   - [ ] Modal pre-fills with current values
   - [ ] Change name to "Finalize Report"
   - [ ] Click Save
   - [ ] Name updates in list

**Delete Operations**: 9. Click "Delete" on subtask

- [ ] Confirmation dialog appears
- [ ] Click Confirm
- [ ] Subtask removed from list

10. Create another subtask for testing
11. Click "Delete" on task

    - [ ] Confirmation dialog appears
    - [ ] Click Confirm
    - [ ] Task and all subtasks removed

12. Click "Delete" on goal
    - [ ] Confirmation dialog appears
    - [ ] Click Confirm
    - [ ] Goal and all children removed

**Expected Result**: All CRUD operations work correctly and persist

---

### Test 3: Settings Persistence

**Objective**: Verify all settings save and persist across browser restarts

**Steps**:

1. In Options page, configure the following:

   - [ ] Default session duration: 15 minutes
   - [ ] Default break duration: 3 minutes
   - [ ] Enable auto-start next session
   - [ ] Set idle threshold: 180 seconds
   - [ ] Add discouraged site: "reddit.com"
   - [ ] Add discouraged site: "youtube.com"
   - [ ] Enable strict mode
   - [ ] Add blocked site: "twitter.com"
   - [ ] Disable animations
   - [ ] Disable notifications

2. Close options page
3. Open popup and verify:

   - [ ] Duration input shows 15 minutes (new default)

4. Close Chrome completely
5. Reopen Chrome
6. Open Options page
7. Verify all settings retained:
   - [ ] Session duration: 15 minutes
   - [ ] Break duration: 3 minutes
   - [ ] Auto-start: enabled
   - [ ] Idle threshold: 180 seconds
   - [ ] Discouraged sites: reddit.com, youtube.com
   - [ ] Strict mode: enabled
   - [ ] Blocked sites: twitter.com
   - [ ] Animations: disabled
   - [ ] Notifications: disabled

**Expected Result**: All settings persist across browser restart

---

### Test 4: Complete Focus Session Flow

**Objective**: Test full session lifecycle with reward calculations

**Preparation**:

1. Reset settings to defaults (session: 25 min, break: 5 min)
2. For testing purposes, temporarily modify session duration to 1 minute
3. Create a test task in Options

**Steps**:

1. Open popup
2. Select test task from dropdown
3. Set duration to 1 minute
4. Click "Start Focus Session"
5. Verify:

   - [ ] UI switches to minimal view
   - [ ] Message displays: "Soul Shepherd is communing with a Stubborn Soul. Stay focused."
   - [ ] Timer shows remaining time (if enabled)
   - [ ] No stats, currency, or buttons visible

6. Wait for 1 minute (session completes)
7. Verify:

   - [ ] Popup automatically switches to Reward View
   - [ ] Soul Insight earned displays (should be ~10 based on formula)
   - [ ] Soul Embers earned displays (should be ~2 based on formula)
   - [ ] Boss damage dealt displays
   - [ ] Boss Resolve bar decreased
   - [ ] No critical hit indicator (low harmony stat)
   - [ ] No compromise warning (no discouraged sites visited)
   - [ ] Idle time shows 0 minutes
   - [ ] Active time shows 1 minute
   - [ ] "Continue to Break" button visible

8. Click "Continue to Break"
9. Verify:

   - [ ] UI switches to Break View
   - [ ] Full game UI visible
   - [ ] Stats panel shows updated values
   - [ ] Soul Embers count updated
   - [ ] Soul Insight progress bar updated
   - [ ] Break timer countdown visible (5 minutes)
   - [ ] Current boss card displays
   - [ ] "Start Next Session" button visible

10. Wait for break to complete (or use short break for testing)
11. Verify:
    - [ ] Notification appears (if enabled): "Break complete. Ready for another session?"
    - [ ] UI remains in idle state

**Expected Result**: Complete session flow works correctly with accurate calculations

---

### Test 5: Idle Detection

**Objective**: Test chrome.idle API integration and session pause/resume

**Preparation**:

1. Set idle threshold to 120 seconds (2 minutes) in Options
2. Set session duration to 5 minutes for testing

**Steps**:

1. Start a focus session
2. Verify session is active
3. Step away from computer for 3 minutes (exceed idle threshold)
4. Return and open popup
5. Verify:

   - [ ] Session was paused during idle time
   - [ ] Session resumed when you returned
   - [ ] Idle time is tracked separately

6. Complete the session
7. In Reward View, verify:
   - [ ] Idle time breakdown shows ~3 minutes idle
   - [ ] Active time shows ~2 minutes active
   - [ ] If idle time > 25% of session, compromise warning appears
   - [ ] Rewards are reduced if compromised

**Expected Result**: Idle detection works and affects rewards appropriately

---

### Test 6: Discouraged Site Warnings

**Objective**: Test soft warnings for discouraged sites during sessions

**Preparation**:

1. Add "reddit.com" to discouraged sites in Options
2. Ensure strict mode is OFF

**Steps**:

1. Start a focus session (1-2 minutes for testing)
2. Navigate to reddit.com in a new tab
3. Verify:

   - [ ] Warning overlay appears on page
   - [ ] Message displays: "The Soul Shepherd senses this realm drains your Spirit. Return to your task."
   - [ ] Overlay is semi-transparent
   - [ ] Page content is still accessible
   - [ ] Overlay can be dismissed

4. Navigate to another page on reddit.com
5. Verify:

   - [ ] Warning reappears on new page

6. Complete the session
7. In Reward View, verify:
   - [ ] Compromise warning appears
   - [ ] Rewards are reduced (0.7x multiplier)
   - [ ] Message indicates session was compromised

**Expected Result**: Discouraged sites trigger warnings and reduce rewards

---

### Test 7: Strict Mode Blocking

**Objective**: Test hard blocking of sites during strict mode sessions

**Preparation**:

1. Enable strict mode in Options
2. Add "twitter.com" to blocked sites list

**Steps**:

1. Start a focus session
2. Navigate to twitter.com in a new tab
3. Verify:

   - [ ] Page is blocked immediately
   - [ ] Redirected to blocked.html page
   - [ ] Soul Shepherd character displays
   - [ ] Message: "This realm is sealed while your Soul Shepherd works."
   - [ ] Current boss name displays
   - [ ] Remaining session time displays
   - [ ] "End Session Early (Penalty Applied)" button visible

4. Try to access twitter.com via different URL (e.g., twitter.com/home)
5. Verify:

   - [ ] Still blocked

6. Click "End Session Early"
7. Verify:
   - [ ] Session ends immediately
   - [ ] Reward View shows 50% penalty applied
   - [ ] Session marked as compromised

**Test Strict Mode OFF**: 8. Disable strict mode in Options 9. Start a new session 10. Navigate to twitter.com 11. Verify: - [ ] Site is accessible (no blocking) - [ ] No warning appears (twitter.com not in discouraged list)

**Expected Result**: Strict mode blocks sites completely with emergency exit option

---

### Test 8: Stat Upgrades

**Objective**: Test stat upgrade system with cost scaling

**Preparation**:

1. Complete several sessions to accumulate Soul Embers (or manually set in storage for testing)
2. Ensure you have at least 50 Soul Embers

**Steps**:

1. During a break, open popup
2. Navigate to stats panel
3. Verify:

   - [ ] Current stat values display
   - [ ] Upgrade buttons visible next to each stat
   - [ ] Upgrade costs display (Spirit: 10, Harmony: 10, Soulflow: 10 for first upgrade)

4. Click upgrade button for Spirit
5. Verify:

   - [ ] Soul Embers deducted (10)
   - [ ] Spirit stat increases by 1
   - [ ] Next upgrade cost increases (15 = 10 \* 1.5^1)
   - [ ] Upgrade button updates with new cost

6. Click upgrade button for Spirit again
7. Verify:

   - [ ] Soul Embers deducted (15)
   - [ ] Spirit stat increases to 3
   - [ ] Next upgrade cost increases (22 = 10 \* 1.5^2)

8. Attempt to upgrade when insufficient Soul Embers
9. Verify:

   - [ ] Upgrade button is disabled
   - [ ] No action occurs on click

10. Complete another session to earn more Soul Embers
11. Verify:
    - [ ] Upgraded stats affect reward calculations
    - [ ] Higher Spirit = more boss damage
    - [ ] Higher Soulflow = more Soul Embers earned

**Expected Result**: Stat upgrades work with correct cost scaling and affect gameplay

---

### Test 9: Skill Point Allocation

**Objective**: Test skill point system from level-ups

**Preparation**:

1. Complete enough sessions to level up (or manually set Soul Insight for testing)

**Steps**:

1. Accumulate enough Soul Insight to reach level 2 (100 Soul Insight)
2. When level-up occurs, verify:

   - [ ] Level increases to 2
   - [ ] Skill points granted (1 point)
   - [ ] Level-up animation/message displays
   - [ ] New level threshold calculated (100 \* 2^1.5 = 282)

3. During break, open popup
4. Verify:

   - [ ] Available skill points display
   - [ ] Skill point allocation buttons visible next to stats

5. Click skill point allocation button for Harmony
6. Verify:

   - [ ] Skill point deducted (0 remaining)
   - [ ] Harmony stat increases by 1
   - [ ] Allocation button disabled (no points remaining)

7. Level up again to level 3
8. Verify:
   - [ ] 1 more skill point granted
   - [ ] Can allocate to any stat

**Expected Result**: Skill points grant on level-up and can be allocated to stats

---

### Test 10: Boss Defeat and Progression

**Objective**: Test boss defeat mechanics and unlocking next boss

**Preparation**:

1. Set up state to be close to defeating first boss (or manually reduce boss Resolve)

**Steps**:

1. Complete sessions until boss Resolve reaches 0
2. When boss defeated, verify:

   - [ ] Boss defeat animation/message displays
   - [ ] "The Restless Athlete" marked as defeated
   - [ ] Next boss unlocks: "The Unfinished Scholar"
   - [ ] New boss Resolve set to 200
   - [ ] Boss card updates with new boss info
   - [ ] New backstory displays

3. Check if level requirement met for next boss
4. If level too low, verify:

   - [ ] Message displays: "Boss locked until level X"
   - [ ] Cannot progress until level requirement met

5. Continue sessions with new boss
6. Verify:
   - [ ] Damage applies to new boss
   - [ ] Progress tracked correctly

**Expected Result**: Boss defeat triggers correctly and progression continues

---

### Test 11: Idle Collection Over Time

**Objective**: Test passive Content Soul collection

**Preparation**:

1. Note current Soul Embers count
2. Note current time

**Steps**:

1. Close popup and wait 5 minutes (or longer)
2. Open popup after 5+ minutes
3. Verify:

   - [ ] Idle collection occurred
   - [ ] Soul Embers increased
   - [ ] Collection rate based on Soulflow stat
   - [ ] Formula: 1 soul per 5 min _ (1 + soulflow _ 0.1) = 5 embers per 5 min

4. Close browser completely
5. Wait 10 minutes
6. Reopen browser and extension
7. Open popup
8. Verify:
   - [ ] Idle collection calculated for time browser was closed
   - [ ] Soul Embers increased appropriately
   - [ ] lastCollectionTime updated

**Expected Result**: Idle collection works continuously, even when browser closed

---

### Test 12: Streak Tracking

**Objective**: Test consecutive session streak tracking over multiple days

**Note**: This test requires multiple days to complete fully

**Day 1**:

1. Complete at least one focus session
2. Open Options → Statistics
3. Verify:
   - [ ] Current streak: 1
   - [ ] Last session date: today's date
   - [ ] Total sessions: 1

**Day 2** (next day): 4. Complete at least one focus session 5. Check statistics 6. Verify:

- [ ] Current streak: 2
- [ ] Last session date: today's date
- [ ] Total sessions: 2

**Day 3** (skip a day - don't complete any sessions): 7. Do not complete any sessions

**Day 4** (day after skip): 8. Complete a focus session 9. Check statistics 10. Verify: - [ ] Current streak: 1 (reset due to skipped day) - [ ] Longest streak: 2 (preserved from Day 1-2)

**Expected Result**: Streak increments on consecutive days and resets when day skipped

---

### Test 13: Statistics Dashboard

**Objective**: Verify all statistics track correctly

**Steps**:

1. Complete multiple sessions (at least 5)
2. Defeat at least one boss
3. Level up at least once
4. Open Options → Statistics
5. Verify all statistics display:

   - [ ] Total focus time (sum of all session durations)
   - [ ] Total sessions completed (count)
   - [ ] Current streak (consecutive days)
   - [ ] Longest streak (max consecutive days)
   - [ ] Bosses defeated (count)
   - [ ] Current level
   - [ ] Current stat values (Spirit, Harmony, Soulflow)
   - [ ] Total Soul Insight earned (lifetime)
   - [ ] Total Soul Embers earned (lifetime)

6. Complete another session
7. Refresh statistics page
8. Verify:
   - [ ] All values updated correctly
   - [ ] Calculations are accurate

**Expected Result**: All statistics track and display correctly

---

### Test 14: Cosmetics System

**Objective**: Test cosmetic purchases and application

**Preparation**:

1. Accumulate enough Soul Embers for cosmetic purchases (100+)

**Steps**:

1. During break, open popup
2. Navigate to Shop section
3. Verify:

   - [ ] Available cosmetics display
   - [ ] Prices shown in Soul Embers
   - [ ] Purchase buttons visible
   - [ ] Default theme and sprite marked as owned

4. Click purchase button for a theme
5. Verify:

   - [ ] Soul Embers deducted
   - [ ] Theme marked as owned
   - [ ] Purchase button changes to "Select"

6. Click "Select" on purchased theme
7. Verify:

   - [ ] Theme applied to all UI elements
   - [ ] Colors change throughout popup
   - [ ] Selection persists

8. Purchase and select a character sprite
9. Verify:

   - [ ] Soul Shepherd character image changes
   - [ ] New sprite displays in all views

10. Close and reopen popup
11. Verify:

    - [ ] Selected theme and sprite persist
    - [ ] Cosmetics remain applied

12. Open popup on different device (if using chrome.storage.sync)
13. Verify:
    - [ ] Cosmetic ownership syncs across devices
    - [ ] Selected cosmetics apply on other device

**Expected Result**: Cosmetics can be purchased, applied, and persist

---

### Test 15: Animations and Preferences

**Objective**: Test animation toggle and other preferences

**Steps**:

1. Enable animations in Options
2. During break, open popup
3. Verify:

   - [ ] Content Soul sprites float across screen
   - [ ] Collection animations play
   - [ ] XP bar fill animates
   - [ ] Reward numbers count up
   - [ ] Smooth transitions between views

4. Disable animations in Options
5. Open popup during break
6. Verify:

   - [ ] No floating souls
   - [ ] Simple numeric counter for idle collection
   - [ ] Instant transitions
   - [ ] No animations play

7. Test notification preference:
   - Enable notifications
   - Complete session
   - [ ] Notification appears
   - Disable notifications
   - Complete session
   - [ ] No notification appears

**Expected Result**: Preferences control animation and notification behavior

---

### Test 16: State Persistence Across Browser Restarts

**Objective**: Verify complete state persistence

**Steps**:

1. Complete several sessions to build up state:

   - Level 3+
   - 50+ Soul Embers
   - 2+ stats upgraded
   - 1+ boss defeated
   - Multiple tasks created
   - Various settings configured

2. Note all current values:

   - Level, Soul Insight, Soul Embers
   - Stat values
   - Current boss and Resolve
   - Task list
   - Settings

3. Close Chrome completely
4. Wait 1 minute
5. Reopen Chrome
6. Open extension popup
7. Verify all state retained:

   - [ ] Level matches
   - [ ] Soul Insight matches
   - [ ] Soul Embers matches
   - [ ] Stats match
   - [ ] Current boss and Resolve match
   - [ ] Cosmetics still applied

8. Open Options page
9. Verify:

   - [ ] All tasks present
   - [ ] All settings retained

10. Check if any timers were running:
    - If session was active, verify it ended or continued appropriately
    - If break was active, verify it ended or continued appropriately

**Expected Result**: Complete state persists perfectly across browser restart

---

### Test 17: Error Handling - Storage Failures

**Objective**: Test graceful degradation when storage fails

**Steps**:

1. Open Chrome DevTools
2. Go to Application → Storage → Clear storage
3. Simulate storage quota exceeded (if possible)
4. Attempt to save state
5. Verify:
   - [ ] Error logged to console
   - [ ] User notification appears
   - [ ] In-memory state maintained as fallback
   - [ ] Extension continues to function

**Expected Result**: Extension handles storage errors gracefully

---

### Test 18: Error Handling - Timer Discrepancies

**Objective**: Test handling of missed or late alarms

**Steps**:

1. Start a focus session
2. Close popup
3. Put computer to sleep for duration longer than session
4. Wake computer
5. Open popup
6. Verify:
   - [ ] Extension detects session should have ended
   - [ ] Calculates missed time
   - [ ] Applies rewards retroactively
   - [ ] Notifies user of time discrepancy (if significant)

**Expected Result**: Extension handles timer issues gracefully

---

### Test 19: Critical Hit Mechanics

**Objective**: Test Harmony stat critical hit chance

**Preparation**:

1. Upgrade Harmony stat to 20+ (20% crit chance)
2. Complete multiple sessions

**Steps**:

1. Complete 10 sessions
2. Verify:
   - [ ] Some sessions show critical hit indicator
   - [ ] Critical hits grant 1.5x rewards
   - [ ] Critical hit rate approximately matches Harmony percentage

**Expected Result**: Critical hits occur based on Harmony stat

---

### Test 20: Auto-Start Next Session

**Objective**: Test auto-start preference

**Steps**:

1. Enable "Auto-start next session" in Options
2. Complete a focus session
3. Wait for break to end
4. Verify:

   - [ ] Popup automatically prompts to start next session
   - [ ] Task selector and duration pre-filled

5. Disable auto-start
6. Complete another session
7. Wait for break to end
8. Verify:
   - [ ] No automatic prompt
   - [ ] User must manually click "Start Next Session"

**Expected Result**: Auto-start preference controls behavior

---

## Test Results Summary

### Pass/Fail Checklist

- [ ] Test 1: Initial State Verification
- [ ] Test 2: Task Management CRUD
- [ ] Test 3: Settings Persistence
- [ ] Test 4: Complete Focus Session Flow
- [ ] Test 5: Idle Detection
- [ ] Test 6: Discouraged Site Warnings
- [ ] Test 7: Strict Mode Blocking
- [ ] Test 8: Stat Upgrades
- [ ] Test 9: Skill Point Allocation
- [ ] Test 10: Boss Defeat and Progression
- [ ] Test 11: Idle Collection Over Time
- [ ] Test 12: Streak Tracking
- [ ] Test 13: Statistics Dashboard
- [ ] Test 14: Cosmetics System
- [ ] Test 15: Animations and Preferences
- [ ] Test 16: State Persistence
- [ ] Test 17: Error Handling - Storage
- [ ] Test 18: Error Handling - Timers
- [ ] Test 19: Critical Hit Mechanics
- [ ] Test 20: Auto-Start Next Session

### Issues Found

Document any bugs or issues discovered during testing:

1.
2.
3.

### Notes

Additional observations or recommendations:

---

## Conclusion

This manual testing guide covers all major features and requirements of the Soul Shepherd extension. Complete all tests and document results before considering the extension ready for release.
