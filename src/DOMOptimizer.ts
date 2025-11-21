// ============================================================================
// DOM Optimization Utilities for Soul Shepherd
// ============================================================================

/**
 * Batch DOM updates to minimize reflows and repaints
 */
export class DOMBatcher {
  private static instance: DOMBatcher;
  private pendingUpdates: Array<() => void> = [];
  private rafId: number | null = null;

  private constructor() {}

  static getInstance(): DOMBatcher {
    if (!DOMBatcher.instance) {
      DOMBatcher.instance = new DOMBatcher();
    }
    return DOMBatcher.instance;
  }

  /**
   * Schedule a DOM update to be batched
   */
  schedule(update: () => void): void {
    this.pendingUpdates.push(update);

    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(() => {
        this.flush();
      });
    }
  }

  /**
   * Execute all pending updates
   */
  private flush(): void {
    const updates = this.pendingUpdates.slice();
    this.pendingUpdates = [];
    this.rafId = null;

    // Execute all updates in a single batch
    updates.forEach((update) => {
      try {
        update();
      } catch (error) {
        console.error("[DOMBatcher] Error executing update:", error);
      }
    });
  }

  /**
   * Force immediate flush of pending updates
   */
  flushImmediate(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.flush();
  }
}

/**
 * Element pool for reusing DOM elements
 */
export class ElementPool<T extends HTMLElement> {
  private pool: T[] = [];
  private inUse: Set<T> = new Set();
  private factory: () => T;
  private maxSize: number;

  constructor(factory: () => T, initialSize: number = 0, maxSize: number = 50) {
    this.factory = factory;
    this.maxSize = maxSize;

    // Pre-create initial elements
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.factory());
    }
  }

  /**
   * Get an element from the pool
   */
  acquire(): T {
    let element: T;

    if (this.pool.length > 0) {
      element = this.pool.pop()!;
    } else {
      element = this.factory();
    }

    this.inUse.add(element);
    return element;
  }

  /**
   * Return an element to the pool
   */
  release(element: T): void {
    if (!this.inUse.has(element)) {
      return;
    }

    this.inUse.delete(element);

    // Clean up element
    element.className = "";
    element.textContent = "";
    element.removeAttribute("style");

    // Add back to pool if not at max size
    if (this.pool.length < this.maxSize) {
      this.pool.push(element);
    }
  }

  /**
   * Release all elements
   */
  releaseAll(): void {
    const elements = Array.from(this.inUse);
    elements.forEach((el) => this.release(el));
  }

  /**
   * Get pool statistics
   */
  getStats(): { available: number; inUse: number; total: number } {
    return {
      available: this.pool.length,
      inUse: this.inUse.size,
      total: this.pool.length + this.inUse.size,
    };
  }

  /**
   * Clear the pool
   */
  clear(): void {
    this.pool = [];
    this.inUse.clear();
  }
}

/**
 * Virtual scrolling helper for large lists
 */
export class VirtualScroller {
  private container: HTMLElement;
  private itemHeight: number;
  private items: any[];
  private renderItem: (item: any, index: number) => HTMLElement;
  private visibleRange: { start: number; end: number } = { start: 0, end: 0 };
  private scrollHandler: () => void;

  constructor(
    container: HTMLElement,
    itemHeight: number,
    items: any[],
    renderItem: (item: any, index: number) => HTMLElement
  ) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.items = items;
    this.renderItem = renderItem;

    this.scrollHandler = this.onScroll.bind(this);
    this.container.addEventListener("scroll", this.scrollHandler);

