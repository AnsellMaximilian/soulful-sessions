# Cosmetics System Implementation

## Overview

The cosmetics system allows users to customize the Soul Shepherd extension's appearance by purchasing and applying themes and character sprites using Soul Embers.

## Features Implemented

### 1. Cosmetic Catalog (constants.ts)

- **6 Themes**: Including default "Twilight Veil" and 5 unlockable themes
  - Crimson Dusk (100 embers)
  - Emerald Grove (150 embers)
  - Golden Dawn (200 embers)
  - Midnight Ocean (250 embers)
  - Violet Dream (300 embers)
- **4 Character Sprites**: Including default and 3 unlockable sprites
  - Hooded Guide (150 embers)
  - Radiant Guardian (200 embers)
  - Ethereal Wanderer (250 embers)
- Each cosmetic includes:
  - Unique ID
  - Display name
  - Description
  - Cost in Soul Embers
  - Theme-specific color palette or sprite image path

### 2. Backend Handlers (background.ts)

- **handlePurchaseCosmetic**:
  - Validates item exists and user doesn't already own it
  - Checks if user has sufficient Soul Embers
  - Deducts cost and adds item to owned list
  - Saves to both local and sync storage
  - Broadcasts state update to popup
- **handleApplyCosmetic**:
  - Validates user owns the cosmetic
  - Sets as active theme or sprite
  - Saves to both local and sync storage
  - Broadcasts state update to popup

### 3. Shop UI (popup.html)

- Added shop section to break view
- Tab-based interface for themes and sprites
- Each cosmetic item displays:
  - Name and description
  - Cost (if not owned)
  - Status (Owned/Active)
  - Purchase button (if not owned and affordable)
  - Apply button (if owned but not active)
- Theme preview showing color gradient

### 4. Shop Styling (popup.css)

- Responsive cosmetic item cards
- Visual indicators for owned/active items
- Disabled state for unaffordable items
- Tab switching interface
- Theme preview boxes
- CSS variables for dynamic theming

### 5. Shop Logic (popup.ts)

- **updateShop**: Renders theme and sprite lists
- **renderThemesList**: Creates theme item cards with purchase/apply buttons
- **renderSpritesList**: Creates sprite item cards with purchase/apply buttons
- **applyTheme**: Sets CSS variables and body background
- **applySprite**: Updates character sprite images
- **purchaseCosmetic**: Sends purchase message to background
- **applyCosmetic**: Sends apply message to background
- Tab switching event handlers

### 6. Theme System

- CSS variables for dynamic theming:
  - `--theme-primary`: Primary color
  - `--theme-secondary`: Secondary color
  - `--theme-accent`: Accent color
  - `--theme-background`: Background color
- Applied to:
  - Stat values
  - XP bars
  - Progress bars
  - Buttons
  - Timers
  - Shop tabs

### 7. Cross-Device Sync (StateManager.ts)

- Cosmetics saved to chrome.storage.sync
- Loaded on extension startup
- Syncs across devices automatically

### 8. Testing

- Created test-cosmetics.ts for manual testing
- Tests catalog structure
- Tests purchase logic
- Tests theme application
- Tests pricing progression

## Requirements Fulfilled

✅ **15.1**: Maintain a catalog of unlockable cosmetic items including themes and character sprites
✅ **15.2**: Display a shop interface during breaks where cosmetic items can be purchased with Soul Embers
✅ **15.3**: Purchase cosmetic items - deduct Soul Embers and mark as owned
✅ **15.4**: Apply selected theme colors and character sprite to all UI elements
✅ **15.5**: Persist cosmetic ownership and selections to chrome.storage.sync for cross-device availability

## Usage

1. **Earning Soul Embers**: Complete focus sessions and collect idle Content Souls
2. **Accessing Shop**: During break periods, scroll to the "Soul Shepherd's Shop" section
3. **Browsing**: Switch between Themes and Sprites tabs
4. **Purchasing**: Click "Purchase" button on affordable items
5. **Applying**: Click "Apply" button on owned items to activate them
6. **Syncing**: Cosmetics automatically sync across devices via Chrome sync storage

## File Changes

- `src/constants.ts`: Added cosmetic catalog (COSMETIC_THEMES, COSMETIC_SPRITES)
- `src/background.ts`: Implemented purchase and apply handlers
- `src/popup.ts`: Added shop rendering and theme application logic
- `src/popup.html`: Added shop UI section
- `src/popup.css`: Added shop styling and CSS variables
- `src/StateManager.ts`: Added sync storage loading for cosmetics
- `src/test-cosmetics.ts`: Created test file for manual testing

## Notes

- Default theme and sprite are always owned (cost: 0)
- Themes change colors throughout the entire UI
- Sprites currently use placeholder images (all point to soul_shepherd.png)
- Total cost to unlock all cosmetics: 1,000 Soul Embers (themes) + 600 Soul Embers (sprites) = 1,600 Soul Embers
- Estimated ~32 sessions needed to unlock everything (at ~50 embers/session)
