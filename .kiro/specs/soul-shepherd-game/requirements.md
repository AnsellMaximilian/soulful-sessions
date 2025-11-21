# Requirements Document

## Introduction

Soul Shepherd is a Chrome extension that combines dopamine detox principles with gamification to help users maintain focus during work sessions. The extension features a gentle Grim Reaper character who guides souls while the user completes real-world tasks. The system rewards actual work with progression, using a two-currency economy (Soul Insight for experience and Soul Embers for purchases) and a boss-based campaign structure where users progress through Stubborn Souls by completing focus sessions.

## Glossary

- **Soul Shepherd**: The main character controlled by the user; a gentle guide who helps souls pass on
- **Content Souls**: Passive spirits that are collected over time and yield Soul Embers currency
- **Stubborn Souls**: Campaign bosses with backstories and Resolve values that must be overcome through focus sessions
- **Soul Insight**: Experience points earned from completing focus sessions that drive level progression
- **Soul Embers**: Currency earned primarily from idle Content Soul collection, used for upgrades and cosmetics
- **Spirit**: A stat representing persuasive strength; affects progress against Stubborn Souls per work session
- **Harmony**: A stat representing critical hit chance for bonus progress or rewards during focus sessions
- **Soulflow**: A stat representing throughput; increases idle collection rate and soothing actions per session
- **Focus Session**: A timed work period during which the game UI is hidden and the user works on real tasks
- **Break**: A short timed period after a focus session when the full game UI is accessible
- **Resolve**: The resistance value of a Stubborn Soul that must be reduced to zero through focus sessions
- **Extension**: The Chrome browser extension that hosts the Soul Shepherd game
- **Background Service Worker**: The persistent script that manages game logic, timers, and state
- **Popup**: The UI displayed when clicking the extension icon
- **Options Page**: The configuration interface for tasks, goals, and extension settings
- **Discouraged Sites**: User-defined domains that trigger soft warnings during focus sessions
- **Blocked Sites**: User-defined domains that are hard-blocked during strict mode focus sessions
- **Strict Mode**: An optional setting that enforces hard blocking of specified sites during focus sessions

## Requirements

### Requirement 1

**User Story:** As a user struggling with distractions, I want to start timed focus sessions that hide game rewards, so that I can work without dopamine spikes interrupting my concentration

#### Acceptance Criteria

1. WHEN the user clicks "Start Focus Session" in the Popup, THE Extension SHALL initiate a focus session with the user-selected duration
2. WHILE a focus session is active, THE Popup SHALL display only minimal text indicating the session is in progress
3. WHILE a focus session is active, THE Extension SHALL hide all game statistics, rewards, and interactive elements from the Popup
4. WHEN a focus session timer reaches zero, THE Extension SHALL mark the session as complete and calculate rewards
5. IF the user attempts to view the Popup during an active focus session, THEN THE Extension SHALL display only the minimal "ritual in progress" message without game content

### Requirement 2

**User Story:** As a user who completes work, I want to receive Soul Insight and Soul Embers after each focus session, so that I feel rewarded for my real effort

#### Acceptance Criteria

1. WHEN a focus session completes successfully, THE Background Service Worker SHALL calculate Soul Insight based on session duration and current stats
2. WHEN a focus session completes successfully, THE Background Service Worker SHALL calculate Soul Embers based on session duration and Soulflow stat
3. WHEN rewards are calculated, THE Extension SHALL apply Harmony stat to determine if a critical success occurs
4. IF a critical success occurs during reward calculation, THEN THE Extension SHALL grant bonus Soul Insight or bonus progress against the current Stubborn Soul
5. WHEN the user opens the Popup after session completion, THE Extension SHALL display a reward screen showing Soul Insight earned, Soul Embers earned, and progress against the current Stubborn Soul

### Requirement 3

**User Story:** As a user building productive habits, I want to progress through story-driven Stubborn Soul bosses by completing focus sessions, so that I have a meaningful long-term goal

#### Acceptance Criteria