    this.render();
  }

  /**
   * Update items and re-render
   */
  updateItems(items: any[]): void {
    this.items = items;
    this.render();
  }

  /**
   * Handle scroll event
   */
  private onScroll(): void {
    this.render();
  }

  /**
   * Render visible items
   */
  private render(): void {
    const scrollTop = this.container.scrollTop;
    const containerHeight = this.container.clientHeight;

    const start = Math.floor(scrollTop / this.itemHeight);
    const end = Math.ceil((scrollTop + containerHeight) / this.itemHeight);

    // Add buffer for smooth scrolling
    const bufferedStart = Math.max(0, start - 5);
    const bufferedEnd = Math.min(this.items.length, end + 5);

    // Only re-render if range changed
    if (
      bufferedStart !== this.visibleRange.start ||
      bufferedEnd !== this.visibleRange.end
    ) {
      this.visibleRange = { start: bufferedStart, end: bufferedEnd };
      this.renderVisibleItems();
    }
  }

  /**
   * Render only visible items
   */
  private renderVisibleItems(): void {
    // Clear container
    this.container.innerHTML = "";

    // Create spacer for items before visible range
    const topSpacer = document.createElement("div");
    topSpacer.style.height = `${this.visibleRange.start * this.itemHeight}px`;
    this.container.appendChild(topSpacer);

    // Render visible items
    for (let i = this.visibleRange.start; i < this.visibleRange.end; i++) {
      if (i < this.items.length) {
        const element = this.renderItem(this.items[i], i);
        this.container.appendChild(element);
      }
    }

    // Create spacer for items after visible range
    const bottomSpacer = document.createElement("div");
    bottomSpacer.style.height = `${
      (this.items.length - this.visibleRange.end) * this.itemHeight
    }px`;
    this.container.appendChild(bottomSpacer);
  }

  /**
   * Destroy and clean up
   */
  destroy(): void {
    this.container.removeEventListener("scroll", this.scrollHandler);
  }
}

/**
 * Optimize CSS class operations
 */
export class ClassListOptimizer {
  /**
   * Batch add/remove classes
   */
  static batchUpdate(
    element: HTMLElement,
    add: string[] = [],
    remove: string[] = []
  ): void {
    const batcher = DOMBatcher.getInstance();
    batcher.schedule(() => {
      if (remove.length > 0) {
        element.classList.remove(...remove);
      }
      if (add.length > 0) {
        element.classList.add(...add);
      }
    });
  }

  /**
   * Toggle class with condition
   */
  static toggle(
    element: HTMLElement,
    className: string,
    force?: boolean
  ): void {
    const batcher = DOMBatcher.getInstance();
    batcher.schedule(() => {
      element.classList.toggle(className, force);
    });
  }
}

/**
 * Optimize style updates
 */
export class StyleOptimizer {
  /**
   * Batch style updates
   */
  static batchUpdate(
    element: HTMLElement,
    styles: Partial<CSSStyleDeclaration>
  ): void {
    const batcher = DOMBatcher.getInstance();
    batcher.schedule(() => {
      Object.assign(element.style, styles);
    });
  }

  /**
   * Use CSS variables for theme changes
   */
  static setThemeVariables(variables: Record<string, string>): void {
    const batcher = DOMBatcher.getInstance();
    batcher.schedule(() => {
      const root = document.documentElement;
      Object.entries(variables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    });
  }
}

/**
 * Intersection Observer helper for lazy rendering
 */
export class LazyRenderer {
  private observer: IntersectionObserver;
  private callbacks: Map<Element, () => void> = new Map();

  constructor(options?: IntersectionObserverInit) {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const callback = this.callbacks.get(entry.target);
          if (callback) {
            callback();
            this.unobserve(entry.target);
          }
        }
      });
    }, options);
  }

  /**
   * Observe an element and render when visible
   */
  observe(element: Element, renderCallback: () => void): void {
    this.callbacks.set(element, renderCallback);
    this.observer.observe(element);
  }

  /**
   * Stop observing an element
   */
  unobserve(element: Element): void {
    this.observer.unobserve(element);
    this.callbacks.delete(element);
  }

  /**
   * Disconnect observer
   */
  disconnect(): void {
    this.observer.disconnect();
    this.callbacks.clear();
  }
}
