/**
 * Unit tests for URL parameter handling in options page
 * Tests Requirements 1.3, 1.4
 */

/**
 * Helper function to parse URL parameters and determine actions
 * This mirrors the logic that will be in handleURLParameters
 */
function parseURLParameters(searchString: string): {
  shouldSwitchTab: boolean;
  tabName: string | null;
  shouldShowDetail: boolean;
  bossId: number | null;
} {
  const params = new URLSearchParams(searchString);
  const tab = params.get('tab');
  const bossIdStr = params.get('boss');

  let shouldSwitchTab = false;
  let tabName: string | null = null;
  let shouldShowDetail = false;
  let bossId: number | null = null;

  if (tab === 'guided-souls') {
    shouldSwitchTab = true;
    tabName = 'guided-souls';

    if (bossIdStr !== null && bossIdStr !== '') {
      const id = parseInt(bossIdStr);
      if (!isNaN(id) && id >= 0 && id <= 9) {
        shouldShowDetail = true;
        bossId = id;
      }
    }
  }

  return { shouldSwitchTab, tabName, shouldShowDetail, bossId };
}

describe('URL Parameter Handling', () => {
  describe('parseURLParameters', () => {
    it('should switch to guided-souls tab when tab parameter is guided-souls', () => {
      const result = parseURLParameters('?tab=guided-souls');

      expect(result.shouldSwitchTab).toBe(true);
      expect(result.tabName).toBe('guided-souls');
      expect(result.shouldShowDetail).toBe(false);
      expect(result.bossId).toBeNull();
    });

    it('should show detail view for valid boss ID 0', () => {
      const result = parseURLParameters('?tab=guided-souls&boss=0');

      expect(result.shouldSwitchTab).toBe(true);
      expect(result.tabName).toBe('guided-souls');
      expect(result.shouldShowDetail).toBe(true);
      expect(result.bossId).toBe(0);
    });

    it('should show detail view for valid boss ID 9', () => {
      const result = parseURLParameters('?tab=guided-souls&boss=9');

      expect(result.shouldSwitchTab).toBe(true);
      expect(result.tabName).toBe('guided-souls');
      expect(result.shouldShowDetail).toBe(true);
      expect(result.bossId).toBe(9);
    });

    it('should show detail view for valid boss ID 5', () => {
      const result = parseURLParameters('?tab=guided-souls&boss=5');

      expect(result.shouldSwitchTab).toBe(true);
      expect(result.tabName).toBe('guided-souls');
      expect(result.shouldShowDetail).toBe(true);
      expect(result.bossId).toBe(5);
    });

    it('should not show detail view for invalid boss ID -1 (negative)', () => {
      const result = parseURLParameters('?tab=guided-souls&boss=-1');

      expect(result.shouldSwitchTab).toBe(true);
      expect(result.tabName).toBe('guided-souls');
      expect(result.shouldShowDetail).toBe(false);
      expect(result.bossId).toBeNull();
    });

    it('should not show detail view for invalid boss ID 10 (greater than 9)', () => {
      const result = parseURLParameters('?tab=guided-souls&boss=10');

      expect(result.shouldSwitchTab).toBe(true);
      expect(result.tabName).toBe('guided-souls');
      expect(result.shouldShowDetail).toBe(false);
      expect(result.bossId).toBeNull();
    });

    it('should not show detail view for non-numeric boss ID', () => {
      const result = parseURLParameters('?tab=guided-souls&boss=abc');

      expect(result.shouldSwitchTab).toBe(true);
      expect(result.tabName).toBe('guided-souls');
      expect(result.shouldShowDetail).toBe(false);
      expect(result.bossId).toBeNull();
    });

    it('should only switch tab when boss parameter is missing', () => {
      const result = parseURLParameters('?tab=guided-souls');

      expect(result.shouldSwitchTab).toBe(true);
      expect(result.tabName).toBe('guided-souls');
      expect(result.shouldShowDetail).toBe(false);
      expect(result.bossId).toBeNull();
    });

    it('should do nothing when no parameters are present', () => {
      const result = parseURLParameters('');

      expect(result.shouldSwitchTab).toBe(false);
      expect(result.tabName).toBeNull();
      expect(result.shouldShowDetail).toBe(false);
      expect(result.bossId).toBeNull();
    });

    it('should do nothing when tab parameter is not guided-souls', () => {
      const result = parseURLParameters('?tab=settings');

      expect(result.shouldSwitchTab).toBe(false);
      expect(result.tabName).toBeNull();
      expect(result.shouldShowDetail).toBe(false);
      expect(result.bossId).toBeNull();
    });

    it('should handle malformed URL with empty boss parameter', () => {
      const result = parseURLParameters('?tab=guided-souls&boss=');

      expect(result.shouldSwitchTab).toBe(true);
      expect(result.tabName).toBe('guided-souls');
      expect(result.shouldShowDetail).toBe(false);
      expect(result.bossId).toBeNull();
    });
  });
});
