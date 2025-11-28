# Design Document

## Overview

The Boss Bestiary feature (branded as "Guided Souls") provides players with a comprehensive gallery and narrative experience for all Stubborn Souls in the game. This feature enhances the Soul Shepherd theme by revealing the complete story arc of each boss—from their initial pain and regret through their breakthrough moment to their final peace. The feature integrates seamlessly with the existing popup and options page architecture, using URL parameters for deep linking and maintaining the extension's established patterns for state management and UI rendering.

## Architecture

### Component Structure

The feature consists of three main components:

1. **Popup Info Icon Component**: A small clickable icon adjacent to the current boss name in the popup that opens the options page to the Guided Souls tab
2. **Gallery View Component**: A grid-based display in the options page showing all 10 Stubborn Souls with visual state indicators
3. **Detail View Component**: An expanded view replacing the gallery when a boss is selected, showing complete narrative content

### Data Flow

```
User clicks info icon in popup
  → Opens options page with URL parameter (?tab=guided-souls&boss=<id>)
    → Options page reads URL parameters
      → Switches to Guided Souls tab
        → If boss ID present, opens detail view for that boss
          → Otherwise shows gallery view

User clicks boss in gallery
  → Transitions from gallery to detail view
    → Renders boss details based on defeat status
      → Shows locked content placeholders for undefeated bosses
      → Shows full narrative for defeated bosses
```

### Integration Points

- **Popup Integration**: Adds info icon next to boss name in idle view
- **Options Page Integration**: New tab in existing tab navigation system
- **State Management**: Reads from existing `GameState.progression.defeatedBosses` array
- **Data Model**: Extends `StubbornSoul` interface in `types.ts`
- **Boss Data**: Extends `STUBBORN_SOULS` array in `constants.ts`

## Components and Interfaces

### 1. Popup Info Icon Component

**Location**: `popup.html` and `popup.ts`

**HTML Structure**:
```html
<div class="boss-card">
  <div class="boss-header">
    <h3 id="boss-name" class="boss-name">The Restless Athlete</h3>
    <button id="boss-info-btn" class="boss-info-btn" aria-label="View boss details">ⓘ</button>
  </div>
  <p id="boss-backstory" class="boss-backstory">...</p>
  <!-- existing resolve bar -->
</div>
```

**Event Handler**:
```typescript
function openBossDetails(bossId: number): void {
  const url = chrome.runtime.getURL(`options.html?tab=guided-souls&boss=${bossId}`);
  chrome.tabs.create({ url });
}
```

### 2. Gallery View Component

**Location**: `options.html` and `options.ts`

**HTML Structure**:
```html
<section id="guided-souls-section" class="tab-content">
  <h2>Guided Souls</h2>
  <p class="section-description">
    Explore the stories of the Stubborn Souls you've encountered on your journey.
  </p>
  <div id="souls-gallery" class="souls-gallery">
    <!-- Boss cards dynamically generated -->
  </div>
  <div id="soul-detail" class="soul-detail" style="display: none;">
    <!-- Detail view content -->
  </div>
</section>
```

**Boss Card States**:
- **Locked**: `<div class="soul-card locked">` - greyed sprite, level overlay, no click handler
- **Unlocked-Current**: `<div class="soul-card unlocked current">` - full color, glow border, clickable
- **Defeated**: `<div class="soul-card defeated">` - full color, "Guided" badge, clickable

**Rendering Function**:
```typescript
function renderGalleryView(state: GameState): void {
  const gallery = document.getElementById('souls-gallery');
  const currentBossId = state.progression.currentBossIndex;
  const defeatedBosses = state.progression.defeatedBosses;
  const playerLevel = state.player.level;

  STUBBORN_SOULS.forEach(soul => {
    const isLocked = playerLevel < soul.unlockLevel;
    const isCurrent = soul.id === currentBossId;
    const isDefeated = defeatedBosses.includes(soul.id);
    
    const card = createSoulCard(soul, isLocked, isCurrent, isDefeated);
    gallery.appendChild(card);
  });
}
```

### 3. Detail View Component

**Location**: `options.html` and `options.ts`

**HTML Structure**:
```html
<div id="soul-detail" class="soul-detail">
  <button id="back-to-gallery-btn" class="btn btn-secondary">← Back to Gallery</button>
  
  <div class="soul-detail-header">
    <img id="detail-sprite" class="soul-sprite-large" src="" alt="">
    <h2 id="detail-name" class="soul-name"></h2>
  </div>
  
  <div class="soul-info-grid">
    <div class="info-item">
      <span class="info-label">Initial Resolve:</span>
      <span id="detail-resolve" class="info-value"></span>
    </div>
    <div class="info-item">
      <span class="info-label">Unlock Level:</span>
      <span id="detail-unlock-level" class="info-value"></span>
    </div>
  </div>
  
  <div class="soul-backstory-section">
    <h3>Backstory</h3>
    <p id="detail-backstory"></p>
  </div>
  
  <div id="final-conversation-section" class="narrative-section">
    <!-- Locked or unlocked conversation -->
  </div>
  
  <div id="resolution-section" class="narrative-section">
    <!-- Locked or unlocked resolution -->
  </div>
  
  <div id="defeat-stats-section" class="defeat-stats-section" style="display: none;">
    <!-- Optional defeat statistics -->
  </div>
</div>
```

