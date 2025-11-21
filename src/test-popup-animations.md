# Popup UI Animations Manual Test

This document describes how to manually test the popup UI animations and transitions implemented in task 37.

## Prerequisites

1. Build the extension: `npm run build`
2. Load the extension in Chrome
3. Ensure you have some game state (completed at least one session)

## Test Cases

### 1. Fade Transitions Between View States

**Test Steps:**

1. Open the popup (should show idle view)
2. Start a focus session
3. Observe the fade transition from idle view to focus session view
4. Wait for session to complete or end it early
5. Observe the fade transition to reward view
6. Click "Continue to Break"
7. Observe the fade transition to break view
8. Click "Start Next Session"
9. Observe the fade transition back to idle view

**Expected Results:**

- All view transitions should have a smooth 300ms fade effect
- Old view fades out, then new view fades in
- No jarring instant switches

**With Animations Disabled:**

- Go to Options page
- Disable animations
- Repeat the test
- Transitions should be instant with no fade effect

### 2. XP Bar Fill Animation on Reward View

**Test Steps:**

1. Complete a focus session
2. On the reward view, observe the XP bar
3. The bar should animate from the previous XP value to the new value

**Expected Results:**

- XP bar smoothly fills from old value to new value over ~1.5 seconds
- XP text counter animates from old value to new value
- Animation uses easing function for smooth motion

**With Animations Disabled:**

- XP bar should instantly show the new value
- No animation or counter effect

### 3. Number Count-Up Animation for Rewards

**Test Steps:**

1. Complete a focus session
2. On the reward view, observe the reward values:
   - Soul Insight Earned
   - Soul Embers Earned
   - Boss Damage Dealt

**Expected Results:**

- Each number should count up from 0 to the final value
- Soul Insight animates first (no delay)
- Soul Embers animates second (100ms delay)
- Boss Damage animates third (200ms delay)
- Each animation takes ~1 second
- Numbers use easing function for smooth counting

**With Animations Disabled:**

- All numbers should instantly show final values
- No count-up effect

### 4. Pulse Animation for Critical Hits

**Test Steps:**

1. Complete multiple focus sessions until you get a critical hit
   - Critical hits are based on Harmony stat (5% base chance)
   - You may need to upgrade Harmony stat to increase chances
2. When you get a critical hit, observe the "⚡ Critical Hit! ⚡" indicator

**Expected Results:**

- Critical indicator appears with a pulsing animation
- Animation includes:
  - Scale effect (grows and shrinks)
  - Glow effect (box-shadow pulses)
- Animation lasts ~1.5 seconds
- Pulses twice during the animation

**With Animations Disabled:**

- Critical indicator appears instantly
- No pulse or glow effect

### 5. Shake Animation for Compromise Warnings

**Test Steps:**

1. Start a focus session
2. Visit a discouraged site during the session
3. Complete the session
4. On the reward view, observe the "⚠️ Session Compromised" warning

**Expected Results:**

- Warning appears with a shake animation
- Element shakes left and right rapidly
- Animation lasts ~0.5 seconds
- Creates a sense of warning/alert

**With Animations Disabled:**

- Warning appears instantly
- No shake effect

### 6. Smooth Progress Bar Animations for Boss Resolve

**Test Steps:**

1. Complete a focus session that damages a boss
2. Observe the boss Resolve bar in:
   - Idle view (after returning from break)
   - Break view
3. The bar should smoothly transition to the new value

**Expected Results:**

- Resolve bar smoothly animates from old value to new value
- Animation takes ~1.2 seconds
- Uses cubic-bezier easing for smooth motion
- Bar color remains consistent during animation

**With Animations Disabled:**

- Resolve bar instantly shows new value
- No smooth transition

### 7. All Animations Respect animationsEnabled Setting

**Test Steps:**

1. Go to Options page
2. Find the "Enable Animations" toggle
3. Disable animations
4. Return to popup and test all animations above
5. Re-enable animations
6. Test again to confirm animations work

**Expected Results:**

- When disabled: All animations are instant/skipped
- When enabled: All animations work as described
- Setting persists across popup opens
- No errors in console when animations are disabled

## Additional Notes

### Animation Performance

- All animations should run at 60fps
- No stuttering or lag
- Popup should remain responsive during animations

### Animation Timing

- View transitions: 300ms
- XP bar fill: 1500ms
- Number count-up: 1000ms
- Critical pulse: 1500ms
- Compromise shake: 500ms
- Resolve bar: 1200ms

### CSS Classes Used

- `.fade-out` - Applied to view being hidden
- `.fade-in` - Applied to view being shown
- `.animate` - Applied to elements with animations

## Known Limitations

1. Animations only work when `animationsEnabled` setting is true
2. View transitions require a 300ms delay between views
3. Multiple rapid view switches may queue animations

## Troubleshooting

**Animations not working:**

- Check that animations are enabled in Options
- Check browser console for errors
- Verify CSS classes are being applied
- Check that `currentState.settings.animationsEnabled` is true

**Animations too fast/slow:**

- Adjust duration values in CSS
- Modify timing functions for different feel

**Animations stuttering:**

- Check browser performance
- Reduce animation complexity
- Use `will-change` CSS property for optimization
