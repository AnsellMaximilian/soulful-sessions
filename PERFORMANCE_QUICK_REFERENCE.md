# Performance Optimization Quick Reference

## 🎯 Performance Targets

| Metric               | Target  | Expected |
| -------------------- | ------- | -------- |
| Popup Load Time      | < 100ms | 60-80ms  |
| Memory Usage         | < 50MB  | 20-35MB  |
| Storage Operations   | < 50ms  | 15-30ms  |
| Animation Frame Rate | > 30fps | 55-60fps |

## 📦 New Files Created

```
src/
├── PerformanceMonitor.ts      # Timing & profiling utilities
├── AssetLoader.ts             # Lazy loading for assets
├── DOMOptimizer.ts            # DOM batching & pooling
├── popup-optimizations.ts     # Popup-specific optimizations
└── performance-test.ts        # Testing suite

docs/
├── PERFORMANCE_OPTIMIZATION.md        # Full documentation
├── PERFORMANCE_INTEGRATION_GUIDE.md   # Integration steps
├── PERFORMANCE_SUMMARY.md             # Task summary
└── PERFORMANCE_QUICK_REFERENCE.md     # This file
```

## 🚀 Quick Start

### 1. Add Performance Monitoring

```typescript
import { PerformanceMonitor } from "./PerformanceMonitor";

const monitor = PerformanceMonitor.getInstance();
const endTimer = monitor.startTimer("operation-name");
// ... do work
endTimer();
```

### 2. Batch DOM Updates

```typescript
import { DOMBatcher } from "./DOMOptimizer";

const batcher = DOMBatcher.getInstance();
batcher.schedule(() => {
  element1.textContent = "value1";
  element2.textContent = "value2";
});
```

### 3. Lazy Load Assets

```typescript
import { AssetLoader } from "./AssetLoader";

const loader = AssetLoader.getInstance();
const themes = await loader.loadThemes();
```

### 4. Use Element Pooling

```typescript
import { ElementPool } from "./DOMOptimizer";

const pool = new ElementPool(() => document.createElement("div"), 10, 50);
const element = pool.acquire();
// ... use element
pool.release(element);
```

### 5. Throttle/Debounce

```typescript
import { throttle, debounce } from "./PerformanceMonitor";

const throttledUpdate = throttle(updateFunction, 1000);
const debouncedSave = debounce(saveFunction, 500);
```

## 🧪 Testing

### Run All Tests

```javascript
// In browser console
await performanceTests.runAll();
```

### Individual Tests

```javascript
await performanceTests.profilePopup();
await performanceTests.profileStorage();
performanceTests.benchmarkDOM();
```

### Check Stats

```javascript
const monitor = PerformanceMonitor.getInstance();
monitor.logStats();
monitor.logMemory();
```

## 📊 Common Patterns

### ❌ Before (Slow)

```typescript
// Multiple DOM updates
element1.textContent = "value1";
element2.textContent = "value2";
element3.textContent = "value3";

// Creating new elements
function spawn() {
  const el = document.createElement("div");
  // ... use
  el.remove(); // Creates garbage
}

// Frequent saves
input.addEventListener("input", () => {
  saveSettings(); // Every keystroke
});

// Synchronous imports
import { THEMES } from "./constants"; // Loaded immediately
```

### ✅ After (Fast)

```typescript
// Batched DOM updates
const batcher = DOMBatcher.getInstance();
batcher.schedule(() => {
  element1.textContent = "value1";
  element2.textContent = "value2";
  element3.textContent = "value3";
});

// Element pooling
const pool = new ElementPool(() => document.createElement("div"));
function spawn() {
  const el = pool.acquire();
  // ... use
  pool.release(el); // Reused
}

// Debounced saves
const debouncedSave = debounce(saveSettings, 500);
input.addEventListener("input", debouncedSave);

// Lazy loading
const loader = AssetLoader.getInstance();
const themes = await loader.loadThemes(); // Loaded when needed
```

## 🔍 Debugging Performance Issues

### Slow Popup Load

1. Check DevTools Performance tab
2. Look for long tasks (> 50ms)
3. Profile with `performanceTests.profilePopup()`
4. Check for synchronous operations

### High Memory Usage

1. Take heap snapshots in DevTools
2. Look for detached DOM nodes
3. Check event listener leaks
4. Verify pools are releasing elements

### Low Frame Rate

1. Check for layout thrashing
2. Verify DOM batching is used
3. Profile with Performance tab
4. Reduce animation complexity

### Slow Storage

1. Check for large state objects
2. Verify change detection is working
3. Profile with `performanceTests.profileStorage()`
4. Check storage quota

## 📈 Monitoring in Production

### Log Performance Stats

```typescript
// Every 5 minutes
setInterval(() => {
  const monitor = PerformanceMonitor.getInstance();
  monitor.logStats();
  monitor.logMemory();
}, 300000);
```

### Track Errors with Performance Data

```typescript
window.addEventListener("error", (event) => {
  const monitor = PerformanceMonitor.getInstance();
  console.error({
    error: event.error,
    performance: monitor.getAllStats(),
    memory: monitor.measureMemory(),
  });
});
```

## 🎨 Optimization Checklist

### Popup (popup.ts)

- [ ] Add performance monitoring
- [ ] Use `renderShopOptimized()` for shop
- [ ] Use `applyThemeOptimized()` for themes
- [ ] Use `applySpriteOptimized()` for sprites
- [ ] Use element pooling for Content Souls
- [ ] Batch stat updates with `batchStatUpdates()`

### Background (background.ts)

- [ ] Add performance monitoring
- [ ] Add timing to critical operations
- [ ] Monitor memory usage

### Options (options.ts)

- [ ] Use `saveSettingsDebounced()` for saves
- [ ] Batch DOM updates
- [ ] Throttle frequent operations

### State Manager (StateManager.ts)

- [x] Change detection (already implemented)
- [x] Retry logic (already implemented)

## 💡 Pro Tips

1. **Measure First:** Always profile before optimizing
2. **Batch Updates:** Group DOM changes together
3. **Reuse Elements:** Use pools for repeated elements
4. **Lazy Load:** Defer non-critical assets
5. **Throttle/Debounce:** Limit expensive operations
6. **CSS Over JS:** Use CSS animations when possible
7. **Monitor Always:** Keep performance logging enabled

## 📚 Documentation

- **Full Guide:** `PERFORMANCE_OPTIMIZATION.md`
- **Integration:** `PERFORMANCE_INTEGRATION_GUIDE.md`
- **Summary:** `PERFORMANCE_SUMMARY.md`
- **This File:** `PERFORMANCE_QUICK_REFERENCE.md`

## 🆘 Need Help?

1. Check documentation files
2. Run performance tests
3. Check console for warnings
4. Profile with Chrome DevTools
5. Review code examples above

## ✅ Success Criteria

- [ ] All performance tests pass
- [ ] Popup loads in < 100ms
- [ ] Memory usage < 50MB
- [ ] Storage ops < 50ms
- [ ] Frame rate > 30fps
- [ ] No console warnings
- [ ] Smooth user experience

---

**Quick Links:**

- [Full Documentation](PERFORMANCE_OPTIMIZATION.md)
- [Integration Guide](PERFORMANCE_INTEGRATION_GUIDE.md)
- [Task Summary](PERFORMANCE_SUMMARY.md)
