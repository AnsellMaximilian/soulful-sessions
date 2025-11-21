# Boss Defeat and Unlock Flow - Manual Test

## Purpose

Test the boss defeat and unlock flow implementation (Task 31).

## Prerequisites

- Extension loaded in Chrome
- Fresh state or known boss/level state

## Test Scenarios

### Test 1: Boss Defeat with Level Sufficient for Next Boss

**Setup:**

1. Ensure player is at level 3 or higher
2. Ensure current boss (The Restless Athlete) has low Resolve (< 50)

**Steps:**

1. Start a focus session (25 minutes recommended)
2. Complete the session
3. Observe the reward view

**Expected Results:**

- Boss Resolve reaches 0
- Boss defeat overlay appears with:
  - ✨ icon
  - "Stubborn Soul Guided!" title
  - Message about soul finding peace
  - "Next Soul Awaits" section showing The Unfinished Scholar
  - Boss backstory and initial Resolve displayed
  - "Continue" button
- After clicking Continue, break view shows new boss (The Unfinished Scholar)
- Statistics show bossesDefeated incremented

### Test 2: Boss Defeat with Level Too Low for Next Boss

**Setup:**

1. Manually edit state to set player level to 1
2. Set current boss Resolve to a low value (< 50)
3. Set current boss to The Restless Athlete (index 0)

**Steps:**

1. Start a focus session
2. Complete the session to defeat the boss
3. Observe the reward view

**Expected Results:**

- Boss Resolve reaches 0
- Boss defeat overlay appears with:
  - 🔒 icon
  - "Stubborn Soul Guided!" title
  - Message about soul finding peace
  - "Next Soul: The Unfinished Scholar" with lock message
  - "Boss locked until level 3" message
  - Hint showing current level and encouragement to level up
  - "Continue" button
- After clicking Continue, break view still shows The Restless Athlete (locked boss not unlocked)
- Player must level up to 3 before next boss unlocks

### Test 3: Final Boss Defeated (Campaign Complete)

**Setup:**

1. Manually edit state to set current boss to last boss (index 9)
2. Set boss Resolve to low value
3. Ensure player level is high enough

**Steps:**

1. Start and complete a focus session to defeat final boss
2. Observe the reward view

**Expected Results:**

- Boss defeat overlay appears with:
  - 🎉 icon
  - "Campaign Complete!" title
  - Message about guiding all Stubborn Souls
  - Encouragement to continue focus sessions
  - "Continue" button
- No next boss is shown
- Player can continue doing sessions but no new bosses appear

### Test 4: Boss Not Defeated (Partial Damage)

**Setup:**

1. Ensure current boss has high Resolve (> 200)
2. Player at any level

**Steps:**

1. Start a short focus session (5 minutes)
2. Complete the session
3. Observe the reward view

**Expected Results:**

- Boss Resolve decreases but doesn't reach 0
- No boss defeat overlay appears
- Reward view shows normal rewards and remaining Resolve
- Break view shows same boss with updated Resolve

### Test 5: Level Up During Boss Defeat

**Setup:**

1. Set player close to level up (Soul Insight near threshold)
2. Set boss Resolve low enough to defeat
3. Current level below next boss unlock requirement

**Steps:**

1. Complete a session that both defeats boss and levels up player
2. Observe if level up happens before boss unlock check

**Expected Results:**

- Player levels up first
- If new level meets next boss requirement, boss unlocks
- If new level still too low, boss remains locked
- Both level-up and boss defeat notifications appear

## Manual State Editing (for testing)

To manually edit state for testing:

1. Open Chrome DevTools (F12)
2. Go to Application tab → Storage → Local Storage
3. Find `soulShepherdState` key
4. Edit the JSON:
   ```json
   {
     "player": {
       "level": 1,  // Change this
       "soulInsight": 0,
       "soulInsightToNextLevel": 100,
       ...
     },
     "progression": {
       "currentBossIndex": 0,  // Change this (0-9)
       "currentBossResolve": 50,  // Change this
       ...
     }
   }
   ```
5. Reload the extension popup

## Console Logging

Watch the background service worker console for:

- `[Background] Boss defeated!`
- `[Background] Next boss available: [name]`
- `[Background] Boss unlocked: [name]` (if level sufficient)
- `[Background] Boss locked: [name] requires level X, player is level Y` (if level too low)
- `[Background] All bosses defeated - campaign complete!` (if final boss)

## Success Criteria

✅ Boss defeat overlay displays correctly with appropriate icon and message
✅ Next boss information shown when available
✅ Lock message displayed when player level too low
✅ Campaign complete message shown when all bosses defeated
✅ Boss unlock only happens when player level meets requirement
✅ State correctly updates with new boss or remains on current boss if locked
✅ Statistics correctly increment bossesDefeated counter
✅ No errors in console
✅ Smooth animations and transitions
