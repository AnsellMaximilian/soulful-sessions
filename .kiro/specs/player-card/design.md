# Design Document

## Overview

The Player Card feature adds a shareable visual representation of a user's Soul Shepherd progress. This feature integrates into the existing statistics tab in the options page, replacing the static character sprite with an interactive button that opens a modal overlay displaying a styled card. Users can copy this card as an image to their clipboard for sharing on social media, forums, or with friends.

The implementation leverages the existing game state, cosmetics system, and statistics tracking to generate a visually appealing card that showcases the player's achievements, level, stats, and equipped cosmetics.

## Architecture

### Component Structure

```
Options Page (options.ts)
├── Statistics Tab
│   ├── Show Player Card Button (replaces sprite)
│   ├── Player Card Modal/Overlay
│   │   ├── Card Content Container
│   │   │   ├── Header (Character Name/Title)
│   │   │   ├── Character Sprite Display
│   │   │   ├── Level & XP Progress
│   │   │   ├── Stats Grid (Spirit, Harmony, Soulflow)
│   │   │   ├── Achievement Summary
│   │   │   └── Footer (Theme indicator)
│   │   └── Action Buttons
│   │       ├── Copy Card Button
│   │       └── Close Button
│   └── Success/Error Toast Notification
└── Image Generation Module
    ├── html2canvas Integration
    ├── Canvas Rendering
    └── Clipboard API Integration
```

### Data Flow

1. User clicks "Show Player Card" button in statistics tab
2. Modal overlay opens with card rendered from current `GameState`
3. User clicks "Copy Card" button
4. Image generation module:
   - Captures card DOM element using html2canvas
   - Converts canvas to blob
   - Writes blob to clipboard using Clipboard API
5. Success notification displays
6. User can paste image elsewhere

## Components and Interfaces

### PlayerCardManager

A new module responsible for managing the player card functionality.

```typescript
interface PlayerCardData {
  characterName: string;
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  stats: {
    spirit: number;
    harmony: number;
    soulflow: number;
  };
  achievements: {
    totalSessions: number;
    totalFocusTime: number;
    bossesDefeated: number;
    currentStreak: number;
  };
  cosmetics: {
    spriteId: string;
    spritePath: string;
    themeId: string;
    themeName: string;
  };
}

class PlayerCardManager {
  // Generate card data from game state
  static generateCardData(state: GameState): PlayerCardData;
  
  // Render card HTML into modal
  static renderCard(data: PlayerCardData): void;
  
  // Capture card as image and copy to clipboard
  static async copyCardToClipboard(): Promise<void>;
  
  // Show/hide modal
  static showCardModal(): void;
  static hideCardModal(): void;
  
  // Display notifications
  static showNotification(message: string, type: 'success' | 'error'): void;
}
```

### UI Components

#### Show Player Card Button
- Replaces the current `<img id="statistics-character-sprite">` in the statistics tab
- Styled as a prominent button with icon
- Displays character sprite as button background/icon
- Accessible with proper ARIA labels

#### Player Card Modal
- Full-screen overlay with semi-transparent backdrop
- Centered card container with game-themed styling
- Responsive design that works at different viewport sizes
- Dismissible via close button or backdrop click
- Keyboard accessible (ESC to close)

#### Card Content
- Fixed dimensions (e.g., 600x800px) for consistent sharing
- Styled with active theme colors
- Includes:
  - Character sprite (large, centered at top)
  - Player level with progress bar
  - Stats displayed with icons
  - Achievement highlights
  - Subtle branding/watermark
  - Theme name in footer

#### Action Buttons
- "Copy Card" button with clipboard icon
- "Close" button
- Loading state during image generation
- Disabled state during processing

## Data Models

### Existing Types (No Changes Required)

The feature uses existing types from `types.ts`:
- `GameState` - Complete game state
- `PlayerState` - Player level, stats, cosmetics
- `StatisticsState` - Achievement data
- `CosmeticState` - Active theme and sprite

### New Types

