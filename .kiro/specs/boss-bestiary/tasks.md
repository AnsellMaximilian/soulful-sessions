# Implementation Plan

- [x] 1. Extend data models with narrative content





  - Update `StubbornSoul` interface in `types.ts` to include `finalConversation` and `resolution` properties
  - Create `ConversationExchange` interface with `speaker` and `text` properties
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 2. Write narrative content for all 10 Stubborn Souls





  - Add `finalConversation` arrays (3-5 exchanges each) to all bosses in `constants.ts`
  - Add `resolution` strings to all bosses in `constants.ts`
  - Follow narrative arc: backstory → breakthrough → peace
  - Ensure thematic consistency with Soul Shepherd concept
  - _Requirements: 4.4, 4.5, 4.6, 5.3, 5.4_

- [x] 2.1 Write property test for boss data completeness


  - **Property 11: Boss data completeness - conversations**
  - **Property 12: Boss data completeness - resolutions**
  - **Validates: Requirements 4.4, 4.5**

- [x] 3. Add info icon to popup interface





  - Modify `popup.html` to add boss header container with info icon button
  - Update `popup.css` with info icon styles (circular button with ⓘ symbol)
  - Implement click handler in `popup.ts` to open options page with URL parameters
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 3.1 Write unit tests for popup info icon


  - Test info icon is rendered when boss is displayed
  - Test click handler opens correct URL with boss ID parameter
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 4. Create Guided Souls tab in options page




  - Add "Guided Souls" tab button to `options.html` navigation
  - Create tab content section with gallery and detail view containers
  - Update tab switching logic in `options.ts` to handle new tab
  - _Requirements: 2.1, 5.1_

- [x] 5. Implement URL parameter handling





  - Add `handleURLParameters()` function in `options.ts`
  - Parse `tab` and `boss` query parameters on page load
  - Switch to Guided Souls tab if `tab=guided-souls`
  - Show detail view if valid `boss` parameter is present
  - _Requirements: 1.3, 1.4_

- [x] 5.1 Write unit tests for URL parameter handling


  - Test valid boss IDs (0-9)
  - Test invalid boss IDs (negative, > 9, non-numeric)
  - Test missing parameters
  - Test malformed URLs
  - _Requirements: 1.3, 1.4_

- [x] 6. Implement gallery view rendering





  - Create `renderGalleryView()` function in `options.ts`
  - Generate boss cards for all 10 Stubborn Souls
  - Determine boss state (locked/unlocked-current/defeated) based on game state
  - Apply appropriate CSS classes and visual indicators
  - Attach click handlers only to unlocked/defeated bosses
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 6.1 Write property test for locked boss visual state


  - **Property 1: Locked boss visual state**
  - **Validates: Requirements 2.2**

- [x] 6.2 Write property test for locked boss interaction prevention


  - **Property 2: Locked boss interaction prevention**
  - **Validates: Requirements 2.3**

- [x] 6.3 Write property test for defeated boss visual indicator


  - **Property 3: Defeated boss visual indicator**
  - **Validates: Requirements 2.5**

- [x] 6.4 Write property test for unlocked boss hover feedback


  - **Property 4: Unlocked boss hover feedback**
  - **Validates: Requirements 2.6**

- [x] 6.5 Write property test for boss card navigation


  - **Property 5: Boss card navigation**
  - **Validates: Requirements 2.7**

- [x] 7. Implement detail view rendering





  - Create `renderDetailView()` function in `options.ts`
  - Display boss name, sprite, backstory, resolve, and unlock level
  - Implement back button to return to gallery
  - Conditionally render narrative content based on defeat status
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 7.1 Write property test for detail view completeness


  - **Property 6: Detail view completeness**
  - **Validates: Requirements 3.1**

- [x] 7.2 Write property test for locked content placeholders


  - **Property 7: Locked content placeholders**
  - **Validates: Requirements 3.3**

- [x] 7.3 Write property test for unlocked conversation display


  - **Property 8: Unlocked conversation display**
  - **Validates: Requirements 3.4**

- [x] 7.4 Write property test for conversation speaker distinction


  - **Property 9: Conversation speaker distinction**
  - **Validates: Requirements 3.5**

- [x] 7.5 Write property test for unlocked resolution display


  - **Property 10: Unlocked resolution display**
  - **Validates: Requirements 3.6**

- [x] 8. Implement narrative content rendering




  - Create `renderConversation()` function to display dialogue exchanges
  - Create `renderResolution()` function to display epilogue text
  - Create `renderLockedPlaceholder()` function for locked content
  - Apply appropriate CSS classes for speaker distinction and styling
  - _Requirements: 3.4, 3.5, 3.6, 3.7_

- [x] 9. Add CSS styling for all components





  - Add gallery view styles (grid layout, card states, hover effects)
  - Add detail view styles (layout, dialogue bubbles, resolution formatting)
  - Add popup info icon styles (circular button, hover effects)
  - Add locked placeholder styles (dashed border, lock icon)
  - Ensure responsive design and theme variable usage
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 3.7, 5.2_

- [x] 10. Implement accessibility features






  - Add ARIA labels to gallery, boss cards, and detail view
  - Ensure keyboard navigation for all interactive elements
  - Add screen reader announcements for boss states
  - Implement focus management for view transitions
  - _Requirements: All requirements (accessibility is cross-cutting)_

- [ ] 11. Add error handling
  - Handle invalid boss IDs in URL parameters
  - Handle missing game state data
  - Handle navigation errors during view transitions
  - Handle missing boss narrative data
  - _Requirements: All requirements (error handling is cross-cutting)_

- [ ] 11.1 Write unit tests for error handling
  - Test invalid boss ID handling
  - Test missing state data handling
  - Test navigation error recovery
  - _Requirements: All requirements_

- [ ] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Manual testing and polish
  - Test popup to options navigation flow
  - Test gallery to detail view transitions
  - Test locked vs unlocked content display
  - Verify all 10 bosses have complete narrative content
  - Test with different player levels and defeated boss states
  - Verify thematic consistency and terminology
  - _Requirements: All requirements_
