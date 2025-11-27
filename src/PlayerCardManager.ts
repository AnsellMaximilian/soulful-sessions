import { GameState } from "./types";
import { STUBBORN_SOULS, COSMETIC_SPRITES, COSMETIC_THEMES } from "./constants";

// ============================================================================
// Player Card Data Types
// ============================================================================

export interface PlayerCardData {
  characterName: string;
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  stats: {
    spirit: number;
    harmony: number;
    soulflow: number;
  };
  achievements: {
    totalSessions: number;
    totalFocusTime: number;
    bossesDefeated: number;
    currentStreak: number;
  };
  cosmetics: {
    spriteId: string;
    spritePath: string;
    themeId: string;
    themeName: string;
  };
}

// ============================================================================
// PlayerCardManager Class
// ============================================================================

/**
 * PlayerCardManager handles player card generation, display, and sharing.
 * Manages modal overlay, image generation, and clipboard operations.
 */
export class PlayerCardManager {
  private static modalElement: HTMLElement | null = null;
  private static cardContentElement: HTMLElement | null = null;
  private static isHtml2CanvasLoaded = false;
  private static eventListeners: Array<{ element: HTMLElement; event: string; handler: EventListener }> = [];

  /**
   * Generate card data from game state
   * Handles missing or invalid data with sensible defaults
   */
  static generateCardData(state: GameState): PlayerCardData {
    // Validate state exists
    if (!state || !state.player) {
      console.warn("[PlayerCardManager] Invalid game state, using defaults");
      return this.getDefaultCardData();
    }

    const { player, statistics, progression } = state;

    // Extract player data with defaults
    const level = typeof player.level === "number" ? player.level : 1;
    const currentXP = typeof player.soulInsight === "number" ? player.soulInsight : 0;
    const xpToNextLevel = typeof player.soulInsightToNextLevel === "number" 
      ? player.soulInsightToNextLevel 
      : 100;

    // Extract stats with defaults
    const stats = {
      spirit: player.stats?.spirit ?? 1,
      harmony: player.stats?.harmony ?? 0.05,
      soulflow: player.stats?.soulflow ?? 1,
    };

    // Extract achievements with defaults
    const achievements = {
      totalSessions: statistics?.totalSessions ?? 0,
      totalFocusTime: statistics?.totalFocusTime ?? 0,
      bossesDefeated: statistics?.bossesDefeated ?? 0,
      currentStreak: statistics?.currentStreak ?? 0,
    };

    // Extract cosmetics with defaults
    const spriteId = player.cosmetics?.activeSprite ?? "default";
    const themeId = player.cosmetics?.activeTheme ?? "default";

    // Find sprite path
    const sprite = COSMETIC_SPRITES.find((s) => s.id === spriteId);
    const spritePath = sprite?.imagePath ?? COSMETIC_SPRITES[0].imagePath;

    // Find theme name
    const theme = COSMETIC_THEMES.find((t) => t.id === themeId);
    const themeName = theme?.name ?? COSMETIC_THEMES[0].name;

    // Generate character name (use level-based title)
    const characterName = this.generateCharacterName(level);

    return {
      characterName,
      level,
      currentXP,
      xpToNextLevel,
      stats,
      achievements,
      cosmetics: {
        spriteId,
        spritePath,
        themeId,
        themeName,
      },
    };
  }

  /**
   * Get default card data for error cases
   */
  private static getDefaultCardData(): PlayerCardData {
    return {
      characterName: "Novice Shepherd",
      level: 1,
      currentXP: 0,
      xpToNextLevel: 100,
      stats: {
        spirit: 1,
        harmony: 0.05,
        soulflow: 1,
      },
      achievements: {
        totalSessions: 0,
        totalFocusTime: 0,
        bossesDefeated: 0,
        currentStreak: 0,
      },
      cosmetics: {
        spriteId: "default",
        spritePath: COSMETIC_SPRITES[0].imagePath,
        themeId: "default",
        themeName: COSMETIC_THEMES[0].name,
      },
    };
  }

