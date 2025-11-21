# Integration Tests for Soul Shepherd

This directory contains integration tests that test the Soul Shepherd extension in a real Chrome browser environment using Puppeteer.

## Setup

Integration tests require:

1. The extension to be built (`npm run build`)
2. Puppeteer installed (`npm install`)
3. Chrome/Chromium browser

## Running Tests

### Run all tests (unit + integration)

```bash
npm test
```

### Run only unit tests

```bash
npm run test:unit
```

### Run only integration tests

```bash
npm run test:integration
```

## Test Coverage

The integration tests cover the following scenarios:

1. **Complete Session Flow** - Tests the full user journey from starting a session through rewards to break

   - Requirements: 1.1, 1.2, 1.4, 2.5

2. **Idle Detection** - Verifies that the extension properly tracks idle time during sessions

   - Requirements: 12.1

3. **Discouraged Site Visits** - Tests that visiting discouraged sites marks sessions as compromised

   - Requirements: 6.3

4. **Strict Mode Blocking** - Verifies that strict mode properly blocks configured sites

   - Requirements: 7.3

5. **Boss Defeat and Unlock** - Tests progression through the boss campaign

   - Requirements: 3.2, 3.3

6. **Level-up and Skill Points** - Verifies that leveling up grants skill points

   - Requirements: 9.2

7. **Stat Upgrades** - Tests purchasing stat upgrades with Soul Embers

   - Requirements: 8.2

8. **State Persistence** - Verifies that game state persists across browser sessions

## Notes

- Integration tests run in headed mode (visible browser) because Chrome extensions require it
- Tests have a 60-second timeout to accommodate browser startup and extension loading
- Some tests manipulate game state directly via chrome.storage for faster test execution
- Tests may take several minutes to complete due to browser startup overhead

## Troubleshooting

### Tests fail with "Extension not loaded"

- Ensure you've run `npm run build` before running tests
- Check that the manifest.json is valid
- Verify all required files are present in the dist directory

### Tests timeout

- Increase the timeout in jest.config.js
- Check that Chrome can launch properly on your system
- Ensure no other Chrome instances are interfering

### Browser doesn't close after tests

- This is a known issue with Puppeteer
- Manually close the browser window if needed
- Check for zombie Chrome processes and kill them if necessary
