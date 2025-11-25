# Design Document

## Overview

The Dev Screen is a standalone development tool that provides a simulation environment for testing and calibrating the Soul Shepherd reward system. It consists of a single HTML page served via a local development server that imports and uses the production calculation classes (RewardCalculator, ProgressionManager) to ensure perfect consistency between testing and actual gameplay.

The key architectural principle is **code reuse**: the Dev Screen imports the exact same TypeScript modules used by the Chrome extension, ensuring that any formula changes are immediately reflected in both environments without duplication.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Dev Screen (HTML)                     │
│  ┌────────────────────────────────────────────────────┐ │
│  │              UI Layer (dev-screen.ts)              │ │
│  │  - Input forms for simulation parameters           │ │
│  │  - Results display and visualization               │ │
│  │  - Export/Import functionality                     │ │
│  └────────────────────────────────────────────────────┘ │
│                          │                               │
│                          ▼                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Simulation Engine (SimulationEngine)       │ │
│  │  - Session simulation orchestration                │ │
│  │  - State management for simulation character       │ │
│  │  - Results aggregation and formatting              │ │
│  └────────────────────────────────────────────────────┘ │
│                          │                               │
│                          ▼                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Production Calculation Classes             │ │
│  │  ┌──────────────────┐  ┌──────────────────┐       │ │
│  │  │ RewardCalculator │  │ProgressionManager│       │ │
│  │  └──────────────────┘  └──────────────────┘       │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │         constants.ts (FORMULAS)              │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Build System Integration

The Dev Screen will be built using the same esbuild configuration as the extension, with a separate entry point:

- Entry point: `src/dev-screen.ts`
- Output: `dist/dev-screen.js`
- HTML file: `dev-screen.html` (root directory, not included in extension build)
- Server: Simple Node.js HTTP server script

## Components and Interfaces

### SimulationEngine

The core orchestration component that manages simulation state and coordinates between UI and calculation classes.

```typescript
interface SimulationConfig {
  sessionDuration: number; // Minutes
  sessionCount: number;
  playerStats: PlayerStats;
  startingLevel: number;
  startingSoulInsight: number;
  currentBossIndex: number;
  isCompromised: boolean;
}

interface SimulationResult {
  sessions: SessionSimulationResult[];
  totals: {
    soulInsight: number;
    soulEmbers: number;
    bossProgress: number;
    criticalHits: number;
  };
  progression: {
    startLevel: number;
    endLevel: number;
    levelsGained: number;
    skillPointsEarned: number;
    finalSoulInsight: number;
  };
  boss: {
    startingResolve: number;
    remainingResolve: number;
    wasDefeated: boolean;
    nextBoss?: StubbornSoul;
  };
}

interface SessionSimulationResult {
  sessionNumber: number;
  duration: number;
  soulInsight: number;
  soulEmbers: number;
  bossProgress: number;
  wasCritical: boolean;
  wasCompromised: boolean;
  calculationDetails: {
    baseSoulInsight: number;
    spiritBonus: number;
    baseSoulEmbers: number;
    soulflowBonus: number;
    criticalMultiplier: number;
    compromisePenalty: number;
  };
}

class SimulationEngine {
  private rewardCalculator: RewardCalculator;
  private progressionManager: ProgressionManager;

  constructor() {
    this.rewardCalculator = new RewardCalculator();
    this.progressionManager = new ProgressionManager();
  }

  runSimulation(config: SimulationConfig): SimulationResult;
  simulateSingleSession(config: SimulationConfig): SessionSimulationResult;
  resetSimulation(): void;
}
```

### UI Controller

Manages DOM interactions, form validation, and result rendering.

```typescript
interface UIController {
  initializeForm(): void;
  validateInputs(): boolean;
  handleSimulateClick(): void;
  handleResetClick(): void;
  handleQuickLevelClick(level: number): void;
  handleExportClick(): void;
  handleImportClick(): void;
  renderResults(result: SimulationResult): void;
  renderSessionTable(sessions: SessionSimulationResult[]): void;
  renderProgressionSummary(progression: SimulationResult['progression']): void;
  renderBossSummary(boss: SimulationResult['boss']): void;
  showError(message: string): void;
  showTooltip(element: HTMLElement, content: string): void;
}
```

### Export/Import Manager

Handles serialization and deserialization of simulation configurations and results.

