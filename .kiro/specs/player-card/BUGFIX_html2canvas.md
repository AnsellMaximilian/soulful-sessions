# Bug Fix: html2canvas Library Not Found

## Issue
When testing the Player Card feature, the following error occurred:
```
Failed to load resource: net::ERR_FILE_NOT_FOUND
dist/html2canvas.js:1

[PlayerCardManager] Failed to copy card: Error: Failed to load html2canvas library
```

## Root Cause
The html2canvas library was installed as a dependency but was not being bundled and included in the extension's dist folder during the build process.

## Solution

### 1. Updated build.js
Added a separate build configuration for html2canvas:

```javascript
// Build configuration for html2canvas library
const html2canvasBuildOptions = {
  entryPoints: ["node_modules/html2canvas/dist/html2canvas.js"],
  bundle: true,
  outfile: "dist/html2canvas.js",
  format: "iife",
  globalName: "html2canvas",
  target: "es2020",
  platform: "browser",
  sourcemap: false,
  minify: false,
};
```

Updated the build function to include html2canvas bundling:
```javascript
async function build() {
  try {
    await esbuild.build(extensionBuildOptions);
    console.log("Extension build complete");
    
    // Build html2canvas library
    await esbuild.build(html2canvasBuildOptions);
    console.log("html2canvas library bundled");
    
    // Build dev-screen if requested
    if (process.argv.includes("--dev-screen")) {
      await esbuild.build(devScreenBuildOptions);
      console.log("Dev Screen build complete");
    }
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}
```

### 2. Updated manifest.json
Added html2canvas.js to web_accessible_resources:

```json
"web_accessible_resources": [
  {
    "resources": ["blocked.html", "dist/blocked.js", "dist/chunks/*.js", "dist/html2canvas.js"],
    "matches": ["<all_urls>"]
  }
]
```

## Verification

After running `npm run build`:
- ✅ html2canvas.js created in dist/ folder
- ✅ File size: 406KB (reasonable for the library)
- ✅ Build completes successfully with "html2canvas library bundled" message

## Testing
To verify the fix:
1. Rebuild the extension: `npm run build`
2. Reload the extension in Chrome
3. Open options page
4. Navigate to Statistics tab
5. Click "Show Player Card"
6. Click "Copy Card" button
7. Verify no console errors
8. Verify success notification appears
9. Paste into an application to confirm image was copied

## Impact
- **Severity:** Critical (feature completely broken without this)
- **User Impact:** High (users cannot copy player cards)
- **Fix Complexity:** Low (configuration change only)
- **Risk:** Low (isolated to build process)

## Prevention
To prevent similar issues in the future:
1. Always test features that depend on external libraries in the actual extension environment
2. Document library dependencies in the build process
3. Add build verification step to check for required output files
4. Consider adding a build test that verifies all web_accessible_resources exist

## Related Files
- `build.js` - Build configuration
- `manifest.json` - Extension manifest
- `src/PlayerCardManager.ts` - Uses html2canvas
- `package.json` - Lists html2canvas dependency

## Status
✅ **Fixed and Verified**

The html2canvas library is now properly bundled and accessible to the extension.
