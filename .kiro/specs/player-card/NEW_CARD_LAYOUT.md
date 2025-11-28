# New Pokemon Card Layout Design

## Layout Structure

Based on the mockup provided:

```
┌─────────────────────────────────────────────────────────┐
│ [Level] │ INITIATE SHEPHERD    │ [XP BAR overlapping] │
├─────────────────────────┬───────────────────────────────┤
│                         │ ┌───────────────────────────┐ │
│                         │ │                           │ │
│    SPRITE HERE          │ │   ACHIEVEMENTS (Yellow)   │ │
│                         │ │                           │ │
│                         │ └───────────────────────────┘ │
├─────┬─────┬─────┬───────┤ ┌───────────────────────────┐ │
│ 333 │ 333 │ 333 │ ORANGE│ │                           │ │
│STAT │STAT │STAT │  SEP  │ │   CURRENCIES (Red)        │ │
└─────┴─────┴─────┴───────┴─┴───────────────────────────┘ │
```

## Key Features

1. **Level Circle** - Top-left with diagonal separator line
2. **Character Name** - Top-center header
3. **XP Bar** - Top-right with negative margin overlap into sections below
4. **Sprite Box** - Large left section
5. **Stats Row** - 3 stats at bottom-left
6. **Orange Separator** - Vertical divider using theme colors
7. **Achievements Box** - Top-right (yellow in mockup) using theme colors
8. **Currencies Box** - Bottom-right (red in mockup) using theme colors

## Theme Integration

- Orange separator uses theme accent color
- Achievements box uses theme primary color
- Currencies box uses theme secondary color
- All sections adapt to active theme