1. THE Extension SHALL maintain a fixed sequence of Stubborn Souls that all users progress through in the same order
2. WHEN a focus session completes, THE Background Service Worker SHALL reduce the current Stubborn Soul's Resolve value based on the user's Spirit stat and session quality
3. WHEN a Stubborn Soul's Resolve reaches zero, THE Extension SHALL mark that Stubborn Soul as completed and unlock the next Stubborn Soul in the sequence
4. THE Extension SHALL store each Stubborn Soul's backstory, name, and initial Resolve value in the game data
5. WHEN the user views the Popup during a break, THE Extension SHALL display the current Stubborn Soul's progress, backstory, and remaining Resolve

### Requirement 4

**User Story:** As a user who wants passive progress, I want to collect Content Souls over time while idle, so that I earn Soul Embers even when not actively working

#### Acceptance Criteria

1. THE Background Service Worker SHALL increment Content Soul collection at regular intervals based on elapsed time
2. WHEN Content Souls are collected, THE Background Service Worker SHALL convert them to Soul Embers based on the user's Soulflow stat
3. THE Extension SHALL calculate idle collection rate using the formula: base rate multiplied by Soulflow stat value
4. WHEN the user opens the Popup during a break, THE Extension SHALL display the number of Content Souls collected since last check
5. THE Background Service Worker SHALL persist idle collection timestamps to chrome.storage.local to maintain accuracy across browser sessions

### Requirement 5

**User Story:** As a user managing multiple projects, I want to define goals, tasks, and subtasks in the Options Page, so that I can organize my work and select what to focus on during sessions

#### Acceptance Criteria

1. THE Options Page SHALL provide an interface to create, edit, and delete user-defined goals
2. THE Options Page SHALL allow users to create tasks associated with each goal
3. THE Options Page SHALL allow users to create subtasks under each task that are small enough to complete in one focus session
4. WHEN starting a focus session, THE Popup SHALL allow the user to select which task or subtask they are working on
5. THE Extension SHALL store all goals, tasks, and subtasks in chrome.storage.local with unique identifiers

### Requirement 6

**User Story:** As a user prone to distraction, I want to configure discouraged sites that give soft warnings during focus sessions, so that I'm gently reminded without feeling restricted

#### Acceptance Criteria

1. THE Options Page SHALL provide an interface to add and remove domains to a discouraged sites list
2. WHILE a focus session is active, THE Background Service Worker SHALL monitor navigation events using chrome.webNavigation API
3. WHEN the user navigates to a discouraged site during a focus session, THE Extension SHALL mark the session as compromised
4. WHEN a session is marked as compromised, THE Extension SHALL reduce the Soul Insight and Soul Embers rewards for that session
5. WHERE a content script is injected on discouraged sites, THE Extension SHALL display a subtle overlay or banner warning the user

### Requirement 7

**User Story:** As a user who needs strict accountability, I want to enable strict mode that blocks specified sites during focus sessions, so that I cannot access distractions even if tempted

#### Acceptance Criteria

1. THE Options Page SHALL provide a toggle to enable or disable strict mode
2. WHERE strict mode is enabled, THE Options Page SHALL provide an interface to add and remove domains to a blocked sites list
3. WHILE strict mode is enabled and a focus session is active, THE Extension SHALL intercept navigation attempts to blocked domains
4. WHEN a blocked domain is accessed during strict mode, THE Extension SHALL redirect the user to a custom blocked page
5. THE custom blocked page SHALL display a message indicating the realm is sealed and offer an option to end the focus session with a penalty

### Requirement 8

**User Story:** As a user progressing in the game, I want to spend Soul Embers to upgrade my Spirit, Harmony, and Soulflow stats, so that I become more effective at guiding souls

#### Acceptance Criteria

1. THE Popup SHALL display the user's current Spirit, Harmony, and Soulflow stat values during breaks
2. THE Popup SHALL provide an interface to spend Soul Embers on stat upgrades during breaks
3. WHEN the user purchases a stat upgrade, THE Background Service Worker SHALL deduct the Soul Ember cost and increment the stat value
4. THE Extension SHALL calculate upgrade costs using a scaling formula that increases with each purchase
5. THE Extension SHALL persist all stat values to chrome.storage.local after each upgrade

### Requirement 9

**User Story:** As a user leveling up, I want to gain levels through Soul Insight accumulation and receive skill points, so that I can customize my character progression

#### Acceptance Criteria

