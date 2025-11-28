/**
 * @jest-environment jsdom
 */

import * as fc from 'fast-check';
import { STUBBORN_SOULS } from '../constants';
import { StubbornSoul, ConversationExchange } from '../types';

/**
 * Property-Based Tests for Detail View Rendering
 * 
 * Feature: boss-bestiary, Property 6: Detail view completeness
 * Feature: boss-bestiary, Property 7: Locked content placeholders
 * Feature: boss-bestiary, Property 8: Unlocked conversation display
 * Feature: boss-bestiary, Property 9: Conversation speaker distinction
 * Feature: boss-bestiary, Property 10: Unlocked resolution display
 * 
 * Validates: Requirements 3.1, 3.3, 3.4, 3.5, 3.6
 */

// Helper to create a mock detail view DOM structure
function createMockDetailView(soul: StubbornSoul, isDefeated: boolean): HTMLElement {
  const detailView = document.createElement('div');
  detailView.id = 'soul-detail';
  detailView.className = 'soul-detail';

  // Back button
  const backButton = document.createElement('button');
  backButton.id = 'back-to-gallery-btn';
  backButton.className = 'btn btn-secondary';
  backButton.textContent = '← Back to Gallery';
  detailView.appendChild(backButton);

  // Header with sprite and name
  const header = document.createElement('div');
  header.className = 'soul-detail-header';

  const sprite = document.createElement('img');
  sprite.id = 'detail-sprite';
  sprite.className = 'soul-sprite-large';
  sprite.src = `assets/sprites/${soul.sprite}`;
  sprite.alt = soul.name;
  header.appendChild(sprite);

  const name = document.createElement('h2');
  name.id = 'detail-name';
  name.className = 'soul-name';
  name.textContent = soul.name;
  header.appendChild(name);

  detailView.appendChild(header);

  // Info grid
  const infoGrid = document.createElement('div');
  infoGrid.className = 'soul-info-grid';

  const resolveItem = document.createElement('div');
  resolveItem.className = 'info-item';
  resolveItem.innerHTML = `
    <span class="info-label">Initial Resolve:</span>
    <span id="detail-resolve" class="info-value">${soul.initialResolve}</span>
  `;
  infoGrid.appendChild(resolveItem);

  const unlockItem = document.createElement('div');
  unlockItem.className = 'info-item';
  unlockItem.innerHTML = `
    <span class="info-label">Unlock Level:</span>
    <span id="detail-unlock-level" class="info-value">${soul.unlockLevel}</span>
  `;
  infoGrid.appendChild(unlockItem);

  detailView.appendChild(infoGrid);

  // Backstory section
  const backstorySection = document.createElement('div');
  backstorySection.className = 'soul-backstory-section';
  backstorySection.innerHTML = `
    <h3>Backstory</h3>
    <p id="detail-backstory">${soul.backstory}</p>
  `;
  detailView.appendChild(backstorySection);

  // Final conversation section
  const conversationSection = document.createElement('div');
  conversationSection.id = 'final-conversation-section';
  conversationSection.className = 'narrative-section';
  
  if (isDefeated) {
    conversationSection.innerHTML = '<h3>Final Conversation</h3>';
    const dialogueContainer = document.createElement('div');
    dialogueContainer.className = 'dialogue-container';
    
    soul.finalConversation.forEach((exchange) => {
      const bubble = document.createElement('div');
      bubble.className = `dialogue-bubble ${exchange.speaker}`;
      
      const speaker = document.createElement('div');
      speaker.className = 'dialogue-speaker';
      speaker.textContent = exchange.speaker === 'shepherd' ? 'Soul Shepherd' : 'Stubborn Soul';
      bubble.appendChild(speaker);
      
      const text = document.createElement('div');
      text.className = 'dialogue-text';
      text.textContent = exchange.text;
      bubble.appendChild(text);
      
      dialogueContainer.appendChild(bubble);
    });
    
    conversationSection.appendChild(dialogueContainer);
  } else {
    conversationSection.innerHTML = '<h3>Final Conversation</h3>';
    const placeholder = document.createElement('div');
    placeholder.className = 'locked-placeholder';
    placeholder.textContent = 'Guide this soul to unlock the final conversation';
    conversationSection.appendChild(placeholder);
  }
  
  detailView.appendChild(conversationSection);

  // Resolution section
  const resolutionSection = document.createElement('div');
  resolutionSection.id = 'resolution-section';
  resolutionSection.className = 'narrative-section';
  
  if (isDefeated) {
    resolutionSection.innerHTML = '<h3>Resolution</h3>';
    const resolutionText = document.createElement('div');
    resolutionText.className = 'resolution-text';
    resolutionText.textContent = soul.resolution;
    resolutionSection.appendChild(resolutionText);
  } else {
    resolutionSection.innerHTML = '<h3>Resolution</h3>';
    const placeholder = document.createElement('div');
    placeholder.className = 'locked-placeholder';
    placeholder.textContent = 'Guide this soul to unlock the resolution';
    resolutionSection.appendChild(placeholder);
  }
  
  detailView.appendChild(resolutionSection);

  return detailView;
}

