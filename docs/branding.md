# Branding

## Overview

Companion uses a consistent visual identity across all modules. Brand assets are defined once and referenced everywhere. No duplication, no recreation, no variation.

## Single Source of Truth

The master branding asset is:

| Asset | Location | Format |
|-------|----------|--------|
| Logo | `assets/logo.svg` | SVG (master) |
| Colors | `src/companion/brand-colors.ts` | TypeScript constants |

### Logo Source

`assets/logo.svg` is the master asset. All other logo representations are derived from it.

| Derived Asset | Location | Source |
|---------------|----------|--------|
| SVG string | `src/companion/brand-logo.ts` | Generated from `assets/logo.svg` |
| PNG icons | `assets/icons/` | Generated from `assets/logo.svg` |
| Data URI | `src/companion/brand-logo.ts` | Generated from `assets/logo.svg` |

**Rule:** `assets/logo.svg` is the source of truth. `brand-logo.ts` is a generated artifact.

## Logo Usage

### Rules

1. **Never redraw or simplify the logo.** The official SVG must be used exactly as provided.
2. **Never embed logo SVG inline.** Always import from `brand-logo.ts`.
3. **Never recreate the logo for different contexts.** The same SVG is used everywhere.
4. **Never modify logo colors or proportions.**
5. **All icon generation must use `assets/logo.svg`** as the source.

### Access

```typescript
import { COMPANION_LOGO_SVG, COMPANION_LOGO_DATA_URI } from "./brand-logo";

// In DOM creation
const logo = document.createElement("span");
logo.innerHTML = COMPANION_LOGO_SVG;

// In CSS backgrounds
element.style.backgroundImage = `url(${COMPANION_LOGO_DATA_URI})`;
```

### Exported Values

| Export | Type | Description |
|--------|------|-------------|
| `COMPANION_LOGO_SVG` | `string` | Raw SVG markup for innerHTML injection |
| `COMPANION_LOGO_DATA_URI` | `string` | Data URI for CSS background usage |

## Icon Generation

### Requirements

- All icons must be derived from `assets/logo.svg`
- No custom icon creation without approval
- Icons must work at standard sizes
- Icons must be recognizable at 16px

### Required Sizes

| Size | Usage | Filename |
|------|-------|----------|
| 16px | Favicon, browser tab | `icon-16x16.png` |
| 32px | Extension icon | `icon-32x32.png` |
| 48px | Chrome Web Store listing | `icon-48x48.png` |
| 128px | Chrome Web Store detail | `icon-128x128.png` |

### Naming Convention

```
icon-{size}x{size}.png
```

### Generation Process

1. Start with `assets/logo.svg`
2. Render at target size
3. Export as PNG
4. Save to `assets/icons/`

## Color System

### Brand Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| Primary | `#2F6BFF` | `rgb(47, 107, 255)` | Launcher, active states, accents |
| Hover | `#4A82FF` | `rgb(74, 130, 255)` | Interactive element hover |
| Dark BG | `#1F2235` | `rgb(31, 34, 53)` | Widget backgrounds, menus |
| Accent | `#59AFFF` | `rgb(89, 175, 255)` | Highlighted values |
| Text | `#FFFFFF` | `rgb(255, 255, 255)` | Primary text on dark |
| Text Secondary | `#E0E0E0` | `rgb(224, 224, 224)` | Secondary text |
| Success | `#81C784` | `rgb(129, 199, 132)` | Active status indicators |
| Error | `#EF5350` | `rgb(239, 83, 80)` | Close button, error states |

### Access

```typescript
import { BRAND_COLORS } from "./brand-colors";

element.style.background = BRAND_COLORS.PRIMARY;
element.style.color = BRAND_COLORS.TEXT;
```

## Typography

### Font Stack

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

### Usage

- All UI text uses the system font stack
- No custom font loading
- No web font dependencies
- Consistent sizing per [UI Guidelines](ui-guidelines.md)

## Brand Consistency

### Do

- Use brand colors from `brand-colors.ts`
- Use the official logo from `brand-logo.ts`
- Follow spacing and typography from [UI Guidelines](ui-guidelines.md)
- Maintain visual consistency across modules
- Generate icons from `assets/logo.svg`

### Don't

- Create custom color palettes
- Redraw or modify the logo
- Use third-party icon libraries
- Introduce custom fonts
- Mix brand styles between modules
- Use inline SVG without importing from `brand-logo.ts`

## Future Branding

When new modules are added:

1. Use existing brand colors
2. Import the official logo
3. Follow the established visual language
4. Do not create module-specific branding
5. All modules share the same visual identity