**Rendering Function**:
```typescript
function renderDetailView(soul: StubbornSoul, isDefeated: boolean): void {
  // Populate always-visible information
  document.getElementById('detail-name').textContent = soul.name;
  document.getElementById('detail-backstory').textContent = soul.backstory;
  document.getElementById('detail-resolve').textContent = soul.initialResolve.toString();
  document.getElementById('detail-unlock-level').textContent = soul.unlockLevel.toString();
  
  // Render conversation section
  if (isDefeated) {
    renderConversation(soul.finalConversation);
  } else {
    renderLockedPlaceholder('final-conversation-section', 'Final Conversation');
  }
  
  // Render resolution section
  if (isDefeated) {
    renderResolution(soul.resolution);
  } else {
    renderLockedPlaceholder('resolution-section', 'Resolution');
  }
}
```

## Data Models

### Extended StubbornSoul Interface

**File**: `src/types.ts`

```typescript
export interface ConversationExchange {
  speaker: 'shepherd' | 'soul';
  text: string;
}

export interface StubbornSoul {
  id: number;
  name: string;
  backstory: string;
  initialResolve: number;
  sprite: string;
  unlockLevel: number;
  finalConversation: ConversationExchange[];  // NEW
  resolution: string;                          // NEW
}
```

### Boss Data Extension

**File**: `src/constants.ts`

Each boss in the `STUBBORN_SOULS` array will be extended with:

```typescript
{
  id: 0,
  name: "The Restless Athlete",
  backstory: "A runner who never crossed the finish line they dreamed of...",
  initialResolve: 100,
  sprite: "athlete.png",
  unlockLevel: 1,
  finalConversation: [
    {
      speaker: 'shepherd',
      text: "You've been running for so long. What are you chasing?"
    },
    {
      speaker: 'soul',
      text: "The finish line... I can see it, but I can never reach it."
    },
    {
      speaker: 'shepherd',
      text: "Perhaps the race was never about the finish. What did you learn along the way?"
    },
    {
      speaker: 'soul',
      text: "I... I learned discipline. Perseverance. I inspired others to run their own races."
    },
    {
      speaker: 'shepherd',
      text: "Then you've already crossed every finish line that mattered."
    }
  ],
  resolution: "The Restless Athlete finally stops running. They realize that their legacy wasn't in crossing a single finish line, but in the countless miles they ran and the inspiration they provided to others. With a peaceful smile, they take their final rest, their race complete."
}
```

### URL Parameter Handling

**File**: `src/options.ts`

