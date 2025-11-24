# Tech Stack

## Core Technologies

- **TypeScript** (ES2020, strict mode enabled)
- **Chrome Extension Manifest V3**
- **esbuild** for bundling

## Build System

Build script: `build.js` (custom esbuild configuration)

### Common Commands

```bash
# Build extension for production
npm run build

# Type checking only (no emit)
npm run build:types

# Watch mode for development
npm run watch

# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run unit tests only
npm test:unit

# Run integration tests only
npm test:integration
```

## Testing

- **Jest** with ts-jest for unit and integration tests
- **Puppeteer** for browser automation testing
- Test files located in `src/__tests__/`

## Extension Architecture

- **Service Worker**: `src/background.ts` (background.js)
- **Content Script**: `src/content.ts` (runs on all pages)
- **Popup**: `popup.html` + `src/popup.ts`
- **Options Page**: `options.html` + `src/options.ts`
- **Blocked Page**: `blocked.html` + `src/blocked.ts`

## Chrome APIs Used

- `chrome.storage` - State persistence
- `chrome.alarms` - Session/break timers
- `chrome.idle` - Idle detection
- `chrome.webNavigation` - Navigation monitoring
- `chrome.tabs` - Tab management
- `chrome.declarativeNetRequest` - Site blocking (strict mode)
- `chrome.notifications` - User notifications

## Output Structure

Compiled files go to `dist/` directory with chunk splitting for shared code.
