# Requirements Document

## Introduction

The Dev Screen is a development-only tool that allows developers to simulate focus sessions and test reward calculations without completing actual work sessions. This tool enables rapid iteration on game balance by providing immediate feedback on how formula changes affect Soul Insight (XP), Soul Embers (currency), boss damage, and level progression. The Dev Screen must use the exact same calculation functions as the production extension to ensure consistency between testing and actual gameplay.

## Glossary

- **Dev Screen**: A standalone HTML page served locally for development testing purposes
- **Session Simulator**: Component that simulates completed focus sessions with configurable parameters
- **RewardCalculator**: Production class that calculates Soul Insight, Soul Embers, and boss damage
- **ProgressionManager**: Production class that handles XP, leveling, and boss progression
- **Soul Insight**: Experience points earned from focus sessions
- **Soul Embers**: Currency earned from focus sessions
- **Boss Damage**: Damage dealt to current Stubborn Soul based on session completion
- **Player Stats**: Spirit (damage), Harmony (crit chance), and Soulflow (idle collection)
- **Critical Hit**: Random event based on Harmony stat that multiplies rewards by 1.5x
- **Compromised Session**: Session with excessive idle time or discouraged site visits (30% penalty)

## Requirements

### Requirement 1

**User Story:** As a developer, I want to simulate multiple focus sessions with different durations, so that I can quickly test how reward formulas scale across various session lengths.

#### Acceptance Criteria

1. WHEN the developer opens the Dev Screen THEN the system SHALL display input fields for session duration, number of sessions to simulate, and player stats
2. WHEN the developer enters a session duration between 5 and 120 minutes THEN the system SHALL accept the input as valid
3. WHEN the developer enters a session duration outside the 5-120 minute range THEN the system SHALL reject the input and display a validation error
4. WHEN the developer clicks the simulate button THEN the system SHALL execute the specified number of sessions using the RewardCalculator class
5. WHEN simulations complete THEN the system SHALL display total Soul Insight earned, total Soul Embers earned, total boss damage dealt, and number of critical hits

### Requirement 2

**User Story:** As a developer, I want to adjust player stats before running simulations, so that I can test how Spirit, Harmony, and Soulflow affect reward calculations.

#### Acceptance Criteria

1. WHEN the developer opens the Dev Screen THEN the system SHALL display input fields for Spirit, Harmony, and Soulflow with default values (1, 0.05, 1)
2. WHEN the developer modifies any stat value THEN the system SHALL use the updated values in all subsequent simulations
3. WHEN the developer enters a negative stat value THEN the system SHALL reject the input and display a validation error
4. WHEN the developer enters a Harmony value greater than 1.0 THEN the system SHALL accept it but display a warning that crit chance exceeds 100%
5. WHEN simulations run with modified stats THEN the system SHALL calculate rewards using the exact same formulas as the production RewardCalculator

### Requirement 3

**User Story:** As a developer, I want to see detailed breakdowns of each simulated session, so that I can understand exactly how rewards are calculated and identify edge cases.

#### Acceptance Criteria

1. WHEN simulations complete THEN the system SHALL display a table showing each session's duration, Soul Insight earned, Soul Embers earned, boss damage, and critical hit status
2. WHEN a session results in a critical hit THEN the system SHALL visually highlight that session in the results table
3. WHEN the developer hovers over a reward value THEN the system SHALL display a tooltip showing the calculation formula and intermediate values
4. WHEN the developer clicks on a session row THEN the system SHALL expand to show detailed calculation steps including base values, stat bonuses, and multipliers
5. WHEN the results table contains more than 20 sessions THEN the system SHALL implement pagination or scrolling to maintain readability

### Requirement 4

**User Story:** As a developer, I want to simulate compromised sessions with idle time penalties, so that I can verify the penalty calculations work correctly.

#### Acceptance Criteria

1. WHEN the developer opens the Dev Screen THEN the system SHALL display a checkbox to mark sessions as compromised
2. WHEN the compromised checkbox is enabled THEN the system SHALL apply the 30% penalty multiplier to all simulated sessions
3. WHEN compromised sessions are simulated THEN the system SHALL use the exact same applyCompromisePenalty method from the production RewardCalculator
4. WHEN compromised sessions complete THEN the system SHALL display both the base rewards and penalized rewards for comparison
5. WHEN the developer toggles the compromised checkbox THEN the system SHALL update the simulation results immediately

### Requirement 5

**User Story:** As a developer, I want to see how simulated sessions affect level progression, so that I can calibrate the leveling curve and ensure players level up at appropriate rates.

#### Acceptance Criteria

1. WHEN the developer opens the Dev Screen THEN the system SHALL display input fields for starting level and current Soul Insight
2. WHEN simulations complete THEN the system SHALL calculate and display the new player level using the ProgressionManager class
3. WHEN a level-up occurs during simulation THEN the system SHALL display the level-up event with the amount of Soul Insight required for that level
4. WHEN multiple level-ups occur THEN the system SHALL show each level threshold crossed and total skill points earned
5. WHEN the developer enters a starting level THEN the system SHALL calculate the correct Soul Insight threshold using the production formula (100 * level^1.5)

