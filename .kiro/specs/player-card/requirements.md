# Requirements Document

## Introduction

This feature adds a shareable player card system to the Soul Shepherd extension, allowing users to showcase their game progress and achievements. The card replaces the avatar display in the statistics tab with an interactive button that opens a visual card overlay. Users can copy this card as an image to share their progress with others.

## Glossary

- **Player Card**: A visual representation of the user's game statistics, level, and achievements that can be displayed and shared
- **Statistics Tab**: The tab in the options page that displays user progress metrics
- **Card Overlay**: A modal/popover dialog that displays the player card over the current page
- **Share Button**: A button that copies the player card as an image to the clipboard
- **Extension**: The Soul Shepherd Chrome extension
- **User**: A person using the Soul Shepherd extension

## Requirements

### Requirement 1

**User Story:** As a user, I want to view my player card from the statistics tab, so that I can see a visual representation of my progress.

#### Acceptance Criteria

1. WHEN a user navigates to the statistics tab THEN the Extension SHALL display a "Show Player Card" button in place of the avatar display
2. WHEN a user clicks the "Show Player Card" button THEN the Extension SHALL display a card overlay containing the player's statistics
3. WHEN the card overlay is displayed THEN the Extension SHALL show the user's level, stats (Spirit, Harmony, Soulflow), total sessions completed, current boss progress, and selected cosmetic sprite
4. WHEN the card overlay is open THEN the Extension SHALL provide a close button or backdrop click to dismiss the overlay
5. WHEN the user dismisses the card overlay THEN the Extension SHALL return to the normal statistics tab view

### Requirement 2

**User Story:** As a user, I want to copy my player card as an image, so that I can share my progress with others.

#### Acceptance Criteria

1. WHEN the card overlay is displayed THEN the Extension SHALL show a "Copy Card" button below the card content
2. WHEN a user clicks the "Copy Card" button THEN the Extension SHALL render the player card as an image
3. WHEN the card is rendered as an image THEN the Extension SHALL copy the image to the system clipboard
4. WHEN the image copy operation succeeds THEN the Extension SHALL display a success notification to the user
5. WHEN the image copy operation fails THEN the Extension SHALL display an error message explaining the failure

### Requirement 3

**User Story:** As a user, I want the player card to have an attractive design, so that it looks good when I share it.

#### Acceptance Criteria

1. WHEN the player card is rendered THEN the Extension SHALL use the game's visual theme and styling
2. WHEN the player card displays stats THEN the Extension SHALL include appropriate icons for Soul Insight, Soul Embers, and character stats
3. WHEN the player card shows the character sprite THEN the Extension SHALL display the user's currently equipped cosmetic sprite
4. WHEN the player card is generated THEN the Extension SHALL include the user's character name or identifier if available
5. WHEN the card is displayed THEN the Extension SHALL ensure all text is readable and properly formatted

### Requirement 4

**User Story:** As a developer, I want to use a reliable image generation library, so that the card copying functionality works across different browsers and environments.

#### Acceptance Criteria

1. WHEN implementing image generation THEN the Extension SHALL use html2canvas or a similar DOM-to-image library
2. WHEN the library is selected THEN the Extension SHALL verify it works within Chrome extension content security policies
3. WHEN generating the image THEN the Extension SHALL handle external assets (sprites, icons) correctly
4. WHEN the clipboard API is used THEN the Extension SHALL request necessary permissions in the manifest
5. WHEN the image generation fails THEN the Extension SHALL provide fallback behavior or clear error messaging

### Requirement 5

**User Story:** As a user, I want the player card feature to be performant, so that it doesn't slow down the options page.

#### Acceptance Criteria

1. WHEN the statistics tab loads THEN the Extension SHALL not preload image generation libraries until the user clicks "Show Player Card"
2. WHEN the user clicks "Show Player Card" THEN the Extension SHALL display the overlay within 500 milliseconds
3. WHEN generating the card image THEN the Extension SHALL complete the operation within 2 seconds for typical card content
4. WHEN the card overlay is dismissed THEN the Extension SHALL clean up resources and event listeners
5. WHEN the user navigates away from the statistics tab THEN the Extension SHALL not leave the card overlay visible
