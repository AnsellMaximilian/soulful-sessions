// ============================================================================
// Lazy Asset Loader for Soul Shepherd
// ============================================================================

/**
 * Manages lazy loading of cosmetic assets and other resources
 */
export class AssetLoader {
  private static instance: AssetLoader;
  private loadedAssets: Set<string> = new Set();
  private loadingPromises: Map<string, Promise<any>> = new Map();
  private cache: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): AssetLoader {
    if (!AssetLoader.instance) {
      AssetLoader.instance = new AssetLoader();
    }
    return AssetLoader.instance;
  }

  /**
   * Lazy load cosmetic themes
   */
  async loadThemes(): Promise<any[]> {
    const cacheKey = "cosmetic_themes";

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    const loadPromise = import("./constants").then((module) => {
      const themes = module.COSMETIC_THEMES;
      this.cache.set(cacheKey, themes);
      this.loadedAssets.add(cacheKey);
      this.loadingPromises.delete(cacheKey);
      return themes;
    });

    this.loadingPromises.set(cacheKey, loadPromise);
    return loadPromise;
  }

  /**
   * Lazy load cosmetic sprites
   */
  async loadSprites(): Promise<any[]> {
    const cacheKey = "cosmetic_sprites";

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    const loadPromise = import("./constants").then((module) => {
      const sprites = module.COSMETIC_SPRITES;
      this.cache.set(cacheKey, sprites);
      this.loadedAssets.add(cacheKey);
      this.loadingPromises.delete(cacheKey);
      return sprites;
    });

    this.loadingPromises.set(cacheKey, loadPromise);
    return loadPromise;
  }

  /**
   * Preload an image
   */
  async preloadImage(src: string): Promise<HTMLImageElement> {
    if (this.cache.has(src)) {
      return this.cache.get(src);
    }

    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.cache.set(src, img);
        this.loadedAssets.add(src);
        this.loadingPromises.delete(src);
        resolve(img);
      };
      img.onerror = () => {
        this.loadingPromises.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });

    this.loadingPromises.set(src, loadPromise);
    return loadPromise;
  }

  /**
   * Batch preload multiple images
   */
  async preloadImages(sources: string[]): Promise<HTMLImageElement[]> {
    return Promise.all(sources.map((src) => this.preloadImage(src)));
  }

  /**
   * Check if asset is loaded
   */
  isLoaded(key: string): boolean {
    return this.loadedAssets.has(key);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.loadedAssets.clear();
    this.loadingPromises.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}
