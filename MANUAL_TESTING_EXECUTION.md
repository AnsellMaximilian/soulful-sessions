# Soul Shepherd - Manual Testing Execution Report

## Testing Session Information

**Date Started**: [To be filled during testing]
**Tester**: [Your name]
**Chrome Version**: [Check chrome://version]
**Extension Version**: 1.0.0
**Testing Environment**: Windows

---

## Setup Instructions

### Step 1: Prepare Chrome for Testing

1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" toggle (top-right corner)
4. Click "Load unpacked" button
5. Navigate to your project folder and select the `dist` folder
6. Verify the Soul Shepherd extension appears in the list
7. Pin the extension icon to the toolbar for easy access

**Status**: [ ] Complete

---

## Test Execution

### Test 1: Install Extension and Verify Initial State

**Objective**: Confirm the extension initializes with correct default values

**Steps**:

1. Click the Soul Shepherd extension icon in the toolbar
2. The popup should open (400x600px window)

**Verify the following**:

- [ ] Soul Shepherd character image is visible
- [ ] Level displays as "1"
- [ ] Soul Insight shows "0/100" with progress bar
- [ ] Soul Embers shows "0"
- [ ] Spirit stat shows "1"
- [ ] Harmony stat shows "5%" (0.05)
- [ ] Soulflow stat shows "1"
- [ ] Current boss card displays "The Restless Athlete"
- [ ] Boss backstory is visible
- [ ] Boss Resolve bar shows "100/100"
- [ ] "Start Focus Session" button is present and enabled
- [ ] Task dropdown is present (may be empty)
- [ ] Duration input field shows "25" (default minutes)

**Result**: PASS / FAIL
**Notes**:

---

### Test 2: Complete Full Session and Verify All Calculations

**Objective**: Test the complete session lifecycle with accurate reward calculations

**Preparation**:

- For faster testing, we'll use a 1-minute session
- Note your current stats before starting

**Steps**:

1. In the popup, set duration to "1" minute
2. Click "Start Focus Session"

**During Session** (Verify):

- [ ] UI switches to minimal view immediately
- [ ] Message displays: "Soul Shepherd is communing with a Stubborn Soul. Stay focused."
- [ ] Timer shows remaining time (optional, may be hidden)
- [ ] All stats, currency, and buttons are hidden
- [ ] Only minimal text is visible

3. Wait for 1 minute (do not close popup or visit any sites)
4. Session should complete automatically

**After Session Completes** (Verify):

- [ ] Popup automatically switches to Reward View
- [ ] Soul Insight earned displays (expected: ~10 for 1-min session with Spirit=1)
  - Formula: 1 _ 10 _ (1 + 1 \* 0.1) = 11 Soul Insight
- [ ] Soul Embers earned displays (expected: ~2 for 1-min session with Soulflow=1)
  - Formula: 1 _ 2 _ (1 + 1 \* 0.05) = 2.1 Soul Embers
- [ ] Boss damage dealt displays (expected: ~0.5 for 1-min session)
  - Formula: 1 _ 1 _ 0.5 = 0.5 damage
- [ ] Boss Resolve bar decreased from 100 to 99.5
- [ ] No critical hit indicator (Harmony is only 5%)
- [ ] No compromise warning (no discouraged sites visited)
- [ ] Idle time shows "0 minutes"
- [ ] Active time shows "1 minute"
- [ ] "Continue to Break" button is visible

5. Click "Continue to Break"

**During Break** (Verify):

- [ ] UI switches to Break View
- [ ] Full game UI is now visible
- [ ] Stats panel shows all stats
- [ ] Soul Embers count updated (should be ~2)
- [ ] Soul Insight progress bar updated (should show 11/100)
- [ ] Break timer countdown visible (default: 5 minutes)
- [ ] Current boss card displays with updated Resolve
- [ ] "Start Next Session" button visible
- [ ] Upgrade buttons visible next to stats

**Actual Values Recorded**:

- Soul Insight earned: **\_\_\_**
- Soul Embers earned: **\_\_\_**
- Boss damage: **\_\_\_**
- Boss Resolve after: **\_\_\_**

**Result**: PASS / FAIL
**Notes**:

---

### Test 3: Test Idle Detection by Stepping Away

**Objective**: Verify chrome.idle API integration and session pause/resume

**Preparation**:

- Check Options page to confirm idle threshold is set to 120 seconds (2 minutes)
- If not, set it to 120 seconds

**Steps**:

1. Start a 5-minute focus session
2. Keep the popup open or note the time
3. Step away from your computer for 3 minutes (do not touch mouse/keyboard)
4. Return after 3 minutes
5. Open the popup (if closed)

**Verify**:

- [ ] Session is still active (not ended early)
- [ ] Session timer accounts for idle time

6. Wait for the session to complete (remaining active time)

**After Session Completes** (Verify):

- [ ] Reward View displays idle time breakdown
- [ ] Idle time shows approximately 3 minutes
- [ ] Active time shows approximately 2 minutes
- [ ] If idle time > 25% of session (which it is: 3/5 = 60%), compromise warning appears
- [ ] Rewards are reduced by 0.7x multiplier
- [ ] Message indicates session was compromised due to idle time

**Actual Values Recorded**:

- Idle time: **\_\_\_**
- Active time: **\_\_\_**
- Compromise penalty applied: YES / NO

**Result**: PASS / FAIL
**Notes**:

---

### Test 4: Test Discouraged Site Warnings

**Objective**: Verify soft warnings appear on discouraged sites during sessions

**Preparation**:

1. Right-click extension icon → "Options"
2. Navigate to "Distraction Management" section
3. Ensure Strict Mode is OFF
4. Add "reddit.com" to the Discouraged Sites list
5. Click Save/Add

**Steps**:

1. Return to popup
2. Start a 2-minute focus session
3. Open a new tab and navigate to `https://www.reddit.com`

**Verify on Reddit Page**:

- [ ] Warning overlay appears on the page
- [ ] Overlay is semi-transparent (you can see page content behind it)
- [ ] Message displays: "The Soul Shepherd senses this realm drains your Spirit. Return to your task."
- [ ] Overlay can be dismissed (click X or outside)
- [ ] Page content is still accessible underneath

4. Navigate to another Reddit page (e.g., a subreddit)

**Verify**:

- [ ] Warning overlay reappears on the new page

5. Close Reddit tab and wait for session to complete

**After Session Completes** (Verify):

- [ ] Compromise warning appears in Reward View
- [ ] Message indicates session was compromised
- [ ] Rewards are reduced (0.7x multiplier applied)
- [ ] Soul Insight and Soul Embers are lower than expected

**Result**: PASS / FAIL
**Notes**:

---

### Test 5: Test Strict Mode Blocking

**Objective**: Verify hard blocking of sites during strict mode sessions

**Preparation**:

1. Open Options page
2. Navigate to "Distraction Management" section
3. Enable "Strict Mode" toggle
4. Add "twitter.com" to the Blocked Sites list
5. Save settings

**Steps**:

1. Return to popup
2. Start a 2-minute focus session
3. Open a new tab and try to navigate to `https://twitter.com`

**Verify**:

- [ ] Page is blocked immediately (cannot access Twitter)
- [ ] Browser redirects to `blocked.html` page
- [ ] Soul Shepherd character displays on blocked page
- [ ] Message displays: "This realm is sealed while your Soul Shepherd works."
- [ ] Current boss name displays ("The Restless Athlete")
- [ ] Remaining session time displays
- [ ] "End Session Early (Penalty Applied)" button is visible

4. Try to access Twitter via different URL (e.g., `https://twitter.com/home`)

**Verify**:

- [ ] Still blocked (redirects to blocked.html again)

5. Click "End Session Early (Penalty Applied)" button

**Verify**:

- [ ] Session ends immediately
- [ ] Popup switches to Reward View
- [ ] 50% penalty applied to rewards
- [ ] Session marked as compromised
- [ ] Message indicates early termination penalty

**Test Strict Mode OFF**: 6. Disable Strict Mode in Options 7. Start a new session 8. Navigate to twitter.com

**Verify**:

- [ ] Site is accessible (no blocking)
- [ ] No warning appears (twitter.com is not in discouraged list)

**Result**: PASS / FAIL
**Notes**:

---

### Test 6: Test Task CRUD in Options

**Objective**: Verify all Create, Read, Update, Delete operations for tasks

**Steps**:

**CREATE OPERATIONS**:

1. Open Options page (right-click extension icon → Options)
2. Navigate to "Task Management" section
3. Click "Add Goal" button

**Verify**:

- [ ] Modal/form appears for creating a goal
- [ ] Name field is present
- [ ] Description field is present

4. Enter the following:
   - Name: "Work Projects"
   - Description: "Professional work tasks"
5. Click Save

**Verify**:

- [ ] Goal appears in the task list
- [ ] Name "Work Projects" is visible
- [ ] Description is visible

6. Click "Add Task" button under "Work Projects" goal

**Verify**:

- [ ] Modal/form appears for creating a task

7. Enter the following:
   - Name: "Complete Report"
   - Description: "Q4 financial report"
8. Click Save

**Verify**:

- [ ] Task appears under "Work Projects" goal
- [ ] Task is properly nested/indented

9. Click "Add Subtask" button under "Complete Report" task

**Verify**:

- [ ] Modal/form appears for creating a subtask

10. Enter the following:
    - Name: "Gather data"
    - Estimated Duration: 30 minutes
11. Click Save

**Verify**:

- [ ] Subtask appears under "Complete Report" task
- [ ] Subtask is properly nested/indented
- [ ] Duration displays correctly

**READ OPERATIONS**:

12. Verify all created items display correctly:

- [ ] Goal name and description visible
- [ ] Task name and description visible
- [ ] Subtask name and duration visible
- [ ] Hierarchy is clear (Goal → Task → Subtask)

**UPDATE OPERATIONS**:

13. Click "Edit" button on "Work Projects" goal

**Verify**:

- [ ] Modal pre-fills with current values
- [ ] Name shows "Work Projects"
- [ ] Description shows "Professional work tasks"

14. Change description to "Updated professional tasks"
15. Click Save

**Verify**:

- [ ] Description updates in the list
- [ ] New description displays correctly

16. Click "Edit" button on "Complete Report" task
17. Change name to "Finalize Report"
18. Click Save

**Verify**:

- [ ] Task name updates to "Finalize Report"

**DELETE OPERATIONS**:

19. Click "Delete" button on the subtask "Gather data"

**Verify**:

- [ ] Confirmation dialog appears
- [ ] Dialog asks for confirmation

20. Click Confirm

**Verify**:

- [ ] Subtask is removed from the list
- [ ] Task "Finalize Report" still exists

21. Create a new subtask under "Finalize Report" for testing
22. Click "Delete" button on the task "Finalize Report"

**Verify**:

- [ ] Confirmation dialog appears

23. Click Confirm

**Verify**:

- [ ] Task is removed
- [ ] All subtasks under it are also removed
- [ ] Goal "Work Projects" still exists

24. Click "Delete" button on goal "Work Projects"
25. Click Confirm

**Verify**:

- [ ] Goal is removed
- [ ] All tasks and subtasks under it are removed
- [ ] Task list is now empty

**VERIFY IN POPUP**:

26. Open the popup
27. Look at the task dropdown in the session start area

**Verify**:

- [ ] Dropdown is empty (no tasks available)

28. Create a new goal, task, and subtask in Options
29. Return to popup

**Verify**:

- [ ] New task appears in the dropdown
- [ ] Can select it for a session

**Result**: PASS / FAIL
**Notes**:

---

### Test 7: Test All Settings Persistence

**Objective**: Verify all settings save and persist across browser restarts

**Steps**:

1. Open Options page
2. Configure the following settings:

**Session Configuration**:

- [ ] Set default session duration to 15 minutes
- [ ] Set default break duration to 3 minutes
- [ ] Enable "Auto-start next session" toggle
- [ ] Set idle threshold to 180 seconds

**Distraction Management**:

- [ ] Add "reddit.com" to discouraged sites
- [ ] Add "youtube.com" to discouraged sites
- [ ] Enable Strict Mode
- [ ] Add "twitter.com" to blocked sites
- [ ] Add "facebook.com" to blocked sites

**Preferences**:

- [ ] Disable animations toggle
- [ ] Disable notifications toggle
- [ ] Set sound volume to 75%

3. Close the Options page
4. Open popup

**Verify**:

- [ ] Duration input shows "15" (new default)

5. Close Chrome completely (all windows)
6. Wait 10 seconds
7. Reopen Chrome
8. Open the extension Options page

**Verify All Settings Retained**:

- [ ] Session duration: 15 minutes
- [ ] Break duration: 3 minutes
- [ ] Auto-start: enabled (checked)
- [ ] Idle threshold: 180 seconds
- [ ] Discouraged sites: reddit.com, youtube.com (both present)
- [ ] Strict mode: enabled (checked)
- [ ] Blocked sites: twitter.com, facebook.com (both present)
- [ ] Animations: disabled (unchecked)
- [ ] Notifications: disabled (unchecked)
- [ ] Sound volume: 75%

9. Open popup

**Verify**:

- [ ] Duration input still shows "15" (default persisted)

**Result**: PASS / FAIL
**Notes**:

---

### Test 8: Test Streak Tracking Over Multiple Days

**Objective**: Verify consecutive session streak tracking

**Note**: This test requires multiple days to complete. Document results as you progress.

**Day 1** (Today):

1. Complete at least one focus session (any duration)
2. Open Options → Statistics section

**Verify**:

- [ ] Current streak: 1
- [ ] Last session date: [Today's date]
- [ ] Total sessions: [Count includes this session]

**Record**:

- Date: **\_\_\_**
- Current streak: **\_\_\_**
- Total sessions: **\_\_\_**

**Day 2** (Tomorrow):

1. Complete at least one focus session
2. Open Options → Statistics

**Verify**:

- [ ] Current streak: 2
- [ ] Last session date: [Today's date]
- [ ] Total sessions: [Previous count + 1]

**Record**:

- Date: **\_\_\_**
- Current streak: **\_\_\_**

**Day 3** (Day After Tomorrow):

1. **DO NOT complete any sessions** (intentionally skip)

**Day 4** (Two Days After Tomorrow):

1. Complete a focus session
2. Open Options → Statistics

**Verify**:

- [ ] Current streak: 1 (reset due to skipped day)
- [ ] Longest streak: 2 (preserved from Day 1-2)
- [ ] Last session date: [Today's date]

**Record**:

- Date: **\_\_\_**
- Current streak: **\_\_\_**
- Longest streak: **\_\_\_**

**Result**: PASS / FAIL (Complete after Day 4)
**Notes**:

---

### Test 9: Test Idle Collection Over Time

**Objective**: Verify passive Content Soul collection works correctly

**Steps**:

1. Open popup and note current values:

   - Soul Embers: **\_\_\_**
   - Current time: **\_\_\_**

2. Close the popup
3. Wait exactly 5 minutes (set a timer)
4. After 5 minutes, open the popup

**Verify**:

- [ ] Soul Embers increased
- [ ] Idle collection occurred automatically

**Calculate Expected Increase**:

- Formula: 1 soul per 5 min _ (1 + soulflow _ 0.1) = 5 embers per 5 min
- With Soulflow = 1: 1 _ (1 + 1 _ 0.1) = 1.1 souls per 5 min
- 1.1 souls \* 5 embers per soul = 5.5 embers per 5 min

**Verify**:

- [ ] Soul Embers increased by approximately 5-6 embers
- [ ] Calculation matches formula

**Record**:

- Soul Embers before: **\_\_\_**
- Soul Embers after: **\_\_\_**
- Actual increase: **\_\_\_**
- Expected increase: ~5.5

5. Close Chrome completely (all windows)
6. Wait exactly 10 minutes (set a timer)
7. Reopen Chrome
8. Open the extension popup

**Verify**:

- [ ] Idle collection calculated for time browser was closed
- [ ] Soul Embers increased by approximately 11 embers (10 min worth)
- [ ] lastCollectionTime was updated

**Record**:

- Soul Embers before closing: **\_\_\_**
- Soul Embers after reopening: **\_\_\_**
- Actual increase: **\_\_\_**
- Expected increase: ~11

**Result**: PASS / FAIL
**Notes**:

---

### Test 10: Verify State Persistence Across Browser Restarts

**Objective**: Ensure complete game state persists perfectly

**Preparation**:

- Complete several sessions to build up significant state
- Aim for: Level 2+, 20+ Soul Embers, 1+ stat upgrades

**Steps**:

1. Build up game state by completing multiple sessions
2. Upgrade at least one stat
3. Create at least one task in Options
4. Configure at least one setting

5. Before closing browser, record all current values:

**Player State**:

- Level: **\_\_\_**
- Soul Insight: **\_\_\_**/**\_\_\_** (current/next level)
- Soul Embers: **\_\_\_**
- Spirit: **\_\_\_**
- Harmony: **\_\_\_**
- Soulflow: **\_\_\_**
- Skill Points: **\_\_\_**

**Progression State**:

- Current Boss: **\_\_\_**
- Boss Resolve: **\_\_\_**/**\_\_\_**
- Bosses Defeated: **\_\_\_**

**Tasks**:

- Number of goals: **\_\_\_**
- Number of tasks: **\_\_\_**
- Number of subtasks: **\_\_\_**

**Settings**:

- Session duration: **\_\_\_**
- Break duration: **\_\_\_**
- Discouraged sites count: **\_\_\_**
- Blocked sites count: **\_\_\_**

6. Close Chrome completely (all windows)
7. Wait 30 seconds
8. Reopen Chrome
9. Open extension popup

**Verify All State Retained**:

- [ ] Level matches recorded value
- [ ] Soul Insight matches recorded value
- [ ] Soul Embers matches recorded value
- [ ] Spirit stat matches
- [ ] Harmony stat matches
- [ ] Soulflow stat matches
- [ ] Skill Points match
- [ ] Current boss matches
- [ ] Boss Resolve matches
- [ ] Bosses defeated count matches

10. Open Options page

**Verify**:

- [ ] All tasks present (goals, tasks, subtasks)
- [ ] All settings retained
- [ ] Statistics match previous values

11. If a session or break was active when browser closed:

**Verify**:

- [ ] Extension handled the interruption appropriately
- [ ] Either session ended or continued based on elapsed time
- [ ] No data loss occurred

**Result**: PASS / FAIL
**Notes**:

---

## Additional Tests (Optional but Recommended)

### Test 11: Boss Defeat and Progression

**Objective**: Verify boss defeat mechanics

**Note**: This requires completing many sessions or manually adjusting boss Resolve for testing

**Steps**:

1. Complete sessions until boss Resolve reaches 0
2. Verify boss defeat animation/message
3. Verify next boss unlocks
4. Verify new boss Resolve is set correctly

**Result**: PASS / FAIL
**Notes**:

---

### Test 12: Stat Upgrades and Cost Scaling

**Objective**: Verify stat upgrade system

**Steps**:

1. Accumulate 50+ Soul Embers
2. Upgrade Spirit stat
3. Verify cost was 10 embers (first upgrade)
4. Verify Spirit increased by 1
5. Verify next upgrade cost is 15 (10 \* 1.5^1)
6. Upgrade again
7. Verify cost was 15 embers
8. Verify next upgrade cost is 22 (10 \* 1.5^2)

**Result**: PASS / FAIL
**Notes**:

---

### Test 13: Skill Point Allocation

**Objective**: Verify skill points from level-ups

**Steps**:

1. Level up to level 2 (reach 100 Soul Insight)
2. Verify 1 skill point granted
3. Allocate skill point to a stat
4. Verify stat increased by 1
5. Verify skill point deducted

**Result**: PASS / FAIL
**Notes**:

---

### Test 14: Critical Hit Mechanics

**Objective**: Verify Harmony stat affects critical hits

**Steps**:

1. Upgrade Harmony to 20% (requires multiple upgrades)
2. Complete 10 sessions
3. Verify approximately 2 sessions had critical hits
4. Verify critical hits granted 1.5x rewards

**Result**: PASS / FAIL
**Notes**:

---

### Test 15: Cosmetics System

**Objective**: Verify cosmetic purchases and application

**Steps**:

1. Accumulate 100+ Soul Embers
2. Open shop in popup
3. Purchase a theme
4. Apply the theme
5. Verify UI colors change
6. Purchase a character sprite
7. Apply the sprite
8. Verify character image changes
9. Close and reopen popup
10. Verify cosmetics persist

**Result**: PASS / FAIL
**Notes**:

---

### Test 16: Animations Toggle

**Objective**: Verify animation preference works

**Steps**:

1. Enable animations in Options
2. Open popup during break
3. Verify Content Souls float across screen
4. Verify XP bar animates
5. Disable animations
6. Open popup during break
7. Verify no animations play
8. Verify simple counters display instead

**Result**: PASS / FAIL
**Notes**:

---

### Test 17: Notifications Toggle

**Objective**: Verify notification preference works

**Steps**:

1. Enable notifications in Options
2. Complete a session
3. Verify notification appears
4. Disable notifications
5. Complete another session
6. Verify no notification appears

**Result**: PASS / FAIL
**Notes**:

---

### Test 18: Auto-Start Next Session

**Objective**: Verify auto-start preference

**Steps**:

1. Enable "Auto-start next session" in Options
2. Complete a session
3. Wait for break to end
4. Verify automatic prompt to start next session
5. Disable auto-start
6. Complete another session
7. Wait for break to end
8. Verify no automatic prompt

**Result**: PASS / FAIL
**Notes**:

---

## Critical Issues Found

List any blocking bugs that prevent core functionality:

1.
2.
3.

---

## Minor Issues Found

List any non-blocking issues or improvements:

1.
2.
3.

---

## Overall Test Summary

**Total Tests Executed**: **\_\_\_**
**Tests Passed**: **\_\_\_**
**Tests Failed**: **\_\_\_**
**Tests Skipped**: **\_\_\_**

**Pass Rate**: **\_\_\_**%

---

## Recommendations

Based on testing results:

1.
2.
3.

---

## Sign-Off

**Tester Name**: ********\_\_\_********
**Date Completed**: ********\_\_\_********
**Overall Status**: PASS / FAIL / PASS WITH ISSUES

**Ready for Release**: YES / NO / WITH FIXES

---

## Notes

Additional observations or comments:
