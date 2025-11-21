import {
  StubbornSoul,
  PlayerStats,
  SettingsState,
  PlayerState,
  ProgressionState,
  TaskState,
  StatisticsState,
  CosmeticState,
} from "./types";

// ============================================================================
// Stubborn Soul Catalog
// ============================================================================

export const STUBBORN_SOULS: StubbornSoul[] = [
  {
    id: 0,
    name: "The Restless Athlete",
    backstory:
      "A runner who never crossed the finish line they dreamed of. They cling to the track, running endless laps.",
    initialResolve: 100,
    sprite: "athlete.png",
    unlockLevel: 1,
  },
  {
    id: 1,
    name: "The Unfinished Scholar",
    backstory:
      "A researcher who died before publishing their life's work. They haunt the library, searching for one more source.",
    initialResolve: 200,
    sprite: "scholar.png",
    unlockLevel: 3,
  },
  {
    id: 2,
    name: "The Regretful Parent",
    backstory:
      "A parent who missed their child's milestones. They linger at the playground, watching families.",
    initialResolve: 350,
    sprite: "parent.png",
    unlockLevel: 5,
  },
  {
    id: 3,
    name: "The Forgotten Artist",
    backstory:
      "A painter whose masterpiece was never seen. They wander galleries, invisible among the crowds.",
    initialResolve: 500,
    sprite: "artist.png",
    unlockLevel: 7,
  },
  {
    id: 4,
    name: "The Lonely Musician",
    backstory:
      "A composer whose symphony was never performed. They sit at a silent piano, fingers hovering over keys.",
    initialResolve: 700,
    sprite: "musician.png",
    unlockLevel: 10,
  },
  {
    id: 5,
    name: "The Devoted Gardener",
    backstory:
      "A botanist who never saw their rare seed bloom. They tend to a garden that exists only in memory.",
    initialResolve: 950,
    sprite: "gardener.png",
    unlockLevel: 13,
  },
  {
    id: 6,
    name: "The Ambitious Inventor",
    backstory:
      "An engineer whose breakthrough was stolen. They tinker endlessly with a machine that will never work.",
    initialResolve: 1250,
    sprite: "inventor.png",
    unlockLevel: 16,
  },
  {
    id: 7,
    name: "The Wandering Explorer",
    backstory:
      "A traveler who never reached the summit. They climb an endless mountain, always one step from the peak.",
    initialResolve: 1600,
    sprite: "explorer.png",
    unlockLevel: 20,
  },
  {
    id: 8,
    name: "The Silent Poet",
    backstory:
      "A writer whose words were burned before being read. They whisper verses to the wind that carries them away.",
    initialResolve: 2000,
    sprite: "poet.png",
    unlockLevel: 24,
  },
  {
    id: 9,
    name: "The Eternal Guardian",
    backstory:
      "A protector who failed their final duty. They stand watch over ruins, guarding nothing but regret.",
    initialResolve: 2500,
    sprite: "guardian.png",
    unlockLevel: 28,
  },
];

// ============================================================================
// Game Formulas
// ============================================================================

export const FORMULAS = {
  // Reward Calculations
  SOUL_INSIGHT_BASE_MULTIPLIER: 10,
  SOUL_INSIGHT_SPIRIT_BONUS: 0.1,

  SOUL_EMBERS_BASE_MULTIPLIER: 2,
  SOUL_EMBERS_SOULFLOW_BONUS: 0.05,

  CRITICAL_HIT_MULTIPLIER: 1.5,
  COMPROMISE_PENALTY_MULTIPLIER: 0.7,

  BOSS_DAMAGE_MULTIPLIER: 0.5,

  // Idle Collection
  IDLE_COLLECTION_BASE_RATE: 1, // 1 soul per 5 minutes
  IDLE_COLLECTION_INTERVAL: 5, // Minutes
  IDLE_COLLECTION_SOULFLOW_BONUS: 0.1,
  CONTENT_SOUL_TO_EMBERS: 5, // 5 embers per content soul

  // Level Progression
  LEVEL_THRESHOLD_BASE: 100,
  LEVEL_THRESHOLD_EXPONENT: 1.5,
  SKILL_POINTS_PER_LEVEL: 1,

  // Stat Upgrades
  STAT_UPGRADE_BASE_COST: 10,
  STAT_UPGRADE_COST_MULTIPLIER: 1.5,

  // Session Validation
  IDLE_TIME_THRESHOLD_PERCENT: 0.25, // 25% idle time marks as compromised
  EMERGENCY_END_PENALTY: 0.5, // 50% reward reduction
};

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_PLAYER_STATS: PlayerStats = {
  spirit: 1,
  harmony: 0.05, // 5% crit chance
  soulflow: 1,
};

export const DEFAULT_COSMETICS: CosmeticState = {
  ownedThemes: ["default"],
  ownedSprites: ["default"],
  activeTheme: "default",
  activeSprite: "default",
};

export const DEFAULT_PLAYER_STATE: PlayerState = {
  level: 1,
  soulInsight: 0,
  soulInsightToNextLevel: 100,
  soulEmbers: 0,
  stats: { ...DEFAULT_PLAYER_STATS },
  skillPoints: 0,
  cosmetics: { ...DEFAULT_COSMETICS },
};

export const DEFAULT_PROGRESSION_STATE: ProgressionState = {
  currentBossIndex: 0,
  currentBossResolve: STUBBORN_SOULS[0].initialResolve,
  defeatedBosses: [],
  idleState: {
    lastCollectionTime: Date.now(),
    accumulatedSouls: 0,
  },
};

export const DEFAULT_TASK_STATE: TaskState = {
  goals: [],
  nextId: 1,
};

export const DEFAULT_SETTINGS: SettingsState = {
  defaultSessionDuration: 25,
  defaultBreakDuration: 5,
  autoStartNextSession: false,
  idleThreshold: 120,
  strictMode: false,
  discouragedSites: [],
  blockedSites: [],
  animationsEnabled: true,
  notificationsEnabled: true,
  soundVolume: 0.5,
};

export const DEFAULT_STATISTICS: StatisticsState = {
  totalSessions: 0,
  totalFocusTime: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastSessionDate: "",
  bossesDefeated: 0,
  totalSoulInsightEarned: 0,
  totalSoulEmbersEarned: 0,
  totalIdleSoulsCollected: 0,
};

// ============================================================================
// Validation Constants
// ============================================================================

export const VALIDATION = {
  MIN_SESSION_DURATION: 5, // Minutes
  MAX_SESSION_DURATION: 120, // Minutes
  MIN_BREAK_DURATION: 1, // Minutes
  MAX_BREAK_DURATION: 30, // Minutes
  IDLE_DETECTION_THRESHOLD: 120, // Seconds (2 minutes)
};

// ============================================================================
// UI Constants
// ============================================================================

export const UI = {
  POPUP_WIDTH: 400,
  POPUP_HEIGHT: 600,
  ANIMATION_DURATION: 300, // Milliseconds
};
