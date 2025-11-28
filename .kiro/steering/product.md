# Product Overview

**Soulful Sessions** (Soul Shepherd) is a Chrome extension that gamifies productivity by combining focus session tracking with RPG mechanics.

## Core Concept

Users complete timed focus sessions to earn rewards and progress through a game where they defeat "Stubborn Souls" (bosses) while building their character stats.

## Key Features

- **Focus Sessions**: Pomodoro-style work sessions with idle detection and site blocking
- **RPG Progression**: Level up, earn Soul Insight (XP) and Soul Embers (currency)
- **Boss Battles**: Defeat Stubborn Souls by completing focus sessions
- **Character Stats**: Spirit (damage), Harmony (crit chance), Soulflow (idle collection)
- **Idle Collection**: Earn passive rewards when not in sessions
- **Strict Mode**: Block distracting sites during focus sessions
- **Cosmetics**: Unlock themes and character sprites with earned currency
- **Task Management**: Track goals, tasks, and subtasks with auto-completion

## User Flow

1. User starts a focus session with a duration and optional task
2. Optionally enable "Complete when done" to auto-mark task/subtask as complete
3. Extension monitors activity (idle detection, navigation tracking)
4. Session ends → rewards calculated → boss damage applied → task auto-completed (if enabled)
5. Break timer starts automatically
6. During breaks, users can upgrade stats, purchase cosmetics, or start next session

## Task Integration

- **Task Selection**: Choose a task or subtask when starting a session
- **Smart Duration**: Duration auto-fills based on task/subtask estimated time
  - Subtask selected: Uses subtask's estimated duration
  - Task selected: Sums all incomplete subtasks' durations
  - No task selected: Uses default session duration
- **Auto-Completion**: Optional checkbox to mark task/subtask complete when session ends
  - Completing a task cascades to all its subtasks
  - Completing a subtask only marks that subtask
  - Default checkbox state configurable in settings
