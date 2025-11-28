# Boss Bestiary (Guided Souls) - Manual Testing Guide

## Overview

This guide provides comprehensive manual testing instructions for the Boss Bestiary feature (branded as "Guided Souls"). This feature allows players to explore boss backstories, view sprites, and unlock narrative content.

## Prerequisites

Before testing, ensure:
- Extension is built and loaded in Chrome (`npm run build`)
- You have access to Chrome DevTools (F12)
- You understand how to modify chrome.storage.local for testing different states

## Test Setup

### Quick State Setup for Testing

To test different scenarios, you can modify the game state via DevTools Console:

```javascript
// Get current state
chrome.storage.local.get('gameState', (result) => console.log(result.gameState));

// Set player level (to unlock different bosses)
chrome.storage.local.get('gameState', (result) => {
  let state = result.gameState;
  state.player.level = 10; // Change to desired level
  chrome.storage.local.set({gameState: state}, () => console.log('Level updated'));
});

// Mark bosses as defeated
chrome.storage.local.get('gameState', (result) => {
  let state = result.gameState;
  state.progression.defeatedBosses = [0, 1, 2]; // Bosses 0, 1, 2 defeated
  chrome.storage.local.set({gameState: state}, () => console.log('Defeated bosses updated'));
});

// Reset to fresh state
chrome.storage.local.clear(() => console.log('State cleared - reload extension'));
```

---

## Test Suite


### Test 1: Popup Info Icon - Idle View

**Requirement**: 1.1, 1.2, 1.4

**Objective**: Verify info icon appears and navigates correctly from idle view

**Steps**:
1. Open the extension popup
2. Ensure you're in the idle view (not in a session)
3. Locate the boss card showing the current boss
4. Verify the info icon (ⓘ) appears next to the boss name

**Expected Results**:
- ✅ Info icon is visible as a circular button with ⓘ symbol
- ✅ Icon has a border with theme accent color
- ✅ Icon is positioned to the right of the boss name
- ✅ Hovering over icon shows visual feedback (background color change, scale)
- ✅ Icon has proper aria-label: "View boss details"

**Click Test**:
5. Click the info icon

**Expected Results**:
- ✅ Options page opens in a new tab
- ✅ URL contains `?tab=guided-souls&boss=<id>`
- ✅ Guided Souls tab is automatically selected
- ✅ Detail view for the current boss is displayed (not gallery)

**Keyboard Test**:
6. Close the options tab
7. Tab to the info icon using keyboard
8. Press Enter or Space

**Expected Results**:
- ✅ Same navigation behavior as clicking
- ✅ Focus indicator is visible on the icon

---

### Test 2: Popup Info Icon - Break View

**Requirement**: 1.1, 1.2, 1.4

**Objective**: Verify info icon works during break periods

**Steps**:
1. Complete a focus session to enter break view
2. Locate the boss card in the break view
3. Verify the info icon appears next to the boss name

**Expected Results**:
- ✅ Info icon is visible in break view
- ✅ Same styling and behavior as idle view
- ✅ Clicking opens options page with correct parameters

---

### Test 3: Gallery View - Initial Load

**Requirement**: 2.1

**Objective**: Verify gallery displays all 10 bosses correctly

**Steps**:
1. Open options page
2. Click "Guided Souls" tab
3. Observe the gallery view

**Expected Results**:
- ✅ Gallery displays in a grid layout
- ✅ All 10 Stubborn Souls are visible
- ✅ Each boss card shows sprite image and name
- ✅ Grid is responsive and well-spaced
- ✅ Section has heading "Guided Souls"
- ✅ Section has description text

---

### Test 4: Locked Boss Visual State

**Requirement**: 2.2, 2.3

**Objective**: Verify locked bosses display correctly

**Setup**: Set player level to 1 (most bosses will be locked)

**Steps**:
1. Navigate to Guided Souls tab
2. Identify locked boss cards (level requirement not met)

