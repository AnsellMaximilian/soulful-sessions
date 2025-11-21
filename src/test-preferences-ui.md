# Preferences UI Test Plan

## Overview

Task 36 implementation adds a theme selector to the Preferences section in the Options page.

## Features Implemented

### 1. Animation Toggle

- **Location**: Preferences tab in Options page
- **Element**: Checkbox with ID `animations-enabled`
- **Behavior**: Enables/disables Content Soul animations and visual effects
- **Persistence**: Saves immediately to `settings.animationsEnabled`

### 2. Notification Toggle

- **Location**: Preferences tab in Options page
- **Element**: Checkbox with ID `notifications-enabled`
- **Behavior**: Enables/disables session and break end notifications
- **Persistence**: Saves immediately to `settings.notificationsEnabled`

### 3. Show Session Timer Toggle

- **Location**: Preferences tab in Options page
- **Element**: Checkbox with ID `show-session-timer`
- **Behavior**: Shows/hides remaining time during focus sessions
- **Persistence**: Saves immediately to `settings.showSessionTimer`

### 4. Sound Volume Slider

- **Location**: Preferences tab in Options page
- **Element**: Range slider with ID `sound-volume` (0-100)
- **Display**: Shows current value as percentage
- **Behavior**: Adjusts sound volume for game effects
- **Persistence**: Saves immediately to `settings.soundVolume` (converted to 0-1 range)

### 5. Theme Selector (NEW)

- **Location**: Preferences tab in Options page
- **Element**: Dropdown select with ID `theme-selector`
- **Behavior**:
  - Shows all available themes from `COSMETIC_THEMES` catalog
  - Only unlocked themes are selectable
  - Locked themes show as disabled with cost in Soul Embers
  - Displays theme preview with colors when selected
- **Persistence**: Saves immediately via `APPLY_COSMETIC` message to background
- **Preview**: Shows theme name, description, cost, and color swatches

## Manual Testing Steps

### Test 1: Animation Toggle

1. Open Options page (right-click extension icon → Options)
2. Navigate to Preferences tab
3. Toggle "Enable animations" checkbox
4. Verify setting persists after closing and reopening options
5. Open popup and verify animations are enabled/disabled accordingly

### Test 2: Notification Toggle

1. Open Options page
2. Navigate to Preferences tab
3. Toggle "Enable notifications" checkbox
4. Complete a focus session
5. Verify notification appears or doesn't appear based on setting

### Test 3: Sound Volume Slider

1. Open Options page
2. Navigate to Preferences tab
3. Adjust "Sound Volume" slider
4. Verify percentage display updates in real-time
5. Verify setting persists after closing and reopening options

### Test 4: Theme Selector

1. Open Options page
2. Navigate to Preferences tab
3. Verify theme selector shows "Twilight Veil" (default) as selected
4. Verify locked themes show as disabled with cost
5. Select a different unlocked theme (if any)
6. Verify theme preview updates with:
   - Theme name
   - Description
   - Cost (if not free)
   - Color swatches (primary, secondary, accent, background)
7. Close and reopen options
8. Verify selected theme persists

### Test 5: Theme Unlocking (Integration)

1. Earn Soul Embers through focus sessions
2. Purchase a theme from the shop (in popup during break)
3. Open Options page → Preferences tab
4. Verify newly purchased theme is now selectable
5. Select the new theme
6. Verify it applies correctly

## Expected Behavior

### Theme Selector Display

- **Unlocked themes**: Show theme name only, selectable
- **Locked themes**: Show "Theme Name (Locked - X Soul Embers)", disabled
- **Active theme**: Pre-selected in dropdown

### Theme Preview

- Appears below selector when theme is selected
- Shows theme name, description, and cost
- Displays 4 color swatches representing the theme's color palette
- Animates in with fade effect

### Persistence

- All preference changes save immediately to chrome.storage
- No "Save" button required
- Changes persist across browser sessions
- Theme selection syncs via chrome.storage.sync for cross-device availability

## Requirements Satisfied

✅ **Requirement 13.4**: Options page provides toggle to enable/disable animations
✅ **Requirement 13.5**: Where animations are disabled, popup displays Content Soul collection as simple numeric counter

## Implementation Details

### Files Modified

1. **options.html**: Added theme selector and preview container
2. **options.css**: Added styles for theme selector and preview
3. **src/options.ts**:
   - Imported `COSMETIC_THEMES` from constants
   - Added `populateThemeSelector()` function
   - Added `updateThemePreview()` function
   - Added `updateCosmetic()` function
   - Added event listener for theme selector change

### Message Flow

1. User selects theme in options page
2. `updateCosmetic()` sends `APPLY_COSMETIC` message to background
3. Background validates ownership and updates state
4. Background saves to both local and sync storage
5. Background broadcasts `STATE_UPDATE` to all components
6. Popup applies new theme colors on next open

## Notes

- Theme selector only shows themes from the `COSMETIC_THEMES` catalog
- Default theme "Twilight Veil" is always unlocked
- Locked themes cannot be selected until purchased
- Theme preview provides visual feedback before applying
- All preferences save immediately without confirmation
