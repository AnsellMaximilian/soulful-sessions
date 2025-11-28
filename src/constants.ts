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
    finalConversation: [
      {
        speaker: 'shepherd',
        text: "You've been running for so long. What are you chasing?"
      },
      {
        speaker: 'soul',
        text: "The finish line... I can see it, but I can never reach it. Every step forward, it moves further away."
      },
      {
        speaker: 'shepherd',
        text: "Perhaps the race was never about the finish. What did you learn along the way?"
      },
      {
        speaker: 'soul',
        text: "I... I learned discipline. Perseverance. I inspired others to run their own races. Maybe that was enough."
      },
      {
        speaker: 'shepherd',
        text: "Then you've already crossed every finish line that mattered. Your journey inspired countless others to begin theirs."
      }
    ],
    resolution: "The Restless Athlete finally stops running. They realize that their legacy wasn't in crossing a single finish line, but in the countless miles they ran and the inspiration they provided to others. With a peaceful smile, they take their final rest, their race complete.",
  },
  {
    id: 1,
    name: "The Unfinished Scholar",
    backstory:
      "A researcher who died before publishing their life's work. They haunt the library, searching for one more source.",
    initialResolve: 200,
    sprite: "scholar.png",
    unlockLevel: 3,
    finalConversation: [
      {
        speaker: 'shepherd',
        text: "Your research sits unfinished. What were you trying to prove?"
      },
      {
        speaker: 'soul',
        text: "Everything. I needed one more citation, one more experiment. My work was so close to completion."
      },
      {
        speaker: 'shepherd',
        text: "And what did your research teach you, even incomplete?"
      },
      {
        speaker: 'soul',
        text: "That knowledge builds upon itself. My notes, my methods—they became the foundation for others who came after."
      },
      {
        speaker: 'shepherd',
        text: "Then your work was never unfinished. You were part of something greater than any single publication."
      }
    ],
    resolution: "The Unfinished Scholar closes their final book. They understand now that scholarship is not about individual glory, but about contributing to the endless pursuit of knowledge. Their research, though unpublished, lives on in the work of those who followed. They depart in peace, knowing their contribution mattered.",
  },
  {
    id: 2,
    name: "The Regretful Parent",
    backstory:
      "A parent who missed their child's milestones. They linger at the playground, watching families.",
    initialResolve: 350,
    sprite: "parent.png",
    unlockLevel: 5,
    finalConversation: [
      {
        speaker: 'shepherd',
        text: "You watch these families with such longing. What do you wish you could change?"
      },
      {
        speaker: 'soul',
        text: "I missed so much. First steps, first words, birthdays. I was always working, always busy. I thought I had time."
      },
      {
        speaker: 'shepherd',
        text: "What moments did you share with them?"
      },
      {
        speaker: 'soul',
        text: "Quiet mornings. Bedtime stories. The way they smiled when I came home. Small moments I took for granted."
      },
      {
        speaker: 'shepherd',
        text: "Those small moments were everything. Your child remembers your love, not your absence."
      }
    ],
    resolution: "The Regretful Parent finally leaves the playground. They realize that love isn't measured in milestones attended, but in the countless small moments of connection and care. Their child grew up knowing they were loved, and that is the greatest gift any parent can give. They find peace in the memories they did create.",
  },
  {
    id: 3,
    name: "The Forgotten Artist",
    backstory:
      "A painter whose masterpiece was never seen. They wander galleries, invisible among the crowds.",
    initialResolve: 500,
    sprite: "artist.png",
    unlockLevel: 7,
    finalConversation: [
      {
        speaker: 'shepherd',
        text: "Your painting sits hidden away. Does art need an audience to have meaning?"
      },
      {
        speaker: 'soul',
        text: "I poured my soul into that canvas. If no one sees it, did I create anything at all?"
      },
      {
        speaker: 'shepherd',
        text: "What did the act of creation give you?"
      },
      {
        speaker: 'soul',
        text: "Purpose. Joy. A way to express what words couldn't capture. The painting changed me, even if it changed no one else."
      },
      {
        speaker: 'shepherd',
        text: "Then it was seen by the one person who needed to see it most—you. Art transforms the artist first."
      }
    ],
    resolution: "The Forgotten Artist steps away from the galleries. They understand now that creation itself is the reward, not recognition. The act of bringing beauty into the world changed them profoundly, and that transformation was their true masterpiece. They depart with the quiet satisfaction of an artist who created for the right reasons.",
  },
  {
    id: 4,
    name: "The Lonely Musician",
    backstory:
      "A composer whose symphony was never performed. They sit at a silent piano, fingers hovering over keys.",
    initialResolve: 700,
    sprite: "musician.png",
    unlockLevel: 10,
    finalConversation: [
      {
        speaker: 'shepherd',
        text: "Your symphony remains unheard. What music did you hope to share?"
      },
      {
        speaker: 'soul',
        text: "A piece that captured the beauty of fleeting moments. Joy, sorrow, hope—all woven together. But silence is all that remains."
      },
      {
        speaker: 'shepherd',
        text: "Did you hear it when you composed it?"
      },
      {
        speaker: 'soul',
        text: "Every note, every harmony. It played in my mind like a living thing. I heard it perfectly."
      },
      {
        speaker: 'shepherd',
        text: "Then it was performed, in the most intimate concert hall of all. Music exists first in the heart of its creator."
      }
    ],
    resolution: "The Lonely Musician finally plays their symphony, not for an audience, but for themselves. They realize that music's power lies not in grand performances, but in its ability to express the inexpressible. Their symphony lived fully in their imagination and heart, and that was enough. They fade away with the final, perfect note still resonating.",
  },
  {
    id: 5,
    name: "The Devoted Gardener",
    backstory:
      "A botanist who never saw their rare seed bloom. They tend to a garden that exists only in memory.",
    initialResolve: 950,
    sprite: "gardener.png",
    unlockLevel: 13,
    finalConversation: [
      {
        speaker: 'shepherd',
        text: "You planted a seed that never bloomed in your lifetime. Was your work wasted?"
      },
      {
        speaker: 'soul',
        text: "I prepared the soil, provided water and care. But I never saw the flower. All that patience for nothing."
      },
      {
        speaker: 'shepherd',
        text: "What did you learn from tending the garden?"
      },
      {
        speaker: 'soul',
        text: "That growth takes time. That care matters even when results aren't immediate. That some seeds bloom long after the gardener is gone."
      },
      {
        speaker: 'shepherd',
        text: "Your seed did bloom—just not in the way you expected. You cultivated patience, dedication, and hope. Those blooms never fade."
      }
    ],
    resolution: "The Devoted Gardener sets down their tools. They understand now that a gardener's true legacy isn't in the flowers they see, but in the care they provide and the lessons they embody. Their rare seed may have bloomed years later, or perhaps it taught others the value of patient cultivation. Either way, their garden was never empty. They rest in peace, knowing they tended well.",
  },
  {
    id: 6,
    name: "The Ambitious Inventor",
    backstory:
      "An engineer whose breakthrough was stolen. They tinker endlessly with a machine that will never work.",
    initialResolve: 1250,
    sprite: "inventor.png",
    unlockLevel: 16,
    finalConversation: [
      {
        speaker: 'shepherd',
        text: "Your invention was taken from you. Does that erase what you created?"
      },
      {
        speaker: 'soul',
        text: "They claimed it as their own. My name was forgotten while they received all the credit. My life's work, stolen."
      },
      {
        speaker: 'shepherd',
        text: "But who truly invented it? Who solved the impossible problem?"
      },
      {
        speaker: 'soul',
        text: "I did. I know I did. The breakthrough was mine, even if the world doesn't know it."
      },
      {
        speaker: 'shepherd',
        text: "Then you carry something they never can—the knowledge that you were capable of greatness. That truth can never be stolen."
      }
    ],
    resolution: "The Ambitious Inventor stops tinkering with their phantom machine. They realize that innovation lives in the mind that conceives it, not in the credit received. Their breakthrough changed the world, regardless of whose name was attached. The satisfaction of solving the unsolvable was always theirs to keep. They depart with the quiet pride of a true inventor.",
  },
  {
    id: 7,
    name: "The Wandering Explorer",
    backstory:
      "A traveler who never reached the summit. They climb an endless mountain, always one step from the peak.",
    initialResolve: 1600,
    sprite: "explorer.png",
    unlockLevel: 20,
    finalConversation: [
      {
        speaker: 'shepherd',
        text: "The summit remains just out of reach. Why do you keep climbing?"
      },
      {
        speaker: 'soul',
        text: "Because it's there. Because I came so close. One more step, one more day, and I would have made it."
      },
      {
        speaker: 'shepherd',
        text: "What did you see on your journey up the mountain?"
      },
      {
        speaker: 'soul',
        text: "Wonders I never imagined. Vistas that took my breath away. Challenges that made me stronger. Every step revealed something new."
      },
      {
        speaker: 'shepherd',
        text: "Then you've already reached countless summits. The peak was never the destination—the climb was the journey itself."
      }
    ],
    resolution: "The Wandering Explorer stops climbing and looks back at the path they've traveled. They see now that exploration is not about reaching a single destination, but about the courage to venture into the unknown. Every step of their journey was a summit in its own right. They rest at last, content with the magnificent journey they completed.",
  },
  {
    id: 8,
    name: "The Silent Poet",
    backstory:
      "A writer whose words were burned before being read. They whisper verses to the wind that carries them away.",
    initialResolve: 2000,
    sprite: "poet.png",
    unlockLevel: 24,
    finalConversation: [
      {
        speaker: 'shepherd',
        text: "Your words were destroyed before anyone could read them. Do they still exist?"
      },
      {
        speaker: 'soul',
        text: "They're gone. Ash and smoke. All those verses, all those truths I tried to capture—erased."
      },
      {
        speaker: 'shepherd',
        text: "But you remember them, don't you?"
      },
      {
        speaker: 'soul',
        text: "Every word. Every rhythm. They live in me, even if nowhere else."
      },
      {
        speaker: 'shepherd',
        text: "Then they were never destroyed. Words that change the writer have already fulfilled their purpose. You became the poem you wrote."
      }
    ],
    resolution: "The Silent Poet stops whispering to the wind. They understand now that writing is an act of self-discovery, not just communication. Their verses shaped who they became, and that transformation was the true poetry. The words lived most fully in the heart that conceived them. They depart in peace, their greatest poem complete—the life they lived.",
  },
  {
    id: 9,
    name: "The Eternal Guardian",
    backstory:
      "A protector who failed their final duty. They stand watch over ruins, guarding nothing but regret.",
    initialResolve: 2500,
    sprite: "guardian.png",
    unlockLevel: 28,
    finalConversation: [
      {
        speaker: 'shepherd',
        text: "You guard ruins now. What are you protecting?"
      },
      {
        speaker: 'soul',
        text: "Nothing. I failed when it mattered most. I couldn't protect what I was sworn to defend."
      },
      {
        speaker: 'shepherd',
        text: "How many times did you succeed before that final moment?"
      },
      {
        speaker: 'soul',
        text: "Countless times. Years of vigilance. Decades of keeping them safe. But the one time I failed..."
      },
      {
        speaker: 'shepherd',
        text: "That one failure doesn't erase a lifetime of protection. You gave everything you had. That is what it means to be a guardian."
      }
    ],
    resolution: "The Eternal Guardian finally lays down their watch. They understand now that true guardianship is measured not by the one time they fell, but by the countless times they stood strong. Their lifetime of protection mattered, and their final failure was simply the moment they gave everything they had left. They rest at last, their duty fulfilled with honor.",
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
