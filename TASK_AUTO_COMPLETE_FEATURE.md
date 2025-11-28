# Task Auto-Complete Feature

## Overview
Added functionality to automatically mark tasks/subtasks as complete when a focus session ends.

## Changes Made

### 1. Type Definitions (`src/types.ts`)
- Added `autoCompleteTask: boolean` to `SessionState` interface
- Added `autoCompleteTask: boolean` to `SettingsState` interface (default setting)

### 2. Popup UI (`popup.html` & `popup.css`)
- Added "Complete when done" checkbox next to duration input
- Checkbox is disabled when no task is selected
- Checkbox is enabled when a task/subtask is selected
- Added responsive layout with `.duration-row` flexbox styling

### 3. Popup Logic (`src/popup.ts`)
- Checkbox state syncs with `settings.autoCompleteTask` default
- Checkbox disabled/enabled based on task selection
- `startSession()` now passes `autoCompleteTask` parameter
- Updated `updateIdleView()` to initialize checkbox state

### 4. Session Manager (`src/SessionManager.ts`)
- Updated `startSession()` signature to accept `autoCompleteTask` parameter
- Session state now stores whether to auto-complete the task

### 5. Background Service (`src/background.ts`)
- Added `TaskState` import
- Updated `handleStartSession()` to accept and pass `autoCompleteTask`
- Added `completeTask()` helper function that:
  - Finds task or subtask by ID
  - Marks it as complete
  - Cascades completion to all subtasks if completing a task
- Integrated task completion in `handleEndSession()` after session ends

### 6. Options Page (`options.html` & `src/options.ts`)
- Added "Auto-check 'Complete when done' by default" setting in Session Configuration
- Checkbox controls the default state of the popup's auto-complete checkbox
- Setting persists to `settings.autoCompleteTask`

### 7. Default Settings (`src/constants.ts`)
- Added `autoCompleteTask: false` to `DEFAULT_SETTINGS`

### 8. Task Completion Behavior
- **Cascading in Options**: Checking a task checkbox marks all subtasks as complete
- **Cascading in Auto-Complete**: Completing a task via session auto-complete marks all subtasks as complete
- **Subtask Only**: Completing a subtask only marks that specific subtask

### 9. Documentation
- Updated `product.md` with task integration details
- Documented smart duration feature
- Documented auto-completion behavior

## User Experience

### Starting a Session
1. User selects a task or subtask from dropdown
2. Duration auto-fills based on selection:
   - Subtask: Uses its estimated duration
   - Task: Sums incomplete subtasks' durations
   - None: Uses default session duration
3. "Complete when done" checkbox appears (enabled)
4. User can check/uncheck based on preference
5. User clicks "Start Focus Session"

### Session Completion
1. Session ends normally
2. If "Complete when done" was checked and a task was selected:
   - Task/subtask is marked as complete
   - If task: all subtasks also marked complete
3. Task state updates persist
4. Completed tasks/subtasks no longer appear in popup selector

## Configuration
Users can set the default checkbox state in Options > Session Configuration:
- "Auto-check 'Complete when done' by default"
- When enabled, checkbox is pre-checked for all new sessions
- When disabled, checkbox starts unchecked (user must manually check)