```typescript
function handleURLParameters(): void {
  const urlParams = new URLSearchParams(window.location.search);
  const tab = urlParams.get('tab');
  const bossId = urlParams.get('boss');
  
  if (tab === 'guided-souls') {
    switchToTab('guided-souls');
    
    if (bossId !== null) {
      const id = parseInt(bossId);
      if (!isNaN(id)) {
        showDetailView(id);
      }
    }
  }
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Locked boss visual state

*For any* Stubborn Soul where the player level is below the unlock level, the boss card SHALL have desaturation styling and display the unlock level overlay
**Validates: Requirements 2.2**

### Property 2: Locked boss interaction prevention

*For any* Stubborn Soul where the player level is below the unlock level, the boss card SHALL not have click event handlers attached and SHALL not apply hover effects
**Validates: Requirements 2.3**

### Property 3: Defeated boss visual indicator

*For any* Stubborn Soul in the defeated bosses list, the boss card SHALL display a "Guided" badge or checkmark visual indicator
**Validates: Requirements 2.5**

### Property 4: Unlocked boss hover feedback

*For any* Stubborn Soul that is either unlocked or defeated, the boss card SHALL provide visual hover feedback when the cursor is over it
**Validates: Requirements 2.6**

### Property 5: Boss card navigation

*For any* Stubborn Soul that is either unlocked or defeated, clicking the boss card SHALL hide the gallery view and display the detail view with that boss's information
**Validates: Requirements 2.7**

### Property 6: Detail view completeness

*For any* Stubborn Soul displayed in detail view, the view SHALL contain the boss name, sprite image, backstory, initial resolve value, and unlock level requirement
**Validates: Requirements 3.1**

### Property 7: Locked content placeholders

*For any* Stubborn Soul not in the defeated bosses list, the detail view SHALL display locked content placeholders for Final Conversation and Resolution sections
**Validates: Requirements 3.3**

### Property 8: Unlocked conversation display

*For any* Stubborn Soul in the defeated bosses list, the detail view SHALL display all dialogue exchanges from the finalConversation array
**Validates: Requirements 3.4**

### Property 9: Conversation speaker distinction

*For any* conversation exchange in a Final Conversation, the dialogue bubble SHALL have visual styling that distinguishes between 'shepherd' and 'soul' speakers
**Validates: Requirements 3.5**

### Property 10: Unlocked resolution display

*For any* Stubborn Soul in the defeated bosses list, the detail view SHALL display the resolution text
**Validates: Requirements 3.6**

### Property 11: Boss data completeness - conversations

*For all* ten Stubborn Souls in the STUBBORN_SOULS array, each SHALL have a finalConversation array containing between 3 and 5 dialogue exchanges
**Validates: Requirements 4.4**

### Property 12: Boss data completeness - resolutions

*For all* ten Stubborn Souls in the STUBBORN_SOULS array, each SHALL have a non-empty resolution string
**Validates: Requirements 4.5**

### Property 13: Optional statistics visibility

*For any* Stubborn Soul not in the defeated bosses list, the defeat statistics section SHALL not be visible in the detail view
**Validates: Requirements 6.4**

### Property 14: Optional statistics display (if implemented)

*For any* Stubborn Soul in the defeated bosses list, if defeat statistics are implemented, the detail view SHALL display the date of first defeat, total sessions, and total damage
**Validates: Requirements 6.1, 6.2, 6.3**

## Error Handling

### Invalid Boss ID Handling

When URL parameters contain an invalid boss ID:
- Parse the boss ID as an integer
- Validate the ID is within the range [0, 9]
- If invalid, show the gallery view instead of detail view
- Log a warning to console for debugging

### Missing State Data

When the game state is not yet loaded:
- Display a loading indicator in the Guided Souls tab
- Retry state loading after a short delay
- If state fails to load after multiple attempts, show an error message

### Navigation Errors

When tab switching or view transitions fail:
- Catch and log errors during view transitions
- Ensure the UI remains in a consistent state
- Provide a fallback to the gallery view if detail view fails to render

### Missing Boss Data

When a boss is missing required narrative data:
- Log an error to console identifying the missing data
- Display placeholder text indicating incomplete data
- Prevent the application from crashing

## Testing Strategy

### Unit Tests

Unit tests will verify specific examples and edge cases:

1. **URL Parameter Parsing**
   - Test valid boss IDs (0-9)
   - Test invalid boss IDs (negative, > 9, non-numeric)
   - Test missing parameters
   - Test malformed URLs

2. **Boss State Classification**
   - Test locked state (player level < unlock level)
   - Test unlocked-current state (boss is current boss)
   - Test defeated state (boss in defeated array)
   - Test edge case: boss at exact unlock level

3. **View Transitions**
   - Test gallery to detail transition
   - Test detail to gallery transition
   - Test direct navigation via URL

4. **Data Validation**
   - Test all 10 bosses have required fields
   - Test conversation array lengths
   - Test resolution string presence

### Property-Based Tests

Property-based tests will verify universal properties across all inputs using **fast-check** (JavaScript property testing library). Each test will run a minimum of 100 iterations.

1. **Property 1: Locked boss visual state**
   - Generate random player levels and boss unlock levels
   - Verify locked styling is applied when player level < unlock level

2. **Property 2: Locked boss interaction prevention**
   - Generate random locked boss scenarios
   - Verify no click handlers are attached to locked boss cards

3. **Property 3: Defeated boss visual indicator**
   - Generate random defeated boss lists
   - Verify "Guided" badge appears for all defeated bosses

4. **Property 5: Boss card navigation**
   - Generate random unlocked/defeated boss selections
   - Verify clicking transitions to correct detail view

5. **Property 6: Detail view completeness**
   - Generate random boss selections
   - Verify all required fields are present in detail view

6. **Property 7: Locked content placeholders**
   - Generate random undefeated boss scenarios
   - Verify placeholders appear instead of actual content

7. **Property 8: Unlocked conversation display**
   - Generate random defeated boss scenarios
   - Verify all conversation exchanges are rendered

8. **Property 9: Conversation speaker distinction**
   - Generate random conversation exchanges
   - Verify shepherd and soul speakers have distinct styling

9. **Property 11: Boss data completeness - conversations**
   - Iterate through all 10 bosses
   - Verify each has 3-5 conversation exchanges

10. **Property 12: Boss data completeness - resolutions**
    - Iterate through all 10 bosses
    - Verify each has a non-empty resolution string

### Integration Tests

Integration tests will verify end-to-end workflows:

1. **Popup to Options Navigation**
   - Start from popup with active boss
   - Click info icon
   - Verify options page opens to correct tab and boss

2. **Gallery to Detail Flow**
   - Load options page with game state
   - Click unlocked boss in gallery
   - Verify detail view displays correct information
   - Click back button
   - Verify gallery view is restored

3. **Narrative Progression**
   - Load state with no defeated bosses
   - Verify locked content placeholders
   - Update state to mark boss as defeated
   - Verify narrative content is now visible

## CSS Styling Requirements

### Gallery View Styles

```css
.souls-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
  padding: 20px;
}

