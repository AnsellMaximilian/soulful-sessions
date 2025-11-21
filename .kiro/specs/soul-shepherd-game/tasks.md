# Implementation Plan

- [x] 1. Set up core infrastructure and data models

  - Update manifest.json with all required permissions (storage, alarms, idle, webNavigation, tabs, declarativeNetRequest, notifications)
  - Create TypeScript interfaces for all data models (GameState, PlayerState, ProgressionState, TaskState, SettingsState, StatisticsState)
  - Create constants file with Stubborn Soul catalog and game formulas
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [x] 2. Implement StateManager and storage persistence

  - Create StateManager class with loadState, saveState, getState, and updateState methods
  - Implement default state initialization for new users
  - Add state validation and schema checking
  - Implement error handling with retry logic for storage operations
  - _Requirements: 1.1, 2.1, 3.4, 4.5_

- [x] 3. Create Background Service Worker skeleton

  - Set up background.ts file with service worker lifecycle
  - Initialize StateManager on extension install/startup
  - Implement message listener for communication with popup and options
  - Create message routing system with typed message handlers
  - _Requirements: 1.1, 1.4, 2.1_

- [x] 4. Implement SessionManager module

  - Create SessionManager class with startSession, endSession, pauseSession, resumeSession methods
  - Implement session state tracking (startTime, duration, taskId, isActive, isPaused, isCompromised)
  - Integrate chrome.alarms API to create session end timer
  - Add session validation to prevent multiple concurrent sessions
  - _Requirements: 1.1, 1.4, 12.2, 12.3_

- [x] 5. Implement RewardCalculator module

  - Create RewardCalculator class with calculateRewards method
  - Implement Soul Insight formula: sessionDuration _ 10 _ (1 + spirit \* 0.1)
  - Implement Soul Embers formula: sessionDuration _ 2 _ (1 + soulflow \* 0.05)
  - Implement critical hit check using Harmony stat with 1.5x multiplier
  - Implement compromise penalty with 0.7x multiplier
  - Calculate boss damage: spirit _ sessionDuration _ 0.5
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.2_

- [x] 6. Implement ProgressionManager module

  - Create ProgressionManager class with damageBoss, getCurrentBoss, unlockNextBoss methods
  - Implement boss Resolve reduction and defeat detection
  - Implement addExperience method with level-up threshold calculation
  - Implement skill point granting on level-up (1 point per level)
  - Create level threshold formula: 100 \* (level ^ 1.5)
  - _Requirements: 3.1, 3.2, 3.3, 9.1, 9.2, 9.3_

- [x] 7. Implement IdleCollector module

  - Create IdleCollector class with collectIdleSouls and calculateIdleRate methods
  - Implement idle collection formula: 1 soul per 5 minutes _ (1 + soulflow _ 0.1)
  - Convert Content Souls to Soul Embers at 5 embers per soul
  - Create chrome.alarms periodic alarm for idle collection (every 5 minutes)
  - Persist lastCollectionTime to handle browser restarts
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 8. Create basic Popup UI structure

  - Create popup.html with container divs for different view states
  - Create popup.css with base styles and layout (400x600px)
  - Set up popup.ts with view state management (idle, focusSession, reward, break)
  - Implement message passing to request state from background worker
  - Create utility functions for DOM manipulation and view switching
  - _Requirements: 1.2, 1.3, 1.5, 2.5_

- [x] 9. Implement Idle View in Popup

  - Create HTML structure for idle view (character, stats, currency, boss card)
  - Display player stats (Spirit, Harmony, Soulflow, Level)
  - Display Soul Insight progress bar to next level
  - Display Soul Embers count
  - Display current Stubborn Soul with name, backstory, and Resolve progress bar
  - Add "Start Focus Session" button with task selector dropdown and duration input
  - Pre-populate duration input with default from settings
  - _Requirements: 1.1, 3.5, 8.1, 9.4_

- [x] 10. Implement Focus Session View in Popup

  - Create minimal HTML for focus session view
  - Display large text: "Soul Shepherd is communing with a Stubborn Soul. Stay focused."
  - Optionally display remaining time (configurable in settings)
  - Hide all other UI elements (stats, currency, buttons)
  - _Requirements: 1.2, 1.3, 1.5_

