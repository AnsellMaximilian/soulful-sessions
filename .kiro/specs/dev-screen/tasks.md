# Implementation Plan

- [x] 1. Set up Dev Screen infrastructure and build configuration





  - Add dev-screen entry point to build.js for bundling
  - Create dev-screen.html with basic structure and styling
  - Create scripts/dev-screen-server.js for local HTTP server
  - Add "dev-screen" npm script to package.json
  - Ensure Dev Screen files are excluded from extension build
  - _Requirements: 9.1, 9.2, 9.3, 10.5_

- [x] 2. Create core simulation engine




- [x] 2.1 Implement SimulationEngine class with production class integration


  - Create src/dev-screen.ts with SimulationEngine class
  - Import and instantiate RewardCalculator from production code
  - Import and instantiate ProgressionManager from production code
  - Import FORMULAS and STUBBORN_SOULS from constants.ts
  - Implement createMockSession helper to create SessionState objects
  - _Requirements: 10.1, 10.2, 10.3_

- [x] 2.2 Implement single session simulation logic


  - Implement simulateSingleSession method
  - Create mock SessionState with specified duration
  - Call RewardCalculator.calculateRewards with mock session and stats
  - Capture calculation details (base values, bonuses, multipliers)
  - Return SessionSimulationResult with all reward data
  - _Requirements: 1.4, 2.5_

- [x] 2.3 Write property test for calculation consistency


  - **Property 7: Dev Screen produces identical results to production calculator**
  - **Validates: Requirements 2.5, 10.1**

- [x] 2.4 Implement full simulation orchestration


  - Implement runSimulation method accepting SimulationConfig
  - Loop through specified session count
  - Track cumulative Soul Insight and level progression
  - Track cumulative boss damage and defeat status
  - Aggregate totals (Soul Insight, Soul Embers, boss damage, critical hits)
  - Return complete SimulationResult with all data
  - _Requirements: 1.4, 1.5, 5.2, 6.3_

- [x] 2.5 Write property test for session count accuracy


  - **Property 3: Simulation executes correct number of sessions**
  - **Validates: Requirements 1.4**

- [x] 3. Implement UI controller and form handling






- [x] 3.1 Create UI controller class and initialize form

  - Create UIController class in dev-screen.ts
  - Implement initializeForm to set up event listeners
  - Create input fields for session duration, session count, and stats
  - Create dropdown for boss selection populated from STUBBORN_SOULS
  - Create compromised checkbox
  - Create simulate, reset, export, and import buttons
  - Create quick level buttons (5, 10, 20, 50, 100)
  - Set default values (25 min, 1/0.05/1 stats, level 1, first boss)
  - _Requirements: 1.1, 2.1, 4.1, 5.1, 6.1, 11.1, 12.1_

- [x] 3.2 Implement input validation


  - Implement validateInputs method
  - Validate session duration is between 5 and 120 minutes
  - Validate session count is positive integer
  - Validate stats are non-negative numbers
  - Validate level is positive integer
  - Display error messages for invalid inputs
  - Display warning for Harmony > 1.0
  - _Requirements: 1.2, 1.3, 2.3, 2.4_

- [x] 3.3 Write property tests for input validation


  - **Property 1: Valid session durations are accepted**
  - **Property 2: Invalid session durations are rejected**
  - **Property 6: Negative stat values are rejected**
  - **Validates: Requirements 1.2, 1.3, 2.3**

- [x] 3.4 Implement simulate button handler


  - Implement handleSimulateClick method
  - Validate all inputs before simulation
  - Gather SimulationConfig from form inputs
  - Call SimulationEngine.runSimulation
  - Pass results to renderResults method
  - Handle and display any simulation errors
  - _Requirements: 1.4, 1.5_

- [x] 4. Implement results display and visualization





- [x] 4.1 Implement results summary rendering


  - Implement renderResults method
  - Display total Soul Insight, Soul Embers, boss damage, critical hits
  - Call renderProgressionSummary for level progression data
  - Call renderBossSummary for boss status
  - Call renderSessionTable for detailed session breakdown
  - _Requirements: 1.5, 3.1_

- [x] 4.2 Write property test for results completeness


  - **Property 4: Simulation results contain all required fields**
  - **Validates: Requirements 1.5**

- [x] 4.3 Implement session results table


  - Implement renderSessionTable method
  - Create table with columns: session #, duration, Soul Insight, Soul Embers, boss damage, critical
  - Apply visual highlighting to critical hit rows
  - Implement click-to-expand for detailed calculation breakdown
  - Show base values, stat bonuses, multipliers in expanded view
  - Implement pagination or scrolling for >20 sessions
  - _Requirements: 3.1, 3.2, 3.4, 3.5_

- [x] 4.5 Write property test for critical hit highlighting


  - **Property 9: Critical hit sessions are visually highlighted**
  - **Validates: Requirements 3.2**