  /**
   * Generate character name based on level
   */
  private static generateCharacterName(level: number): string {
    if (level >= 28) return "Eternal Shepherd";
    if (level >= 24) return "Master Shepherd";
    if (level >= 20) return "Sage Shepherd";
    if (level >= 16) return "Veteran Shepherd";
    if (level >= 13) return "Adept Shepherd";
    if (level >= 10) return "Skilled Shepherd";
    if (level >= 7) return "Journeyman Shepherd";
    if (level >= 5) return "Apprentice Shepherd";
    if (level >= 3) return "Initiate Shepherd";
    return "Novice Shepherd";
  }

  /**
   * Show the player card modal
   * Creates modal if it doesn't exist, renders card, and sets up event listeners
   */
  static showCardModal(cardData: PlayerCardData): void {
    // Get or create modal element
    this.modalElement = document.getElementById("player-card-modal");
    
    if (!this.modalElement) {
      this.createModalElement();
      this.modalElement = document.getElementById("player-card-modal");
    }

    if (!this.modalElement) {
      console.error("[PlayerCardManager] Failed to create modal element");
      return;
    }

    // Render card content
    this.renderCard(cardData);

    // Show modal
    this.modalElement.style.display = "flex";
    this.modalElement.setAttribute("aria-hidden", "false");

    // Set up event listeners
    this.setupEventListeners();

    // Focus trap - focus the modal
    const closeButton = this.modalElement.querySelector(".player-card-close") as HTMLElement;
    if (closeButton) {
      closeButton.focus();
    }
  }

  /**
   * Hide the player card modal
   * Removes event listeners and hides the modal
   */
  static hideCardModal(): void {
    if (!this.modalElement) {
      return;
    }

    // Hide modal
    this.modalElement.style.display = "none";
    this.modalElement.setAttribute("aria-hidden", "true");

    // Clean up event listeners
    this.cleanupEventListeners();
  }

  /**
   * Render card HTML into modal
   */
  static renderCard(data: PlayerCardData): void {
    this.cardContentElement = document.getElementById("player-card-content");

    if (!this.cardContentElement) {
      console.error("[PlayerCardManager] Card content element not found");
      return;
    }

    // Calculate XP percentage for progress bar
    const xpPercentage = (data.currentXP / (data.currentXP + data.xpToNextLevel)) * 100;

    // Format focus time
    const hours = Math.floor(data.achievements.totalFocusTime / 60);
    const minutes = data.achievements.totalFocusTime % 60;
    const focusTimeFormatted = `${hours}h ${minutes}m`;

    // Format harmony as percentage
    const harmonyPercent = (data.stats.harmony * 100).toFixed(1);

    // Get theme colors
    const theme = COSMETIC_THEMES.find((t) => t.id === data.cosmetics.themeId);
    const themeColors = theme?.colors || COSMETIC_THEMES[0].colors;

    // Generate card HTML
    const cardHTML = `
      <div class="player-card-header">
        <h3 class="player-card-title">${data.characterName}</h3>
        <div class="player-card-level">Level ${data.level}</div>
      </div>

      <div class="player-card-sprite-container">
        <img 
          src="${data.cosmetics.spritePath}" 
          alt="${data.characterName} sprite"
          class="player-card-sprite"
        />
      </div>

      <div class="player-card-xp">
        <div class="xp-label">Soul Insight</div>
        <div class="xp-bar">
          <div class="xp-bar-fill" style="width: ${xpPercentage}%"></div>
        </div>
        <div class="xp-text">${data.currentXP} / ${data.currentXP + data.xpToNextLevel}</div>
      </div>

      <div class="player-card-stats">
        <div class="stat-item">
          <img src="assets/icons/soul_resolve.png" alt="" class="stat-icon" aria-hidden="true" />
          <div class="stat-info">
            <div class="stat-label">Spirit</div>
            <div class="stat-value">${data.stats.spirit.toFixed(1)}</div>
          </div>
        </div>
        <div class="stat-item">
          <img src="assets/icons/soul_insight.png" alt="" class="stat-icon" aria-hidden="true" />
          <div class="stat-info">
            <div class="stat-label">Harmony</div>
            <div class="stat-value">${harmonyPercent}%</div>
          </div>
        </div>
        <div class="stat-item">
          <img src="assets/icons/soul_ember.png" alt="" class="stat-icon" aria-hidden="true" />
          <div class="stat-info">
            <div class="stat-label">Soulflow</div>
            <div class="stat-value">${data.stats.soulflow.toFixed(1)}</div>
          </div>
        </div>
      </div>

      <div class="player-card-achievements">
        <h4>Achievements</h4>
        <div class="achievement-grid">
          <div class="achievement-item">
            <div class="achievement-value">${data.achievements.totalSessions}</div>
            <div class="achievement-label">Sessions</div>
          </div>
          <div class="achievement-item">
            <div class="achievement-value">${focusTimeFormatted}</div>
            <div class="achievement-label">Focus Time</div>
          </div>
          <div class="achievement-item">
            <div class="achievement-value">${data.achievements.bossesDefeated}</div>
            <div class="achievement-label">Bosses</div>
          </div>
          <div class="achievement-item">
            <div class="achievement-value">${data.achievements.currentStreak}</div>
            <div class="achievement-label">Streak</div>
          </div>
        </div>
      </div>

      <div class="player-card-footer">
        <div class="theme-indicator">${data.cosmetics.themeName}</div>
      </div>
    `;

    this.cardContentElement.innerHTML = cardHTML;

    // Apply theme colors to card
    if (this.modalElement) {
      const cardContainer = this.modalElement.querySelector(".player-card-container") as HTMLElement;
      if (cardContainer) {
        cardContainer.style.setProperty("--theme-primary", themeColors.primary);
        cardContainer.style.setProperty("--theme-secondary", themeColors.secondary);
        cardContainer.style.setProperty("--theme-accent", themeColors.accent);
      }
    }
  }

