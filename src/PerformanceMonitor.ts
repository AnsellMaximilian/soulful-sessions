// ============================================================================
// Performance Monitoring Utility for Soul Shepherd
// ============================================================================

/**
 * Performance monitoring utility to track and log performance metrics
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private enabled: boolean = true;

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Enable or disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Start timing an operation
   */
  startTimer(label: string): () => void {
    if (!this.enabled) return () => {};

    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(label, duration);
    };
  }

  /**
   * Record a metric value
   */
  private recordMetric(label: string, value: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    this.metrics.get(label)!.push(value);

    // Log if exceeds threshold
    if (label.includes("load") && value > 100) {
      console.warn(
        `[Performance] ${label} took ${value.toFixed(2)}ms (target: <100ms)`
      );
    } else if (label.includes("storage") && value > 50) {
      console.warn(
        `[Performance] ${label} took ${value.toFixed(2)}ms (target: <50ms)`
      );
    } else if (label.includes("animation") && value > 33) {
      console.warn(
        `[Performance] ${label} took ${value.toFixed(
          2
        )}ms (target: <33ms for 30fps)`
      );
    }
  }

  /**
   * Get statistics for a metric
   */
  getStats(
    label: string
  ): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(label);
    if (!values || values.length === 0) return null;

    const sum = values.reduce((a, b) => a + b, 0);
    return {
      avg: sum / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    };
  }

  /**
   * Get all metrics
   */
  getAllStats(): Record<
    string,
    { avg: number; min: number; max: number; count: number }
  > {
    const stats: Record<string, any> = {};
    for (const [label, _] of this.metrics) {
      stats[label] = this.getStats(label);
    }
    return stats;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Log all statistics to console
   */
  logStats(): void {
    console.group("[Performance Monitor] Statistics");
    const stats = this.getAllStats();
    for (const [label, stat] of Object.entries(stats)) {
      if (stat) {
        console.log(
          `${label}: avg=${stat.avg.toFixed(2)}ms, min=${stat.min.toFixed(
            2
          )}ms, max=${stat.max.toFixed(2)}ms, count=${stat.count}`
        );
      }
    }
    console.groupEnd();
  }

  /**
   * Measure memory usage (Chrome only)
   */
  measureMemory(): {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    limit: number;
  } | null {
    if ("memory" in performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  }

  /**
   * Log memory usage
   */
  logMemory(): void {
    const memory = this.measureMemory();
    if (memory) {
      const usedMB = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
      const totalMB = (memory.totalJSHeapSize / 1024 / 1024).toFixed(2);
      const limitMB = (memory.limit / 1024 / 1024).toFixed(2);
      console.log(
        `[Performance] Memory: ${usedMB}MB / ${totalMB}MB (limit: ${limitMB}MB)`
      );

      if (memory.usedJSHeapSize > 50 * 1024 * 1024) {
        console.warn(`[Performance] Memory usage exceeds 50MB target`);
      }
    }
  }
}

/**
 * Decorator for measuring function execution time
 */
export function measurePerformance(label?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const metricLabel = label || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      const monitor = PerformanceMonitor.getInstance();
      const endTimer = monitor.startTimer(metricLabel);

      try {
        const result = await originalMethod.apply(this, args);
        endTimer();
        return result;
      } catch (error) {
        endTimer();
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Throttle function execution
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: number | null = null;

  return function (...args: Parameters<T>) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall >= delay) {
      lastCall = now;
      func(...args);
    } else {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(() => {
        lastCall = Date.now();
        func(...args);
      }, delay - timeSinceLastCall);
    }
  };
}

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | null = null;

  return function (...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(() => {
      func(...args);
    }, delay);
  };
}

/**
 * Request animation frame with fallback
 */
export function requestAnimFrame(callback: FrameRequestCallback): number {
  return window.requestAnimationFrame(callback);
}

/**
 * Cancel animation frame
 */
export function cancelAnimFrame(id: number): void {
  window.cancelAnimationFrame(id);
}
