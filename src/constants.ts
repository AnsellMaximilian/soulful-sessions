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
    finalConversation: [],
    resolution: "",
  },
  {
    id: 1,
    name: "The Unfinished Scholar",
    backstory:
      "A researcher who died before publishing their life's work. They haunt the library, searching for one more source.",
    initialResolve: 200,
    sprite: "scholar.png",
    unlockLevel: 3,
    finalConversation: [],
    resolution: "",
  },
  {
    id: 2,
    name: "The Regretful Parent",
    backstory:
      "A parent who missed their child's milestones. They linger at the playground, watching families.",
    initialResolve: 350,
    sprite: "parent.png",
    unlockLevel: 5,
    finalConversation: [],
    resolution: "",
  },
  {
    id: 3,
    name: "The Forgotten Artist",
    backstory:
      "A painter whose masterpiece was never seen. They wander galleries, invisible among the crowds.",
    initialResolve: 500,
    sprite: "artist.png",
    unlockLevel: 7,
    finalConversation: [],
    resolution: "",
  },
  {
    id: 4,
    name: "The Lonely Musician",
    backstory:
      "A composer whose symphony was never performed. They sit at a silent piano, fingers hovering over keys.",
    initialResolve: 700,
    sprite: "musician.png",
    unlockLevel: 10,
    finalConversation: [],
    resolution: "",
  },
  {
    id: 5,
    name: "The Devoted Gardener",
    backstory:
      "A botanist who never saw their rare seed bloom. They tend to a garden that exists only in memory.",
    initialResolve: 950,
    sprite: "gardener.png",
    unlockLevel: 13,
    finalConversation: [],
    resolution: "",
  },
  {
    id: 6,
    name: "The Ambitious Inventor",
    backstory:
      "An engineer whose breakthrough was stolen. They tinker endlessly with a machine that will never work.",
    initialResolve: 1250,
    sprite: "inventor.png",
    unlockLevel: 16,
    finalConversation: [],
    resolution: "",
  },
  {
    id: 7,
    name: "The Wandering Explorer",
    backstory:
      "A traveler who never reached the summit. They climb an endless mountain, always one step from the peak.",
    initialResolve: 1600,
    sprite: "explorer.png",
    unlockLevel: 20,
    finalConversation: [],
    resolution: "",
  },
  {
    id: 8,
    name: "The Silent Poet",
    backstory:
      "A writer whose words were burned before being read. They whisper verses to the wind that carries them away.",
    initialResolve: 2000,
    sprite: "poet.png",
    unlockLevel: 24,
    finalConversation: [],
    resolution: "",
  },
  {
    id: 9,
    name: "The Eternal Guardian",
    backstory:
      "A protector who failed their final duty. They stand watch over ruins, guarding nothing but regret.",
    initialResolve: 2500,
    sprite: "guardian.png",
    unlockLevel: 28,
    finalConversation: [],
    resolution: "",
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
  autoCompleteTask: false,
  idleThreshold: 120,
  strictMode: false,
  discouragedSites: [],
  blockedSites: [],
  animationsEnabled: true,
  notificationsEnabled: true,
  soundVolume: 0.5,
  showSessionTimer: true,
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

export const CURRENT_STATE_VERSION = 1; // Increment when schema changes

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

// ============================================================================
// Cosmetic Catalog
// ============================================================================

export interface CosmeticTheme {
  id: string;
  name: string;
  description: string;
  cost: number; // Soul Embers
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    backgroundGradient: string;
  };
}

export interface CosmeticSprite {
  id: string;
  name: string;
  description: string;
  cost: number; // Soul Embers
  imagePath: string;
}

export const COSMETIC_THEMES: CosmeticTheme[] = [
  {
    id: "default",
    name: "Twilight Veil",
    description: "The classic Soul Shepherd aesthetic",
    cost: 0,
    colors: {
      primary: "#667eea",
      secondary: "#764ba2",
      accent: "#4fc3f7",
      background: "#1a1a2e",
      backgroundGradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    },
  },
  {
    id: "crimson-dusk",
    name: "Crimson Dusk",
    description: "A fiery theme for passionate shepherds",
    cost: 100,
    colors: {
      primary: "#ff6b6b",
      secondary: "#ee5a6f",
      accent: "#ffd93d",
      background: "#2d1b1b",
      backgroundGradient: "linear-gradient(135deg, #2d1b1b 0%, #3d1f1f 100%)",
    },
  },
  {
    id: "emerald-grove",
    name: "Emerald Grove",
    description: "A natural theme for peaceful souls",
    cost: 150,
    colors: {
      primary: "#51cf66",
      secondary: "#37b24d",
      accent: "#94d82d",
      background: "#1a2e1a",
      backgroundGradient: "linear-gradient(135deg, #1a2e1a 0%, #1f3d1f 100%)",
    },
  },
  {
    id: "golden-dawn",
    name: "Golden Dawn",
    description: "A radiant theme for enlightened guides",
    cost: 200,
    colors: {
      primary: "#ffd700",
      secondary: "#ffed4e",
      accent: "#ffa94d",
      background: "#2e2a1a",
      backgroundGradient: "linear-gradient(135deg, #2e2a1a 0%, #3d361f 100%)",
    },
  },
  {
    id: "midnight-ocean",
    name: "Midnight Ocean",
    description: "A deep theme for contemplative shepherds",
    cost: 250,
    colors: {
      primary: "#339af0",
      secondary: "#1c7ed6",
      accent: "#74c0fc",
      background: "#1a1e2e",
      backgroundGradient: "linear-gradient(135deg, #1a1e2e 0%, #1f2d3d 100%)",
    },
  },
  {
    id: "violet-dream",
    name: "Violet Dream",
    description: "A mystical theme for spiritual guides",
    cost: 300,
    colors: {
      primary: "#9775fa",
      secondary: "#845ef7",
      accent: "#d0bfff",
      background: "#221a2e",
      backgroundGradient: "linear-gradient(135deg, #221a2e 0%, #2d1f3d 100%)",
    },
  },
];

export const COSMETIC_SPRITES: CosmeticSprite[] = [
  {
    id: "default",
    name: "Classic Shepherd",
    description: "The original Soul Shepherd appearance",
    cost: 0,
    imagePath: "assets/sprites/sprite_classic_shepherd.png",
  },
  {
    id: "hooded-guide",
    name: "Hooded Guide",
    description: "A mysterious shepherd cloaked in shadows",
    cost: 150,
    imagePath: "assets/sprites/sprite_hooded_guide.png",
  },
  {
    id: "radiant-guardian",
    name: "Radiant Guardian",
    description: "A shepherd emanating gentle light",
    cost: 200,
    imagePath: "assets/sprites/sprite_radiant_guardian.png",
  },
  {
    id: "ethereal-wanderer",
    name: "Ethereal Wanderer",
    description: "A shepherd who walks between worlds",
    cost: 250,
    imagePath: "assets/sprites/sprite_ethereal_wanderer.png",
  },
];
