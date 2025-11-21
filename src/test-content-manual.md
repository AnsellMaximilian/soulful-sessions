# Content Script Manual Testing Guide

This guide helps verify that the content script for discouraged site warnings is working correctly.

## Prerequisites

1. Build the extension: `npm run build`
2. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the project directory

## Test Cases

### Test 1: Configure Discouraged Sites

1. Open the extension options page
2. Add a discouraged site (e.g., "reddit.com")
3. Save the settings

**Expected**: Site should be saved to discouraged sites list

### Test 2: Start a Focus Session

1. Click the extension icon to open popup
2. Start a focus session (any duration)
3. Verify the popup shows minimal "ritual in progress" view

**Expected**: Session starts successfully

### Test 3: Visit Discouraged Site During Session

1. With an active session, navigate to the discouraged site (e.g., https://reddit.com)
2. Observe the page

**Expected**:

- A warning banner appears at the top of the page
- Banner shows: "The Soul Shepherd senses this realm drains your Spirit. Return to your task."
- Banner has a dismiss button
- Banner has a brown/earthy gradient background

### Test 4: Dismiss Warning

1. Click the "Dismiss" button on the warning banner

**Expected**:

- Banner disappears
- Banner does not reappear while on the same page

### Test 5: Navigate Within Site (Reappear on Navigation)

1. With the banner dismissed, click a link to navigate to another page on the same discouraged site
2. Observe the page

**Expected**:

- Warning banner reappears on the new page
- Banner can be dismissed again

### Test 6: Visit Discouraged Site Without Active Session

1. End the current session or wait for it to complete
2. Navigate to a discouraged site

**Expected**:

- No warning banner appears
- Site loads normally

### Test 7: Single-Page App Navigation

1. Start a focus session
2. Visit a single-page app that's on the discouraged list (e.g., reddit.com)
3. Navigate within the app using its internal navigation

**Expected**:

- Warning banner appears on initial load
- Banner reappears when navigating to new "pages" within the SPA

### Test 8: Session Compromise Tracking

1. Start a focus session
2. Visit a discouraged site
3. Complete the session
4. Check the reward screen

**Expected**:

- Reward screen shows "compromise warning"
- Rewards are reduced (0.7x multiplier)

### Test 9: Multiple Tabs

1. Start a focus session
2. Open multiple tabs with discouraged sites

**Expected**:

- Warning banner appears in each tab
- Each banner can be dismissed independently

### Test 10: Browser Restart

1. Start a focus session
2. Visit a discouraged site (banner appears)
3. Close and reopen the browser
4. Return to the discouraged site

**Expected**:

- Session should still be active (if not expired)
- Warning banner should appear again

## Debugging

If the content script isn't working:

1. Check the browser console on the page (F12)

   - Look for `[Content]` log messages
   - Check for any errors

2. Check the background service worker console

   - Go to `chrome://extensions/`
   - Click "service worker" under the extension
   - Look for `[Background]` messages related to CHECK_URL and SITE_VISITED

3. Verify the manifest.json includes:

   ```json
   "content_scripts": [
     {
       "matches": ["<all_urls>"],
       "js": ["dist/content.js"],
       "run_at": "document_start"
     }
   ]
   ```

4. Verify dist/content.js exists after building

5. Try reloading the extension:
   - Go to `chrome://extensions/`
   - Click the reload icon for the extension

## Known Limitations

- Content scripts cannot run on Chrome internal pages (chrome://, chrome-extension://)
- Some sites with strict Content Security Policies may prevent the overlay from displaying
- The overlay uses inline styles which should work on most sites