**Expected Results**:
- ✅ Locked boss sprites are desaturated (grayscale filter)
- ✅ Unlock level number is overlaid on the sprite
- ✅ Card has reduced opacity (0.5)
- ✅ Card shows "not-allowed" cursor on hover
- ✅ No hover effects (no transform, no shadow)
- ✅ Card is not clickable
- ✅ Card has no tabindex (not keyboard accessible)
- ✅ Screen reader announces: "[Boss Name], locked, requires level [X]"

---

### Test 5: Unlocked Current Boss Visual State

**Requirement**: 2.4

**Objective**: Verify current boss has special visual indicator

**Setup**: Ensure player level allows current boss to be unlocked

**Steps**:
1. Navigate to Guided Souls tab
2. Identify the current boss card (matches popup boss)

**Expected Results**:
- ✅ Sprite is in full color (no desaturation)
- ✅ Card has a glow or border (using theme accent color)
- ✅ Card has "current" class applied
- ✅ Card is clickable
- ✅ Hover effects work (transform, shadow)

---


### Test 6: Defeated Boss Visual State

**Requirement**: 2.5

**Objective**: Verify defeated bosses show "Guided" badge

**Setup**: Mark at least one boss as defeated in state

**Steps**:
1. Navigate to Guided Souls tab
2. Identify defeated boss cards

**Expected Results**:
- ✅ Sprite is in full color
- ✅ "Guided" badge appears (top-right corner of sprite)
- ✅ Badge has theme accent background color
- ✅ Badge text is white and bold
- ✅ Card is clickable
- ✅ Hover effects work
- ✅ Screen reader announces: "[Boss Name], guided, click to view story"

---

### Test 7: Boss Card Hover Feedback

**Requirement**: 2.6

**Objective**: Verify unlocked/defeated bosses have hover effects

**Steps**:
1. Navigate to Guided Souls tab
2. Hover over unlocked (non-locked) boss cards
3. Hover over defeated boss cards
4. Hover over locked boss cards

**Expected Results**:
- ✅ Unlocked cards: Transform up slightly, shadow increases, cursor is pointer
- ✅ Defeated cards: Same hover effects as unlocked
- ✅ Locked cards: No hover effects, cursor is not-allowed

---

### Test 8: Boss Card Navigation

**Requirement**: 2.7

**Objective**: Verify clicking boss cards navigates to detail view

**Steps**:
1. Navigate to Guided Souls tab
2. Click an unlocked boss card

**Expected Results**:
- ✅ Gallery view hides (display: none)
- ✅ Detail view shows (display: block)
- ✅ Detail view displays the clicked boss's information
- ✅ Transition is smooth
- ✅ Screen reader announces: "Viewing details for [Boss Name], [status] soul"

**Keyboard Test**:
3. Return to gallery (back button)
4. Tab to an unlocked boss card
5. Press Enter or Space

**Expected Results**:
- ✅ Same navigation behavior as clicking
- ✅ Focus moves to back button in detail view

---

### Test 9: Detail View - Basic Information

**Requirement**: 3.1

**Objective**: Verify detail view shows all required information

**Steps**:
1. Navigate to detail view for any boss
2. Inspect all displayed information

**Expected Results**:
- ✅ Boss name is displayed as heading
- ✅ Large sprite image is displayed
- ✅ Backstory text is displayed
- ✅ Initial resolve value is displayed
- ✅ Unlock level requirement is displayed
- ✅ All text is readable and properly formatted
- ✅ Detail view has role="article" and aria-labelledby="detail-name"

---

### Test 10: Detail View - Back Button

**Requirement**: 3.2

**Objective**: Verify back button returns to gallery

**Steps**:
1. Navigate to detail view for any boss
2. Click "← Back to Gallery" button

**Expected Results**:
- ✅ Detail view hides
- ✅ Gallery view shows
- ✅ Gallery displays all bosses again
- ✅ Screen reader announces: "Returned to gallery view"
- ✅ Focus moves to first unlocked boss card (or gallery container)

**Keyboard Test**:
3. Navigate to detail view again
4. Press Escape key

**Expected Results**:
- ✅ Returns to gallery (same as clicking back button)

---

### Test 11: Locked Content Placeholders

**Requirement**: 3.3

**Objective**: Verify undefeated bosses show locked placeholders

**Setup**: View detail for a boss that is NOT defeated

