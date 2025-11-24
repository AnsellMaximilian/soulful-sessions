# Project Structure

## Root Files

- `manifest.json` - Chrome extension manifest (v3)
- `build.js` - Custom esbuild bundler
- `tsconfig.json` - TypeScript configuration
- `jest.config.js` - Jest test configuration
- `popup.html/css`, `options.html/css`, `blocked.html` - UI pages

## Source Directory (`src/`)

### Core Managers (State & Logic)

- `StateManager.ts` - Central state management and persistence
- `SessionManager.ts` - Focus session lifecycle
- `ProgressionManager.ts` - XP, leveling, boss progression
- `RewardCalculator.ts` - Calculate session rewards
- `IdleCollector.ts` - Passive soul collection
- `NavigationMonitor.ts` - Track site visits during sessions

### Optimization Utilities

- `DOMOptimizer.ts` - DOM manipulation performance
- `PerformanceMonitor.ts` - Performance tracking
- `AssetLoader.ts` - Asset loading optimization
- `popup-optimizations.ts` - Popup-specific optimizations

### Entry Points

- `background.ts` - Service worker (message routing, alarms, state coordination)
- `popup.ts` - Popup UI logic and view management
- `options.ts` - Settings page
- `content.ts` - Content script (site blocking, navigation events)
- `blocked.ts` - Blocked page UI

### Data Models

- `types.ts` - All TypeScript interfaces and enums
- `constants.ts` - Game formulas, boss data, cosmetics catalog

### Tests (`src/__tests__/`)

- Unit tests for individual managers
- `integration.test.ts` - End-to-end integration tests
- Manual test documentation (`.md` files)

## Architecture Patterns

### State Management

- Single source of truth in `StateManager`
- Immutable state updates via `updateState(partial)`
- Persistence to `chrome.storage.local`
- State validation on load

### Message Passing

- Background service worker handles all state mutations
- Popup/options send messages via `chrome.runtime.sendMessage`
- Background broadcasts updates via `chrome.runtime.sendMessage` to all clients
- Request-response pattern with async/await

### Manager Separation

Each manager has a single responsibility:
- **StateManager**: Storage and retrieval
- **SessionManager**: Session timing and lifecycle
- **ProgressionManager**: XP and boss mechanics
- **RewardCalculator**: Reward formulas
- **IdleCollector**: Passive rewards
- **NavigationMonitor**: Site tracking

### View Management (Popup)

- View state enum: `IDLE`, `FOCUS_SESSION`, `REWARD`, `BREAK`
- View switching with optional fade animations
- Separate update functions per view
- Animation toggles respect user settings