  /**
   * Create modal element and append to body
   */
  private static createModalElement(): void {
    const modalHTML = `
      <div id="player-card-modal" class="player-card-modal" role="dialog" aria-modal="true" aria-labelledby="player-card-title" aria-hidden="true">
        <div class="player-card-backdrop"></div>
        <div class="player-card-container">
          <div id="player-card-content" class="player-card-content">
            <!-- Card content will be rendered here -->
          </div>
          <div class="player-card-actions">
            <button class="btn btn-primary player-card-copy" aria-label="Copy card to clipboard">
              Copy Card
            </button>
            <button class="btn btn-secondary player-card-close" aria-label="Close player card">
              Close
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
  }

  /**
   * Set up event listeners for modal interactions
   */
  private static setupEventListeners(): void {
    if (!this.modalElement) return;

    // Close button
    const closeButton = this.modalElement.querySelector(".player-card-close") as HTMLElement;
    if (closeButton) {
      const closeHandler = () => this.hideCardModal();
      closeButton.addEventListener("click", closeHandler);
      this.eventListeners.push({ element: closeButton, event: "click", handler: closeHandler });
    }

    // Backdrop click
    const backdrop = this.modalElement.querySelector(".player-card-backdrop") as HTMLElement;
    if (backdrop) {
      const backdropHandler = () => this.hideCardModal();
      backdrop.addEventListener("click", backdropHandler);
      this.eventListeners.push({ element: backdrop, event: "click", handler: backdropHandler });
    }

    // ESC key
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        this.hideCardModal();
      }
    };
    document.addEventListener("keydown", escHandler as EventListener);
    this.eventListeners.push({ element: document as any, event: "keydown", handler: escHandler as EventListener });

    // Copy button
    const copyButton = this.modalElement.querySelector(".player-card-copy") as HTMLElement;
    if (copyButton) {
      const copyHandler = () => this.copyCardToClipboard();
      copyButton.addEventListener("click", copyHandler);
      this.eventListeners.push({ element: copyButton, event: "click", handler: copyHandler });
    }
  }

  /**
   * Clean up event listeners
   */
  private static cleanupEventListeners(): void {
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  }

  /**
   * Copy card to clipboard as image
   * Uses html2canvas to render the card and Clipboard API to write the image
   */
  static async copyCardToClipboard(): Promise<void> {
    try {
      // Lazy load html2canvas if not already loaded
      if (!this.isHtml2CanvasLoaded) {
        await this.loadHtml2Canvas();
      }

      // Get the card container element
      const cardContainer = document.querySelector(".player-card-container") as HTMLElement;
      if (!cardContainer) {
        throw new Error("Card container not found");
      }

      // Show loading state on copy button
      const copyButton = document.querySelector(".player-card-copy") as HTMLElement;
      const originalText = copyButton?.textContent || "Copy Card";
      if (copyButton) {
        copyButton.textContent = "Copying...";
        copyButton.setAttribute("disabled", "true");
      }

      // Import html2canvas dynamically
      const html2canvas = (window as any).html2canvas;
      if (!html2canvas) {
        throw new Error("html2canvas not loaded");
      }

      // Render card to canvas with options for external assets
      const canvas = await html2canvas(cardContainer, {
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        scale: 2, // Higher quality
        logging: false,
      });

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob: Blob | null) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to convert canvas to blob"));
          }
        }, "image/png");
      });

      // Write to clipboard using Clipboard API
      const clipboardItem = new ClipboardItem({ "image/png": blob });
      await navigator.clipboard.write([clipboardItem]);

      // Show success notification
      this.showNotification("Player card copied to clipboard!", "success");

      // Restore button state
      if (copyButton) {
        copyButton.textContent = originalText;
        copyButton.removeAttribute("disabled");
      }
    } catch (error) {
      console.error("[PlayerCardManager] Failed to copy card:", error);
      
      // Show error notification
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.showNotification(`Failed to copy card: ${errorMessage}`, "error");

      // Restore button state
      const copyButton = document.querySelector(".player-card-copy") as HTMLElement;
      if (copyButton) {
        copyButton.textContent = "Copy Card";
        copyButton.removeAttribute("disabled");
      }
    }
  }

  /**
   * Lazy load html2canvas library
   */
  private static async loadHtml2Canvas(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if ((window as any).html2canvas) {
        this.isHtml2CanvasLoaded = true;
        resolve();
        return;
      }

      // Create script element
      const script = document.createElement("script");
      script.src = chrome.runtime.getURL("dist/html2canvas.js");
      script.onload = () => {
        this.isHtml2CanvasLoaded = true;
        console.log("[PlayerCardManager] html2canvas loaded successfully");
        resolve();
      };
      script.onerror = () => {
        reject(new Error("Failed to load html2canvas library"));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Apply theme colors to the player card container
   * Sets the data-theme attribute which triggers CSS custom properties
   */
  static applyTheme(themeId: string): void {
    const cardContainer = document.querySelector(".player-card-container") as HTMLElement;
    
    if (!cardContainer) {
      console.warn("[PlayerCardManager] Card container not found, cannot apply theme");
      return;
    }

    // Verify theme exists
    const theme = COSMETIC_THEMES.find((t) => t.id === themeId);
    
    if (!theme) {
      console.warn(`[PlayerCardManager] Theme '${themeId}' not found, using default`);
      cardContainer.setAttribute("data-theme", "default");
      return;
    }

    // Set theme data attribute
    cardContainer.setAttribute("data-theme", themeId);
  }

  /**
   * Show notification toast
   */
  static showNotification(message: string, type: "success" | "error"): void {
    // Get or create notification container
    let notificationContainer = document.getElementById("player-card-notifications");
    
    if (!notificationContainer) {
      notificationContainer = document.createElement("div");
      notificationContainer.id = "player-card-notifications";
      notificationContainer.className = "player-card-notifications";
      notificationContainer.setAttribute("aria-live", "polite");
      notificationContainer.setAttribute("aria-atomic", "true");
      document.body.appendChild(notificationContainer);
    }

    // Create notification element
    const notification = document.createElement("div");
    notification.className = `player-card-notification player-card-notification-${type}`;
    notification.textContent = message;
    notification.setAttribute("role", "status");

    // Add to container
    notificationContainer.appendChild(notification);

    // Trigger animation
    setTimeout(() => {
      notification.classList.add("show");
    }, 10);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        notification.remove();
      }, 300); // Wait for fade out animation
    }, 3000);
  }
}
