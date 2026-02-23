# JuLang Design System v1.0

## Overview

Visual design system for JuLang — an EdTech language learning desktop app. Built around the JL monogram logo (speech bubble form), Manrope typeface, and a restrained purple accent palette.

## Design Principles

1. **Purple is accent, not dominant** — 1-2 purple elements per screen max. Surfaces stay neutral.
2. **Blue for progress** — Accent blue (#4C6FFF) handles progress bars, learning indicators, interactive feedback.
3. **Air over decoration** — Generous spacing, minimal density. Content breathes.
4. **One screen, one action** — Single primary CTA per screen. Secondary actions are visually subdued.
5. **Consistency** — Same radii, same shadows, same spacing everywhere.

## Color System

### Primary
| Token | Hex | Usage |
|-------|-----|-------|
| primary-500 | #8B5CF6 | CTA buttons, active nav, focus rings, links |
| primary-700 | #6D28D9 | Hover/pressed states, strong emphasis |
| primary-600 | #7C3AED | Hover state for primary-500 |
| primary-400 | #A78BFA | Border hover accents, decorative |
| primary-200 | #EDE9FE | Badge backgrounds, subtle tinting |
| primary-100 | #F3EFFF | Active surfaces, hover backgrounds |

### Surfaces
| Token | Hex | Usage |
|-------|-----|-------|
| surface-white | #FAF9FF | Page background |
| surface-pure | #FFFFFF | Cards, modals, inputs |
| surface-light | #F3EFFF | Active states, tinted sections |

### Text
| Token | Hex | Usage |
|-------|-----|-------|
| text-primary | #1F2430 | Headings, body text |
| text-secondary | #5B6178 | Descriptions, secondary content |
| text-tertiary | #8E93A6 | Placeholders, metadata, captions |

### Accent
| Token | Hex | Usage |
|-------|-----|-------|
| accent-500 | #4C6FFF | Progress bars, learning indicators |
| accent-600 | #3B5EEE | Hover state |
| accent-50 | #E8EDFF | Light accent background |

### Borders
| Token | Hex | Usage |
|-------|-----|-------|
| border | #E5E2F0 | Default borders, dividers |
| border-light | #F0EDF8 | Subtle card borders |

### Semantic
| Token | Hex | Usage |
|-------|-----|-------|
| success | #22C55E | Correct answers, positive status |
| warning | #F59E0B | Attention, reminders |
| error | #EF4444 | Errors, deletion, validation |

### Gradients
- **Primary**: `linear-gradient(135deg, #8B5CF6, #6D28D9)` — Logo, hero accents
- **Brand Blend**: `linear-gradient(135deg, #8B5CF6, #4C6FFF)` — Progress indicators
- **Surface Tint**: `linear-gradient(135deg, #F3EFFF, #E8EDFF)` — Background sections

## Typography

**Font**: Manrope (Google Fonts), weights 400-800.

| Level | Size | Weight | Letter-spacing | Line-height | Usage |
|-------|------|--------|----------------|-------------|-------|
| Display | 52px | 800 | -0.035em | 1.1 | Hero text only |
| H1 | 40px | 800 | -0.025em | 1.2 | Page titles |
| H2 | 32px | 700 | -0.025em | 1.25 | Section headings |
| H3 | 26px | 700 | -0.02em | 1.3 | Subsection headings |
| H4 | 21px | 700 | -0.01em | 1.35 | Card titles, feature headings |
| Subheading | 18px | 600 | -0.01em | 1.4 | Section labels |
| Body | 15px | 400 | -0.01em | 1.55 | Main content |
| Small | 13px | 500 | 0 | 1.5 | Secondary info, metadata |
| Caption | 12px | 600 | 0.06em | 1.4 | Labels, uppercase tags |

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| radius-sm | 8px | Small buttons, badges, inner elements |
| radius-md | 12px | Buttons, inputs, tabs |
| radius-lg | 16px | Cards, modals, dropdowns |
| radius-xl | 20px | Hero cards, feature blocks |
| radius-full | 9999px | Pills, toggles, avatars |

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| shadow-xs | `0 1px 2px rgba(31,36,48,0.04)` | Resting buttons |
| shadow-sm | `0 1px 3px ..., 0 1px 2px ...` | Default cards |
| shadow-md | `0 4px 12px ..., 0 1px 4px ...` | Hovered cards |
| shadow-lg | `0 8px 24px ..., 0 2px 8px ...` | Elevated/hovered interactive |
| shadow-xl | `0 16px 40px ..., 0 4px 12px ...` | Modals, dropdowns |
| shadow-primary | `0 4px 14px rgba(139,92,246,0.20)` | Primary button hover |
| shadow-accent | `0 4px 14px rgba(76,111,255,0.20)` | Accent button hover |

## Buttons

### Variants
- **Primary** — Purple fill, white text. For main CTA.
- **Secondary** — White fill, border. For secondary actions.
- **Ghost** — Transparent, text only. For tertiary/contextual actions.
- **Accent** — Blue fill. For progress-related actions (Continue, Next).
- **Danger** — Red border, red text. For destructive actions.

### Sizes
- **sm**: 13px font, 6px 14px padding
- **md**: 15px font, 10px 20px padding
- **lg**: 16px font, 14px 28px padding

### States
- **Hover**: -1px translateY, colored shadow
- **Active**: return to 0, reduced shadow
- **Disabled**: 0.45 opacity, no pointer events
- **Loading**: transparent text, spinning border animation

## Cards

### Variants
- **Default** — Border, no shadow. Static content.
- **Elevated** — Shadow, hover lifts. Primary content blocks.
- **Interactive** — Clickable, hover lifts + purple border. Navigation items.
- **Outlined** — Border only, transparent bg. Secondary content.
- **Accent** — Light purple background. Highlights, tips.

## Inputs

- Border: 1.5px solid #E5E2F0
- Radius: 12px
- Padding: 10px 16px
- Focus: purple border + 3px purple ring (12% opacity)
- Error: red border + red ring
- Disabled: 50% opacity, light bg

## Icons

- Style: Line icons, stroke-width 1.75
- Caps: round stroke-linecap, round stroke-linejoin
- Sizes: 16px (sm), 20px (base), 24px (lg)
- No emoji, no fill, no decorative icons

## Spacing Scale

4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80px

## Transitions

- Fast: 120ms ease (micro-interactions: checkboxes, toggles)
- Base: 200ms ease (buttons, hover states, borders)
- Slow: 350ms ease (cards lifting, progress bars)

## Files

- `design-system.html` — Interactive showcase page
- `tailwind.config.js` — Updated with all design tokens
- `src/styles/globals.css` — Updated with component classes and CSS custom properties
