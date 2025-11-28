# Theme Components Guide

## Theme Structure

Each theme has **5 color components** that control different parts of the UI:

```typescript
{
  primary: "#667eea",           // Main gradient start color
  secondary: "#764ba2",         // Main gradient end color
  accent: "#4fc3f7",            // Highlight/emphasis color
  background: "#1a1a2e",        // Base background color
  backgroundGradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"
}
```

## Where Each Component is Used

### 1. **Primary Color** (`--theme-primary`)
Used for gradient starts and main color emphasis:
- **Buttons**: Start of gradient on primary buttons
- **Progress bars**: Start of XP bar gradient
- **Level circle**: Start of background gradient
- **Borders**: Some accent borders (when combined with secondary)

### 2. **Secondary Color** (`--theme-secondary`)
Used for gradient ends:
- **Buttons**: End of gradient on primary buttons
- **Progress bars**: End of XP bar gradient
- **Level circle**: End of background gradient
- **Complements primary**: Always paired with primary in gradients

### 3. **Accent Color** (`--theme-accent`)
Used for highlights and important values:
- **Stat values**: Spirit, Harmony, Soulflow numbers
- **Achievement values**: Session count, focus time, etc.
- **Active states**: Active tab indicator, selected items
- **Focus borders**: Input fields when focused
- **Level circle border**: The ring around the level badge
- **Checkboxes**: Checkbox accent color
- **Slider thumbs**: Range slider handle color
- **Section titles**: Goal titles, section headers
- **Volume display**: Volume percentage text

### 4. **Background Color** (`--theme-background`)
Used for solid backgrounds:
- **Player card**: Main background of the card (applied via JavaScript)
- **Solid color**: Makes each theme more visually distinct
- **Darkest color**: The base dark color that defines the theme's mood

### 5. **Background Gradient** (used by popup only)
**Full gradient string** - Used by the popup for its body background:
- **Popup body**: `document.body.style.background = theme.colors.backgroundGradient`
- **Player card**: Uses solid `background` color instead (more distinct)
- **Why different?**: The popup uses gradients for depth, but the card uses solid colors so themes are more visually different from each other

**Note**: Each theme's gradient is very subtle (dark to slightly darker), so the player card uses the solid `background` color for better theme distinction.

## All 6 Themes

### 1. **Twilight Veil** (Default - Free)
```
Primary:    #667eea (Purple-blue)
Secondary:  #764ba2 (Deep purple)
Accent:     #4fc3f7 (Cyan)
Background: #1a1a2e (Dark blue-gray) ← Card background
```
**Vibe**: Classic, mystical, balanced

### 2. **Crimson Dusk** (100 Embers)
```
Primary:    #ff6b6b (Bright red)
Secondary:  #ee5a6f (Rose red)
Accent:     #ffd93d (Golden yellow)
Background: #2d1b1b (Dark red-brown) ← Card background
```
**Vibe**: Fiery, passionate, intense

### 3. **Emerald Grove** (150 Embers)
```
Primary:    #51cf66 (Bright green)
Secondary:  #37b24d (Forest green)
Accent:     #94d82d (Lime green)
Background: #1a2e1a (Dark green) ← Card background
```
**Vibe**: Natural, peaceful, calming

### 4. **Golden Dawn** (200 Embers)
```
Primary:    #ffd700 (Gold)
Secondary:  #ffed4e (Light gold)
Accent:     #ffa94d (Orange)
Background: #2e2a1a (Dark brown-gold) ← Card background
```
**Vibe**: Radiant, enlightened, warm

### 5. **Midnight Ocean** (250 Embers)
```
Primary:    #339af0 (Ocean blue)
Secondary:  #1c7ed6 (Deep ocean blue)
Accent:     #74c0fc (Light blue)
Background: #1a1e2e (Dark navy) ← Card background
```
**Vibe**: Deep, contemplative, serene

### 6. **Violet Dream** (300 Embers)
```
Primary:    #9775fa (Violet)
Secondary:  #845ef7 (Deep violet)
Accent:     #d0bfff (Light lavender)
Background: #221a2e (Dark purple) ← Card background
```
**Vibe**: Mystical, spiritual, dreamy

## Background Colors Comparison

The card now uses **solid background colors** instead of gradients:
- **Twilight Veil**: Dark blue-gray (#1a1a2e)
- **Crimson Dusk**: Dark red-brown (#2d1b1b) - Warmer, reddish
- **Emerald Grove**: Dark green (#1a2e1a) - Green tint
- **Golden Dawn**: Dark brown-gold (#2e2a1a) - Warm brown
- **Midnight Ocean**: Dark navy (#1a1e2e) - Cool blue
- **Violet Dream**: Dark purple (#221a2e) - Purple tint

Each background color has a **distinct hue** that makes themes easily distinguishable!

## Visual Examples

### Button with Theme
```
Background: linear-gradient(135deg, PRIMARY 0%, SECONDARY 100%)
Text: White
```
**Twilight Veil**: Purple-blue → Deep purple gradient
**Crimson Dusk**: Bright red → Rose red gradient
**Emerald Grove**: Bright green → Forest green gradient

### Stat Value with Theme
```
Color: ACCENT
```
**Twilight Veil**: Cyan (#4fc3f7)
**Crimson Dusk**: Golden yellow (#ffd93d)
**Emerald Grove**: Lime green (#94d82d)

### XP Bar with Theme
```
Background: linear-gradient(90deg, PRIMARY 0%, SECONDARY 100%)
```
**Twilight Veil**: Purple-blue → Deep purple (horizontal)
**Golden Dawn**: Gold → Light gold (horizontal)
**Midnight Ocean**: Ocean blue → Deep ocean blue (horizontal)

## How to Add a New Theme

1. Add to `COSMETIC_THEMES` array in `src/constants.ts`
2. Define all 5 color components
3. Choose colors that work well together:
   - **Primary + Secondary**: Should create a smooth gradient
   - **Accent**: Should contrast well with dark backgrounds
   - **Background**: Dark enough for white text to be readable
   - **Gradient**: Should provide subtle depth

Example:
```typescript
{
  id: "sunset-blaze",
  name: "Sunset Blaze",
  description: "A warm sunset theme",
  cost: 350,
  colors: {
    primary: "#ff7e5f",        // Coral
    secondary: "#feb47b",      // Peach
    accent: "#ffd700",         // Gold
    background: "#2a1810",     // Dark brown
    backgroundGradient: "linear-gradient(135deg, #2a1810 0%, #3d2415 100%)",
  },
}
```

## Testing Themes

To test how a theme looks:
1. Open options page
2. Go to Preferences tab
3. Select theme from dropdown
4. Check these elements:
   - Primary buttons (should show gradient)
   - Stat values (should show accent color)
   - Active tab (should show accent color)
   - XP bars (should show gradient)
   - Input focus borders (should show accent color)
5. Open player card to see full theme application

## Design Tips

- **Contrast**: Accent color should be bright enough to stand out
- **Harmony**: Primary and secondary should blend smoothly
- **Readability**: Background should be dark enough for white text
- **Consistency**: All colors should feel like they belong together
- **Accessibility**: Ensure sufficient contrast ratios for text