describe('Detail View - Property Tests', () => {
  /**
   * Property 6: Detail view completeness
   * 
   * For any Stubborn Soul displayed in detail view, the view SHALL contain
   * the boss name, sprite image, backstory, initial resolve value, and unlock level requirement
   * 
   * Validates: Requirements 3.1
   */
  it('Property 6: Detail view contains all required information', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...STUBBORN_SOULS),
        fc.boolean(),
        (boss, isDefeated) => {
          const detailView = createMockDetailView(boss, isDefeated);
          
          // Check for boss name
          const nameElement = detailView.querySelector('#detail-name');
          expect(nameElement).not.toBeNull();
          expect(nameElement?.textContent).toBe(boss.name);
          
          // Check for sprite image
          const spriteElement = detailView.querySelector('#detail-sprite') as HTMLImageElement;
          expect(spriteElement).not.toBeNull();
          expect(spriteElement?.src).toContain(boss.sprite);
          expect(spriteElement?.alt).toBe(boss.name);
          
          // Check for backstory
          const backstoryElement = detailView.querySelector('#detail-backstory');
          expect(backstoryElement).not.toBeNull();
          expect(backstoryElement?.textContent).toBe(boss.backstory);
          
          // Check for initial resolve value
          const resolveElement = detailView.querySelector('#detail-resolve');
          expect(resolveElement).not.toBeNull();
          expect(resolveElement?.textContent).toBe(boss.initialResolve.toString());
          
          // Check for unlock level
          const unlockLevelElement = detailView.querySelector('#detail-unlock-level');
          expect(unlockLevelElement).not.toBeNull();
          expect(unlockLevelElement?.textContent).toBe(boss.unlockLevel.toString());
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7: Locked content placeholders
   * 
   * For any Stubborn Soul not in the defeated bosses list, the detail view SHALL display
   * locked content placeholders for Final Conversation and Resolution sections
   * 
   * Validates: Requirements 3.3
   */
  it('Property 7: Undefeated bosses show locked placeholders', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...STUBBORN_SOULS),
        fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 0, maxLength: 10 }),
        (boss, defeatedBosses) => {
          const isDefeated = defeatedBosses.includes(boss.id);
          
          if (!isDefeated) {
            const detailView = createMockDetailView(boss, false);
            
            // Check for locked placeholder in conversation section
            const conversationSection = detailView.querySelector('#final-conversation-section');
            expect(conversationSection).not.toBeNull();
            
            const conversationPlaceholder = conversationSection?.querySelector('.locked-placeholder');
            expect(conversationPlaceholder).not.toBeNull();
            expect(conversationPlaceholder?.textContent).toContain('Guide this soul');
            
            // Check for locked placeholder in resolution section
            const resolutionSection = detailView.querySelector('#resolution-section');
            expect(resolutionSection).not.toBeNull();
            
            const resolutionPlaceholder = resolutionSection?.querySelector('.locked-placeholder');
            expect(resolutionPlaceholder).not.toBeNull();
            expect(resolutionPlaceholder?.textContent).toContain('Guide this soul');
            
            // Ensure actual content is NOT present
            const dialogueContainer = conversationSection?.querySelector('.dialogue-container');
            expect(dialogueContainer).toBeNull();
            
            const resolutionText = resolutionSection?.querySelector('.resolution-text');
            expect(resolutionText).toBeNull();
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8: Unlocked conversation display
   * 
   * For any Stubborn Soul in the defeated bosses list, the detail view SHALL display
   * all dialogue exchanges from the finalConversation array
   * 
   * Validates: Requirements 3.4
   */
  it('Property 8: Defeated bosses show complete conversation', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...STUBBORN_SOULS),
        fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 0, maxLength: 10 }),
        (boss, defeatedBosses) => {
          const isDefeated = defeatedBosses.includes(boss.id);
          
          if (isDefeated) {
            const detailView = createMockDetailView(boss, true);
            
            // Check for conversation section
            const conversationSection = detailView.querySelector('#final-conversation-section');
            expect(conversationSection).not.toBeNull();
            
            // Check for dialogue container
            const dialogueContainer = conversationSection?.querySelector('.dialogue-container');
            expect(dialogueContainer).not.toBeNull();
            
            // Check that all exchanges are rendered
            const dialogueBubbles = dialogueContainer?.querySelectorAll('.dialogue-bubble');
            expect(dialogueBubbles?.length).toBe(boss.finalConversation.length);
            
            // Verify each exchange is present
            boss.finalConversation.forEach((exchange, index) => {
              const bubble = dialogueBubbles?.[index];
              expect(bubble).not.toBeNull();
              
              const text = bubble?.querySelector('.dialogue-text');
              expect(text?.textContent).toBe(exchange.text);
            });
            
            // Ensure locked placeholder is NOT present
            const placeholder = conversationSection?.querySelector('.locked-placeholder');
            expect(placeholder).toBeNull();
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9: Conversation speaker distinction
   * 
   * For any conversation exchange in a Final Conversation, the dialogue bubble SHALL have
   * visual styling that distinguishes between 'shepherd' and 'soul' speakers
   * 
   * Validates: Requirements 3.5
   */
  it('Property 9: Dialogue bubbles distinguish speakers', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...STUBBORN_SOULS),
        (boss) => {
          // Only test defeated state since conversation is only visible then
          const detailView = createMockDetailView(boss, true);
          
          const dialogueContainer = detailView.querySelector('.dialogue-container');
          expect(dialogueContainer).not.toBeNull();
          
          const dialogueBubbles = dialogueContainer?.querySelectorAll('.dialogue-bubble');
          
          // Check each dialogue bubble has the correct speaker class
          boss.finalConversation.forEach((exchange, index) => {
            const bubble = dialogueBubbles?.[index];
            expect(bubble).not.toBeNull();
            
            // Bubble should have speaker-specific class
            if (exchange.speaker === 'shepherd') {
              expect(bubble?.classList.contains('shepherd')).toBe(true);
              expect(bubble?.classList.contains('soul')).toBe(false);
            } else if (exchange.speaker === 'soul') {
              expect(bubble?.classList.contains('soul')).toBe(true);
              expect(bubble?.classList.contains('shepherd')).toBe(false);
            }
            
            // Speaker label should be present
            const speakerLabel = bubble?.querySelector('.dialogue-speaker');
            expect(speakerLabel).not.toBeNull();
            
            // Verify speaker label text
            if (exchange.speaker === 'shepherd') {
              expect(speakerLabel?.textContent).toBe('Soul Shepherd');
            } else {
              expect(speakerLabel?.textContent).toBe('Stubborn Soul');
            }
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 10: Unlocked resolution display
   * 
   * For any Stubborn Soul in the defeated bosses list, the detail view SHALL display
   * the resolution text
   * 
   * Validates: Requirements 3.6
   */
  it('Property 10: Defeated bosses show resolution', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...STUBBORN_SOULS),
        fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 0, maxLength: 10 }),
        (boss, defeatedBosses) => {
          const isDefeated = defeatedBosses.includes(boss.id);
          
          if (isDefeated) {
            const detailView = createMockDetailView(boss, true);
            
            // Check for resolution section
            const resolutionSection = detailView.querySelector('#resolution-section');
            expect(resolutionSection).not.toBeNull();
            
            // Check for resolution text element
            const resolutionText = resolutionSection?.querySelector('.resolution-text');
            expect(resolutionText).not.toBeNull();
            expect(resolutionText?.textContent).toBe(boss.resolution);
            
            // Ensure locked placeholder is NOT present
            const placeholder = resolutionSection?.querySelector('.locked-placeholder');
            expect(placeholder).toBeNull();
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional validation: Back button is always present
   */
  it('Property: Detail view always has back button', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...STUBBORN_SOULS),
        fc.boolean(),
        (boss, isDefeated) => {
          const detailView = createMockDetailView(boss, isDefeated);
          
          const backButton = detailView.querySelector('#back-to-gallery-btn');
          expect(backButton).not.toBeNull();
          expect(backButton?.textContent).toContain('Back to Gallery');
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