.soul-card {
  position: relative;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.soul-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.soul-card.locked .soul-sprite {
  filter: grayscale(100%);
}

.soul-card.locked .unlock-level-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2em;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.8);
}

.soul-card.unlocked:hover,
.soul-card.defeated:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  cursor: pointer;
}

.soul-card.current {
  box-shadow: 0 0 15px var(--theme-accent);
  border: 2px solid var(--theme-accent);
}

.soul-card.defeated .guided-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--theme-accent);
  color: white;
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: bold;
}
```

### Detail View Styles

```css
.soul-detail {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.soul-sprite-large {
  width: 200px;
  height: 200px;
  object-fit: contain;
}

.dialogue-bubble {
  margin: 15px 0;
  padding: 15px;
  border-radius: 12px;
  max-width: 80%;
}

.dialogue-bubble.shepherd {
  background: var(--theme-primary);
  margin-left: auto;
  text-align: right;
}

.dialogue-bubble.soul {
  background: var(--theme-secondary);
  margin-right: auto;
  text-align: left;
}

.dialogue-speaker {
  font-weight: bold;
  font-size: 0.9em;
  margin-bottom: 5px;
  opacity: 0.8;
}

.resolution-text {
  font-style: italic;
  color: var(--theme-accent);
  padding: 20px;
  border-left: 4px solid var(--theme-accent);
  margin: 20px 0;
  background: rgba(255, 255, 255, 0.05);
}

.locked-placeholder {
  padding: 30px;
  text-align: center;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.5);
  margin: 20px 0;
}

.locked-placeholder::before {
  content: "🔒 ";
  font-size: 1.5em;
}
```

### Popup Info Icon Styles

```css
.boss-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.boss-info-btn {
  background: transparent;
  border: 1px solid var(--theme-accent);
  color: var(--theme-accent);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.boss-info-btn:hover {
  background: var(--theme-accent);
  color: white;
  transform: scale(1.1);
}
```

## Performance Considerations

### Lazy Loading

- Gallery view renders all 10 boss cards immediately (small dataset)
- Detail view only renders when a boss is selected
- Sprite images use browser caching

### DOM Optimization

- Use event delegation for boss card clicks in gallery
- Reuse detail view container instead of creating new elements
- Remove event listeners when switching views

### State Management

- Read game state once on tab load
- Cache defeated bosses list for quick lookups
- No polling or real-time updates needed (static narrative content)

## Accessibility

### ARIA Labels

- Gallery: `role="list"` with `aria-label="Stubborn Souls Gallery"`
- Boss cards: `role="listitem"` with `aria-label="[Boss Name] - [State]"`
- Detail view: `role="article"` with `aria-labelledby="detail-name"`
- Back button: `aria-label="Return to gallery"`
- Info icon: `aria-label="View boss details"`

### Keyboard Navigation

- All clickable boss cards are keyboard accessible (tab navigation)
- Info icon is keyboard accessible (Enter/Space to activate)
- Back button is keyboard accessible
- Focus management when transitioning between views

### Screen Reader Support

- Locked bosses announce: "[Boss Name], locked, requires level [X]"
- Current boss announces: "[Boss Name], current boss, click to view details"
- Defeated bosses announce: "[Boss Name], guided, click to view story"
- Locked content announces: "Final Conversation, locked, guide this soul to unlock"

## Future Enhancements

### Phase 2 Features (Not in Initial Implementation)

1. **Defeat Statistics Tracking**
   - Add `defeatedBossStats` to `ProgressionState`
   - Track first defeat date, session count, total damage per boss
   - Display in detail view for defeated bosses

2. **Boss Sprite Animations**
   - Add sprite animation on defeat
   - Transition effect when unlocking new boss
   - Hover animations in gallery

3. **Search and Filter**
   - Search bosses by name
   - Filter by state (locked/unlocked/defeated)
   - Sort by unlock level or defeat date

4. **Narrative Replay**
   - Allow players to replay Final Conversations
   - Add voice-over or sound effects
   - Animated text reveal

5. **Boss Lore Expansion**
   - Add additional backstory details
   - Include hints about boss mechanics
   - Link to related game statistics
