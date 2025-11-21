// Core Data Models for Soul Shepherd Extension

// ============================================================================
// Player State
// ============================================================================

export interface PlayerStats {
  spirit: number; // Base: 1 - Affects boss damage
  harmony: number; // Base: 0.05 - Critical hit chance (5%)
  soulflow: number; // Base: 1 - Affects idle collection rate
}

export interface CosmeticState {
  ownedThemes: string[];
  ownedSprites: string[];
  activeTheme: string;
  activeSprite: string;
}

export interface PlayerState {
  level: number;
  soulInsight: number; // Total accumulated XP
  soulInsightToNextLevel: number; // XP needed for next level
  soulEmbers: number; // Currency
  stats: PlayerStats;
  skillPoints: number;
  cosmetics: CosmeticState;
}

// ============================================================================
// Session State
// ============================================================================

export interface SessionState {
  startTime: number; // Timestamp
  duration: number; // Minutes
  taskId: string;
  isActive: boolean;
  isPaused: boolean;
  isCompromised: boolean;
  idleTime: number; // Seconds
  activeTime: number; // Seconds
}

export interface SessionResult {
  soulInsight: number;
  soulEmbers: number;
  bossProgress: number;
  wasCritical: boolean;
  wasCompromised: boolean;
  idleTime: number;
  activeTime: number;
}

// ============================================================================
// Break State
// ============================================================================

export interface BreakState {
  startTime: number; // Timestamp
  duration: number; // Minutes
  isActive: boolean;
}

// ============================================================================
// Progression State
// ============================================================================

export interface IdleState {
  lastCollectionTime: number; // Timestamp
  accumulatedSouls: number;
}

export interface ProgressionState {
  currentBossIndex: number;
  currentBossResolve: number;
  defeatedBosses: number[];
  idleState: IdleState;
}

export interface StubbornSoul {
  id: number;
  name: string;
  backstory: string;
  initialResolve: number;
  sprite: string;
  unlockLevel: number;
}

export interface BossResult {
  remainingResolve: number;
  wasDefeated: boolean;
  nextBoss?: StubbornSoul;
}

export interface LevelResult {
  newLevel: number;
  leveledUp: boolean;
  skillPointsGranted: number;
}

// ============================================================================
// Task State
// ============================================================================

export interface Subtask {
  id: string;
  taskId: string;
  name: string;
  estimatedDuration: number; // Minutes
  isComplete: boolean;
  createdAt: number; // Timestamp
}

export interface Task {
  id: string;
  goalId: string;
  name: string;
  description: string;
  subtasks: Subtask[];
  isComplete: boolean;
  createdAt: number; // Timestamp
}

export interface Goal {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  createdAt: number; // Timestamp
}

export interface TaskState {
  goals: Goal[];
  nextId: number;
}

// ============================================================================
// Settings State
// ============================================================================

export interface SettingsState {
  defaultSessionDuration: number; // Minutes, default: 25
  defaultBreakDuration: number; // Minutes, default: 5
  autoStartNextSession: boolean; // Default: false
  idleThreshold: number; // Seconds, default: 120
  strictMode: boolean; // Default: false
  discouragedSites: string[]; // Domains
  blockedSites: string[]; // Domains
  animationsEnabled: boolean; // Default: true
  notificationsEnabled: boolean; // Default: true
  soundVolume: number; // 0-1, default: 0.5
  showSessionTimer: boolean; // Default: true - Show remaining time during focus sessions
}

// ============================================================================
// Statistics State
// ============================================================================

export interface StatisticsState {
  totalSessions: number;
  totalFocusTime: number; // Minutes
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string; // ISO date
  bossesDefeated: number;
  totalSoulInsightEarned: number;
  totalSoulEmbersEarned: number;
  totalIdleSoulsCollected: number;
}

// ============================================================================
// Game State (Root)
// ============================================================================

export interface GameState {
  version: number; // Schema version for migrations
  player: PlayerState;
  session: SessionState | null;
  break: BreakState | null;
  progression: ProgressionState;
  tasks: TaskState;
  settings: SettingsState;
  statistics: StatisticsState;
}

// ============================================================================
// Message Types
// ============================================================================

export interface Message {
  type: string;
  payload?: any;
  requestId?: string; // For request-response pattern
}

export enum SiteStatus {
  ALLOWED = "ALLOWED",
  DISCOURAGED = "DISCOURAGED",
  BLOCKED = "BLOCKED",
}