**Steps**:
1. Navigate to detail view for an undefeated boss
2. Scroll to Final Conversation section
3. Scroll to Resolution section

**Expected Results**:
- ✅ Final Conversation section shows locked placeholder
- ✅ Placeholder has dashed border
- ✅ Placeholder shows lock icon (🔒)
- ✅ Placeholder text: "Guide this soul to unlock the final conversation"
- ✅ Resolution section shows locked placeholder
- ✅ Placeholder text: "Guide this soul to unlock the resolution"
- ✅ Placeholders have role="status"
- ✅ Screen reader announces: "[Content Name], locked, guide this soul to unlock"

---


### Test 12: Unlocked Conversation Display

**Requirement**: 3.4, 3.5

**Objective**: Verify defeated bosses show full conversation

**Setup**: View detail for a DEFEATED boss

**Steps**:
1. Navigate to detail view for a defeated boss
2. Scroll to Final Conversation section
3. Read through all dialogue exchanges

**Expected Results**:
- ✅ Final Conversation heading is displayed
- ✅ All dialogue exchanges are rendered (3-5 exchanges)
- ✅ Each exchange is in a dialogue bubble
- ✅ Shepherd dialogue bubbles are right-aligned
- ✅ Soul dialogue bubbles are left-aligned
- ✅ Shepherd bubbles have different background color than Soul bubbles
- ✅ Speaker name is displayed above each bubble
- ✅ Speaker name shows "Soul Shepherd" for shepherd
- ✅ Speaker name shows "Stubborn Soul" for soul
- ✅ Text is readable and properly formatted
- ✅ Dialogue flows naturally from top to bottom

---

### Test 13: Resolution Display

**Requirement**: 3.6, 3.7

**Objective**: Verify defeated bosses show resolution text

**Setup**: View detail for a DEFEATED boss

**Steps**:
1. Navigate to detail view for a defeated boss
2. Scroll to Resolution section

**Expected Results**:
- ✅ Resolution heading is displayed
- ✅ Resolution text is displayed
- ✅ Text has distinct styling (italics)
- ✅ Text has special formatting (border-left, background)
- ✅ Text uses theme accent color
- ✅ Text is readable and properly formatted
- ✅ Resolution provides narrative closure

---

### Test 14: URL Parameter Handling - Valid Boss ID

**Requirement**: 1.3, 1.4

**Objective**: Verify direct navigation via URL works correctly

**Steps**:
1. Open options page with URL: `chrome-extension://[id]/options.html?tab=guided-souls&boss=0`
2. Observe the page load

**Expected Results**:
- ✅ Guided Souls tab is automatically selected
- ✅ Detail view is displayed (not gallery)
- ✅ Detail view shows boss with ID 0 (The Restless Athlete)
- ✅ All boss information is displayed correctly

**Test Multiple Boss IDs**:
3. Test with boss IDs: 1, 5, 9

**Expected Results**:
- ✅ Each URL correctly displays the corresponding boss

---

### Test 15: URL Parameter Handling - Invalid Boss ID

**Requirement**: 1.3, 1.4

**Objective**: Verify error handling for invalid boss IDs

**Steps**:
1. Open options page with URL: `chrome-extension://[id]/options.html?tab=guided-souls&boss=99`
2. Check console for warnings
3. Observe the page

**Expected Results**:
- ✅ Console shows warning: "Invalid boss ID in URL: 99"
- ✅ Gallery view is displayed (fallback)
- ✅ No error is thrown
- ✅ Page remains functional

**Test Other Invalid IDs**:
4. Test with: `boss=-1`, `boss=abc`, `boss=10`

**Expected Results**:
- ✅ All invalid IDs show warning and display gallery
- ✅ No crashes or errors

---

### Test 16: URL Parameter Handling - Missing Parameters

**Requirement**: 1.3, 1.4

**Objective**: Verify behavior when parameters are missing

**Steps**:
1. Open options page with URL: `chrome-extension://[id]/options.html?tab=guided-souls`
2. Observe the page

**Expected Results**:
- ✅ Guided Souls tab is selected
- ✅ Gallery view is displayed (default)
- ✅ No errors occur

