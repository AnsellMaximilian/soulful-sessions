# Boss Bestiary - Quick Test Checklist

## Quick Setup
```javascript
// Set level to 30 (unlock all bosses)
chrome.storage.local.get('gameState', (r) => {
  let s = r.gameState; s.player.level = 30;
  chrome.storage.local.set({gameState: s});
});

// Mark bosses 0, 1, 2 as defeated
chrome.storage.local.get('gameState', (r) => {
  let s = r.gameState; s.progression.defeatedBosses = [0, 1, 2];
  chrome.storage.local.set({gameState: s});
});
```

## Critical Path Tests (15 minutes)

### 1. Popup Info Icon
- [ ] Open popup → See info icon (ⓘ) next to boss name
- [ ] Click icon → Options opens to Guided Souls tab with boss detail
- [ ] Tab to icon → Press Enter → Same result

### 2. Gallery View
- [ ] Open options → Click Guided Souls tab
- [ ] See all 10 bosses in grid
- [ ] Defeated bosses (0,1,2) have "Guided" badge
- [ ] Hover over unlocked boss → Visual feedback

### 3. Boss Card Navigation
- [ ] Click unlocked boss → Detail view shows
- [ ] Click "Back to Gallery" → Returns to gallery
- [ ] Press Escape in detail → Returns to gallery

### 4. Locked vs Unlocked Content
- [ ] View defeated boss (0, 1, or 2) → See full conversation and resolution
- [ ] View undefeated boss (3-9) → See locked placeholders with 🔒

### 5. URL Navigation
- [ ] Open: `options.html?tab=guided-souls&boss=0`
- [ ] Verify: Guided Souls tab selected, boss 0 detail shown
- [ ] Open: `options.html?tab=guided-souls&boss=99`
- [ ] Verify: Gallery shown (invalid ID handled)

### 6. Content Completeness
- [ ] View all 10 bosses (mark all defeated if needed)
- [ ] Each has: name, sprite, backstory, resolve, unlock level
- [ ] Each has: 3-5 conversation exchanges
- [ ] Each has: resolution text

### 7. Accessibility
- [ ] Tab through gallery → Only unlocked bosses focusable
- [ ] Focus indicators visible
- [ ] Info icon has aria-label

### 8. Error Handling
- [ ] Clear storage → Open Guided Souls tab
- [ ] See error message (not crash)

## Pass Criteria
✅ All 8 tests pass → Feature is ready  
⚠️ 1-2 minor issues → Document and decide  
❌ 3+ issues or critical failure → Fix before release

## Notes
_Document any issues found:_