### Requirement 6

**User Story:** As a developer, I want to see how simulated sessions affect boss progression, so that I can balance boss Resolve values and ensure bosses are defeated at appropriate rates.

#### Acceptance Criteria

1. WHEN the developer opens the Dev Screen THEN the system SHALL display a dropdown to select the current boss from the STUBBORN_SOULS list
2. WHEN the developer selects a boss THEN the system SHALL display that boss's name, initial Resolve, and unlock level
3. WHEN simulations complete THEN the system SHALL calculate total boss damage and display remaining Resolve
4. WHEN total boss damage exceeds current Resolve THEN the system SHALL indicate the boss was defeated and show overflow damage
5. WHEN a boss is defeated THEN the system SHALL display the next boss in the sequence if available

### Requirement 7

**User Story:** As a developer, I want to export simulation results to a file, so that I can compare different formula configurations and track balance changes over time.

#### Acceptance Criteria

1. WHEN simulations complete THEN the system SHALL display an export button
2. WHEN the developer clicks the export button THEN the system SHALL generate a JSON file containing all simulation parameters and results
3. WHEN the JSON file is generated THEN the system SHALL include session details, total rewards, level progression, boss damage, and timestamp
4. WHEN the developer clicks export THEN the system SHALL trigger a browser download with filename format "dev-screen-results-YYYY-MM-DD-HHmmss.json"
5. WHEN the JSON file is created THEN the system SHALL format it with proper indentation for human readability

### Requirement 8

**User Story:** As a developer, I want to import previously exported simulation configurations, so that I can reproduce specific test scenarios and regression test formula changes.

#### Acceptance Criteria

1. WHEN the developer opens the Dev Screen THEN the system SHALL display an import button
2. WHEN the developer clicks the import button THEN the system SHALL open a file picker accepting JSON files
3. WHEN the developer selects a valid exported configuration file THEN the system SHALL populate all input fields with the imported values
4. WHEN the developer selects an invalid or corrupted file THEN the system SHALL display an error message and maintain current values
5. WHEN configuration is imported THEN the system SHALL automatically run the simulation with the imported parameters

### Requirement 9

**User Story:** As a developer, I want to run the Dev Screen with a simple command, so that I can quickly access the tool without complex setup.

#### Acceptance Criteria

1. WHEN the developer runs the dev screen command THEN the system SHALL start a local HTTP server
2. WHEN the server starts THEN the system SHALL automatically open the Dev Screen in the default browser
3. WHEN the server is running THEN the system SHALL serve the Dev Screen HTML file and all required JavaScript modules
4. WHEN the developer closes the browser THEN the system SHALL keep the server running until manually stopped
5. WHEN the developer stops the server THEN the system SHALL clean up all resources and terminate gracefully

### Requirement 10

**User Story:** As a developer, I want the Dev Screen to use the exact same calculation functions as the production code, so that I can trust that formula changes tested in the Dev Screen will behave identically in the extension.

#### Acceptance Criteria

1. WHEN the Dev Screen calculates rewards THEN the system SHALL import and use the production RewardCalculator class without modification
2. WHEN the Dev Screen calculates level progression THEN the system SHALL import and use the production ProgressionManager class without modification
3. WHEN the Dev Screen accesses game constants THEN the system SHALL import values from the production constants.ts file
4. WHEN the developer modifies a formula in the production code THEN the system SHALL reflect those changes in the Dev Screen without requiring Dev Screen code changes
5. WHEN the Dev Screen is built THEN the system SHALL use the same TypeScript compilation and bundling process as the production extension

### Requirement 11

**User Story:** As a developer, I want to reset the simulation state to default values, so that I can quickly start fresh test scenarios without manually clearing each field.

#### Acceptance Criteria

1. WHEN the developer opens the Dev Screen THEN the system SHALL display a reset button
2. WHEN the developer clicks the reset button THEN the system SHALL restore all input fields to their default values (level 1, 0 Soul Insight, base stats, 25 minute sessions)
3. WHEN the reset button is clicked THEN the system SHALL clear all simulation results from the display
4. WHEN the reset button is clicked THEN the system SHALL reset the selected boss to the first boss in the sequence
5. WHEN the developer confirms the reset action THEN the system SHALL update the UI immediately without requiring a page reload

### Requirement 12

**User Story:** As a developer, I want quick buttons to set the simulation character to specific levels, so that I can rapidly test different progression stages without manually calculating Soul Insight values.

#### Acceptance Criteria

1. WHEN the developer opens the Dev Screen THEN the system SHALL display quick level buttons for common test levels (5, 10, 20, 50, 100)
2. WHEN the developer clicks a quick level button THEN the system SHALL set the simulation character's level to that value
3. WHEN a quick level button is clicked THEN the system SHALL calculate and set the correct Soul Insight threshold for that level using the production formula
4. WHEN the simulation character level is updated via quick button THEN the system SHALL update the boss selection to show appropriate bosses for that level
5. WHEN the developer clicks a quick level button THEN the system SHALL preserve all other simulation parameters (stats, session duration, etc.)