**Test Without Tab Parameter**:
3. Open options page with URL: `chrome-extension://[id]/options.html?boss=0`

**Expected Results**:
- ✅ Default tab is shown (not Guided Souls)
- ✅ Boss parameter is ignored
- ✅ No errors occur

---


### Test 17: Boss Data Completeness - All 10 Bosses

**Requirement**: 4.4, 4.5, 4.6

**Objective**: Verify all 10 bosses have complete narrative content

**Setup**: Mark all bosses as defeated to view all content

**Steps**:
1. For each boss (0-9), navigate to detail view
2. Verify all required data is present

**Boss 0: The Restless Athlete**
- ✅ Name, backstory, sprite, resolve, unlock level present
- ✅ Final conversation has 3-5 exchanges
- ✅ Conversation follows arc: backstory → breakthrough → peace
- ✅ Resolution text is present and provides closure
- ✅ Thematic consistency with Soul Shepherd concept

**Boss 1: The Unfinished Scholar**
- ✅ All required data present
- ✅ Conversation quality and arc
- ✅ Resolution provides closure
- ✅ Theme: knowledge, contribution, legacy

**Boss 2: The Regretful Parent**
- ✅ All required data present
- ✅ Conversation quality and arc
- ✅ Resolution provides closure
- ✅ Theme: love, presence, small moments

**Boss 3: The Forgotten Artist**
- ✅ All required data present
- ✅ Conversation quality and arc
- ✅ Resolution provides closure
- ✅ Theme: creation, self-expression, intrinsic value

**Boss 4: The Lonely Musician**
- ✅ All required data present
- ✅ Conversation quality and arc
- ✅ Resolution provides closure
- ✅ Theme: music, expression, inner audience

**Boss 5: The Devoted Gardener**
- ✅ All required data present
- ✅ Conversation quality and arc
- ✅ Resolution provides closure
- ✅ Theme: patience, growth, delayed results

**Boss 6: The Ambitious Inventor**
- ✅ All required data present
- ✅ Conversation quality and arc
- ✅ Resolution provides closure
- ✅ Theme: innovation, stolen credit, inner knowledge

**Boss 7: The Wandering Explorer**
- ✅ All required data present
- ✅ Conversation quality and arc
- ✅ Resolution provides closure
- ✅ Theme: journey, exploration, process over destination

**Boss 8: The Silent Poet**
- ✅ All required data present
- ✅ Conversation quality and arc
- ✅ Resolution provides closure
- ✅ Theme: words, self-discovery, internal transformation

**Boss 9: The Eternal Guardian**
- ✅ All required data present
- ✅ Conversation quality and arc
- ✅ Resolution provides closure
- ✅ Theme: protection, duty, lifetime of service

---

### Test 18: Thematic Consistency

**Requirement**: 5.1, 5.2, 5.3, 5.4

**Objective**: Verify Soul Shepherd theme is reinforced throughout

**Steps**:
1. Review all UI text and labels
2. Review all narrative content
3. Check terminology usage

**Expected Results**:
- ✅ Feature is called "Guided Souls" (not "Boss Bestiary")
- ✅ Defeated bosses show "Guided" badge (not "Defeated")
- ✅ Narrative emphasizes guidance, peace, resolution
- ✅ No combat-oriented terminology
- ✅ Conversations show breakthrough moments
- ✅ Resolutions emphasize peace and closure
- ✅ Overall tone is compassionate and reflective
- ✅ Player is positioned as helper, not conqueror

---

### Test 19: Different Player Levels

**Requirement**: 2.2, 2.3

**Objective**: Verify unlock system works correctly at different levels

**Test Level 1**:
- ✅ Only boss 0 is unlocked
- ✅ Bosses 1-9 are locked with level overlays

**Test Level 5**:
- ✅ Bosses 0-2 are unlocked
- ✅ Bosses 3-9 are locked

**Test Level 15**:
- ✅ Bosses 0-5 are unlocked
- ✅ Bosses 6-9 are locked

**Test Level 30+**:
- ✅ All bosses are unlocked
- ✅ No locked overlays visible

---

### Test 20: Different Defeated Boss States