1. THE Background Service Worker SHALL track total accumulated Soul Insight across all sessions
2. WHEN accumulated Soul Insight reaches a level threshold, THE Extension SHALL increment the user's level
3. WHEN the user gains a level, THE Extension SHALL grant skill points that can be allocated to stats
4. THE Popup SHALL display the user's current level, Soul Insight progress to next level, and available skill points during breaks
5. THE Extension SHALL calculate level thresholds using a progressive formula that increases with each level

### Requirement 10

**User Story:** As a user taking breaks, I want a timed break period after each focus session with full game access, so that I can enjoy my rewards before returning to work

#### Acceptance Criteria

1. WHEN a focus session completes, THE Background Service Worker SHALL automatically start a break timer with user-configured duration
2. WHILE a break is active, THE Popup SHALL display the full game UI including stats, rewards, upgrades, and Content Soul animations
3. WHEN the break timer reaches zero, THE Extension SHALL display a notification encouraging the user to start another focus session
4. THE Options Page SHALL allow users to configure default break duration in minutes
5. WHERE the user has enabled auto-start, WHEN a break ends, THE Extension SHALL automatically prompt to begin the next focus session

### Requirement 11

**User Story:** As a user configuring my workflow, I want to set default session lengths and break durations in the Options Page, so that I can customize the extension to my preferred work rhythm

#### Acceptance Criteria

1. THE Options Page SHALL provide input fields to set default focus session duration in minutes
2. THE Options Page SHALL provide an input field to set default break duration in minutes
3. THE Options Page SHALL validate that session duration is between 5 and 120 minutes
4. THE Options Page SHALL validate that break duration is between 1 and 30 minutes
5. WHEN the user starts a focus session from the Popup, THE Extension SHALL pre-populate the duration field with the configured default value

### Requirement 12

**User Story:** As a user who may step away, I want the extension to detect when I'm idle and not award rewards for fake sessions, so that progression remains tied to actual work

#### Acceptance Criteria

1. THE Background Service Worker SHALL use chrome.idle API to detect user idle state during focus sessions
2. WHEN the user is detected as idle for more than 2 minutes during a focus session, THE Extension SHALL pause the session timer
3. WHEN the user returns from idle state, THE Extension SHALL resume the session timer
4. IF total idle time exceeds 25 percent of session duration, THEN THE Extension SHALL mark the session as compromised and reduce rewards
5. THE Extension SHALL display idle time and active time separately in the post-session reward screen

### Requirement 13

**User Story:** As a user who enjoys visual feedback, I want to see Content Souls floating and being collected in the Popup during breaks, so that the idle progression feels tangible

#### Acceptance Criteria

1. WHILE a break is active, THE Popup SHALL render animated Content Soul sprites that float across the screen
2. THE Popup SHALL display a collection animation when Content Souls are converted to Soul Embers
3. THE Popup SHALL adjust the frequency of Content Soul animations based on the user's Soulflow stat
4. THE Options Page SHALL provide a toggle to enable or disable animations for performance or preference
5. WHERE animations are disabled, THE Popup SHALL display Content Soul collection as a simple numeric counter

### Requirement 14

**User Story:** As a user tracking my productivity, I want to view statistics about my focus sessions and streaks, so that I can see my progress over time

#### Acceptance Criteria

1. THE Background Service Worker SHALL track total number of completed focus sessions
2. THE Background Service Worker SHALL track current consecutive session streak
3. THE Background Service Worker SHALL track total time spent in focus sessions
4. THE Popup SHALL display session statistics during breaks including total sessions, current streak, and total focus time
5. WHEN a user skips a day without completing a session, THE Extension SHALL reset the consecutive session streak to zero

### Requirement 15

**User Story:** As a user who wants cosmetic customization, I want to spend Soul Embers on visual themes and character appearances, so that I can personalize my experience

#### Acceptance Criteria

1. THE Extension SHALL maintain a catalog of unlockable cosmetic items including themes and character sprites
2. THE Popup SHALL display a shop interface during breaks where cosmetic items can be purchased with Soul Embers
3. WHEN the user purchases a cosmetic item, THE Background Service Worker SHALL deduct Soul Embers and mark the item as owned
4. THE Popup SHALL apply the selected theme colors and character sprite to all UI elements
5. THE Extension SHALL persist cosmetic ownership and active selections to chrome.storage.sync for cross-device availability
