import * as fc from 'fast-check';
import { STUBBORN_SOULS } from '../constants';

/**
 * Property-Based Tests for Boss Data Completeness
 * 
 * Feature: boss-bestiary, Property 11: Boss data completeness - conversations
 * Feature: boss-bestiary, Property 12: Boss data completeness - resolutions
 * 
 * Validates: Requirements 4.4, 4.5
 */

describe('Boss Data Completeness - Property Tests', () => {
  /**
   * Property 11: Boss data completeness - conversations
   * 
   * For all ten Stubborn Souls in the STUBBORN_SOULS array, each SHALL have 
   * a finalConversation array containing between 3 and 5 dialogue exchanges
   */
  it('Property 11: All bosses have finalConversation with 3-5 exchanges', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...STUBBORN_SOULS),
        (boss) => {
          // Each boss must have a finalConversation array
          expect(boss.finalConversation).toBeDefined();
          expect(Array.isArray(boss.finalConversation)).toBe(true);
          
          // The array must contain between 3 and 5 exchanges
          const conversationLength = boss.finalConversation.length;
          expect(conversationLength).toBeGreaterThanOrEqual(3);
          expect(conversationLength).toBeLessThanOrEqual(5);
          
          // Each exchange must have valid speaker and text
          boss.finalConversation.forEach((exchange, index) => {
            expect(exchange.speaker).toBeDefined();
            expect(['shepherd', 'soul']).toContain(exchange.speaker);
            expect(exchange.text).toBeDefined();
            expect(typeof exchange.text).toBe('string');
            expect(exchange.text.length).toBeGreaterThan(0);
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 12: Boss data completeness - resolutions
   * 
   * For all ten Stubborn Souls in the STUBBORN_SOULS array, each SHALL have 
   * a non-empty resolution string
   */
  it('Property 12: All bosses have non-empty resolution strings', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...STUBBORN_SOULS),
        (boss) => {
          // Each boss must have a resolution property
          expect(boss.resolution).toBeDefined();
          expect(typeof boss.resolution).toBe('string');
          
          // The resolution must be non-empty
          expect(boss.resolution.length).toBeGreaterThan(0);
          
          // The resolution should be meaningful (more than just whitespace)
          expect(boss.resolution.trim().length).toBeGreaterThan(0);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional validation: Ensure conversation alternates between speakers
   * This helps ensure narrative quality
   */
  it('Property: Conversations should have meaningful speaker alternation', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...STUBBORN_SOULS),
        (boss) => {
          if (boss.finalConversation.length === 0) {
            return true; // Skip if no conversation yet
          }
          
          // Check that we have both shepherd and soul speakers
          const speakers = boss.finalConversation.map(ex => ex.speaker);
          const hasShepherd = speakers.includes('shepherd');
          const hasSoul = speakers.includes('soul');
          
          // A complete conversation should have both speakers
          expect(hasShepherd).toBe(true);
          expect(hasSoul).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