**Requirement**: 2.5, 3.3, 3.4, 3.6

**Objective**: Verify content unlocking works correctly

**Test No Defeated Bosses**:
- ✅ No "Guided" badges in gallery
- ✅ All detail views show locked placeholders

**Test Some Defeated Bosses** (e.g., [0, 2, 5]):
- ✅ Bosses 0, 2, 5 show "Guided" badges
- ✅ Bosses 0, 2, 5 show full narrative content
- ✅ Other bosses show locked placeholders

**Test All Defeated Bosses**:
- ✅ All bosses show "Guided" badges
- ✅ All bosses show full narrative content
- ✅ No locked placeholders visible

---


### Test 21: Accessibility - Screen Reader

**Requirement**: All (accessibility is cross-cutting)

**Objective**: Verify screen reader support

**Setup**: Enable screen reader (NVDA, JAWS, or VoiceOver)

**Gallery View**:
- ✅ Gallery has role="list" and aria-label
- ✅ Boss cards have role="listitem"
- ✅ Locked bosses announce state and level requirement
- ✅ Unlocked bosses announce clickable state
- ✅ Defeated bosses announce "guided" status

**Detail View**:
- ✅ Detail view has role="article"
- ✅ Back button has aria-label
- ✅ Locked placeholders have role="status"
- ✅ All content is announced in logical order

**Info Icon**:
- ✅ Icon has aria-label: "View boss details"
- ✅ Button is announced as clickable

---

### Test 22: Accessibility - Keyboard Navigation

**Requirement**: All (accessibility is cross-cutting)

**Objective**: Verify full keyboard accessibility

**Gallery View**:
1. Tab through gallery
2. Verify focus indicators are visible
3. Verify locked bosses are skipped (no tabindex)
4. Press Enter/Space on unlocked boss

**Expected Results**:
- ✅ Only unlocked/defeated bosses are focusable
- ✅ Focus indicators are clear and visible
- ✅ Enter/Space opens detail view

**Detail View**:
1. Tab through detail view
2. Verify back button is focusable
3. Press Escape key

**Expected Results**:
- ✅ Back button receives focus first
- ✅ Escape returns to gallery
- ✅ Focus returns to appropriate element

**Popup Info Icon**:
1. Tab to info icon
2. Press Enter or Space

**Expected Results**:
- ✅ Icon is focusable
- ✅ Focus indicator is visible
- ✅ Enter/Space opens options page

---

### Test 23: Error Handling - Missing State Data

**Requirement**: Error handling (cross-cutting)

**Objective**: Verify graceful handling of missing data

**Steps**:
1. Clear chrome.storage.local
2. Open options page
3. Navigate to Guided Souls tab

**Expected Results**:
- ✅ Error message is displayed (not a crash)
- ✅ Message: "Unable to load game state. Please refresh the page."
- ✅ Console shows error log
- ✅ Page remains functional

---

### Test 24: Error Handling - Missing Boss Data

**Requirement**: Error handling (cross-cutting)

**Objective**: Verify handling of incomplete boss data

**Steps**:
1. Temporarily modify constants.ts to remove conversation from a boss
2. Rebuild extension
3. Navigate to that boss's detail view (as defeated)

**Expected Results**:
- ✅ Console shows warning: "Missing conversation data for boss [id]"
- ✅ Placeholder text: "Conversation data unavailable."
- ✅ No crash occurs
- ✅ Other sections still display correctly

---

### Test 25: Error Handling - Missing Sprite

**Requirement**: Error handling (cross-cutting)

**Objective**: Verify handling of missing sprite images

**Steps**:
1. Temporarily rename a sprite file
2. Rebuild extension
3. View boss with missing sprite

**Expected Results**:
- ✅ Console shows warning about failed sprite load
- ✅ Sprite element is hidden (display: none)
- ✅ Other content displays correctly
- ✅ No broken image icon

---

### Test 26: Visual Polish - Responsive Design

**Objective**: Verify layout works at different sizes

**Steps**:
1. Open options page
2. Resize browser window to various widths
3. Test at: 1920px, 1366px, 1024px, 768px

