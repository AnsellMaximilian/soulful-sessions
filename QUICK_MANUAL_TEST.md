# Soul Shepherd - Quick Manual Test (30 Minutes)

This is a condensed version of the manual testing suite focusing on the most critical functionality. Use this for rapid verification after builds.

---

## Setup (2 minutes)

1. Build extension: `npm run build`
2. Open Chrome: `chrome://extensions/`
3. Enable Developer mode
4. Load unpacked from `dist` folder
5. Pin extension icon to toolbar

✅ Extension loaded successfully

---

## Critical Path Tests

### 1. Initial State (2 minutes)

**Test**: Open popup for first time

**Verify**:

- ✅ Popup opens (400x600px)
- ✅ Level 1, 0 Soul Insight, 0 Embers
- ✅ Default stats (Spirit: 1, Harmony: 5%, Soulflow: 1)
- ✅ First boss: "The Restless Athlete" (100/100 Resolve)
- ✅ Start button visible, duration shows 25 min

**Status**: PASS / FAIL

---

### 2. Complete Session (3 minutes)

**Test**: Full session flow with 1-minute duration

**Steps**:

1. Set duration to 1 minute
2. Click "Start Focus Session"
3. Wait 1 minute

**Verify**:

- ✅ Minimal UI during session
- ✅ Auto-switches to Reward View after 1 min
- ✅ Soul Insight earned: ~11 (formula: 1 _ 10 _ 1.1)
- ✅ Soul Embers earned: ~2 (formula: 1 _ 2 _ 1.05)
- ✅ Boss damage: ~0.5 (formula: 1 _ 1 _ 0.5)
- ✅ Boss Resolve decreased to 99.5
- ✅ Break timer starts (5 min)

**Status**: PASS / FAIL

---

### 3. Task CRUD (5 minutes)

**Test**: Create, edit, delete tasks

**Steps**:

1. Open Options page
2. Add Goal: "Test Goal"
3. Add Task under goal: "Test Task"
4. Add Subtask: "Test Subtask" (30 min)
5. Edit goal name to "Updated Goal"
6. Delete subtask
7. Delete task
8. Delete goal

**Verify**:

- ✅ All create operations work
- ✅ Items display in hierarchy
- ✅ Edit updates values
- ✅ Delete removes items
- ✅ Deleting parent removes children

**Status**: PASS / FAIL

---

### 4. Settings Persistence (5 minutes)

**Test**: Settings survive browser restart

**Steps**:

1. In Options, set:
   - Session duration: 15 min
   - Break duration: 3 min
   - Add discouraged site: "reddit.com"
   - Enable strict mode
   - Add blocked site: "twitter.com"
   - Disable animations
2. Close Chrome completely
3. Reopen Chrome
4. Check Options page

**Verify**:

- ✅ All settings retained after restart
- ✅ Session duration: 15 min
- ✅ Discouraged sites: reddit.com
- ✅ Blocked sites: twitter.com
- ✅ Animations: disabled

**Status**: PASS / FAIL

---

### 5. Idle Detection (5 minutes)

**Test**: Session pauses when user is idle

**Steps**:

1. Start 5-minute session
2. Step away for 3 minutes (don't touch computer)
3. Return and wait for session to complete

**Verify**:

- ✅ Session tracked idle time (~3 min)
- ✅ Active time tracked (~2 min)
- ✅ Compromise warning (idle > 25%)
- ✅ Rewards reduced (0.7x multiplier)

**Status**: PASS / FAIL

---

### 6. Discouraged Sites (3 minutes)

**Test**: Soft warnings on discouraged sites

**Steps**:

1. Add "reddit.com" to discouraged sites
2. Ensure strict mode is OFF
3. Start 2-minute session
4. Visit reddit.com

**Verify**:

- ✅ Warning overlay appears
- ✅ Message: "The Soul Shepherd senses this realm drains your Spirit..."
- ✅ Page still accessible
- ✅ Session marked as compromised
- ✅ Rewards reduced after session

**Status**: PASS / FAIL

---

### 7. Strict Mode Blocking (3 minutes)

**Test**: Hard blocking in strict mode

**Steps**:

1. Enable strict mode
2. Add "twitter.com" to blocked sites
3. Start session
4. Try to visit twitter.com

**Verify**:

- ✅ Page blocked (redirects to blocked.html)
- ✅ Message: "This realm is sealed..."
- ✅ Shows current boss and time remaining
- ✅ "End Session Early" button works
- ✅ Early end applies 50% penalty

**Status**: PASS / FAIL

---

### 8. State Persistence (3 minutes)

**Test**: Game state survives restart

**Steps**:

1. Complete 2-3 sessions to build state
2. Note: Level, Soul Insight, Soul Embers, Boss Resolve
3. Close Chrome completely
4. Reopen Chrome
5. Open popup

**Verify**:

- ✅ Level matches
- ✅ Soul Insight matches
- ✅ Soul Embers matches
- ✅ Boss Resolve matches
- ✅ All stats match

**Status**: PASS / FAIL

---

### 9. Idle Collection (3 minutes)

**Test**: Passive Soul Ember collection

**Steps**:

1. Note current Soul Embers: **\_\_\_**
2. Close popup
3. Wait 5 minutes
4. Open popup

**Verify**:

- ✅ Soul Embers increased by ~5-6
- ✅ Formula: 1 soul per 5 min _ (1 + soulflow _ 0.1) \* 5 embers/soul

**Status**: PASS / FAIL

---

## Quick Results

| Test                    | Status | Notes |
| ----------------------- | ------ | ----- |
| 1. Initial State        | ⬜     |       |
| 2. Complete Session     | ⬜     |       |
| 3. Task CRUD            | ⬜     |       |
| 4. Settings Persistence | ⬜     |       |
| 5. Idle Detection       | ⬜     |       |
| 6. Discouraged Sites    | ⬜     |       |
| 7. Strict Mode          | ⬜     |       |
| 8. State Persistence    | ⬜     |       |
| 9. Idle Collection      | ⬜     |       |

**Total**: \_\_\_/9 Passed

---

## Critical Issues

List any blocking bugs:

1.
2.
3.

---

## Overall Status

**PASS** / **FAIL** / **PASS WITH ISSUES**

**Tested By**: ********\_\_\_********
**Date**: ********\_\_\_********
**Chrome Version**: ********\_\_\_********

---

## Next Steps

- [ ] If all tests pass: Proceed to full manual testing
- [ ] If issues found: Document and fix before continuing
- [ ] If critical failures: Stop and debug immediately