- [x] 4.6 Implement calculation tooltips


  - Implement showTooltip method
  - Create tooltips for reward values showing formulas
  - Display intermediate calculation values
  - Show formula: "duration * 10 * (1 + spirit * 0.1)" for Soul Insight
  - Show formula: "duration * 2 * (1 + soulflow * 0.05)" for Soul Embers
  - Show formula: "spirit * duration * 0.5" for boss damage
  - _Requirements: 3.3_

- [x] 4.7 Implement progression summary display

  - Implement renderProgressionSummary method
  - Display starting level, ending level, levels gained
  - Display skill points earned (1 per level)
  - Display final Soul Insight and progress to next level
  - Highlight level-up events with thresholds
  - Show each level threshold crossed for multiple level-ups
  - _Requirements: 5.2, 5.3, 5.4_

- [x] 4.8 Write property tests for level progression


  - **Property 14: Level-up events are displayed with thresholds**
  - **Property 15: Multiple level-ups are tracked correctly**
  - **Validates: Requirements 5.3, 5.4**

- [x] 4.9 Implement boss summary display

  - Implement renderBossSummary method
  - Display current boss name, initial Resolve, unlock level
  - Display starting Resolve and remaining Resolve after simulation
  - Indicate boss defeat with "DEFEATED" badge
  - Show overflow damage when boss is defeated
  - Display next boss information if available
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [x] 4.10 Write property tests for boss progression


  - **Property 17: Boss information is displayed correctly**
  - **Property 18: Boss damage calculations are accurate**
  - **Property 19: Boss defeat is indicated with overflow**
  - **Property 20: Next boss is displayed after defeat**
  - **Validates: Requirements 6.2, 6.3, 6.4, 6.5**

- [x] 5. Implement compromised session handling




- [x] 5.1 Add compromised session support to simulation


  - Update createMockSession to accept isCompromised parameter
  - Pass compromised status from checkbox to simulation
  - Ensure RewardCalculator.applyCompromisePenalty is called for compromised sessions
  - Track both base and penalized rewards in SessionSimulationResult
  - _Requirements: 4.2, 4.3_

- [x] 5.2 Write property tests for compromise penalty


  - **Property 10: Compromise penalty is applied consistently**
  - **Property 11: Dev Screen uses production penalty method**
  - **Validates: Requirements 4.2, 4.3**

- [x] 5.3 Display compromised session rewards


  - Update renderSessionTable to show both base and penalized rewards
  - Add columns or tooltip showing pre-penalty values
  - Visually distinguish compromised sessions (e.g., red text or icon)
  - Update calculation tooltips to show penalty application
  - _Requirements: 4.4_

- [x] 5.4 Write property test for compromised display


  - **Property 12: Compromised sessions display both reward values**
  - **Validates: Requirements 4.4**

- [x] 5.5 Implement compromised checkbox toggle behavior


  - Add event listener to compromised checkbox
  - Update simulation when checkbox is toggled
  - Re-run simulation automatically with new compromised status
  - Update results display immediately
  - _Requirements: 4.5_

- [x] 6. Implement level progression features




- [x] 6.1 Integrate ProgressionManager for level calculations


  - Call ProgressionManager.addExperience for cumulative Soul Insight
  - Call ProgressionManager.calculateLevelThreshold for level thresholds
  - Track level-ups and skill points during simulation
  - Update simulation character level after each session
  - _Requirements: 5.2, 5.5_

- [x] 6.2 Write property tests for level calculations


  - **Property 13: Level calculations use production ProgressionManager**
  - **Property 16: Level thresholds match production formula**
  - **Validates: Requirements 5.2, 5.5**

- [x] 6.3 Implement quick level buttons


  - Implement handleQuickLevelClick method
  - Set simulation character level to button value (5, 10, 20, 50, 100)
  - Calculate Soul Insight threshold using ProgressionManager.calculateLevelThreshold
  - Update level and Soul Insight input fields
  - Update boss dropdown to show appropriate bosses for level
  - Preserve all other parameters (stats, duration, count, compromised)
  - _Requirements: 12.2, 12.3, 12.4, 12.5_

- [x] 6.4 Write property tests for quick level buttons


  - **Property 29: Quick level buttons set correct level**
  - **Property 30: Quick level buttons calculate correct Soul Insight**
  - **Property 31: Quick level buttons update boss availability**
  - **Property 32: Quick level buttons preserve other parameters**
  - **Validates: Requirements 12.2, 12.3, 12.4, 12.5**

- [x] 7. Implement boss progression features





- [x] 7.1 Add boss selection and tracking
  - Populate boss dropdown from STUBBORN_SOULS array
  - Display selected boss's name, initial Resolve, unlock level
  - Filter boss dropdown based on current level (show only unlocked bosses)
  - Track current boss Resolve during simulation
  - _Requirements: 6.1, 6.2_



- [x] 7.2 Implement boss damage and defeat logic
  - Calculate boss damage using production formula (spirit * duration * 0.5)
  - Subtract damage from current boss Resolve
  - Detect boss defeat when Resolve reaches 0
  - Calculate overflow damage when boss is defeated
  - Determine next boss in sequence after defeat
  - _Requirements: 6.3, 6.4, 6.5_