- [x] 11. Implement Reward View in Popup

  - Create HTML structure for reward display
  - Animate Soul Insight earned with XP bar fill animation
  - Display Soul Embers earned
  - Display boss damage dealt and remaining Resolve
  - Show critical hit indicator if applicable
  - Show compromise warning if session was compromised
  - Display idle time vs active time breakdown
  - Add "Continue to Break" button
  - _Requirements: 2.5, 12.5_

-

- [x] 12. Implement Break View in Popup

  - Create HTML structure for full game UI during break
  - Display Soul Shepherd character (static image initially)
  - Show stats panel with current values
  - Show current Stubborn Soul card with progress
  - Display break timer countdown
  - Add "Start Next Session" button
  - _Requirements: 10.1, 10.2, 10.3_

- [x] 13. Wire up session start flow

  - Handle "Start Focus Session" button click in popup
  - Send startSession message to background with duration and taskId
  - Background calls SessionManager.startSession and creates alarm
  - Background updates state and notifies popup
  - Popup switches to Focus Session View
  - _Requirements: 1.1, 1.2_

- [x] 14. Wire up session end flow

  - Background alarm fires when session duration completes
  - Background calls SessionManager.endSession
  - Background calls RewardCalculator.calculateRewards
  - Background calls ProgressionManager.damageBoss and addExperience
  - Background updates state with rewards and progression
  - Background starts break timer alarm
  - Background sends sessionEnded message to popup with results
  - Popup switches to Reward View and displays results
  - _Requirements: 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 3.2, 9.1, 9.2, 10.1_

- [x] 15. Implement break timer flow

  - Background creates break alarm when session ends
  - Popup displays break timer countdown
  - When break alarm fires, background sends breakEnded message
  - Popup displays notification encouraging next session
  - If auto-start enabled, automatically show session start prompt
  - _Requirements: 10.1, 10.2, 10.3, 10.5_

- [x] 16. Create Options Page structure

  - Create options.html with sections for task management, session config, distraction management, preferences, statistics
  - Create options.css with layout and styling
  - Set up options.ts with message passing to background
  - Implement settings load on page open
  - Implement settings save on change with immediate persistence
  - _Requirements: 5.1, 11.1, 11.2_

- [x] 17. Implement Task Management UI in Options

  - Create tree view structure for Goals → Tasks → Subtasks
  - Implement add/edit/delete buttons for each level
  - Create modal dialogs for creating/editing items
  - Add task completion checkboxes
  - Implement task metadata fields (name, description, estimated duration)
  - Send task updates to background for persistence
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 18. Implement Session Configuration UI in Options

  - Create input fields for default session duration (5-120 minutes)
  - Create input field for default break duration (1-30 minutes)
  - Add validation to enforce min/max ranges
  - Create toggle for auto-start next session
  - Create slider for idle detection sensitivity
  - Save all settings to background on change
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 19. Implement Distraction Management UI in Options

  - Create discouraged sites list with add/remove functionality
  - Create blocked sites list with add/remove functionality
  - Add domain validation for site entries
  - Create strict mode toggle with warning message
  - Disable blocked sites list when strict mode is off
  - Add "Test URL" feature to check if domain matches lists
  - _Requirements: 6.1, 7.1, 7.2_

- [x] 20. Implement NavigationMonitor module

  - Create NavigationMonitor class with startMonitoring, stopMonitoring, checkUrl methods
  - Register chrome.webNavigation.onCommitted listener
  - Extract domain from URL and check against discouraged/blocked lists
  - Send siteVisited message to background when discouraged site detected
  - Mark session as compromised when discouraged site visited
  - _Requirements: 6.2, 6.3, 6.4_

- [x] 21. Implement Content Scripts for discouraged site warnings

  - Create content.ts script that runs on all pages
  - Send URL to background on page load
  - Receive response with site status (allowed, discouraged, blocked)
  - If discouraged and session active, inject warning overlay
  - Create overlay HTML/CSS with semi-transparent banner
  - Display text: "The Soul Shepherd senses this realm drains your Spirit. Return to your task."
  - Make overlay dismissible but reappear on navigation
  - Update manifest to inject content script on all HTTP/HTTPS pages
  - _Requirements: 6.5_

