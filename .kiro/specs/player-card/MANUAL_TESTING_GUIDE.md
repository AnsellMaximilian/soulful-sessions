# Player Card Feature - Manual Testing Guide

## Overview
This guide provides comprehensive manual testing procedures for the Player Card feature. Follow each test scenario to verify functionality, visual quality, and user experience.

## Test Environment Setup

### Prerequisites
- Chrome browser with extension loaded
- Access to options page
- Various game states (new player, mid-level, high-level)
- Different themes unlocked for testing

### Test Data Preparation
1. **New Player State**: Level 1, minimal stats, no achievements
2. **Mid-Level State**: Level 10-15, moderate stats, some achievements
3. **High-Level State**: Level 25+, high stats, many achievements
4. **Edge Cases**: Max level, zero stats, missing cosmetics

---

## Test Scenarios

### 1. Card Generation with Various Game States

#### Test 1.1: New Player Card
**Steps:**
1. Reset extension to new player state
2. Navigate to Statistics tab
3. Click "Show Player Card" button
4. Verify card displays correctly

**Expected Results:**
- ✓ Card shows Level 1
- ✓ Default character sprite displayed
- ✓ Stats show initial values (Spirit: 1, Harmony: 5%, Soulflow: 1)
- ✓ Achievements show zeros
- ✓ XP bar shows 0% progress
- ✓ Theme name displays correctly

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

#### Test 1.2: Mid-Level Player Card
**Steps:**
1. Load game state with Level 10-15 player
2. Navigate to Statistics tab
3. Click "Show Player Card" button
4. Verify all data displays correctly

**Expected Results:**
- ✓ Level displays correctly
- ✓ XP progress bar shows accurate percentage
- ✓ Stats reflect upgrades
- ✓ Achievements show accumulated values
- ✓ Focus time formatted as "Xh Ym"
- ✓ Character name reflects level tier

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

#### Test 1.3: High-Level Player Card
**Steps:**
1. Load game state with Level 25+ player
2. Navigate to Statistics tab
3. Click "Show Player Card" button
4. Verify high values display properly

**Expected Results:**
- ✓ Large numbers format correctly
- ✓ No overflow or truncation
- ✓ Character name shows "Eternal Shepherd" or appropriate tier
- ✓ All visual elements remain properly aligned

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

### 2. Image Quality and File Size

#### Test 2.1: Image Generation Quality
**Steps:**
1. Open player card
2. Click "Copy Card" button
3. Paste into image editor (Paint, Photoshop, etc.)
4. Inspect image quality

**Expected Results:**
- ✓ Image is clear and sharp (2x scale)
- ✓ Text is readable
- ✓ Character sprite renders correctly
- ✓ No pixelation or artifacts
- ✓ Colors match theme accurately
- ✓ Icons are crisp and clear

**Quality Rating:** [ ] Excellent [ ] Good [ ] Acceptable [ ] Poor

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

#### Test 2.2: Image File Size
**Steps:**
1. Copy card to clipboard
2. Paste into image editor
3. Save as PNG
4. Check file size

**Expected Results:**
- ✓ File size is reasonable (< 500KB for typical card)
- ✓ Image loads quickly when pasted
- ✓ No excessive compression artifacts

**File Size:** _______ KB

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

### 3. Clipboard Functionality

#### Test 3.1: Basic Clipboard Copy
**Steps:**
1. Open player card
2. Click "Copy Card" button
3. Wait for success notification
4. Paste into various applications

**Test Applications:**
- [ ] Discord
- [ ] Slack
- [ ] Twitter/X
- [ ] Reddit
- [ ] Email client
- [ ] Microsoft Word
- [ ] Google Docs
- [ ] Image editor

**Expected Results:**
- ✓ Success notification appears
- ✓ Image pastes correctly in all applications
- ✓ No permission errors
- ✓ Image maintains quality

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

#### Test 3.2: Clipboard Permission Denied
**Steps:**
1. Revoke clipboard permissions (if possible)
2. Try to copy card
3. Verify error handling

**Expected Results:**
- ✓ Error notification displays
- ✓ Error message is clear and helpful
- ✓ No console errors crash the page
- ✓ User can retry after granting permission

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

#### Test 3.3: Multiple Copy Operations
**Steps:**
1. Copy card
2. Wait for completion
3. Immediately copy again
4. Repeat 5 times

**Expected Results:**
- ✓ Each copy operation completes successfully
- ✓ No memory leaks
- ✓ Button state updates correctly
- ✓ Notifications don't stack excessively

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

### 4. Theme Colors Application

#### Test 4.1: Default Theme
**Steps:**
1. Set active theme to "Default"
2. Open player card
3. Verify theme colors

**Expected Results:**
- ✓ Primary color: #667eea (purple-blue)
- ✓ Secondary color: #764ba2 (purple)
- ✓ Accent color: #4fc3f7 (cyan)
- ✓ Background gradient matches theme
- ✓ All themed elements use correct colors

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