```typescript
// Add to types.ts or create player-card-types.ts

interface PlayerCardConfig {
  width: number;
  height: number;
  imageFormat: 'png' | 'jpeg';
  imageQuality: number;
  includeWatermark: boolean;
}

interface CardGenerationResult {
  success: boolean;
  error?: string;
  blob?: Blob;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Acceptance Criteria Testing Prework

1.1 WHEN a user navigates to the statistics tab THEN the Extension SHALL display a "Show Player Card" button in place of the avatar display
Thoughts: This is testing that a specific UI element exists when the statistics tab is active. We can test this by checking that the button element exists and the old sprite element does not exist (or is hidden).
Testable: yes - example

1.2 WHEN a user clicks the "Show Player Card" button THEN the Extension SHALL display a card overlay containing the player's statistics
Thoughts: This is testing a UI interaction. For any game state, clicking the button should result in the modal being visible and containing the player's data. We can generate random game states and verify the modal appears with correct data.
Testable: yes - property

1.3 WHEN the card overlay is displayed THEN the Extension SHALL show the user's level, stats (Spirit, Harmony, Soulflow), total sessions completed, current boss progress, and selected cosmetic sprite
Thoughts: This is testing that all required data fields are present in the rendered card. For any game state, the rendered card should contain all specified information. We can generate random game states and verify all fields are present in the DOM.
Testable: yes - property

1.4 WHEN the card overlay is open THEN the Extension SHALL provide a close button or backdrop click to dismiss the overlay
Thoughts: This is testing that dismissal mechanisms work. For any open modal state, clicking close or backdrop should hide the modal. This is a general UI behavior property.
Testable: yes - property

1.5 WHEN the user dismisses the card overlay THEN the Extension SHALL return to the normal statistics tab view
Thoughts: This is testing state cleanup after dismissal. After any dismissal action, the modal should be hidden and the statistics tab should be visible. This is an inverse operation property.
Testable: yes - property

2.1 WHEN the card overlay is displayed THEN the Extension SHALL show a "Copy Card" button below the card content
Thoughts: This is testing that a specific UI element exists when the modal is open. This is a specific example we can verify.
Testable: yes - example

2.2 WHEN a user clicks the "Copy Card" button THEN the Extension SHALL render the player card as an image
Thoughts: This is testing that the image generation process executes. For any card state, clicking copy should trigger image generation. We can verify the html2canvas function is called.
Testable: yes - property

2.3 WHEN the card is rendered as an image THEN the Extension SHALL copy the image to the system clipboard
Thoughts: This is testing the clipboard write operation. For any successfully generated image, it should be written to the clipboard. We can verify the clipboard API is called with the correct blob.
Testable: yes - property

2.4 WHEN the image copy operation succeeds THEN the Extension SHALL display a success notification to the user
Thoughts: This is testing that success feedback is provided. For any successful clipboard write, a success notification should appear. This is a consequence property.
Testable: yes - property

2.5 WHEN the image copy operation fails THEN the Extension SHALL display an error message explaining the failure
Thoughts: This is testing error handling. When the clipboard operation fails (we can simulate this), an error message should be displayed. This is an error condition property.
Testable: yes - property

3.1 WHEN the player card is rendered THEN the Extension SHALL use the game's visual theme and styling
Thoughts: This is testing that the active theme colors are applied to the card. For any game state with a theme, the card should use that theme's colors. We can verify CSS properties match the theme.
Testable: yes - property

3.2 WHEN the player card displays stats THEN the Extension SHALL include appropriate icons for Soul Insight, Soul Embers, and character stats
Thoughts: This is testing that specific visual elements (icons) are present. For any card rendering, these icons should be in the DOM. This is a structural property.
Testable: yes - property

3.3 WHEN the player card shows the character sprite THEN the Extension SHALL display the user's currently equipped cosmetic sprite
Thoughts: This is testing that the correct sprite is displayed. For any game state with an active sprite, the card should show that sprite's image. We can verify the image src matches the active sprite.
Testable: yes - property

3.4 WHEN the player card is generated THEN the Extension SHALL include the user's character name or identifier if available
Thoughts: This is testing conditional display of character name. If a name exists, it should be shown. This is a conditional property.
Testable: yes - property

3.5 WHEN the card is displayed THEN the Extension SHALL ensure all text is readable and properly formatted
Thoughts: This is about visual design quality and readability, which is subjective and not computationally testable.
Testable: no

4.1 WHEN implementing image generation THEN the Extension SHALL use html2canvas or a similar DOM-to-image library
Thoughts: This is an implementation requirement, not a functional behavior we can test.
Testable: no

4.2 WHEN the library is selected THEN the Extension SHALL verify it works within Chrome extension content security policies
Thoughts: This is a compatibility check during development, not a runtime property.
Testable: no

4.3 WHEN generating the image THEN the Extension SHALL handle external assets (sprites, icons) correctly
Thoughts: This is testing that images are properly included in the generated canvas. For any card with external assets, the generated image should contain those assets. We can verify the canvas contains image data.
Testable: yes - property

4.4 WHEN the clipboard API is used THEN the Extension SHALL request necessary permissions in the manifest
Thoughts: This is a configuration requirement, not a runtime property.
Testable: no

4.5 WHEN the image generation fails THEN the Extension SHALL provide fallback behavior or clear error messaging
Thoughts: This is testing error handling. When image generation fails (we can simulate this), an error should be handled gracefully. This is an error condition property.
Testable: yes - property

5.1 WHEN the statistics tab loads THEN the Extension SHALL not preload image generation libraries until the user clicks "Show Player Card"
Thoughts: This is testing lazy loading behavior. We can verify that html2canvas is not loaded until the button is clicked. This is a performance optimization property.
Testable: yes - property

5.2 WHEN the user clicks "Show Player Card" THEN the Extension SHALL display the overlay within 500 milliseconds
Thoughts: This is a performance timing requirement. This is difficult to test reliably in unit tests due to timing variability.
Testable: no

5.3 WHEN generating the card image THEN the Extension SHALL complete the operation within 2 seconds for typical card content
Thoughts: This is a performance timing requirement. This is difficult to test reliably in unit tests.
Testable: no

5.4 WHEN the card overlay is dismissed THEN the Extension SHALL clean up resources and event listeners
Thoughts: This is testing proper cleanup. After dismissal, event listeners should be removed and resources freed. We can verify listeners are removed.
Testable: yes - property

5.5 WHEN the user navigates away from the statistics tab THEN the Extension SHALL not leave the card overlay visible
Thoughts: This is testing that tab switching hides the modal. When switching tabs, the modal should be hidden. This is a state consistency property.
Testable: yes - property

### Property Reflection

After reviewing all testable properties, I've identified the following consolidations:

**Redundancy Analysis:**
- Properties 1.4 and 1.5 can be combined: both test modal dismissal behavior
- Properties 2.2 and 2.3 are sequential steps that can be tested together as one property
- Properties 2.4 and 2.5 are complementary success/error cases that can be tested as one property with conditional logic
- Properties 3.2 and 3.3 both test visual element presence and can be combined into a comprehensive "card contains required visual elements" property

**Consolidated Properties:**
- Modal dismissal (combines 1.4, 1.5)
- Image generation and clipboard copy (combines 2.2, 2.3)
- Notification display (combines 2.4, 2.5)
- Required visual elements (combines 3.2, 3.3)

### Correctness Properties

Property 1: Card data completeness
*For any* valid game state, when generating card data, the resulting PlayerCardData should contain all required fields (level, stats, achievements, cosmetics) with values matching the game state
**Validates: Requirements 1.3**

Property 2: Modal visibility on button click
*For any* game state, when the "Show Player Card" button is clicked, the card modal should become visible and contain the player's current data
**Validates: Requirements 1.2**

Property 3: Modal dismissal restores view
*For any* open card modal, when dismissed via close button or backdrop click, the modal should be hidden and the statistics tab should remain visible
**Validates: Requirements 1.4, 1.5**

Property 4: Image generation and clipboard write
*For any* displayed player card, when the copy button is clicked, an image should be generated and written to the clipboard
**Validates: Requirements 2.2, 2.3**

Property 5: Notification feedback
*For any* clipboard operation, a notification should be displayed indicating success or failure with an appropriate message
**Validates: Requirements 2.4, 2.5**

Property 6: Theme application
*For any* game state with an active theme, the rendered card should use that theme's color values in its styling
**Validates: Requirements 3.1**

Property 7: Required visual elements presence
*For any* rendered card, the DOM should contain the character sprite image, stat icons, and all required data fields
**Validates: Requirements 3.2, 3.3**

Property 8: Correct sprite display
*For any* game state with an active sprite, the card should display an image element with the src matching that sprite's image path
**Validates: Requirements 3.3**

Property 9: External asset handling
*For any* card containing external assets (sprites, icons), the generated canvas image should contain pixel data (not be blank)
**Validates: Requirements 4.3**

Property 10: Error handling for generation failures
*For any* simulated image generation failure, the system should catch the error and display an error notification without crashing
**Validates: Requirements 4.5**

Property 11: Lazy loading of image library
*For any* statistics tab load, the html2canvas library should not be loaded until the "Show Player Card" button is clicked
**Validates: Requirements 5.1**

Property 12: Resource cleanup on dismissal
*For any* card modal dismissal, all event listeners attached to the modal should be removed
**Validates: Requirements 5.4**

Property 13: Tab switching hides modal
*For any* open card modal, when the user switches to a different tab, the modal should be hidden
**Validates: Requirements 5.5**

## Error Handling

### Image Generation Errors

**Scenarios:**
- html2canvas fails to load
- Canvas rendering throws exception
- External assets fail to load
- Browser doesn't support required APIs

**Handling:**
- Wrap all image generation in try-catch blocks
- Display user-friendly error messages
- Log detailed errors to console for debugging
- Provide fallback: suggest manual screenshot

### Clipboard API Errors

**Scenarios:**
- Clipboard permission denied
- Browser doesn't support Clipboard API
- Clipboard write fails

**Handling:**
- Check for Clipboard API support before attempting
- Request permissions if needed
- Display clear error message with instructions
- Provide fallback: download image as file

### Resource Loading Errors

**Scenarios:**
- html2canvas CDN unavailable
- Sprite images fail to load
- Icon assets missing

**Handling:**
- Use local copy of html2canvas as fallback
- Validate asset paths before rendering
- Display placeholder if assets fail
- Graceful degradation of card appearance

### State Errors

**Scenarios:**
- Game state is null or invalid
- Required data fields missing
- Cosmetic IDs reference non-existent items

**Handling:**
- Validate state before rendering card
- Use default values for missing data
- Log warnings for invalid references
- Prevent card display if critical data missing

## Testing Strategy

### Unit Tests

Unit tests will verify specific examples and edge cases:

**PlayerCardManager Tests:**
- `generateCardData()` with valid game state returns complete data
- `generateCardData()` with missing optional fields uses defaults
- `generateCardData()` with invalid cosmetic IDs falls back to defaults
- `renderCard()` creates expected DOM structure
- `showCardModal()` / `hideCardModal()` toggle visibility correctly
- `showNotification()` displays message with correct styling

**UI Interaction Tests:**
- Button click opens modal
- Close button hides modal
- Backdrop click hides modal
- ESC key hides modal
- Copy button triggers image generation
- Tab switching hides modal

**Error Handling Tests:**
- Image generation failure displays error notification
- Clipboard write failure displays error notification
- Missing assets handled gracefully
- Invalid state prevents card display

### Property-Based Tests

Property-based tests will verify universal properties across many inputs:

**Testing Framework:** fast-check (JavaScript/TypeScript property-based testing library)

**Test Configuration:** Each property test should run a minimum of 100 iterations

**Property Test Implementations:**

Each property-based test must be tagged with a comment explicitly referencing the correctness property from this design document using the format: `**Feature: player-card, Property {number}: {property_text}**`

**Test 1: Card Data Completeness**
- Generate random valid game states
- For each state, call `generateCardData()`
- Assert all required fields are present and match source state
- **Feature: player-card, Property 1: Card data completeness**

**Test 2: Modal Visibility**
- Generate random game states
- For each state, simulate button click
- Assert modal is visible and contains correct data
- **Feature: player-card, Property 2: Modal visibility on button click**

**Test 3: Modal Dismissal**
- Generate random modal states (open with various data)
- For each state, simulate dismissal (close button or backdrop)
- Assert modal is hidden and statistics tab visible
- **Feature: player-card, Property 3: Modal dismissal restores view**

**Test 4: Theme Application**
- Generate random game states with different active themes
- For each state, render card
- Assert card styling uses theme colors
- **Feature: player-card, Property 6: Theme application**

**Test 5: Visual Elements Presence**
- Generate random game states
- For each state, render card
- Assert sprite image, stat icons, and data fields exist in DOM
- **Feature: player-card, Property 7: Required visual elements presence**

**Test 6: Sprite Display**
- Generate random game states with different active sprites
- For each state, render card
- Assert image src matches active sprite path
- **Feature: player-card, Property 8: Correct sprite display**

**Test 7: Resource Cleanup**
- Generate random modal states
- For each state, open modal, attach listeners, then dismiss
- Assert listeners are removed after dismissal
- **Feature: player-card, Property 12: Resource cleanup on dismissal**

**Test 8: Tab Switching**
- Generate random modal states (open)
- For each state, simulate tab switch
- Assert modal is hidden
- **Feature: player-card, Property 13: Tab switching hides modal**

### Integration Tests

Integration tests will verify the complete workflow:

**End-to-End Card Generation:**
1. Load options page with test game state
2. Navigate to statistics tab
3. Click "Show Player Card" button
4. Verify modal appears with correct data
5. Click "Copy Card" button
6. Verify image generation completes
7. Verify clipboard contains image data
8. Verify success notification appears
9. Close modal
10. Verify cleanup completed

**Cross-Browser Compatibility:**
- Test in Chrome (primary target)
- Verify Clipboard API support
- Test with different viewport sizes
- Verify image generation quality

### Manual Testing

Manual testing will cover subjective aspects:

**Visual Design:**
- Card appearance matches game aesthetic
- Text is readable at all sizes
- Colors match active theme
- Sprite displays correctly
- Layout is balanced and attractive

**User Experience:**
- Button is discoverable and intuitive
- Modal animations are smooth
- Copy operation feels responsive
- Notifications are clear and helpful
- Error messages are understandable

**Sharing Quality:**
- Generated images look good when shared
- Image resolution is appropriate
- File size is reasonable
- Images paste correctly in various applications

## Implementation Notes

### Library Selection: html2canvas

**Rationale:**
- Mature, well-maintained library
- Works in Chrome extensions with proper CSP configuration
- Handles external images with CORS
- Good performance for typical card sizes
- Fallback options available

**CSP Considerations:**
- Load from local copy (bundle with extension) rather than CDN
- Configure CSP to allow canvas operations
- Handle image loading with proper CORS headers

**Alternative Considered:**
- dom-to-image: Less maintained, similar functionality
- Native Canvas API: Too complex for this use case
- Server-side rendering: Unnecessary complexity

### Clipboard API Integration

**Modern Approach:**
```typescript
async function copyImageToClipboard(blob: Blob): Promise<void> {
  const item = new ClipboardItem({ 'image/png': blob });
  await navigator.clipboard.write([item]);
}
```

**Fallback for Older Browsers:**
- Download image as file
- Display instructions for manual sharing
- Detect API support before attempting

### Performance Optimization

**Lazy Loading:**
- Don't load html2canvas until needed
- Use dynamic import: `const html2canvas = await import('html2canvas')`
- Cache loaded library for subsequent uses

**Image Generation:**
- Use reasonable canvas dimensions (600x800px)
- Optimize image quality vs file size
- Consider using JPEG for smaller file size if appropriate
- Cache generated images briefly to avoid regeneration

**DOM Manipulation:**
- Minimize reflows during card rendering
- Use document fragments for building card HTML
- Remove modal from DOM when not in use (optional)

### Accessibility

**Keyboard Navigation:**
- Modal is keyboard accessible
- Focus trap within modal when open
- ESC key closes modal
- Tab order is logical

**Screen Readers:**
- Proper ARIA labels on all interactive elements
- Modal has role="dialog" and aria-modal="true"
- Button has descriptive aria-label
- Notifications use aria-live regions

**Visual Accessibility:**
- Sufficient color contrast
- Text is readable at default sizes
- Focus indicators are visible
- Animations respect prefers-reduced-motion

### Browser Compatibility

**Target:** Chrome 88+ (Manifest V3 requirement)

**Required APIs:**
- Clipboard API (Chrome 76+)
- Canvas API (universal support)
- Async/await (Chrome 55+)
- CSS Grid (Chrome 57+)

**Polyfills:** None required for target browser

### Security Considerations

**Content Security Policy:**
- Ensure CSP allows canvas operations
- Load html2canvas from local bundle
- Validate all user data before rendering
- Sanitize any text content to prevent XSS

**Data Privacy:**
- Card contains only game data, no personal info
- No external network requests during generation
- Clipboard data is local only
- No analytics or tracking on card generation

## Future Enhancements

**Potential Additions:**
- Multiple card templates/layouts
- Customizable card backgrounds
- Social media size presets (Twitter, Discord, etc.)
- Direct sharing to social platforms
- Card history/gallery
- Animated card elements
- QR code linking to profile
- Comparison cards (before/after progress)
- Seasonal/event-themed cards
- Achievement badges on card