```typescript
interface ExportData {
  version: number;
  timestamp: string;
  config: SimulationConfig;
  results: SimulationResult;
}

interface ExportImportManager {
  exportToJSON(config: SimulationConfig, results: SimulationResult): string;
  importFromJSON(jsonString: string): ExportData;
  downloadFile(filename: string, content: string): void;
  validateImportData(data: any): boolean;
}
```

## Data Models

### Simulation State

The Dev Screen maintains its own simulation state that is completely separate from the extension's actual game state:

```typescript
interface DevScreenState {
  config: SimulationConfig;
  results: SimulationResult | null;
  simulationCharacter: {
    level: number;
    soulInsight: number;
    stats: PlayerStats;
    currentBossIndex: number;
    currentBossResolve: number;
  };
}
```

### Session Mock

To use the production RewardCalculator, we need to create mock SessionState objects:

```typescript
function createMockSession(
  duration: number,
  isCompromised: boolean
): SessionState {
  return {
    startTime: Date.now() - duration * 60 * 1000, // Simulate completed session
    duration: duration,
    taskId: "dev-screen-simulation",
    isActive: false,
    isPaused: false,
    isCompromised: isCompromised,
    idleTime: 0,
    activeTime: duration * 60,
  };
}
```

## Correctness Properties


*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Valid session durations are accepted

*For any* session duration value between 5 and 120 minutes (inclusive), the input validation should accept the value as valid.

**Validates: Requirements 1.2**

### Property 2: Invalid session durations are rejected

*For any* session duration value outside the range [5, 120] (negative, zero, or greater than 120), the input validation should reject the value and display an error message.

**Validates: Requirements 1.3**

### Property 3: Simulation executes correct number of sessions

*For any* specified session count N, running a simulation should execute exactly N sessions using the RewardCalculator class.

**Validates: Requirements 1.4**

### Property 4: Simulation results contain all required fields

*For any* completed simulation, the results should include total Soul Insight, total Soul Embers, total boss damage, and critical hit count.

**Validates: Requirements 1.5**

### Property 5: Modified stats persist across simulations

*For any* stat modification (Spirit, Harmony, or Soulflow), all subsequent simulations should use the updated stat values until they are changed again.

**Validates: Requirements 2.2**

### Property 6: Negative stat values are rejected

*For any* negative stat value entered for Spirit, Harmony, or Soulflow, the input validation should reject the value and display an error message.

**Validates: Requirements 2.3**

### Property 7: Dev Screen produces identical results to production calculator

*For any* session configuration (duration, stats, compromised status), the Dev Screen's reward calculations should produce identical Soul Insight, Soul Embers, and boss damage values as the production RewardCalculator class given the same inputs.

**Validates: Requirements 2.5, 10.1**

### Property 8: Results table contains all session information

*For any* completed simulation, the results table should display duration, Soul Insight, Soul Embers, boss damage, and critical hit status for each session.

**Validates: Requirements 3.1**

### Property 9: Critical hit sessions are visually highlighted

*For any* session that results in a critical hit, that session's row in the results table should have visual highlighting applied.

**Validates: Requirements 3.2**

### Property 10: Compromise penalty is applied consistently

*For any* simulation with the compromised checkbox enabled, all sessions should have the 30% penalty (0.7 multiplier) applied to their rewards.

**Validates: Requirements 4.2**

### Property 11: Dev Screen uses production penalty method

*For any* compromised session, the penalty calculation should produce identical results to the production RewardCalculator's applyCompromisePenalty method.

**Validates: Requirements 4.3**

### Property 12: Compromised sessions display both reward values

*For any* compromised session, the results should display both the base reward values (before penalty) and the penalized reward values (after penalty).

**Validates: Requirements 4.4**

### Property 13: Level calculations use production ProgressionManager

*For any* simulation that earns Soul Insight, the level-up calculations should use the production ProgressionManager class and produce identical results to the extension's level progression.

**Validates: Requirements 5.2**

### Property 14: Level-up events are displayed with thresholds

*For any* simulation that causes a level-up, the results should display the level-up event along with the Soul Insight threshold required for that level.

**Validates: Requirements 5.3**

### Property 15: Multiple level-ups are tracked correctly

*For any* simulation that causes multiple level-ups, the results should show each level threshold crossed and the total skill points earned (1 per level).

**Validates: Requirements 5.4**

### Property 16: Level thresholds match production formula

*For any* starting level, the Soul Insight threshold should be calculated using the production formula (100 * level^1.5) and match the ProgressionManager's calculateLevelThreshold method.

**Validates: Requirements 5.5**

### Property 17: Boss information is displayed correctly

*For any* selected boss from the STUBBORN_SOULS list, the display should show that boss's name, initial Resolve, and unlock level.

**Validates: Requirements 6.2**

### Property 18: Boss damage calculations are accurate

*For any* completed simulation, the total boss damage should be calculated using the production formula (spirit * duration * 0.5) and the remaining Resolve should be correctly computed.

**Validates: Requirements 6.3**

### Property 19: Boss defeat is indicated with overflow

*For any* simulation where total boss damage exceeds current Resolve, the results should indicate the boss was defeated and show the overflow damage amount.

**Validates: Requirements 6.4**

### Property 20: Next boss is displayed after defeat

*For any* boss defeat where a next boss exists in the STUBBORN_SOULS sequence, the results should display the next boss's information.

**Validates: Requirements 6.5**

### Property 21: Exported JSON contains all required data

*For any* simulation export, the generated JSON should include session details, total rewards, level progression, boss damage, and timestamp.

**Validates: Requirements 7.2, 7.3**

### Property 22: Export filename follows correct format

*For any* export operation, the downloaded filename should match the pattern "dev-screen-results-YYYY-MM-DD-HHmmss.json" with the current date and time.

**Validates: Requirements 7.4**

### Property 23: Import populates all fields correctly

*For any* valid exported configuration file, importing it should populate all input fields (duration, session count, stats, level, boss) with the values from the file.

**Validates: Requirements 8.3**

### Property 24: Invalid imports display errors and preserve state

*For any* invalid or corrupted import file, the system should display an error message and maintain the current input field values without modification.

**Validates: Requirements 8.4**

### Property 25: Server serves all required files

*For any* HTTP request to the dev server for HTML or JavaScript files, the server should respond with the correct file content and appropriate MIME type.

**Validates: Requirements 9.3**

### Property 26: Dev Screen uses production ProgressionManager

*For any* level progression calculation, the Dev Screen should import and use the production ProgressionManager class without modification, ensuring identical behavior.

**Validates: Requirements 10.2**

### Property 27: Dev Screen uses production constants

*For any* formula constant (SOUL_INSIGHT_BASE_MULTIPLIER, BOSS_DAMAGE_MULTIPLIER, etc.), the Dev Screen should import the value from the production constants.ts file.

**Validates: Requirements 10.3**

### Property 28: Reset restores all defaults

*For any* state of the Dev Screen, clicking reset should restore all input fields to their default values (level 1, 0 Soul Insight, base stats 1/0.05/1, 25 minute sessions).

**Validates: Requirements 11.2**

### Property 29: Quick level buttons set correct level

*For any* quick level button (5, 10, 20, 50, 100), clicking it should set the simulation character's level to that exact value.

**Validates: Requirements 12.2**

### Property 30: Quick level buttons calculate correct Soul Insight

*For any* quick level button clicked, the Soul Insight threshold should be calculated using the production ProgressionManager's calculateLevelThreshold method.

**Validates: Requirements 12.3**

### Property 31: Quick level buttons update boss availability

*For any* quick level button clicked, the boss dropdown should update to show only bosses whose unlock level is less than or equal to the selected level.

**Validates: Requirements 12.4**

### Property 32: Quick level buttons preserve other parameters

*For any* quick level button clicked, all other simulation parameters (Spirit, Harmony, Soulflow, session duration, session count, compromised status) should remain unchanged.

**Validates: Requirements 12.5**

## Error Handling

### Input Validation Errors

- **Invalid session duration**: Display error message "Session duration must be between 5 and 120 minutes"
- **Invalid session count**: Display error message "Session count must be a positive integer"
- **Negative stat values**: Display error message "Stat values cannot be negative"
- **Invalid level**: Display error message "Level must be a positive integer"

### Import Errors

- **Invalid JSON format**: Display error message "Invalid file format. Please select a valid Dev Screen export file."
- **Missing required fields**: Display error message "Import file is missing required fields: [field names]"
- **Version mismatch**: Display warning "This export was created with a different version. Some fields may not import correctly."

### Simulation Errors

