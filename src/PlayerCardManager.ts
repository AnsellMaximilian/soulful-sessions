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

    // Focus the modal container itself for screen reader announcement
    setTimeout(() => {
      if (this.modalElement) {
        this.modalElement.focus();
      }
    }, 100);
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
   * Convert hex color to rgba string
   */
  private static hexToRgba(hex: string, alpha: number): string {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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

    // Calculate XP percentage for progress bar (same as popup)
    const xpPercentage = data.xpToNextLevel > 0 ? (data.currentXP / data.xpToNextLevel) * 100 : 0;

    // Format focus time
    const hours = Math.floor(data.achievements.totalFocusTime / 60);
    const minutes = data.achievements.totalFocusTime % 60;
    const focusTimeFormatted = `${hours}h ${minutes}m`;

    // Format harmony as percentage
    const harmonyPercent = (data.stats.harmony * 100).toFixed(1);

    // Get theme colors
    const theme = COSMETIC_THEMES.find((t) => t.id === data.cosmetics.themeId);
    const themeColors = theme?.colors || COSMETIC_THEMES[0].colors;
    
    // Generate rgba colors for theme-aware transparency
    const primaryRgba = (alpha: number) => this.hexToRgba(themeColors.primary, alpha);
    const secondaryRgba = (alpha: number) => this.hexToRgba(themeColors.secondary, alpha);
    const accentRgba = (alpha: number) => this.hexToRgba(themeColors.accent, alpha);

    // Generate card HTML with new Pokemon card layout
    const cardHTML = `
      <!-- Card Header with Level, Name, and XP Bar -->
      <div class="card-header-section">
        <!-- Level badge -->
        <div class="card-level-circle" aria-label="Level ${data.level}">
          <div class="card-level-label">Level</div>
          <div class="card-level-number">${data.level}</div>
        </div>
        
        <!-- Character name -->
        <div class="card-character-title">${data.characterName}</div>
        
        <!-- XP bar with overlap -->
        <div class="card-xp-bar-wrapper" role="region" aria-label="Experience progress">
          <div class="card-xp-bar-container">
            <div class="card-xp-bar" role="progressbar" aria-valuenow="${xpPercentage}" aria-valuemin="0" aria-valuemax="100" style="width: ${xpPercentage}%"></div>
            <div class="card-xp-text">${data.currentXP} / ${data.xpToNextLevel} XP</div>
          </div>
        </div>
      </div>
      
      <!-- Row 1: Sprite and Achievements -->
      <div class="card-row-1">
        <!-- Sprite container (square) -->
        <div class="card-sprite-box" role="region" aria-label="Character sprite">
          <img 
            src="${data.cosmetics.spritePath}" 
            alt="${data.characterName} character sprite"
            class="card-sprite"
            onerror="this.src='${COSMETIC_SPRITES[0].imagePath}'; this.onerror=null;"
          />
        </div>
        
        <!-- Achievements section -->
        <div class="card-achievements-box" role="region" aria-label="Achievements">
          <div class="card-achievement-item" role="group" aria-label="Total sessions: ${data.achievements.totalSessions}">
            <div class="card-achievement-value">${data.achievements.totalSessions}</div>
            <div class="card-achievement-label">Sessions</div>
          </div>
          <div class="card-achievement-item" role="group" aria-label="Focus time: ${focusTimeFormatted}">
            <div class="card-achievement-value">${focusTimeFormatted}</div>
            <div class="card-achievement-label">Focus Time</div>
          </div>
          <div class="card-achievement-item" role="group" aria-label="Bosses defeated: ${data.achievements.bossesDefeated}">
            <div class="card-achievement-value">${data.achievements.bossesDefeated}</div>
            <div class="card-achievement-label">Bosses</div>
          </div>
          <div class="card-achievement-item" role="group" aria-label="Current streak: ${data.achievements.currentStreak}">
            <div class="card-achievement-value">${data.achievements.currentStreak}</div>
            <div class="card-achievement-label">Streak</div>
          </div>
        </div>
      </div>
      
      <!-- Row 2: Stats and Currencies -->
      <div class="card-row-2">
        <!-- Stats row -->
        <div class="card-stats-row" role="region" aria-label="Character statistics">
          <div class="card-stat-box" role="group" aria-label="Spirit stat: ${data.stats.spirit.toFixed(1)}">
            <div class="card-stat-value">${data.stats.spirit.toFixed(1)}</div>
            <div class="card-stat-label">Spirit</div>
          </div>
          <div class="card-stat-box" role="group" aria-label="Harmony stat: ${harmonyPercent} percent">
            <div class="card-stat-value">${harmonyPercent}%</div>
            <div class="card-stat-label">Harmony</div>
          </div>
          <div class="card-stat-box" role="group" aria-label="Soulflow stat: ${data.stats.soulflow.toFixed(1)}">
            <div class="card-stat-value">${data.stats.soulflow.toFixed(1)}</div>
            <div class="card-stat-label">Soulflow</div>
          </div>
        </div>
        
        <!-- Currencies section -->
        <div class="card-currencies-box" role="region" aria-label="Currencies">
          <div class="card-currency-item" role="group" aria-label="Soul Insight: ${data.currentXP}">
            <img src="assets/icons/soul_insight.png" alt="" class="card-currency-icon" aria-hidden="true" />
            <div class="card-currency-info">
              <div class="card-currency-label">Insight</div>
              <div class="card-currency-value">${data.currentXP}</div>
            </div>
          </div>
          <div class="card-currency-item" role="group" aria-label="Soul Embers: ${data.soulEmbers}">
            <img src="assets/icons/soul_ember.png" alt="" class="card-currency-icon" aria-hidden="true" />
            <div class="card-currency-info">
              <div class="card-currency-label">Embers</div>
              <div class="card-currency-value">${data.soulEmbers}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card-footer" role="contentinfo">
        <div class="card-theme-name" aria-label="Active theme: ${data.cosmetics.themeName}">${data.cosmetics.themeName}</div>
      </div>
    `;

    this.cardContentElement.innerHTML = cardHTML;

    // Apply theme background color (solid, not gradient)
    // Using the darkest color from the theme makes each theme more distinct
    this.cardContentElement.style.background = themeColors.background;
    
    // Also apply to the card container for consistency
    if (this.modalElement) {
      const cardContainer = this.modalElement.querySelector(".player-card-container") as HTMLElement;
      if (cardContainer) {
        cardContainer.style.background = themeColors.background;
      }
    }
    
    // Apply theme background to XP bar solid layer via CSS variable
    document.documentElement.style.setProperty("--xp-bar-solid-bg", themeColors.background);
  }

  /**
   * Apply theme colors as inline styles for html2canvas compatibility
   * html2canvas doesn't support color-mix() or CSS custom properties in some contexts,
   * so we inject rgba colors directly as inline styles
   */
  private static applyThemeInlineStyles(container: HTMLElement, colors: any): void {
    const primaryRgba = (alpha: number) => this.hexToRgba(colors.primary, alpha);
    
    // Apply to header
    const header = container.querySelector(".player-card-header") as HTMLElement;
    if (header) {
      header.style.background = `linear-gradient(135deg, ${primaryRgba(0.15)} 0%, ${primaryRgba(0.05)} 100%)`;
      header.style.borderBottom = `2px solid ${primaryRgba(0.4)}`;
      
      const title = header.querySelector("h3") as HTMLElement;
      if (title) {
        title.style.textShadow = `0 2px 8px ${primaryRgba(0.5)}`;
      }
    }
    
    // Apply to character section
    const charSection = container.querySelector(".card-character-section") as HTMLElement;
    if (charSection) {
      charSection.style.border = `2px solid ${primaryRgba(0.3)}`;
      
      const sprite = charSection.querySelector(".card-sprite") as HTMLElement;
      if (sprite) {
        sprite.style.filter = `drop-shadow(0 4px 12px ${primaryRgba(0.6)})`;
      }
    }
    
    // Apply to sections with borders
    const sections = container.querySelectorAll(".card-level-section, .card-stats-section, .card-resources-section, .card-achievements-section");
    sections.forEach((section) => {
      (section as HTMLElement).style.border = `1px solid ${primaryRgba(0.3)}`;
    });
    
    // Apply to stat/resource/achievement items
    const items = container.querySelectorAll(".card-stat-item, .card-resource-item, .card-achievement-item");
    items.forEach((item) => {
      (item as HTMLElement).style.background = primaryRgba(0.05);
      (item as HTMLElement).style.border = `1px solid ${primaryRgba(0.15)}`;
    });
    
    // Apply to icons
    const icons = container.querySelectorAll(".card-stat-icon, .card-resource-icon");
    icons.forEach((icon) => {
      (icon as HTMLElement).style.filter = `drop-shadow(0 2px 6px ${primaryRgba(0.5)})`;
    });
    
    // Apply to XP bar
    const xpBar = container.querySelector(".card-xp-bar") as HTMLElement;
    if (xpBar) {
      xpBar.style.boxShadow = `0 0 12px ${primaryRgba(0.8)}`;
    }
    
    const xpBarContainer = container.querySelector(".card-xp-bar-container") as HTMLElement;
    if (xpBarContainer) {
      xpBarContainer.style.background = primaryRgba(0.15);
      xpBarContainer.style.border = `1px solid ${primaryRgba(0.3)}`;
    }
    
    // Apply to footer
    const footer = container.querySelector(".card-footer") as HTMLElement;
    if (footer) {
      footer.style.background = primaryRgba(0.05);
      footer.style.borderTop = `1px solid ${primaryRgba(0.3)}`;
    }
    
    // Apply to value text colors
    const values = container.querySelectorAll(".card-level-value, .card-stat-value, .card-achievement-value");
    values.forEach((value) => {
      (value as HTMLElement).style.textShadow = `0 2px 8px ${primaryRgba(0.5)}`;
    });
    
    // Apply to section title
    const sectionTitle = container.querySelector(".card-section-title") as HTMLElement;
    if (sectionTitle) {
      sectionTitle.style.color = colors.primary;
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

    // Backdrop click to close
    const backdrop = this.modalElement.querySelector(".modal-backdrop") as HTMLElement;
    if (backdrop) {
      const backdropHandler = () => this.hideCardModal();
      backdrop.addEventListener("click", backdropHandler);
      this.eventListeners.push({ element: backdrop, event: "click", handler: backdropHandler });
    }

    // ESC key to close
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        this.hideCardModal();
      }
    };
    document.addEventListener("keydown", escHandler as EventListener);
    this.eventListeners.push({ element: document as any, event: "keydown", handler: escHandler as EventListener });
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
   * Note: Since we removed close buttons, the modal itself is focusable for screen readers
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

    // If no focusable elements (no close buttons), modal itself is focusable
    // This is fine - user can close with ESC or clicking backdrop
    if (this.focusableElements.length === 0) {
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