#### Test 4.2: Crimson Dusk Theme
**Steps:**
1. Set active theme to "Crimson Dusk"
2. Open player card
3. Verify theme colors

**Expected Results:**
- ✓ Primary color: #ff6b6b (red)
- ✓ Card reflects warm red tones
- ✓ Text remains readable
- ✓ Contrast meets accessibility standards

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

#### Test 4.3: All Available Themes
**Themes to Test:**
- [ ] Default
- [ ] Crimson Dusk
- [ ] Emerald Grove
- [ ] Golden Dawn
- [ ] Midnight Ocean
- [ ] Violet Dream

**For Each Theme:**
1. Switch to theme in options
2. Open player card
3. Verify colors apply correctly
4. Check text contrast
5. Verify visual appeal

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

### 5. Error Scenarios

#### Test 5.1: Missing Character Sprite
**Steps:**
1. Modify game state to reference non-existent sprite
2. Open player card
3. Verify fallback behavior

**Expected Results:**
- ✓ Default sprite loads as fallback
- ✓ No broken image icon
- ✓ Card still displays correctly
- ✓ No console errors

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

#### Test 5.2: Invalid Game State
**Steps:**
1. Corrupt game state data (null values, missing fields)
2. Open player card
3. Verify error handling

**Expected Results:**
- ✓ Card uses default values
- ✓ No crashes or blank screens
- ✓ Warning logged to console
- ✓ User can still interact with card

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

#### Test 5.3: Network Issues (html2canvas Loading)
**Steps:**
1. Disable network (if testing with CDN)
2. Try to copy card
3. Verify error handling

**Expected Results:**
- ✓ Error notification displays
- ✓ Clear error message
- ✓ Fallback suggestion provided
- ✓ Page remains functional

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

### 6. Accessibility Testing

#### Test 6.1: Keyboard Navigation
**Steps:**
1. Navigate to Statistics tab using Tab key
2. Press Enter on "Show Player Card" button
3. Navigate through modal using Tab
4. Press Escape to close

**Expected Results:**
- ✓ All interactive elements are keyboard accessible
- ✓ Focus indicators are visible
- ✓ Tab order is logical
- ✓ Focus trap works (Tab cycles within modal)
- ✓ Escape key closes modal
- ✓ Focus returns to trigger button after close

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

#### Test 6.2: Screen Reader Testing
**Screen Readers to Test:**
- [ ] NVDA (Windows)
- [ ] JAWS (Windows)
- [ ] VoiceOver (Mac)
- [ ] ChromeVox (Chrome)

**Steps:**
1. Enable screen reader
2. Navigate to Statistics tab
3. Activate "Show Player Card" button
4. Listen to card content announcement
5. Navigate through card elements
6. Copy card and listen to notification

**Expected Results:**
- ✓ Button has descriptive label
- ✓ Modal announces as dialog
- ✓ All stats are announced with labels
- ✓ Progress bar announces percentage
- ✓ Notifications use aria-live regions
- ✓ Close button is clearly labeled
- ✓ No redundant announcements

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

#### Test 6.3: High Contrast Mode
**Steps:**
1. Enable Windows High Contrast mode
2. Open player card
3. Verify visibility

**Expected Results:**
- ✓ All text is readable
- ✓ Borders are visible
- ✓ Focus indicators are clear
- ✓ Buttons are distinguishable
- ✓ No information is lost

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

#### Test 6.4: Color Contrast
**Steps:**
1. Use browser DevTools or contrast checker
2. Verify text contrast ratios
3. Test with each theme

**Expected Results:**
- ✓ Body text: minimum 4.5:1 contrast ratio
- ✓ Large text: minimum 3:1 contrast ratio
- ✓ Interactive elements: minimum 3:1 contrast ratio
- ✓ All themes meet WCAG AA standards

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

### 7. Viewport Size Testing

#### Test 7.1: Desktop (1920x1080)
**Steps:**
1. Set browser to 1920x1080
2. Open player card
3. Verify layout

**Expected Results:**
- ✓ Card is centered
- ✓ All elements visible
- ✓ Proper spacing
- ✓ No overflow

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

#### Test 7.2: Laptop (1366x768)
**Steps:**
1. Set browser to 1366x768
2. Open player card
3. Verify layout

**Expected Results:**
- ✓ Card fits within viewport
- ✓ Scrolling works if needed
- ✓ No horizontal scroll
- ✓ Elements remain readable

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

#### Test 7.3: Tablet (768x1024)
**Steps:**
1. Set browser to 768x1024
2. Open player card
3. Verify responsive behavior

**Expected Results:**
- ✓ Card adapts to smaller width
- ✓ Stats grid adjusts (3 columns → 3 columns)
- ✓ Text remains readable
- ✓ Touch targets are adequate (44x44px minimum)

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

#### Test 7.4: Mobile (375x667)
**Steps:**
1. Set browser to 375x667
2. Open player card
3. Verify mobile layout