- **Calculator instantiation failure**: Display error message "Failed to initialize reward calculator. Please refresh the page."
- **Calculation errors**: Log detailed error to console and display user-friendly message "An error occurred during simulation. Check console for details."

### Server Errors

- **Port already in use**: Display error message "Port 3000 is already in use. Please stop other servers or specify a different port."
- **File not found**: Return 404 with message "File not found"
- **Build errors**: Display error message "Failed to build Dev Screen. Check console for TypeScript errors."

## Testing Strategy

### Unit Testing

Unit tests will verify individual components and functions:

- **Input validation functions**: Test valid/invalid ranges for duration, stats, level
- **Mock session creation**: Verify SessionState objects are created with correct properties
- **Export/Import serialization**: Test JSON generation and parsing
- **Filename generation**: Verify timestamp formatting in export filenames
- **UI state management**: Test reset functionality, quick level buttons

### Property-Based Testing

Property-based tests will verify universal properties using a PBT library (fast-check for TypeScript):

- **Property 7 (Calculation consistency)**: Generate random session configurations and verify Dev Screen produces identical results to production RewardCalculator
- **Property 16 (Level threshold formula)**: Generate random levels and verify thresholds match production ProgressionManager
- **Property 18 (Boss damage formula)**: Generate random stats and durations, verify damage calculations match production formula
- **Property 28 (Reset behavior)**: Generate random UI states, verify reset always returns to defaults
- **Property 32 (Parameter preservation)**: Generate random parameter sets, click quick level buttons, verify other parameters unchanged

Each property-based test will run a minimum of 100 iterations to ensure comprehensive coverage across the input space.

### Integration Testing

- **End-to-end simulation**: Run complete simulation with multiple sessions, verify all results are calculated and displayed correctly
- **Export/Import round-trip**: Export a configuration, import it, verify all values match
- **Server functionality**: Start server, make HTTP requests, verify correct responses
- **Build process**: Verify Dev Screen builds successfully with same esbuild config as extension

### Manual Testing

- **UI responsiveness**: Verify all buttons, inputs, and interactions work smoothly
- **Visual design**: Verify layout, colors, and styling are appropriate for a dev tool
- **Browser compatibility**: Test in Chrome (primary target)
- **Tooltip display**: Verify calculation tooltips show correct formulas and values
- **Table rendering**: Verify large result sets (100+ sessions) render without performance issues

## Implementation Notes

### Build Configuration

Add a new entry point to `build.js`:

```javascript
// Dev Screen build (not included in extension)
await esbuild.build({
  entryPoints: ['src/dev-screen.ts'],
  bundle: true,
  outfile: 'dist/dev-screen.js',
  platform: 'browser',
  target: 'es2020',
  sourcemap: true,
  // ... other options matching extension build
});
```

### Server Script

Create `scripts/dev-screen-server.js`:

```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;

// Build Dev Screen first
exec('node build.js', (error) => {
  if (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
  
  // Start server
  const server = http.createServer((req, res) => {
    // Serve dev-screen.html, dist/dev-screen.js, etc.
  });
  
  server.listen(PORT, () => {
    console.log(`Dev Screen running at http://localhost:${PORT}`);
    // Open browser
    exec(`start http://localhost:${PORT}`);
  });
});
```

### NPM Script

Add to `package.json`:

```json
{
  "scripts": {
    "dev-screen": "node scripts/dev-screen-server.js"
  }
}
```

### File Structure

```
project-root/
├── dev-screen.html          # Dev Screen HTML (not in extension)
├── src/
│   ├── dev-screen.ts        # Dev Screen entry point
│   ├── RewardCalculator.ts  # Shared with extension
│   ├── ProgressionManager.ts # Shared with extension
│   ├── constants.ts         # Shared with extension
│   └── types.ts             # Shared with extension
├── dist/
│   └── dev-screen.js        # Built Dev Screen bundle
└── scripts/
    └── dev-screen-server.js # Local HTTP server
```

### Code Reuse Strategy

The Dev Screen achieves code reuse by:

1. **Direct imports**: Import RewardCalculator, ProgressionManager, and constants directly from src/
2. **Shared build process**: Use same esbuild configuration for TypeScript compilation
3. **No duplication**: Zero formula duplication - all calculations use production classes
4. **Automatic updates**: When formulas change in production code, Dev Screen automatically reflects changes on next build

This ensures that testing in the Dev Screen is equivalent to testing the actual extension behavior.
