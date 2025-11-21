// ============================================================================
// Manual Test for Notification System
// ============================================================================

/**
 * This file contains manual test instructions for the notification system.
 *
 * SETUP:
 * 1. Build the extension: npm run build
 * 2. Load the extension in Chrome
 * 3. Open the options page and ensure "Enable notifications" is checked
 *
 * TEST 1: Session Complete Notification
 * --------------------------------------
 * 1. Open the extension popup
 * 2. Start a focus session with a short duration (e.g., 1 minute)
 * 3. Wait for the session to complete
 * 4. EXPECTED: You should see a notification with:
 *    - Title: "Soul Shepherd"
 *    - Message: "Your ritual is complete. Souls await you."
 *    - Icon: Soul Shepherd icon
 *
 * TEST 2: Break Complete Notification
 * ------------------------------------
 * 1. After completing a session (from TEST 1)
 * 2. Wait for the break timer to complete (default 5 minutes, or set shorter in options)
 * 3. EXPECTED: You should see a notification with:
 *    - Title: "Soul Shepherd"
 *    - Message: "Break complete. Ready for another session?"
 *    - Icon: Soul Shepherd icon
 *
 * TEST 3: Notification Settings Toggle
 * -------------------------------------
 * 1. Open the options page
 * 2. Go to the "Preferences" tab
 * 3. Uncheck "Enable notifications"
 * 4. Start and complete a focus session
 * 5. EXPECTED: No notification should appear
 * 6. Re-enable notifications in options
 * 7. Start and complete another session
 * 8. EXPECTED: Notification should appear again
 *
 * TEST 4: Emergency Session End Notification
 * -------------------------------------------
 * 1. Enable strict mode in options
 * 2. Add a site to the blocked list (e.g., "example.com")
 * 3. Start a focus session
 * 4. Try to visit the blocked site
 * 5. Click "End Session Early (Penalty Applied)" on the blocked page
 * 6. EXPECTED: You should see a notification with:
 *    - Title: "Soul Shepherd"
 *    - Message: "Session ended early. Reduced rewards applied."
 *
 * TEST 5: Notification Permission
 * --------------------------------
 * 1. Uninstall the extension
 * 2. Reinstall the extension
 * 3. Check the browser console for the background service worker
 * 4. EXPECTED: You should see logs indicating:
 *    - "First install - requesting notification permission"
 *    - "Notification permission granted: true"
 *
 * VERIFICATION CHECKLIST:
 * ----------------------
 * [ ] Session complete notification appears with correct message
 * [ ] Break complete notification appears with correct message
 * [ ] Notifications can be disabled in options
 * [ ] Notifications respect the user's preference setting
 * [ ] Emergency end notification appears with correct message
 * [ ] Notification permission is checked on install
 * [ ] All notifications show the Soul Shepherd icon
 * [ ] Notifications appear at the correct times
 *
 * NOTES:
 * ------
 * - Chrome extensions with "notifications" permission in manifest.json
 *   automatically have permission granted, no user prompt is needed
 * - Notifications will appear in the system notification area
 * - On Windows, notifications appear in the Action Center
 * - On macOS, notifications appear in Notification Center
 * - Make sure system notifications are not disabled for Chrome
 */

console.log(
  "Notification test instructions loaded. See comments for manual test steps."
);
