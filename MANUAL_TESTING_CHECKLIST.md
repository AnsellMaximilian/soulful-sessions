# Soul Shepherd - Quick Testing Checklist

## Pre-Testing Setup

- [ ] Build extension: `npm run build`
- [ ] Load unpacked extension from `dist` folder
- [ ] Extension icon visible in Chrome toolbar

## Core Functionality Tests

### Initial State (5 min)

- [ ] Popup opens successfully
- [ ] Default values correct (Level 1, 0 Soul Insight, 0 Embers)
- [ ] First boss displays ("The Restless Athlete")
- [ ] Start session button works

### Task Management (10 min)

- [ ] Create goal
- [ ] Create task under goal
- [ ] Create subtask under task
- [ ] Edit goal/task/subtask
- [ ] Delete subtask/task/goal
- [ ] Tasks appear in popup dropdown

### Session Flow (15 min)

- [ ] Start session (use 1-min duration for testing)
- [ ] Minimal UI displays during session
- [ ] Session completes automatically
- [ ] Rewards calculated correctly
- [ ] Break timer starts
- [ ] Break completes

### Settings Persistence (10 min)

- [ ] Change session duration default
- [ ] Change break duration default
- [ ] Add discouraged sites
- [ ] Enable strict mode
- [ ] Add blocked sites
- [ ] Toggle animations off
- [ ] Close and reopen browser
- [ ] All settings retained

### Idle Detection (10 min)

- [ ] Start 5-min session
- [ ] Step away for 3 minutes
- [ ] Return and check idle time tracked
- [ ] Complete session
- [ ] Idle/active breakdown shows in rewards

### Discouraged Sites (10 min)

- [ ] Add reddit.com to discouraged sites
- [ ] Start session
- [ ] Visit reddit.com
- [ ] Warning overlay appears
- [ ] Complete session
- [ ] Compromise penalty applied

### Strict Mode (10 min)

- [ ] Enable strict mode
- [ ] Add twitter.com to blocked sites
- [ ] Start session
- [ ] Visit twitter.com
- [ ] Page blocked with custom message
- [ ] Emergency exit works with penalty

### Progression (15 min)

- [ ] Complete multiple sessions
- [ ] Boss Resolve decreases
- [ ] Soul Insight accumulates
- [ ] Level up occurs at threshold
- [ ] Skill point granted
- [ ] Boss defeated when Resolve = 0
- [ ] Next boss unlocks

### Stat System (10 min)

- [ ] Upgrade Spirit with Soul Embers
- [ ] Cost increases after upgrade
- [ ] Upgrade Harmony
- [ ] Upgrade Soulflow
- [ ] Insufficient embers disables button
- [ ] Allocate skill point to stat

### Idle Collection (15 min)

- [ ] Note current Soul Embers
- [ ] Wait 5+ minutes
- [ ] Open popup
- [ ] Soul Embers increased
- [ ] Close browser
- [ ] Wait 10 minutes
- [ ] Reopen browser
- [ ] Idle collection calculated for closed time

### Statistics (5 min)

- [ ] Open Options → Statistics
- [ ] Total sessions count correct
- [ ] Total focus time correct
- [ ] Current streak displays
- [ ] Bosses defeated count correct
- [ ] All lifetime stats accurate

### Cosmetics (10 min)

- [ ] Accumulate 100+ Soul Embers
- [ ] Open shop in popup
- [ ] Purchase theme
- [ ] Apply theme
- [ ] UI colors change
- [ ] Purchase character sprite
- [ ] Apply sprite
- [ ] Character image changes
- [ ] Cosmetics persist after restart

### Animations (5 min)

- [ ] Animations enabled: Content Souls float
- [ ] XP bar animates
- [ ] Reward numbers count up
- [ ] Disable animations
- [ ] No animations play
- [ ] Simple counters display

### Notifications (5 min)

- [ ] Enable notifications
- [ ] Complete session
- [ ] Notification appears
- [ ] Disable notifications
- [ ] Complete session
- [ ] No notification

### State Persistence (10 min)

- [ ] Build up significant state (Level 3+, multiple sessions)
- [ ] Note all values
- [ ] Close Chrome completely
- [ ] Reopen Chrome
- [ ] All state retained perfectly

### Streak Tracking (Multi-day)

- [ ] Day 1: Complete session, streak = 1
- [ ] Day 2: Complete session, streak = 2
- [ ] Day 3: Skip (no session)
- [ ] Day 4: Complete session, streak = 1 (reset)
- [ ] Longest streak preserved

## Edge Cases & Error Handling

### Storage Errors (5 min)

- [ ] Simulate storage failure
- [ ] Error logged
- [ ] User notified
- [ ] Extension continues functioning

### Timer Errors (5 min)

- [ ] Start session
- [ ] Put computer to sleep
- [ ] Wake after session should end
- [ ] Extension detects and handles correctly

### Critical Hits (10 min)

- [ ] Upgrade Harmony to 20%
- [ ] Complete 10 sessions
- [ ] ~2 critical hits occur
- [ ] 1.5x rewards applied

### Auto-Start (5 min)

- [ ] Enable auto-start
- [ ] Complete session and break
- [ ] Automatic prompt appears
- [ ] Disable auto-start
- [ ] No automatic prompt

## Total Estimated Time: ~3 hours

(Excluding multi-day streak tracking)

## Critical Bugs Found

List any blocking issues:

1.
2.
3.

## Minor Issues Found

List any non-blocking issues:

1.
2.
3.

## Testing Complete

- [ ] All tests passed
- [ ] All issues documented
- [ ] Extension ready for use

**Tester Name**: ******\_\_\_******
**Date**: ******\_\_\_******
**Chrome Version**: ******\_\_\_******
**Extension Version**: ******\_\_\_******