**Expected Results:**
- ✓ Card uses full width with padding
- ✓ Stats grid becomes single column
- ✓ Buttons stack vertically
- ✓ All content is accessible
- ✓ No text truncation

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

### 8. Animation and Transition Polish

#### Test 8.1: Modal Open Animation
**Steps:**
1. Click "Show Player Card" button
2. Observe modal appearance

**Expected Results:**
- ✓ Smooth slide-in animation
- ✓ Backdrop fades in
- ✓ Animation duration feels natural (~400ms)
- ✓ No jank or stuttering

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

#### Test 8.2: Modal Close Animation
**Steps:**
1. Open modal
2. Click close button
3. Observe modal disappearance

**Expected Results:**
- ✓ Smooth fade-out
- ✓ No abrupt disappearance
- ✓ Focus returns smoothly

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

#### Test 8.3: Button Hover States
**Steps:**
1. Hover over "Show Player Card" button
2. Hover over "Copy Card" button
3. Hover over "Close" button

**Expected Results:**
- ✓ Smooth color transitions
- ✓ Subtle scale or shadow effects
- ✓ Clear visual feedback
- ✓ No layout shift

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

#### Test 8.4: Loading State
**Steps:**
1. Click "Copy Card" button
2. Observe button during processing

**Expected Results:**
- ✓ Button shows "Copying..." text
- ✓ Button is disabled
- ✓ Loading spinner appears
- ✓ Button returns to normal after completion

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

#### Test 8.5: Reduced Motion
**Steps:**
1. Enable "Reduce Motion" in OS settings
2. Open player card
3. Verify animations are reduced

**Expected Results:**
- ✓ Modal appears without animation
- ✓ Transitions are instant or minimal
- ✓ Functionality is preserved
- ✓ No motion sickness triggers

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

### 9. Visual Polish Checklist

#### Test 9.1: Typography
- [ ] All text is readable
- [ ] Font sizes are appropriate
- [ ] Line heights provide good readability
- [ ] No text overflow or truncation
- [ ] Numbers format correctly (commas, decimals)

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

#### Test 9.2: Spacing and Layout
- [ ] Consistent padding throughout
- [ ] Proper spacing between sections
- [ ] Elements are well-aligned
- [ ] No cramped or cluttered areas
- [ ] Visual hierarchy is clear

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

#### Test 9.3: Colors and Theming
- [ ] Theme colors apply consistently
- [ ] Color transitions are smooth
- [ ] No color clashing
- [ ] Gradients render smoothly
- [ ] Shadows enhance depth

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

#### Test 9.4: Icons and Images
- [ ] All icons load correctly
- [ ] Icons are crisp (not blurry)
- [ ] Character sprite displays properly
- [ ] Image fallbacks work
- [ ] No broken image icons

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

#### Test 9.5: Interactive Elements
- [ ] Buttons have clear hover states
- [ ] Focus indicators are visible
- [ ] Active states provide feedback
- [ ] Disabled states are obvious
- [ ] Cursor changes appropriately

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

### 10. Performance Testing

#### Test 10.1: Modal Open Performance
**Steps:**
1. Open player card
2. Measure time to display

**Expected Results:**
- ✓ Modal appears within 500ms
- ✓ No lag or delay
- ✓ Smooth rendering

**Time Measured:** _______ ms

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

#### Test 10.2: Image Generation Performance
**Steps:**
1. Click "Copy Card" button
2. Measure time to complete

**Expected Results:**
- ✓ Completes within 2 seconds
- ✓ No browser freeze
- ✓ Progress indication is clear

**Time Measured:** _______ ms

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

#### Test 10.3: Memory Usage
**Steps:**
1. Open DevTools Performance tab
2. Open and close modal 10 times
3. Copy card 10 times
4. Check memory usage

**Expected Results:**
- ✓ No significant memory leaks
- ✓ Memory is released after operations
- ✓ No accumulation over time

**Status:** [ ] Pass [ ] Fail [ ] Notes: _______________

---

## Issues Found

### Critical Issues
_List any critical bugs that prevent core functionality_

1. 
2. 
3. 

### Major Issues
_List any major issues that significantly impact UX_

1. 
2. 
3. 

### Minor Issues
_List any minor polish issues or improvements_

1. 
2. 
3. 

---

## Polish Improvements Implemented

### Visual Enhancements
- [ ] Improved animation timing
- [ ] Enhanced color contrast
- [ ] Better spacing and alignment
- [ ] Refined typography

### Functional Improvements
- [ ] Better error messages
- [ ] Improved loading states
- [ ] Enhanced accessibility
- [ ] Optimized performance

### User Experience
- [ ] Clearer feedback
- [ ] Smoother interactions
- [ ] Better mobile experience
- [ ] Improved keyboard navigation

---

## Sign-Off

**Tester Name:** _________________

**Date:** _________________

**Overall Assessment:** [ ] Ready for Release [ ] Needs Minor Fixes [ ] Needs Major Fixes

**Additional Comments:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
