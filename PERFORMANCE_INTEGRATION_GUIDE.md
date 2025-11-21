# Performance Optimization Integration Guide

## Quick Start

This guide shows how to integrate the performance optimizations into the existing Soul Shepherd codebase.

## Step 1: Update popup.ts

### Add imports at the top:

```typescript
import { PerformanceMonitor } from "./PerformanceMonitor";
import { AssetLoader } from "./AssetLoader";
import { DOMBatcher, ElementPool } from "./DOMOptimizer";
import {
  initializePerformanceMonitoring,
  renderShopOptimized,
  applyThemeOptimized,
  applySpriteOptimized,
  createContentSoulPool,
  spawnContentSoulOptimized,
  batchStatUpdates,
} from "./popup-optimizations";
```

### Update initialize function:

```typescript
async function initialize(): Promise<void> {
  // Add performance monitoring
  initializePerformanceMonitoring();

  const monitor = PerformanceMonitor.getInstance();
  const endTimer = monitor.startTimer("Popup.initialize");

  try {
    // Request initial state from background
    currentState = await requestState();

    // Check for missed or late timers
    await checkForMissedTimers(currentState);

    // Set up event handlers
    setupEventHandlers();

    // Set up message listeners
    setupMessageListeners();

    // Update UI based on initial state
    handleStateUpdate(currentState);

    endTimer();

    // Log initial load time
    const stats = monitor.getStats("Popup.initialize");
    if (stats) {
      console.log(`[Performance] Popup loaded in ${stats.avg.toFixed(2)}ms`);
    }
  } catch (error) {
    endTimer();
    console.error("Failed to initialize popup:", error);
    setText("idle-view", "Failed to load. Please try reopening the popup.");
  }
}
```

### Replace updateShop function:

```typescript
function updateShop(state: GameState): void {
  const themesList = getElement("themes-list");
  const spritesList = getElement("sprites-list");

  // Use optimized rendering
  renderShopOptimized(state, themesList, spritesList);
}
```

### Replace applyTheme function:

```typescript
function applyTheme(themeId: string): void {
  applyThemeOptimized(themeId);
}
```

### Replace applySprite function:

```typescript
function applySprite(spriteId: string): void {
  applySpriteOptimized(spriteId);
}
```

### Update Content Soul animations:

```typescript
let soulPool: ElementPool<HTMLDivElement> | null = null;

function startContentSoulAnimations(soulflow: number): void {
  // Stop any existing animations
  stopContentSoulAnimations();

  if (!currentState || !currentState.settings.animationsEnabled) {
    showIdleCollectionCounter();
    return;
  }

  hideIdleCollectionCounter();

  // Create pool if needed
  if (!soulPool) {
    soulPool = createContentSoulPool();
  }

  const container = document.getElementById("content-souls-container");
  if (!container) return;

  // Calculate spawn rate based on Soulflow stat
  const baseInterval = 3000;
  const spawnInterval = Math.max(1000, baseInterval / (1 + soulflow * 0.5));

  // Start spawning souls at intervals
  soulAnimationInterval = window.setInterval(() => {
    spawnContentSoulOptimized(soulPool!, container);
  }, spawnInterval);

  startIdleCollectionCheck();
}

function stopContentSoulAnimations(): void {
  if (soulAnimationInterval !== null) {
    clearInterval(soulAnimationInterval);
    soulAnimationInterval = null;
  }

  if (idleCollectionInterval !== null) {
    clearInterval(idleCollectionInterval);
    idleCollectionInterval = null;
  }

  // Release all souls back to pool
  if (soulPool) {
    soulPool.releaseAll();
  }

  const container = document.getElementById("content-souls-container");
  if (container) {
    container.innerHTML = "";
  }

  hideIdleCollectionCounter();
}
```

### Optimize stat updates:

```typescript
function updateIdleView(state: GameState): void {
  // Batch stat updates
  batchStatUpdates([
    { id: "stat-spirit", value: state.player.stats.spirit.toString() },
    {
      id: "stat-harmony",
      value: `${(state.player.stats.harmony * 100).toFixed(0)}%`,
    },
    { id: "stat-soulflow", value: state.player.stats.soulflow.toString() },
    { id: "stat-level", value: state.player.level.toString() },
    { id: "soul-embers", value: state.player.soulEmbers.toString() },
  ]);

  // ... rest of function
}
```

## Step 2: Update background.ts

### Add performance monitoring:

```typescript
import { PerformanceMonitor } from "./PerformanceMonitor";

// At the top of the file
const perfMonitor = PerformanceMonitor.getInstance();
perfMonitor.setEnabled(true);

// Log stats periodically (optional, for debugging)
setInterval(() => {
  perfMonitor.logStats();
  perfMonitor.logMemory();
}, 300000); // Every 5 minutes
```

### Add timing to critical operations:

