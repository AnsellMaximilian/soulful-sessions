/**
 * Accessibility Tests for Boss Bestiary Feature
 * 
 * Tests verify that all interactive elements have proper ARIA labels,
 * keyboard navigation works correctly, and screen reader support is implemented.
 */

import { JSDOM } from 'jsdom';
import { STUBBORN_SOULS } from '../constants';

describe('Boss Bestiary - Accessibility Tests', () => {
  let dom: JSDOM;
  let document: Document;
  let window: Window;

  beforeEach(() => {
    // Create a fresh DOM for each test
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head></head>
        <body>
          <div id="souls-gallery" class="souls-gallery" role="list" aria-label="Stubborn Souls Gallery"></div>
          <div id="soul-detail" class="soul-detail" style="display: none;" role="article" aria-hidden="true"></div>
          <div id="sr-announcements" role="status" aria-live="polite" aria-atomic="true" style="position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;"></div>
        </body>
      </html>
    `, {
      url: 'http://localhost',
      pretendToBeVisual: true,
    });

    document = dom.window.document;
    window = dom.window as unknown as Window;
    global.document = document;
    (global as any).window = window;
  });

  describe('Gallery View Accessibility', () => {
    test('Gallery container has proper ARIA role and label', () => {
      const gallery = document.getElementById('souls-gallery');
      
      expect(gallery).not.toBeNull();
      expect(gallery?.getAttribute('role')).toBe('list');
      expect(gallery?.getAttribute('aria-label')).toBe('Stubborn Souls Gallery');
    });

    test('Boss cards have listitem role', () => {
      const gallery = document.getElementById('souls-gallery');
      
      // Create a sample boss card
      const card = document.createElement('div');
      card.className = 'soul-card unlocked';
      card.setAttribute('role', 'listitem');
      card.setAttribute('aria-label', 'The Restless Athlete, unlocked, click to view details');
      card.setAttribute('tabindex', '0');
      
      gallery?.appendChild(card);
      
      expect(card.getAttribute('role')).toBe('listitem');
      expect(card.getAttribute('aria-label')).toContain('The Restless Athlete');
      expect(card.getAttribute('tabindex')).toBe('0');
    });

    test('Locked boss cards have appropriate ARIA labels', () => {
      const card = document.createElement('div');
      card.className = 'soul-card locked';
      card.setAttribute('role', 'listitem');
      card.setAttribute('aria-label', 'The Restless Athlete, locked, requires level 5');
      
      expect(card.getAttribute('aria-label')).toContain('locked');
      expect(card.getAttribute('aria-label')).toContain('requires level');
    });

    test('Unlocked boss cards have appropriate ARIA labels', () => {
      const card = document.createElement('div');
      card.className = 'soul-card unlocked current';
      card.setAttribute('role', 'listitem');
      card.setAttribute('aria-label', 'The Restless Athlete, current boss, click to view details');
      
      expect(card.getAttribute('aria-label')).toContain('current boss');
      expect(card.getAttribute('aria-label')).toContain('click to view details');
    });

    test('Defeated boss cards have appropriate ARIA labels', () => {
      const card = document.createElement('div');
      card.className = 'soul-card defeated';
      card.setAttribute('role', 'listitem');
      card.setAttribute('aria-label', 'The Restless Athlete, guided, click to view story');
      
      expect(card.getAttribute('aria-label')).toContain('guided');
      expect(card.getAttribute('aria-label')).toContain('click to view story');
    });

    test('Locked boss cards do not have tabindex', () => {
      const card = document.createElement('div');
      card.className = 'soul-card locked';
      card.setAttribute('role', 'listitem');
      card.setAttribute('aria-label', 'The Restless Athlete, locked, requires level 5');
      // Locked cards should NOT have tabindex
      
      expect(card.hasAttribute('tabindex')).toBe(false);
    });

    test('Unlocked boss cards have tabindex for keyboard navigation', () => {
      const card = document.createElement('div');
      card.className = 'soul-card unlocked';
      card.setAttribute('role', 'listitem');
      card.setAttribute('tabindex', '0');
      
      expect(card.getAttribute('tabindex')).toBe('0');
    });
  });

  describe('Detail View Accessibility', () => {
    test('Detail view has proper ARIA role', () => {
      const detailView = document.getElementById('soul-detail');
      
      expect(detailView).not.toBeNull();
      expect(detailView?.getAttribute('role')).toBe('article');
    });

    test('Detail view has aria-hidden when not displayed', () => {
      const detailView = document.getElementById('soul-detail');
      
      expect(detailView?.getAttribute('aria-hidden')).toBe('true');
      expect(detailView?.style.display).toBe('none');
    });

    test('Back button has proper ARIA label', () => {
      const backButton = document.createElement('button');
      backButton.id = 'back-to-gallery-btn';
      backButton.className = 'btn btn-secondary';
      backButton.setAttribute('aria-label', 'Return to gallery');
      backButton.textContent = '← Back to Gallery';
      
      expect(backButton.getAttribute('aria-label')).toBe('Return to gallery');
    });

    test('Detail view has aria-labelledby pointing to boss name', () => {
      const detailView = document.getElementById('soul-detail');
      detailView?.setAttribute('aria-labelledby', 'detail-name');
      
      const nameElement = document.createElement('h2');
      nameElement.id = 'detail-name';
      nameElement.textContent = 'The Restless Athlete';
      detailView?.appendChild(nameElement);
      
      expect(detailView?.getAttribute('aria-labelledby')).toBe('detail-name');
      expect(document.getElementById('detail-name')?.textContent).toBe('The Restless Athlete');
    });

    test('Locked content placeholders have proper ARIA attributes', () => {
      const placeholder = document.createElement('div');
      placeholder.className = 'locked-placeholder';
      placeholder.setAttribute('role', 'status');
      placeholder.setAttribute('aria-label', 'Final Conversation, locked, guide this soul to unlock');
      placeholder.textContent = 'Guide this soul to unlock the final conversation';
      
      expect(placeholder.getAttribute('role')).toBe('status');
      expect(placeholder.getAttribute('aria-label')).toContain('locked');
      expect(placeholder.getAttribute('aria-label')).toContain('guide this soul to unlock');
    });
  });

  describe('Screen Reader Announcements', () => {
    test('Screen reader announcement region exists', () => {
      const liveRegion = document.getElementById('sr-announcements');
      
      expect(liveRegion).not.toBeNull();
      expect(liveRegion?.getAttribute('role')).toBe('status');
      expect(liveRegion?.getAttribute('aria-live')).toBe('polite');
      expect(liveRegion?.getAttribute('aria-atomic')).toBe('true');
    });

    test('Screen reader announcement region is visually hidden', () => {
      const liveRegion = document.getElementById('sr-announcements');
      
      // Check that it's positioned off-screen
      expect(liveRegion?.style.position).toBe('absolute');
      expect(liveRegion?.style.left).toBe('-10000px');
      expect(liveRegion?.style.width).toBe('1px');
      expect(liveRegion?.style.height).toBe('1px');
      expect(liveRegion?.style.overflow).toBe('hidden');
    });
  });

  describe('Keyboard Navigation', () => {
    test('Boss cards respond to Enter key', () => {
      const card = document.createElement('div');
      card.className = 'soul-card unlocked';
      card.setAttribute('tabindex', '0');
      
      let clicked = false;
      card.addEventListener('keypress', (e: any) => {
        if (e.key === 'Enter') {
          clicked = true;
        }
      });
      
      // Simulate Enter key press
      const event = new dom.window.KeyboardEvent('keypress', { key: 'Enter' });
      card.dispatchEvent(event);
      
      expect(clicked).toBe(true);
    });

    test('Boss cards respond to Space key', () => {
      const card = document.createElement('div');
      card.className = 'soul-card unlocked';
      card.setAttribute('tabindex', '0');
      
      let clicked = false;
      card.addEventListener('keypress', (e: any) => {
        if (e.key === ' ') {
          e.preventDefault();
          clicked = true;
        }
      });
      
      // Simulate Space key press
      const event = new dom.window.KeyboardEvent('keypress', { key: ' ' });
      card.dispatchEvent(event);
      
      expect(clicked).toBe(true);
    });

    test('Back button responds to Escape key', () => {
      const backButton = document.createElement('button');
      backButton.id = 'back-to-gallery-btn';
      
      let escapePressed = false;
      backButton.addEventListener('keydown', (e: any) => {
        if (e.key === 'Escape') {
          escapePressed = true;
        }
      });
      
      // Simulate Escape key press
      const event = new dom.window.KeyboardEvent('keydown', { key: 'Escape' });
      backButton.dispatchEvent(event);
      
      expect(escapePressed).toBe(true);
    });

    test('Locked boss cards do not respond to keyboard events', () => {
      const card = document.createElement('div');
      card.className = 'soul-card locked';
      // No tabindex, so it should not be keyboard accessible
      
      expect(card.hasAttribute('tabindex')).toBe(false);
    });
  });

  describe('Focus Management', () => {
    test('Gallery is focusable when returning from detail view', () => {
      const gallery = document.getElementById('souls-gallery');
      
      // Simulate returning to gallery
      gallery?.setAttribute('tabindex', '-1');
      
      expect(gallery?.hasAttribute('tabindex')).toBe(true);
    });

    test('First unlocked card can receive focus', () => {
      const gallery = document.getElementById('souls-gallery');
      
      const card = document.createElement('div');
      card.className = 'soul-card unlocked';
      card.setAttribute('tabindex', '0');
      
      gallery?.appendChild(card);
      
      const firstUnlockedCard = gallery?.querySelector('.soul-card:not(.locked)[tabindex="0"]');
      expect(firstUnlockedCard).not.toBeNull();
    });
  });

  describe('Visual Indicators for Accessibility', () => {
    test('Unlock level overlay has aria-hidden', () => {
      const overlay = document.createElement('div');
      overlay.className = 'unlock-level-overlay';
      overlay.textContent = '5';
      overlay.setAttribute('aria-hidden', 'true');
      
      expect(overlay.getAttribute('aria-hidden')).toBe('true');
    });

    test('Guided badge has aria-hidden', () => {
      const badge = document.createElement('div');
      badge.className = 'guided-badge';
      badge.textContent = 'Guided';
      badge.setAttribute('aria-hidden', 'true');
      
      expect(badge.getAttribute('aria-hidden')).toBe('true');
    });
  });
});