**Expected Results**:
- ✅ Gallery grid adjusts column count appropriately
- ✅ Boss cards maintain aspect ratio
- ✅ Detail view remains readable
- ✅ No horizontal scrolling
- ✅ Text doesn't overflow containers

---

### Test 27: Visual Polish - Theme Integration

**Objective**: Verify feature uses theme colors correctly

**Steps**:
1. Apply different themes from shop
2. Navigate to Guided Souls tab
3. Observe color usage

**Expected Results**:
- ✅ Gallery uses theme colors for borders, backgrounds
- ✅ Detail view uses theme colors
- ✅ Info icon uses theme accent color
- ✅ Hover effects use theme colors
- ✅ All themes look visually cohesive

---

### Test 28: Visual Polish - Animations

**Objective**: Verify smooth transitions and animations

**With Animations Enabled**:
- ✅ Gallery to detail transition is smooth
- ✅ Detail to gallery transition is smooth
- ✅ Hover effects are smooth
- ✅ No jarring movements

**With Animations Disabled**:
- ✅ Transitions are instant but functional
- ✅ No animation delays
- ✅ All functionality still works

---

### Test 29: Integration - Popup to Options Flow

**Requirement**: 1.1, 1.2, 1.3, 1.4

**Objective**: Verify complete user flow from popup

**Steps**:
1. Open popup
2. Note current boss name
3. Click info icon
4. Verify options page opens
5. Verify correct boss is displayed
6. Click back to gallery
7. Click the same boss card
8. Verify detail view shows same boss

**Expected Results**:
- ✅ Seamless flow from popup to options
- ✅ Correct boss is displayed throughout
- ✅ Navigation is intuitive
- ✅ No confusion or errors

---

### Test 30: Integration - Multiple Tab Switches

**Objective**: Verify feature works after switching tabs

**Steps**:
1. Navigate to Guided Souls tab
2. View a boss detail
3. Switch to Settings tab
4. Switch back to Guided Souls tab
5. Verify state is preserved

**Expected Results**:
- ✅ Detail view is still displayed (or gallery if that was showing)
- ✅ No re-rendering issues
- ✅ All functionality still works

---

## Test Completion Checklist

### Core Functionality
- [ ] Popup info icon works (idle view)
- [ ] Popup info icon works (break view)
- [ ] Gallery displays all 10 bosses
- [ ] Locked bosses display correctly
- [ ] Unlocked bosses display correctly
- [ ] Defeated bosses display correctly
- [ ] Boss cards navigate to detail view
- [ ] Detail view shows all required info
- [ ] Back button returns to gallery
- [ ] Locked content shows placeholders
- [ ] Unlocked content shows full narrative

### URL Navigation
- [ ] Valid boss IDs work
- [ ] Invalid boss IDs handled gracefully
- [ ] Missing parameters handled correctly

### Content Quality
- [ ] All 10 bosses have complete data
- [ ] Conversations are 3-5 exchanges
- [ ] Conversations follow narrative arc
- [ ] Resolutions provide closure
- [ ] Thematic consistency maintained
- [ ] Soul Shepherd terminology used

### Accessibility
- [ ] Screen reader support works
- [ ] Keyboard navigation works
- [ ] Focus management is correct
- [ ] ARIA labels are present

### Error Handling
- [ ] Missing state handled gracefully
- [ ] Missing boss data handled gracefully
- [ ] Missing sprites handled gracefully

### Visual Polish
- [ ] Responsive design works
- [ ] Theme integration works
- [ ] Animations are smooth
- [ ] Layout is clean and readable

### Integration
- [ ] Popup to options flow works
- [ ] Tab switching preserves state
- [ ] Multiple player levels tested
- [ ] Multiple defeated states tested

---

## Known Issues / Notes

Document any issues found during testing:

1. **Issue**: [Description]
   - **Severity**: Critical / High / Medium / Low
   - **Steps to Reproduce**: [Steps]
   - **Expected**: [Expected behavior]
   - **Actual**: [Actual behavior]

---

## Sign-Off

**Tester**: ___________________  
**Date**: ___________________  
**Result**: ☐ Pass  ☐ Pass with minor issues  ☐ Fail

**Notes**:

