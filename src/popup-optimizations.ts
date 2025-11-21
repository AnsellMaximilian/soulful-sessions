// ============================================================================
// Popup Performance Optimizations
// ============================================================================

import { PerformanceMonitor } from "./PerformanceMonitor";
import { AssetLoader } from "./AssetLoader";
import { DOMBatcher, ElementPool, StyleOptimizer } from "./DOMOptimizer";
import { throttle, debounce } from "./PerformanceMonitor";

/**
 * Initialize performance monitoring for popup
 */
export function initializePerformanceMonitoring(): void {
  const monitor = PerformanceMonitor.getInstance();
  monitor.setEnabled(true);

  // Log performance stats every 30 seconds in development
  if (process.env.NODE_ENV === "development") {
    setInterval(() => {
      monitor.logStats();
      monitor.logMemory();
    }, 30000);
  }
}

/**
 * Optimize shop rendering with lazy loading
 */
export async function renderShopOptimized(
  state: any,
  themesListElement: HTMLElement,
  spritesListElement: HTMLElement
): Promise<void> {
  const monitor = PerformanceMonitor.getInstance();
  const endTimer = monitor.startTimer("Shop.render");
  const assetLoader = AssetLoader.getInstance();

  try {
    // Lazy load cosmetic data only when needed
    const [themes, sprites] = await Promise.all([
      assetLoader.loadThemes(),
      assetLoader.loadSprites(),
    ]);

    // Batch DOM updates
    const batcher = DOMBatcher.getInstance();

    // Render themes
    batcher.schedule(() => {
      renderThemesListOptimized(state, themes, themesListElement);
    });

    // Render sprites
    batcher.schedule(() => {
      renderSpritesListOptimized(state, sprites, spritesListElement);
    });
  } finally {
    endTimer();
  }
}

/**
 * Optimized theme list rendering
 */
function renderThemesListOptimized(
  state: any,
  themes: any[],
  container: HTMLElement
): void {
  // Use document fragment for batch insertion
  const fragment = document.createDocumentFragment();

  themes.forEach((theme) => {
    const isOwned = state.player.cosmetics.ownedThemes.includes(theme.id);
    const isActive = state.player.cosmetics.activeTheme === theme.id;
    const canAfford = state.player.soulEmbers >= theme.cost;

    const itemDiv = createThemeItemElement(theme, isOwned, isActive, canAfford);
    fragment.appendChild(itemDiv);
  });

  // Single DOM update
  container.innerHTML = "";
  container.appendChild(fragment);
}

/**
 * Optimized sprite list rendering
 */
function renderSpritesListOptimized(
  state: any,
  sprites: any[],
  container: HTMLElement
): void {
  // Use document fragment for batch insertion
  const fragment = document.createDocumentFragment();

  sprites.forEach((sprite) => {
    const isOwned = state.player.cosmetics.ownedSprites.includes(sprite.id);
    const isActive = state.player.cosmetics.activeSprite === sprite.id;
    const canAfford = state.player.soulEmbers >= sprite.cost;

    const itemDiv = createSpriteItemElement(
      sprite,
      isOwned,
      isActive,
      canAfford
    );
    fragment.appendChild(itemDiv);
  });

  // Single DOM update
  container.innerHTML = "";
  container.appendChild(fragment);
}

/**
 * Create theme item element (helper)
 */
function createThemeItemElement(
  theme: any,
  isOwned: boolean,
  isActive: boolean,
  canAfford: boolean
): HTMLElement {
  const itemDiv = document.createElement("div");
  itemDiv.className = `cosmetic-item ${isOwned ? "owned" : ""} ${
    isActive ? "active" : ""
  }`;

  // Build HTML string for better performance
  itemDiv.innerHTML = `
    <div class="cosmetic-item-with-preview">
      <div class="theme-preview" style="background: ${
        theme.colors.backgroundGradient
      }"></div>
      <div class="cosmetic-info">
        <div class="cosmetic-name">${theme.name}</div>
        <div class="cosmetic-description">${theme.description}</div>
        ${
          isActive
            ? '<div class="cosmetic-status">Active</div>'
            : isOwned
            ? '<div class="cosmetic-status">Owned</div>'
            : ""
        }
      </div>
    </div>
    <div class="cosmetic-actions">
      ${
        !isOwned && theme.cost > 0
          ? `
        <div class="cosmetic-cost">${theme.cost} Embers</div>
        <button class="cosmetic-button purchase" ${
          !canAfford ? "disabled" : ""
        } data-type="theme" data-id="${theme.id}">Purchase</button>
      `
          : isOwned && !isActive
          ? `
        <button class="cosmetic-button apply" data-type="theme" data-id="${theme.id}">Apply</button>
      `
          : ""
      }
    </div>
  `;

  return itemDiv;
}

/**
 * Create sprite item element (helper)
 */