- [x] 22. Implement strict mode blocking

  - Create declarativeNetRequest rules for blocked sites
  - Update rules dynamically when blocked sites list changes
  - Redirect blocked sites to blocked.html page
  - Create blocked.html with Soul Shepherd character and message
  - Display text: "This realm is sealed while your Soul Shepherd works."
  - Show current Stubborn Soul name and remaining session time
  - Add "End Session Early (Penalty Applied)" button
  - Implement emergency session end with 50% reward reduction
  - Update manifest with declarativeNetRequest permission
  - _Requirements: 7.3, 7.4, 7.5_

- [x] 23. Implement stat upgrade system

  - Create upgrade cost formula: baseCost \* (1.5 ^ currentStatValue)
  - Add upgrade buttons to Break View stats panel
  - Display upgrade cost next to each stat
  - Handle upgrade purchase: deduct Soul Embers, increment stat, update cost
  - Disable upgrade button if insufficient Soul Embers
  - Persist stat changes to storage
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 24. Implement skill point allocation

  - Display available skill points in Break View
  - Add skill point allocation buttons next to each stat
  - Implement allocation: deduct skill point, increment stat by 1
  - Disable allocation if no skill points available
  - Show skill point grant animation on level-up
  - _Requirements: 9.3, 9.4, 9.5_

- [x] 25. Implement idle detection with chrome.idle API

  - Set idle threshold to 120 seconds (configurable in options)
  - Register chrome.idle.onStateChanged listener during active sessions
  - When idle detected, call SessionManager.pauseSession
  - When active detected, call SessionManager.resumeSession
  - Track total idle time and active time separately
  - If idle time exceeds 25% of session duration, mark as compromised
  - Display idle/active breakdown in reward view
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 26. Implement statistics tracking

  - Track totalSessions, totalFocusTime, currentStreak, longestStreak in StatisticsState
  - Increment totalSessions on each completed session
  - Add session duration to totalFocusTime
  - Update lastSessionDate on each session
  - Increment currentStreak if session completed on consecutive day
  - Reset currentStreak if day skipped
  - Update longestStreak if currentStreak exceeds it
  - Track bossesDefeated, totalSoulInsightEarned, totalSoulEmbersEarned
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 27. Implement Statistics Dashboard in Options

  - Create statistics section in options page
  - Display total focus time (formatted as hours and minutes)
  - Display total sessions completed
  - Display current streak and longest streak
  - Display bosses defeated count
  - Display current level and stat values
  - Display total Soul Insight and Soul Embers earned (lifetime)
  - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [x] 28. Implement Content Soul animations

  - Create CSS animations for floating souls across popup
  - Generate soul sprites at random intervals based on Soulflow stat
  - Animate souls from bottom to top with slight horizontal drift
  - Trigger collection animation when souls reach top
  - Display Soul Embers increment on collection
  - Add toggle in options to disable animations
  - If animations disabled, show simple numeric counter instead
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 29. Implement cosmetics system

  - Create cosmetic catalog with themes and character sprites
  - Define base cosmetics (default theme, default sprite)
  - Define unlockable cosmetics with Soul Ember costs
  - Create shop UI in Break View
  - Display available cosmetics with purchase buttons
  - Handle cosmetic purchase: deduct Soul Embers, mark as owned
  - Add cosmetic selection UI to apply owned items
  - Apply selected theme colors to all UI elements
  - Apply selected character sprite to Soul Shepherd displays
  - Persist cosmetic ownership and selections to chrome.storage.sync
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 30. Implement notifications

  - Request notification permission on extension install
  - Send notification when session completes: "Your ritual is complete. Souls await you."
  - Send notification when break ends: "Break complete. Ready for another session?"
  - Add notification settings toggle in options
  - Respect user's notification preference
  - _Requirements: 10.3_

- [x] 31. Implement boss defeat and unlock flow

  - When boss Resolve reaches zero, trigger boss defeat
  - Display boss defeat animation/message in popup
  - Unlock next boss in sequence
  - Reset current boss Resolve to next boss's initial Resolve
  - Check if user's level meets next boss unlock requirement
  - If level too low, show "Boss locked until level X" message
  - Send bossDefeated message to popup for celebration UI
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [x] 32. Implement level-up flow

  - When Soul Insight reaches threshold, trigger level-up
  - Calculate new level threshold using formula: 100 \* (level ^ 1.5)
  - Grant 1 skill point per level
  - Display level-up animation/message in popup
  - Send levelUp message to popup
  - Check if new level unlocks next boss
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 33. Implement error handling for storage operations

  - Wrap all chrome.storage calls in try-catch blocks
  - Implement exponential backoff retry (3 attempts)
  - If all retries fail, show user notification
  - Maintain in-memory state as fallback
  - Log all storage errors to console
  - _Requirements: 1.1, 2.1_

- [x] 34. Implement error handling for timer operations

  - On popup open, check if session/break should have ended
  - Calculate missed time if alarm fired late
  - Apply rewards retroactively based on actual elapsed time
  - Notify user if significant time discrepancy detected
  - Log timer errors to console
  - _Requirements: 1.4, 10.1_

- [x] 35. Implement state validation and migration

  - Create schema validator for GameState
  - Validate state on load from storage
  - If invalid, attempt to repair missing/corrupted fields
  - If unrepairable, backup old state and reset to default
  - Notify user of data loss if reset occurs
  - Implement version number for future migrations
  - _Requirements: 1.1, 2.1_

- [x] 36. Add Preferences UI in Options

  - Create preferences section with animation toggle
  - Add notification toggle
  - Add sound volume slider (0-100%)
  - Add theme selector (shows only unlocked themes)
  - Save all preferences immediately on change
  - _Requirements: 13.4, 13.5_

- [x] 37. Polish popup UI with animations and transitions

  - Add fade transitions between view states
  - Add XP bar fill animation on reward view
  - Add number count-up animation for rewards
  - Add pulse animation for critical hits
  - Add shake animation for compromise warnings
  - Add smooth progress bar animations for boss Resolve
  - Ensure all animations respect animationsEnabled setting
  - _Requirements: 2.5, 13.1, 13.2_

- [x] 38. Implement accessibility features

  - Add ARIA labels to all buttons and inputs
  - Ensure keyboard navigation works for all interactive elements
  - Add focus indicators with sufficient contrast
  - Test with screen reader (NVDA or JAWS)
  - Ensure color contrast meets WCAG AA standards
  - Add alt text to all images and character sprites
  - _Requirements: All requirements (accessibility is cross-cutting)_

- [x] 39. Create unit tests for core modules

  - Write tests for RewardCalculator formulas with various inputs
  - Write tests for ProgressionManager level-up thresholds
  - Write tests for IdleCollector time-based calculations
  - Write tests for NavigationMonitor URL matching
  - Write tests for StateManager validation and migration
  - Set up Jest with @types/chrome mocks
  - _Requirements: 2.1, 2.2, 3.2, 4.2, 6.2, 9.1_

- [x] 40. Create integration tests

  - Set up Puppeteer with Chrome extension support
  - Write test for complete session flow (start → work → rewards → break)
  - Write test for idle detection during session
  - Write test for discouraged site visit during session
  - Write test for strict mode blocking
  - Write test for boss defeat and unlock
  - Write test for level-up and skill point allocation
  - Write test for stat upgrade purchase
  - _Requirements: 1.1, 1.2, 1.4, 2.5, 3.2, 3.3, 6.3, 7.3, 8.2, 9.2, 12.1_

- [ ] 41. Perform manual testing

  - Install extension in Chrome and verify initial state
  - Complete full session and verify all calculations
  - Test idle detection by stepping away
  - Test discouraged site warnings
  - Test strict mode blocking
  - Test task CRUD in options
  - Test all settings persistence
  - Test streak tracking over multiple days
  - Test idle collection over time
  - Verify state persistence across browser restarts
  - _Requirements: All requirements_

- [x] 42. Performance optimization

  - Profile popup load time (target < 100ms)
  - Profile background worker memory usage (target < 50MB)
  - Profile storage operation timing (target < 50ms)
  - Profile animation frame rate (target > 30fps)
  - Optimize any bottlenecks found
  - Implement lazy loading for cosmetic assets
  - _Requirements: All requirements (performance is cross-cutting)_
