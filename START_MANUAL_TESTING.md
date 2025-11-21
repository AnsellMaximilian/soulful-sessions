# 🧪 Start Manual Testing - Soul Shepherd Extension

## Quick Start

You have **3 testing options** based on your available time:

1. **Quick Test (30 min)** → Use `QUICK_MANUAL_TEST.md`
2. **Full Test (3 hours)** → Use `MANUAL_TESTING_EXECUTION.md`
3. **Reference Guide** → Use `MANUAL_TESTING_GUIDE.md`

---

## Prerequisites ✅

Before starting, ensure:

- [ ] Extension is built: Run `npm run build`
- [ ] Chrome browser is installed
- [ ] You have 30 minutes to 3 hours available (depending on test suite)
- [ ] You're ready to step away from computer for idle detection test

---

## Step 1: Load Extension in Chrome

1. Open Chrome browser
2. Navigate to: `chrome://extensions/`
3. Enable **"Developer mode"** (toggle in top-right corner)
4. Click **"Load unpacked"** button
5. Navigate to your project folder
6. Select the **`dist`** folder
7. Verify Soul Shepherd extension appears in the list
8. **Pin the extension icon** to toolbar (click puzzle icon → pin Soul Shepherd)

✅ **Extension loaded successfully!**

---

## Step 2: Choose Your Testing Path

### Option A: Quick Test (Recommended for First Run)

**Time**: 30 minutes  
**File**: `QUICK_MANUAL_TEST.md`  
**Coverage**: 9 critical tests

This covers the most important functionality:

- Initial state verification
- Complete session flow
- Task CRUD operations
- Settings persistence
- Idle detection
- Discouraged sites
- Strict mode blocking
- State persistence
- Idle collection

**Start here if**: You want to verify core functionality quickly

---

### Option B: Full Manual Test

**Time**: ~3 hours (excluding multi-day streak test)  
**File**: `MANUAL_TESTING_EXECUTION.md`  
**Coverage**: 18+ comprehensive tests

This covers everything including:

- All features from Quick Test
- Boss defeat and progression
- Stat upgrades and cost scaling
- Skill point allocation
- Critical hit mechanics
- Cosmetics system
- Animations toggle
- Notifications toggle
- Auto-start next session
- Error handling scenarios

**Start here if**: You want comprehensive coverage before release

---

### Option C: Reference Guide

**File**: `MANUAL_TESTING_GUIDE.md`  
**Purpose**: Detailed step-by-step instructions for each test

This is a reference document with:

- Detailed test procedures
- Expected results for each step
- Troubleshooting guidance
- Complete test scenarios

**Use this**: As a reference while executing tests from Option A or B

---

## Step 3: Execute Tests

### For Quick Test:

```bash
# Open the quick test file
code QUICK_MANUAL_TEST.md

# Follow the 9 tests in order
# Mark each test as PASS/FAIL
# Document any issues found
```

### For Full Test:

```bash
# Open the execution report
code MANUAL_TESTING_EXECUTION.md

# Follow tests 1-18 in order
# Record actual values where indicated
# Document all issues found
```

---

## Step 4: Document Results

As you test, fill in:

- [ ] Test status (PASS/FAIL)
- [ ] Actual values recorded
- [ ] Any bugs or issues found
- [ ] Screenshots of problems (if any)
- [ ] Notes about unexpected behavior

---

## Step 5: Report Issues

If you find bugs, document them with:

1. **Test number** where bug was found
2. **Steps to reproduce**
3. **Expected behavior**
4. **Actual behavior**
5. **Severity** (Critical/Major/Minor)
6. **Screenshots** (if applicable)

---

## Common Testing Tips

### For Faster Testing:

- Use **1-minute sessions** instead of 25 minutes
- Use **1-minute breaks** instead of 5 minutes
- Temporarily modify defaults in Options page
- Keep DevTools open to monitor console errors

### For Idle Detection Test:

- Set idle threshold to 120 seconds (2 minutes)
- Use a 5-minute session
- Step away for exactly 3 minutes
- Don't touch mouse or keyboard during idle period

### For Multi-Day Streak Test:

- This requires testing over 4 days
- Set a reminder to complete sessions on Day 1, 2, and 4
- Intentionally skip Day 3
- Document results after Day 4

### For State Persistence Test:

- Build up significant state first (multiple sessions)
- Record ALL values before closing browser
- Close Chrome completely (all windows)
- Wait 30 seconds before reopening
- Verify all values match

---

## Troubleshooting

### Extension Won't Load

- Ensure `npm run build` completed successfully
- Check that `dist` folder contains all files
- Look for errors in Chrome extensions page
- Try removing and re-adding the extension

### Popup Won't Open

- Check for JavaScript errors in DevTools
- Verify `dist/popup.js` exists
- Check manifest.json points to correct files
- Try reloading the extension

### Tests Failing

- Check console for errors (F12 → Console)
- Verify all files are present in `dist` folder
- Ensure Chrome has all required permissions
- Try clearing extension storage and restarting

### Storage Issues

- Open DevTools → Application → Storage
- Check chrome.storage.local for game state
- Verify data is being saved
- Clear storage and test fresh install

---

## After Testing

### If All Tests Pass:

1. Mark task as complete in `tasks.md`
2. Document test results
3. Extension is ready for use!

### If Issues Found:

1. Document all bugs in testing report
2. Prioritize by severity
3. Fix critical bugs first
4. Re-test after fixes
5. Repeat until all tests pass

---

## Test Completion Checklist

- [ ] Extension loaded successfully in Chrome
- [ ] Testing path chosen (Quick or Full)
- [ ] All tests executed
- [ ] Results documented
- [ ] Issues reported (if any)
- [ ] Screenshots captured (if needed)
- [ ] Test report completed
- [ ] Task marked as complete (if all pass)

---

## Quick Reference: Test Files

| File                          | Purpose                      | Time      |
| ----------------------------- | ---------------------------- | --------- |
| `QUICK_MANUAL_TEST.md`        | Fast critical path testing   | 30 min    |
| `MANUAL_TESTING_EXECUTION.md` | Comprehensive test execution | 3 hours   |
| `MANUAL_TESTING_GUIDE.md`     | Detailed reference guide     | Reference |
| `MANUAL_TESTING_CHECKLIST.md` | Quick checklist format       | Reference |

---

## Need Help?

If you encounter issues during testing:

1. Check the console for errors (F12)
2. Review the MANUAL_TESTING_GUIDE.md for detailed steps
3. Verify all prerequisites are met
4. Try reloading the extension
5. Check that all files are present in `dist` folder

---

## Ready to Start?

1. ✅ Extension loaded in Chrome
2. ✅ Testing file opened
3. ✅ DevTools ready (F12)
4. ✅ Timer ready (for timed tests)

**Let's begin testing! 🚀**

Choose your path:

- **Quick Test**: Open `QUICK_MANUAL_TEST.md` and start with Test 1
- **Full Test**: Open `MANUAL_TESTING_EXECUTION.md` and start with Test 1

Good luck! 🎮👻
