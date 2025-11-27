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
  soulEmbers: number;
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
  private static previouslyFocusedElement: HTMLElement | null = null;
  private static focusableElements: HTMLElement[] = [];
  private static firstFocusableElement: HTMLElement | null = null;
  private static lastFocusableElement: HTMLElement | null = null;

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
    const soulEmbers = typeof player.soulEmbers === "number" ? player.soulEmbers : 0;

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
      soulEmbers,
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
      soulEmbers: 0,
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

    // Store the element that had focus before opening modal
    this.previouslyFocusedElement = document.activeElement as HTMLElement;

    // Render card content
    this.renderCard(cardData);

    // Show modal
    this.modalElement.style.display = "flex";
    this.modalElement.setAttribute("aria-hidden", "false");

    // Set up event listeners
    this.setupEventListeners();

    // Set up focus trap
    this.setupFocusTrap();

    // Focus the first focusable element (close button in header)
    const closeButton = this.modalElement.querySelector("#player-card-close-btn") as HTMLElement;
    if (closeButton) {
      // Use setTimeout to ensure modal is fully rendered and animation started before focusing
      setTimeout(() => closeButton.focus(), 100);
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

    // Restore focus to the element that had focus before modal opened
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
      this.previouslyFocusedElement = null;
    }

    // Clear focus trap references
    this.focusableElements = [];
    this.firstFocusableElement = null;
    this.lastFocusableElement = null;
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

    // Calculate XP percentage for progress bar (handle edge case of 0 total XP)
    const totalXP = data.currentXP + data.xpToNextLevel;
    const xpPercentage = totalXP > 0 ? (data.currentXP / totalXP) * 100 : 0;

    // Format focus time
    const hours = Math.floor(data.achievements.totalFocusTime / 60);
    const minutes = data.achievements.totalFocusTime % 60;
    const focusTimeFormatted = `${hours}h ${minutes}m`;

    // Format harmony as percentage
    const harmonyPercent = (data.stats.harmony * 100).toFixed(1);

    // Get theme colors
    const theme = COSMETIC_THEMES.find((t) => t.id === data.cosmetics.themeId);
    const themeColors = theme?.colors || COSMETIC_THEMES[0].colors;

    // Generate card HTML with proper ARIA labels
    const cardHTML = `
      <div class="player-card-header">
        <h3 class="player-card-title" role="heading" aria-level="2">${data.characterName}</h3>
        <div class="player-card-level" aria-label="Player level ${data.level}">Level ${data.level}</div>
      </div>

      <div class="player-card-sprite-container" role="img" aria-label="Character sprite for ${data.characterName}">
        <img 
          src="${data.cosmetics.spritePath}" 
          alt="${data.characterName} character sprite"
          class="player-card-sprite"
          onerror="this.src='${COSMETIC_SPRITES[0].imagePath}'; this.onerror=null;"
        />
      </div>

      <div class="player-card-xp" role="region" aria-label="Experience progress">
        <div class="xp-label" id="xp-label">Soul Insight</div>
        <div class="xp-bar" role="progressbar" aria-labelledby="xp-label" aria-valuenow="${xpPercentage}" aria-valuemin="0" aria-valuemax="100" aria-valuetext="${data.currentXP} out of ${data.currentXP + data.xpToNextLevel} experience points, ${xpPercentage.toFixed(0)}% complete">
          <div class="xp-bar-fill" style="width: ${xpPercentage}%"></div>
        </div>
        <div class="xp-text" aria-hidden="true">${data.currentXP} / ${data.currentXP + data.xpToNextLevel}</div>
      </div>

      <div class="player-card-stats" role="region" aria-label="Character statistics">
        <div class="stat-item" role="group" aria-label="Spirit stat: ${data.stats.spirit.toFixed(1)}">
          <img src="assets/icons/soul_resolve.png" alt="" class="stat-icon" aria-hidden="true" />
          <div class="stat-info">
            <div class="stat-label">Spirit</div>
            <div class="stat-value" aria-label="${data.stats.spirit.toFixed(1)} spirit">${data.stats.spirit.toFixed(1)}</div>
          </div>
        </div>
        <div class="stat-item" role="group" aria-label="Harmony stat: ${harmonyPercent} percent">
          <img src="assets/icons/soul_resolve.png" alt="" class="stat-icon" aria-hidden="true" />
          <div class="stat-info">
            <div class="stat-label">Harmony</div>
            <div class="stat-value" aria-label="${harmonyPercent} percent harmony">${harmonyPercent}%</div>
          </div>
        </div>
        <div class="stat-item" role="group" aria-label="Soulflow stat: ${data.stats.soulflow.toFixed(1)}">
          <img src="assets/icons/soul_resolve.png" alt="" class="stat-icon" aria-hidden="true" />
          <div class="stat-info">
            <div class="stat-label">Soulflow</div>
            <div class="stat-value" aria-label="${data.stats.soulflow.toFixed(1)} soulflow">${data.stats.soulflow.toFixed(1)}</div>
          </div>
        </div>
      </div>

      <div class="player-card-resources" role="region" aria-label="Resources">
        <div class="resource-item" role="group" aria-label="Soul Insight: ${data.currentXP}">
          <img src="assets/icons/soul_insight.png" alt="" class="resource-icon" aria-hidden="true" />
          <div class="resource-info">
            <div class="resource-label">Soul Insight</div>
            <div class="resource-value" aria-label="${data.currentXP} soul insight">${data.currentXP}</div>
          </div>
        </div>
        <div class="resource-item" role="group" aria-label="Soul Embers: ${data.soulEmbers}">
          <img src="assets/icons/soul_ember.png" alt="" class="resource-icon" aria-hidden="true" />
          <div class="resource-info">
            <div class="resource-label">Soul Embers</div>
            <div class="resource-value" aria-label="${data.soulEmbers} soul embers">${data.soulEmbers}</div>
          </div>
        </div>
      </div>

      <div class="player-card-achievements" role="region" aria-label="Achievements">
        <h4 role="heading" aria-level="3">Achievements</h4>
        <div class="achievement-grid">
          <div class="achievement-item" role="group" aria-label="Total sessions: ${data.achievements.totalSessions}">
            <div class="achievement-value" aria-label="${data.achievements.totalSessions} sessions">${data.achievements.totalSessions}</div>
            <div class="achievement-label">Sessions</div>
          </div>
          <div class="achievement-item" role="group" aria-label="Focus time: ${focusTimeFormatted}">
            <div class="achievement-value" aria-label="${focusTimeFormatted} focus time">${focusTimeFormatted}</div>
            <div class="achievement-label">Focus Time</div>
          </div>
          <div class="achievement-item" role="group" aria-label="Bosses defeated: ${data.achievements.bossesDefeated}">
            <div class="achievement-value" aria-label="${data.achievements.bossesDefeated} bosses defeated">${data.achievements.bossesDefeated}</div>
            <div class="achievement-label">Bosses</div>
          </div>
          <div class="achievement-item" role="group" aria-label="Current streak: ${data.achievements.currentStreak}">
            <div class="achievement-value" aria-label="${data.achievements.currentStreak} day streak">${data.achievements.currentStreak}</div>
            <div class="achievement-label">Streak</div>
          </div>
        </div>
      </div>

      <div class="player-card-footer" role="contentinfo">
        <div class="theme-indicator" aria-label="Active theme: ${data.cosmetics.themeName}">${data.cosmetics.themeName}</div>
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
   * Note: This method is not used as the modal is already in options.html
   * Keeping for backwards compatibility
   */
  private static createModalElement(): void {
    console.warn("[PlayerCardManager] Modal element should already exist in options.html");
  }

  /**
   * Set up event listeners for modal interactions
   */
  private static setupEventListeners(): void {
    if (!this.modalElement) return;

    // Close button in header
    const closeButtonHeader = this.modalElement.querySelector("#player-card-close-btn") as HTMLElement;
    if (closeButtonHeader) {
      const closeHandler = () => this.hideCardModal();
      closeButtonHeader.addEventListener("click", closeHandler);
      this.eventListeners.push({ element: closeButtonHeader, event: "click", handler: closeHandler });
    }

    // Close button in footer
    const closeButtonFooter = this.modalElement.querySelector("#player-card-close-btn-bottom") as HTMLElement;
    if (closeButtonFooter) {
      const closeHandler = () => this.hideCardModal();
      closeButtonFooter.addEventListener("click", closeHandler);
      this.eventListeners.push({ element: closeButtonFooter, event: "click", handler: closeHandler });
    }

    // Backdrop click
    const backdrop = this.modalElement.querySelector(".modal-backdrop") as HTMLElement;
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
    const copyButton = this.modalElement.querySelector("#copy-card-btn") as HTMLElement;
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
   * Set up focus trap to keep focus within modal
   * Implements keyboard navigation and prevents focus from leaving the modal
   */
  private static setupFocusTrap(): void {
    if (!this.modalElement) return;

    // Get all focusable elements within the modal
    const focusableSelectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    this.focusableElements = Array.from(
      this.modalElement.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];

    if (this.focusableElements.length === 0) {
      console.warn("[PlayerCardManager] No focusable elements found in modal");
      return;
    }

    this.firstFocusableElement = this.focusableElements[0];
    this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];

    // Handle Tab key to trap focus
    const trapFocusHandler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      // If Shift + Tab on first element, go to last
      if (e.shiftKey && document.activeElement === this.firstFocusableElement) {
        e.preventDefault();
        this.lastFocusableElement?.focus();
      }
      // If Tab on last element, go to first
      else if (!e.shiftKey && document.activeElement === this.lastFocusableElement) {
        e.preventDefault();
        this.firstFocusableElement?.focus();
      }
    };

    this.modalElement.addEventListener('keydown', trapFocusHandler as EventListener);
    this.eventListeners.push({ 
      element: this.modalElement, 
      event: 'keydown', 
      handler: trapFocusHandler as EventListener 
    });
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
      const copyButton = document.querySelector("#copy-card-btn") as HTMLElement;
      const originalText = copyButton?.textContent || "Copy Card";
      if (copyButton) {
        copyButton.textContent = "Copying...";
        copyButton.setAttribute("disabled", "true");
        copyButton.setAttribute("aria-busy", "true");
        copyButton.setAttribute("aria-label", "Copying player card to clipboard, please wait");
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
        copyButton.removeAttribute("aria-busy");
        copyButton.setAttribute("aria-label", "Copy player card to clipboard");
      }
    } catch (error) {
      console.error("[PlayerCardManager] Failed to copy card:", error);
      
      // Show error notification with helpful message
      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Provide more helpful messages for common errors
        if (errorMessage.includes("permission")) {
          errorMessage = "Clipboard permission denied. Please allow clipboard access and try again.";
        } else if (errorMessage.includes("not loaded")) {
          errorMessage = "Image library failed to load. Please check your connection and try again.";
        } else if (errorMessage.includes("not found")) {
          errorMessage = "Card content not found. Please close and reopen the card.";
        }
      }
      
      this.showNotification(`Failed to copy card: ${errorMessage}`, "error");

      // Restore button state
      const copyButton = document.querySelector("#copy-card-btn") as HTMLElement;
      if (copyButton) {
        copyButton.textContent = "Copy Card";
        copyButton.removeAttribute("disabled");
        copyButton.removeAttribute("aria-busy");
        copyButton.setAttribute("aria-label", "Copy player card to clipboard");
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
   * Show notification toast with proper ARIA live region support
   */
  static showNotification(message: string, type: "success" | "error"): void {
    // Get or create notification container
    let notificationContainer = document.getElementById("notification-container");
    
    if (!notificationContainer) {
      notificationContainer = document.createElement("div");
      notificationContainer.id = "notification-container";
      notificationContainer.className = "notification-container";
      // Use assertive for errors, polite for success
      notificationContainer.setAttribute("aria-live", type === "error" ? "assertive" : "polite");
      notificationContainer.setAttribute("aria-atomic", "true");
      notificationContainer.setAttribute("role", type === "error" ? "alert" : "status");
      document.body.appendChild(notificationContainer);
    } else {
      // Update aria-live based on notification type
      notificationContainer.setAttribute("aria-live", type === "error" ? "assertive" : "polite");
      notificationContainer.setAttribute("role", type === "error" ? "alert" : "status");
    }

    // Create notification element
    const notification = document.createElement("div");
    notification.className = `player-card-notification player-card-notification-${type}`;
    notification.textContent = message;
    // Add descriptive label for screen readers
    notification.setAttribute("aria-label", `${type === "error" ? "Error" : "Success"}: ${message}`);

    // Add to container
    notificationContainer.appendChild(notification);

    // Trigger animation
    setTimeout(() => {
      notification.classList.add("show");
    }, 10);

    // Auto-dismiss after appropriate time (longer for errors to allow reading)
    const dismissTime = type === "error" ? 5000 : 3000;
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        notification.remove();
      }, 300); // Wait for fade out animation
    }, dismissTime);
  }
}