```typescript
async function handleStartSession(payload: {
  duration: number;
  taskId: string;
}): Promise<SessionState> {
  const endTimer = perfMonitor.startTimer("Background.startSession");

  try {
    // ... existing code
    return newSession;
  } finally {
    endTimer();
  }
}

async function handleEndSession(): Promise<void> {
  const endTimer = perfMonitor.startTimer("Background.endSession");

  try {
    // ... existing code
  } finally {
    endTimer();
  }
}
```

## Step 3: Update options.ts

### Add debounced saves:

```typescript
import { saveSettingsDebounced } from "./popup-optimizations";

// Replace immediate saves with debounced saves
function onSettingChange(setting: string, value: any) {
  const updatedSettings = {
    ...currentSettings,
    [setting]: value,
  };

  // Debounced save (waits 500ms after last change)
  saveSettingsDebounced(updatedSettings);
}
```

## Step 4: Testing

### Run performance tests:

1. Build the extension:

```bash
npm run build
```

2. Load the extension in Chrome

3. Open the popup

4. Open DevTools console

5. Run tests:

```javascript
// Run all performance tests
await performanceTests.runAll();

// Profile specific operations
await performanceTests.profilePopup();
await performanceTests.profileStorage();
performanceTests.benchmarkDOM();
```

### Check results:

All tests should show:

- ✓ PASSED for targets met
- ⚠️ FAILED for targets not met (with specific metrics)

### Manual verification:

1. **Popup Load Time:**

   - Open DevTools Performance tab
   - Start recording
   - Open popup
   - Stop recording
   - Check "Summary" - should be < 100ms

2. **Memory Usage:**

   - Open DevTools Memory tab
   - Take heap snapshot
   - Use extension for 5 minutes
   - Take another snapshot
   - Compare - should be < 50MB

3. **Storage Operations:**

   - Check console logs for "[StateManager]" messages
   - Should see "State unchanged, skipping save" frequently
   - Save operations should be < 50ms

4. **Animation Frame Rate:**
   - Open popup during break
   - Open DevTools Performance tab
   - Record for 5 seconds
   - Check FPS in timeline - should be > 30fps

## Step 5: Monitoring in Production

### Add error reporting:

```typescript
window.addEventListener("error", (event) => {
  const monitor = PerformanceMonitor.getInstance();
  const stats = monitor.getAllStats();
  const memory = monitor.measureMemory();

  console.error("[Error Report]", {
    error: event.error,
    performance: stats,
    memory,
  });
});
```

### Add performance logging:

```typescript
// Log performance stats on popup close
window.addEventListener("beforeunload", () => {
  const monitor = PerformanceMonitor.getInstance();
  monitor.logStats();
  monitor.logMemory();
});
```

## Step 6: Gradual Rollout

### Phase 1: Core Optimizations (Immediate)

- ✅ StateManager change detection
- ✅ Performance monitoring
- ✅ DOM batching utilities

### Phase 2: Popup Optimizations (Week 1)

- ✅ Lazy asset loading
- ✅ Optimized shop rendering
- ✅ Element pooling for Content Souls

### Phase 3: Advanced Optimizations (Week 2)

- ✅ Throttled/debounced updates
- ✅ Virtual scrolling (if needed)
- ✅ Advanced caching

## Troubleshooting

### "Module not found" errors

Make sure all new files are included in tsconfig.json:

```json
{
  "include": ["src/**/*"]
}
```

### Performance tests not available

Make sure performance-test.ts is loaded:

```typescript
// In popup.ts or background.ts
import "./performance-test";
```

### Optimizations not working

1. Check console for errors
2. Verify imports are correct
3. Check that functions are being called
4. Use PerformanceMonitor to verify timing

### Memory still high

1. Check for event listener leaks
2. Verify element pools are releasing
3. Check for circular references
4. Profile with Chrome DevTools Memory tab

## Best Practices

1. **Always measure before optimizing**

   - Use PerformanceMonitor to identify bottlenecks
   - Don't optimize prematurely

2. **Test on low-end devices**

   - Performance targets should work on older hardware
   - Test on devices with limited memory

3. **Monitor in production**

   - Keep performance logging enabled
   - Track metrics over time
   - Watch for regressions

4. **Document performance changes**
   - Note why optimizations were made
   - Track performance improvements
   - Share learnings with team

## Next Steps

1. ✅ Integrate core optimizations
2. ✅ Run performance tests
3. ✅ Verify all targets are met
4. ✅ Monitor in production
5. ✅ Iterate based on real-world data

## Support

For questions or issues:

1. Check PERFORMANCE_OPTIMIZATION.md for detailed documentation
2. Review performance test results
3. Check console logs for warnings
4. Profile with Chrome DevTools

## Conclusion

These optimizations will significantly improve Soul Shepherd's performance while maintaining code quality and maintainability. The modular approach allows for gradual integration and easy testing.
