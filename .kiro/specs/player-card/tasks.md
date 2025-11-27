# Implementation Plan

- [x] 1. Set up html2canvas library and basic infrastructure





  - Install html2canvas as a dependency via npm
  - Configure build.js to bundle html2canvas with the extension
  - Verify CSP compatibility in manifest.json
  - _Requirements: 4.1, 4.2_

- [ ] 2. Create PlayerCardManager module
- [ ] 2.1 Implement card data generation
  - Create `src/PlayerCardManager.ts` file
  - Implement `generateCardData()` function that extracts relevant data from GameState
  - Handle missing or invalid data with sensible defaults
  - _Requirements: 1.3, 3.4_

- [ ] 2.2 Write property test for card data generation
  - **Property 1: Card data completeness**
  - **Validates: Requirements 1.3**

- [ ] 2.3 Implement modal management functions
  - Implement `showCardModal()` and `hideCardModal()` functions
  - Implement `renderCard()` function to generate card HTML
  - Add event listener setup and cleanup logic
  - _Requirements: 1.2, 1.4, 1.5_

- [ ] 2.4 Write property test for modal visibility
  - **Property 2: Modal visibility on button click**
  - **Validates: Requirements 1.2**

- [ ] 2.5 Write property test for modal dismissal
  - **Property 3: Modal dismissal restores view**
  - **Validates: Requirements 1.4, 1.5**

- [ ] 2.6 Implement image generation and clipboard functionality
  - Implement `copyCardToClipboard()` function using html2canvas
  - Handle canvas rendering with proper options for external assets
  - Integrate Clipboard API to write image blob
  - _Requirements: 2.2, 2.3, 4.3_

- [ ] 2.7 Write property test for image generation
  - **Property 4: Image generation and clipboard write**
  - **Validates: Requirements 2.2, 2.3**

- [ ] 2.8 Write property test for external asset handling
  - **Property 9: External asset handling**
  - **Validates: Requirements 4.3**

- [ ] 2.9 Implement notification system
  - Implement `showNotification()` function for success/error messages
  - Create toast notification UI component
  - Add auto-dismiss timer for notifications
  - _Requirements: 2.4, 2.5_

- [ ] 2.10 Write property test for notification feedback
  - **Property 5: Notification feedback**
  - **Validates: Requirements 2.4, 2.5**

- [ ] 2.11 Add error handling for all operations
  - Wrap image generation in try-catch blocks
  - Handle clipboard API errors gracefully
  - Validate game state before rendering
  - Provide fallback error messages
  - _Requirements: 4.5_

- [ ] 2.12 Write property test for error handling
  - **Property 10: Error handling for generation failures**
  - **Validates: Requirements 4.5**

- [ ] 3. Update options.html with player card UI elements
  - Replace character sprite in statistics section with "Show Player Card" button
  - Add player card modal structure to HTML
  - Add card content container with proper semantic HTML
  - Add copy and close buttons
  - Add notification container for toast messages
  - _Requirements: 1.1, 2.1_

- [ ] 4. Style the player card components
- [ ] 4.1 Create card modal styles in options.css
  - Style modal overlay with backdrop
  - Style card container with game aesthetic
  - Ensure card has fixed dimensions (600x800px)
  - Add responsive behavior for smaller viewports
  - _Requirements: 3.1, 3.5_

- [ ] 4.2 Style card content layout
  - Create grid layout for stats display
  - Style character sprite display area
  - Style level progress bar
  - Add stat icons and labels
  - Style achievement summary section
  - _Requirements: 3.1, 3.2_

- [ ] 4.3 Implement theme-aware styling
  - Use CSS custom properties for theme colors
  - Apply active theme colors to card dynamically
  - Ensure text contrast meets accessibility standards
  - _Requirements: 3.1_

- [ ] 4.4 Write property test for theme application
  - **Property 6: Theme application**
  - **Validates: Requirements 3.1**

- [ ] 4.5 Style action buttons and notifications
  - Style copy and close buttons
  - Add loading state styles for copy button
  - Style toast notification component
  - Add animations for modal and notifications
  - _Requirements: 2.1_

- [ ] 5. Integrate PlayerCardManager into options.ts
- [ ] 5.1 Import and initialize PlayerCardManager
  - Import PlayerCardManager module
  - Add event listener for "Show Player Card" button
  - Lazy load html2canvas on first button click
  - _Requirements: 5.1_

- [ ] 5.2 Write property test for lazy loading
  - **Property 11: Lazy loading of image library**
  - **Validates: Requirements 5.1**

- [ ] 5.3 Wire up modal interactions
  - Connect close button to hideCardModal()
  - Connect backdrop click to hideCardModal()
  - Add ESC key listener to close modal
  - Connect copy button to copyCardToClipboard()
  - _Requirements: 1.4, 2.2_

- [ ] 5.4 Add tab switching handler
  - Listen for tab change events
  - Hide modal when user switches away from statistics tab
  - _Requirements: 5.5_

- [ ] 5.5 Write property test for tab switching
  - **Property 13: Tab switching hides modal**
  - **Validates: Requirements 5.5**

- [ ] 5.6 Update populateStatistics function
  - Remove old sprite display logic
  - Ensure button shows current sprite as icon/background
  - Pass current game state to card generation
  - _Requirements: 1.1_

- [ ] 6. Implement visual element rendering
- [ ] 6.1 Render character sprite in card
  - Display active sprite image in card
  - Handle sprite loading errors
  - Add fallback for missing sprites
  - _Requirements: 3.3_

- [ ] 6.2 Write property test for sprite display
  - **Property 8: Correct sprite display**
  - **Validates: Requirements 3.3**

- [ ] 6.3 Render stats with icons
  - Display Spirit, Harmony, Soulflow with appropriate icons
  - Format stat values for display (e.g., Harmony as percentage)
  - Add Soul Insight and Soul Embers displays
  - _Requirements: 3.2_

- [ ] 6.4 Write property test for visual elements
  - **Property 7: Required visual elements presence**
  - **Validates: Requirements 3.2, 3.3**

- [ ] 6.5 Render achievement summary
  - Display total sessions, focus time, bosses defeated, current streak
  - Format time values (hours and minutes)
  - Add visual indicators for achievements
  - _Requirements: 1.3_

- [ ] 6.6 Add level and XP progress display
  - Show current level prominently
  - Display XP progress bar
  - Show XP to next level
  - _Requirements: 1.3_

- [ ] 7. Add accessibility features
  - Add ARIA labels to all interactive elements
  - Implement focus trap in modal
  - Ensure keyboard navigation works correctly
  - Add aria-live region for notifications
  - Test with screen reader
  - _Requirements: 1.4, 2.1_

- [ ] 8. Implement resource cleanup
  - Remove event listeners on modal close
  - Clean up html2canvas resources after generation
  - Ensure no memory leaks from repeated operations
  - _Requirements: 5.4_

- [ ] 8.1 Write property test for resource cleanup
  - **Property 12: Resource cleanup on dismissal**
  - **Validates: Requirements 5.4**

- [ ] 9. Add manifest permissions for clipboard
  - Add "clipboardWrite" permission to manifest.json
  - Verify permission is granted on extension load
  - _Requirements: 4.4_

- [ ] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Manual testing and polish
  - Test card generation with various game states
  - Verify image quality and file size
  - Test clipboard functionality in different contexts
  - Verify theme colors apply correctly
  - Test error scenarios (network issues, permission denied)
  - Verify accessibility with keyboard and screen reader
  - Test on different viewport sizes
  - Polish animations and transitions
  - _Requirements: All_
