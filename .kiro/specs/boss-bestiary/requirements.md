# Requirements Document

## Introduction

The Boss Bestiary feature (branded as "Guided Souls") adds a comprehensive gallery and detail view for all Stubborn Souls (bosses) in the Soul Shepherd extension. This feature allows players to explore the backstories, view sprites, and unlock narrative content for each soul they encounter and guide to peace. The feature integrates with both the popup interface (via an info icon) and the options page (via a new dedicated tab).

## Glossary

- **Stubborn Soul**: A boss entity that the player defeats through focus sessions; represents a troubled spirit seeking peace
- **Soul Shepherd**: The player character who guides Stubborn Souls to peace
- **Guided Souls Tab**: The new options page tab displaying the boss bestiary
- **Gallery View**: The default grid/list display showing all Stubborn Souls with their unlock states
- **Detail View**: The expanded view showing a single boss's complete information and narrative
- **Final Conversation**: Unlockable dialogue between Shepherd and Soul, revealed after defeating the boss
- **Resolution**: Unlockable epilogue describing how the soul finds peace, revealed after defeating the boss
- **Unlock Level**: The player level requirement before a Stubborn Soul becomes accessible
- **Boss State**: The current status of a Stubborn Soul (Locked, Unlocked-Current, or Defeated)

## Requirements

### Requirement 1

**User Story:** As a player, I want to click an info icon next to the current boss name in the popup, so that I can quickly access detailed information about the boss I'm currently fighting.

#### Acceptance Criteria

1. WHEN the popup displays a current boss THEN the system SHALL render an info icon (ⓘ) adjacent to the boss name
2. WHEN a player clicks the info icon THEN the system SHALL open the options page to the Guided Souls tab
3. WHEN the options page opens from the info icon THEN the system SHALL automatically display the detail view for the specified boss
4. WHEN passing the boss identifier to the options page THEN the system SHALL use URL parameters to communicate the target boss

### Requirement 2

**User Story:** As a player, I want to view a gallery of all Stubborn Souls in the Guided Souls tab, so that I can see which souls I've encountered, which are available, and which are still locked.

#### Acceptance Criteria

1. WHEN a player navigates to the Guided Souls tab THEN the system SHALL display all ten Stubborn Souls in a grid layout
2. WHEN displaying a locked Stubborn Soul THEN the system SHALL render the sprite image with desaturation and overlay the unlock level number
3. WHEN displaying a locked Stubborn Soul THEN the system SHALL prevent click interactions and hover effects
4. WHEN displaying an unlocked current boss THEN the system SHALL render the sprite in full color with a subtle glow or border indicator
5. WHEN displaying a defeated Stubborn Soul THEN the system SHALL render the sprite in full color with a visual indicator such as a checkmark or "Guided" badge
6. WHEN a player hovers over an unlocked or defeated Stubborn Soul THEN the system SHALL provide visual hover feedback
7. WHEN a player clicks an unlocked or defeated Stubborn Soul THEN the system SHALL transition from gallery view to detail view for that boss

### Requirement 3

**User Story:** As a player, I want to view detailed information about a Stubborn Soul, so that I can learn their backstory and understand their narrative.

#### Acceptance Criteria

1. WHEN a player views a boss detail page THEN the system SHALL display the boss name, large sprite image, backstory, initial resolve value, and unlock level requirement
2. WHEN viewing a boss detail page THEN the system SHALL provide a back button that returns the player to the gallery view
3. WHEN a player views an undefeated boss detail page THEN the system SHALL display locked content placeholders for Final Conversation and Resolution
4. WHEN a player views a defeated boss detail page THEN the system SHALL display the unlocked Final Conversation dialogue array
5. WHEN displaying Final Conversation dialogue THEN the system SHALL render alternating dialogue bubbles with visual distinction between Shepherd and Soul speakers
6. WHEN a player views a defeated boss detail page THEN the system SHALL display the unlocked Resolution epilogue text
7. WHEN displaying the Resolution text THEN the system SHALL apply distinct styling such as italics or special formatting to differentiate it from other content

### Requirement 4

**User Story:** As a developer, I want to extend the StubbornSoul data model with narrative content, so that each boss has a complete story arc from backstory through resolution.

#### Acceptance Criteria

1. WHEN defining the StubbornSoul interface THEN the system SHALL include a finalConversation property as an array of conversation objects
2. WHEN defining a conversation object THEN the system SHALL include a speaker property with values 'shepherd' or 'soul' and a text property containing the dialogue string
3. WHEN defining the StubbornSoul interface THEN the system SHALL include a resolution property as a string containing the epilogue text
4. WHEN populating boss data in constants THEN the system SHALL provide finalConversation arrays with three to five dialogue exchanges for each of the ten Stubborn Souls
5. WHEN populating boss data in constants THEN the system SHALL provide resolution strings that describe how each soul finds peace
6. WHEN writing narrative content THEN the system SHALL ensure each boss follows the story arc of backstory, breakthrough moment, and peaceful closure

### Requirement 5

**User Story:** As a player, I want the Guided Souls feature to reinforce the Soul Shepherd theme, so that I feel like I'm helping troubled spirits rather than just defeating enemies.

#### Acceptance Criteria

1. WHEN naming the bestiary feature THEN the system SHALL use "Guided Souls" rather than combat-oriented terminology
2. WHEN displaying defeated bosses THEN the system SHALL use terminology like "Guided" rather than "Defeated"
3. WHEN presenting narrative content THEN the system SHALL emphasize themes of guidance, peace, and resolution rather than combat victory
4. WHEN structuring boss stories THEN the system SHALL present a narrative arc that moves from pain and regret to breakthrough and peace

### Requirement 6

**User Story:** As a player, I want to see optional statistics for defeated bosses, so that I can track my accomplishment in guiding each soul.

#### Acceptance Criteria

1. WHERE defeat statistics are implemented THEN the system SHALL display the date of first defeat for defeated bosses
2. WHERE defeat statistics are implemented THEN the system SHALL display the total number of sessions required to defeat the boss
3. WHERE defeat statistics are implemented THEN the system SHALL display the total damage dealt to the boss
4. WHEN viewing an undefeated boss THEN the system SHALL not display defeat statistics placeholders