function createSpriteItemElement(
  sprite: any,
  isOwned: boolean,
  isActive: boolean,
  canAfford: boolean
): HTMLElement {
  const itemDiv = document.createElement("div");
  itemDiv.className = `cosmetic-item ${isOwned ? "owned" : ""} ${
    isActive ? "active" : ""
  }`;

  itemDiv.innerHTML = `
    <div class="cosmetic-info">
      <div class="cosmetic-name">${sprite.name}</div>
      <div class="cosmetic-description">${sprite.description}</div>
      ${
        isActive
          ? '<div class="cosmetic-status">Active</div>'
          : isOwned
          ? '<div class="cosmetic-status">Owned</div>'
          : ""
      }
    </div>
    <div class="cosmetic-actions">
      ${
        !isOwned && sprite.cost > 0
          ? `
        <div class="cosmetic-cost">${sprite.cost} Embers</div>
        <button class="cosmetic-button purchase" ${
          !canAfford ? "disabled" : ""
        } data-type="sprite" data-id="${sprite.id}">Purchase</button>
      `
          : isOwned && !isActive
          ? `
        <button class="cosmetic-button apply" data-type="sprite" data-id="${sprite.id}">Apply</button>
      `
          : ""
      }
    </div>
  `;

  return itemDiv;
}

/**
 * Optimized theme application using CSS variables
 */
export function applyThemeOptimized(themeId: string): void {
  const assetLoader = AssetLoader.getInstance();

  assetLoader.loadThemes().then((themes) => {
    const theme = themes.find((t: any) => t.id === themeId);
    if (!theme) return;

    // Use StyleOptimizer for batched updates
    StyleOptimizer.setThemeVariables({
      "--theme-primary": theme.colors.primary,
      "--theme-secondary": theme.colors.secondary,
      "--theme-accent": theme.colors.accent,
      "--theme-background": theme.colors.background,
    });

    // Update background gradient separately
    const batcher = DOMBatcher.getInstance();
    batcher.schedule(() => {
      document.body.style.background = theme.colors.backgroundGradient;
    });
  });
}

/**
 * Optimized sprite application with preloading
 */
export async function applySpriteOptimized(spriteId: string): Promise<void> {
  const assetLoader = AssetLoader.getInstance();

  const sprites = await assetLoader.loadSprites();
  const sprite = sprites.find((s: any) => s.id === spriteId);
  if (!sprite) return;

  // Preload image before applying
  try {
    await assetLoader.preloadImage(sprite.imagePath);

    // Apply to both character sprites
    const batcher = DOMBatcher.getInstance();
    batcher.schedule(() => {
      const idleSprite = document.getElementById(
        "character-sprite"
      ) as HTMLImageElement;
      const breakSprite = document.getElementById(
        "break-character-sprite"
      ) as HTMLImageElement;

      if (idleSprite) {
        idleSprite.src = sprite.imagePath;
      }
      if (breakSprite) {
        breakSprite.src = sprite.imagePath;
      }
    });
  } catch (error) {
    console.error("Failed to preload sprite:", error);
  }
}

/**
 * Create element pool for Content Souls
 */
export function createContentSoulPool(): ElementPool<HTMLDivElement> {
  return new ElementPool<HTMLDivElement>(
    () => {
      const soul = document.createElement("div");
      soul.className = "content-soul";
      soul.textContent = "👻";
      return soul;
    },
    10, // Initial size
    30 // Max size
  );
}

/**
 * Optimized Content Soul spawning with object pooling
 */
export function spawnContentSoulOptimized(
  pool: ElementPool<HTMLDivElement>,
  container: HTMLElement
): void {
  const soul = pool.acquire();

  // Random horizontal position
  const randomX = Math.random() * (400 - 32);
  soul.style.left = `${randomX}px`;
  soul.style.bottom = "0px";

  // Random horizontal drift
  const drift = (Math.random() - 0.5) * 100;
  soul.style.setProperty("--drift", `${drift}px`);

  container.appendChild(soul);

  // Start floating animation
  requestAnimationFrame(() => {
    soul.classList.add("floating");
  });

  // When animation completes, return to pool
  setTimeout(() => {
    soul.classList.remove("floating");
    container.removeChild(soul);
    pool.release(soul);
  }, 8000);
}

/**
 * Throttled timer update for better performance
 */
export const updateTimerThrottled = throttle(
  (elementId: string, text: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = text;
    }
  },
  1000
); // Update at most once per second

/**
 * Debounced state save for options page
 */
export const saveSettingsDebounced = debounce(async (settings: any) => {
  try {
    await chrome.runtime.sendMessage({
      type: "UPDATE_SETTINGS",
      payload: settings,
    });
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
}, 500); // Wait 500ms after last change

/**
 * Batch multiple stat updates
 */
export function batchStatUpdates(
  updates: Array<{ id: string; value: string }>
): void {
  const batcher = DOMBatcher.getInstance();

  batcher.schedule(() => {
    updates.forEach(({ id, value }) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    });
  });
}

/**
 * Optimize animation frame rate monitoring
 */
export function monitorFrameRate(duration: number = 5000): Promise<number> {
  return new Promise((resolve) => {
    let frameCount = 0;
    const startTime = performance.now();

    const countFrame = () => {
      frameCount++;
      const elapsed = performance.now() - startTime;

      if (elapsed < duration) {
        requestAnimationFrame(countFrame);
      } else {
        const fps = (frameCount / elapsed) * 1000;
        resolve(fps);
      }
    };

    requestAnimationFrame(countFrame);
  });
}
