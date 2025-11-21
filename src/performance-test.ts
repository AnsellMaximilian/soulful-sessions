// ============================================================================
// Performance Testing Script for Soul Shepherd
// ============================================================================

import { PerformanceMonitor } from "./PerformanceMonitor";
import { StateManager } from "./StateManager";

/**
 * Run performance tests
 */
export async function runPerformanceTests(): Promise<void> {
  console.group("[Performance Tests] Starting...");

  const monitor = PerformanceMonitor.getInstance();
  monitor.setEnabled(true);

  // Test 1: State Manager Load Time
  await testStateManagerLoad();

  // Test 2: State Manager Save Time
  await testStateManagerSave();

  // Test 3: Memory Usage
  testMemoryUsage();

  // Test 4: Animation Frame Rate
  await testAnimationFrameRate();

  // Log all statistics
  monitor.logStats();
  monitor.logMemory();

  console.groupEnd();
}

/**
 * Test StateManager load performance
 */
async function testStateManagerLoad(): Promise<void> {
  console.log("[Test] StateManager Load Time");
  const monitor = PerformanceMonitor.getInstance();

  const stateManager = new StateManager();

  // Run multiple iterations
  const iterations = 10;
  for (let i = 0; i < iterations; i++) {
    const endTimer = monitor.startTimer("StateManager.loadState");
    await stateManager.loadState();
    endTimer();
  }

  const stats = monitor.getStats("StateManager.loadState");
  if (stats) {
    console.log(`  Average: ${stats.avg.toFixed(2)}ms (target: <50ms)`);
    console.log(
      `  Min: ${stats.min.toFixed(2)}ms, Max: ${stats.max.toFixed(2)}ms`
    );

    if (stats.avg > 50) {
      console.warn("  ⚠️ FAILED: Average load time exceeds 50ms target");
    } else {
      console.log("  ✓ PASSED: Load time within target");
    }
  }
}

/**
 * Test StateManager save performance
 */
async function testStateManagerSave(): Promise<void> {
  console.log("[Test] StateManager Save Time");
  const monitor = PerformanceMonitor.getInstance();

  const stateManager = new StateManager();
  await stateManager.loadState();
  const state = stateManager.getState();

  // Run multiple iterations
  const iterations = 10;
  for (let i = 0; i < iterations; i++) {
    const endTimer = monitor.startTimer("StateManager.saveState");
    await stateManager.saveState(state);
    endTimer();
  }

  const stats = monitor.getStats("StateManager.saveState");
  if (stats) {
    console.log(`  Average: ${stats.avg.toFixed(2)}ms (target: <50ms)`);
    console.log(
      `  Min: ${stats.min.toFixed(2)}ms, Max: ${stats.max.toFixed(2)}ms`
    );

    if (stats.avg > 50) {
      console.warn("  ⚠️ FAILED: Average save time exceeds 50ms target");
    } else {
      console.log("  ✓ PASSED: Save time within target");
    }
  }
}

/**
 * Test memory usage
 */
function testMemoryUsage(): void {
  console.log("[Test] Memory Usage");
  const monitor = PerformanceMonitor.getInstance();

  const memory = monitor.measureMemory();
  if (memory) {
    const usedMB = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
    console.log(`  Used: ${usedMB}MB (target: <50MB)`);

    if (memory.usedJSHeapSize > 50 * 1024 * 1024) {
      console.warn("  ⚠️ FAILED: Memory usage exceeds 50MB target");
    } else {
      console.log("  ✓ PASSED: Memory usage within target");
    }
  } else {
    console.log("  ⚠️ Memory API not available");
  }
}

/**
 * Test animation frame rate
 */
async function testAnimationFrameRate(): Promise<void> {
  console.log("[Test] Animation Frame Rate");
  const monitor = PerformanceMonitor.getInstance();

  return new Promise((resolve) => {
    let frameCount = 0;
    let lastTime = performance.now();
    const frameTimes: number[] = [];

    const measureFrame = () => {
      const currentTime = performance.now();
      const frameTime = currentTime - lastTime;
      frameTimes.push(frameTime);
      lastTime = currentTime;
      frameCount++;

      if (frameCount < 60) {
        requestAnimationFrame(measureFrame);
      } else {
        // Calculate average frame time
        const avgFrameTime =
          frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
        const fps = 1000 / avgFrameTime;

        console.log(`  Average FPS: ${fps.toFixed(2)} (target: >30fps)`);
        console.log(`  Average frame time: ${avgFrameTime.toFixed(2)}ms`);

        if (fps < 30) {
          console.warn("  ⚠️ FAILED: Frame rate below 30fps target");
        } else {
          console.log("  ✓ PASSED: Frame rate within target");
        }

        resolve();
      }
    };

    requestAnimationFrame(measureFrame);
  });
}

/**
 * Profile popup load time
 */
export async function profilePopupLoad(): Promise<number> {
  const startTime = performance.now();

  // Simulate popup initialization
  await new Promise((resolve) => setTimeout(resolve, 10));

  const loadTime = performance.now() - startTime;
  console.log(
    `[Profile] Popup load time: ${loadTime.toFixed(2)}ms (target: <100ms)`
  );

  if (loadTime > 100) {
    console.warn("⚠️ Popup load time exceeds 100ms target");
  }

  return loadTime;
}

/**
 * Profile storage operations
 */
export async function profileStorageOperations(): Promise<void> {
  console.group("[Profile] Storage Operations");

  const monitor = PerformanceMonitor.getInstance();

  // Test chrome.storage.local.get
  const getTimer = monitor.startTimer("storage.local.get");
  await chrome.storage.local.get("soulShepherdGameState");
  getTimer();

  // Test chrome.storage.local.set
  const setTimer = monitor.startTimer("storage.local.set");
  await chrome.storage.local.set({ testKey: "testValue" });
  setTimer();

  // Clean up
  await chrome.storage.local.remove("testKey");

  monitor.logStats();
  console.groupEnd();
}

/**
 * Benchmark DOM operations
 */
export function benchmarkDOMOperations(): void {
  console.group("[Benchmark] DOM Operations");

  const monitor = PerformanceMonitor.getInstance();

  // Test 1: Element creation
  const createTimer = monitor.startTimer("DOM.createElement");
  for (let i = 0; i < 1000; i++) {
    const div = document.createElement("div");
    div.textContent = `Item ${i}`;
  }
  createTimer();

  // Test 2: Class manipulation
  const div = document.createElement("div");
  document.body.appendChild(div);

  const classTimer = monitor.startTimer("DOM.classList");
  for (let i = 0; i < 1000; i++) {
    div.classList.add("test-class");
    div.classList.remove("test-class");
  }
  classTimer();

  // Test 3: Style updates
  const styleTimer = monitor.startTimer("DOM.style");
  for (let i = 0; i < 1000; i++) {
    div.style.width = `${i}px`;
  }
  styleTimer();

  document.body.removeChild(div);

  monitor.logStats();
  console.groupEnd();
}

// Export for console access
if (typeof window !== "undefined") {
  (window as any).performanceTests = {
    runAll: runPerformanceTests,
    profilePopup: profilePopupLoad,
    profileStorage: profileStorageOperations,
    benchmarkDOM: benchmarkDOMOperations,
  };
}