- [x] 7.3 Write property test for boss damage

  - **Property 18: Boss damage calculations are accurate**
  - **Validates: Requirements 6.3**
  - **PBT Status: ✅ PASSED**

- [x] 8. Implement export and import functionality




- [x] 8.1 Create ExportImportManager class


  - Create ExportImportManager class in dev-screen.ts
  - Define ExportData interface with version, timestamp, config, results
  - Implement exportToJSON method to serialize simulation data
  - Implement importFromJSON method to deserialize data
  - Implement validateImportData to check for required fields
  - _Requirements: 7.2, 7.3, 8.3, 8.4_

- [x] 8.2 Implement export functionality


  - Implement handleExportClick method
  - Call ExportImportManager.exportToJSON with current config and results
  - Format JSON with proper indentation (JSON.stringify with 2 spaces)
  - Generate filename with format "dev-screen-results-YYYY-MM-DD-HHmmss.json"
  - Trigger browser download using Blob and URL.createObjectURL
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 8.3 Write property tests for export


  - **Property 21: Exported JSON contains all required data**
  - **Property 22: Export filename follows correct format**
  - **Validates: Requirements 7.2, 7.3, 7.4**

- [x] 8.4 Implement import functionality


  - Implement handleImportClick method
  - Create file input element accepting .json files
  - Read file content using FileReader API
  - Call ExportImportManager.importFromJSON to parse data
  - Validate imported data structure
  - Populate all form inputs with imported config values
  - Automatically run simulation with imported parameters
  - Handle errors for invalid/corrupted files
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 8.5 Write property tests for import


  - **Property 23: Import populates all fields correctly**
  - **Property 24: Invalid imports display errors and preserve state**
  - **Validates: Requirements 8.3, 8.4**

- [x] 9. Implement reset functionality




- [x] 9.1 Implement reset button handler


  - Implement handleResetClick method
  - Reset level to 1, Soul Insight to 0
  - Reset stats to defaults (1, 0.05, 1)
  - Reset session duration to 25 minutes, session count to 1
  - Reset boss selection to first boss (The Restless Athlete)
  - Reset compromised checkbox to unchecked
  - Clear all simulation results from display
  - Update UI immediately without page reload
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 9.2 Write property test for reset behavior


  - **Property 28: Reset restores all defaults**
  - **Validates: Requirements 11.2**

- [x] 10. Implement dev server and build integration




- [x] 10.1 Create dev-screen.html

  - Create HTML structure with form inputs and results containers
  - Add CSS styling for dev tool aesthetic (simple, functional)
  - Include script tag for dist/dev-screen.js
  - Add containers for: input form, results summary, session table, progression, boss status
  - Style buttons, inputs, tables for readability
  - _Requirements: 1.1, 2.1, 4.1, 5.1, 6.1_

- [x] 10.2 Update build.js for Dev Screen

  - Add dev-screen entry point to esbuild configuration
  - Configure output to dist/dev-screen.js
  - Use same TypeScript and bundling settings as extension
  - Ensure dev-screen.html is not included in extension build
  - _Requirements: 10.5_

- [x] 10.3 Create dev-screen-server.js script

  - Create scripts/dev-screen-server.js
  - Implement HTTP server using Node.js http module
  - Serve dev-screen.html at root path
  - Serve dist/dev-screen.js at /dist/dev-screen.js
  - Set appropriate MIME types for HTML and JavaScript
  - Run build.js before starting server
  - Listen on port 3000
  - Automatically open browser to http://localhost:3000
  - Handle server errors (port in use, file not found)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 10.4 Write property test for server file serving


  - **Property 25: Server serves all required files**
  - **Validates: Requirements 9.3**

- [x] 10.5 Add npm script for Dev Screen

  - Add "dev-screen" script to package.json
  - Script should run: "node scripts/dev-screen-server.js"
  - _Requirements: 9.1_

- [ ] 11. Final integration and polish
- [ ] 11.1 Verify production class integration
  - Test that RewardCalculator produces identical results in Dev Screen and extension
  - Test that ProgressionManager produces identical results in Dev Screen and extension
  - Test that constants.ts values are correctly imported
  - Verify formula changes in production code automatically reflect in Dev Screen
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 11.2 Write property tests for production class integration
  - **Property 7: Dev Screen produces identical results to production calculator**
  - **Property 26: Dev Screen uses production ProgressionManager**
  - **Property 27: Dev Screen uses production constants**
  - **Validates: Requirements 10.1, 10.2, 10.3**

- [ ] 11.3 Add error handling and user feedback
  - Implement showError method for displaying error messages
  - Add try-catch blocks around simulation execution
  - Add try-catch blocks around export/import operations
  - Display user-friendly error messages for all error cases
  - Log detailed errors to console for debugging
  - _Requirements: Error Handling section_

- [ ] 11.4 Test end-to-end workflows
  - Test complete simulation workflow: input → simulate → view results
  - Test export → import → simulate round-trip
  - Test reset → configure → simulate workflow
  - Test quick level buttons → simulate workflow
  - Test compromised sessions workflow
  - Verify all UI interactions work smoothly
  - _Requirements: All requirements_

- [ ] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
