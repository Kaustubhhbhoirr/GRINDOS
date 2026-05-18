---
name: Grind Metric
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#dbc1b9'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#a38c85'
  outline-variant: '#55433d'
  surface-tint: '#ffb59d'
  primary: '#ffb59d'
  on-primary: '#5d1901'
  primary-container: '#da7756'
  on-primary-container: '#541500'
  inverse-primary: '#994528'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#5ddac8'
  on-tertiary: '#003731'
  tertiary-container: '#00a494'
  on-tertiary-container: '#00312c'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbd0'
  primary-fixed-dim: '#ffb59d'
  on-primary-fixed: '#390b00'
  on-primary-fixed-variant: '#7b2f13'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#7cf7e4'
  tertiary-fixed-dim: '#5ddac8'
  on-tertiary-fixed: '#00201c'
  on-tertiary-fixed-variant: '#005048'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
  surface-elevated: '#222222'
  border-subtle: '#2a2a2a'
  easy: '#4caf7d'
  medium: '#f0a030'
  hard: '#e05555'
  revisit: '#f0c040'
  text-primary: '#f0f0f0'
  text-secondary: '#888888'
  text-muted: '#444444'
typography:
  wordmark:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  stats-lg:
    fontFamily: JetBrains Mono
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  sidebar-w: 56px
  panel-w: 35%
---

## Brand & Style

This design system is engineered for the focused developer. It rejects the soft, bubbly aesthetics of modern SaaS in favor of a **Minimalist Dev-Tool** aesthetic. The visual language is high-density, functional, and evokes the focused atmosphere of a terminal emulator or a high-end IDE.

The brand personality is disciplined, serious, and utilitarian. It prioritizes data clarity over decorative flourishes. By utilizing a "Dark-Only" architecture, the system reduces eye strain during long "grind" sessions. The "Retro-Modern" vibe is achieved through sharp corners, monospaced data points, and a restricted color palette that avoids gradients and soft shadows in favor of structural borders and purposeful accents.

**Design Principles:**
- **Utility First:** Every element must serve a functional purpose in tracking progress.
- **Data over Chrome:** Minimize UI chrome; let the code snippets and problem counts take center stage.
- **Information Density:** Use compact layouts and small font sizes (12px-14px) typical of professional engineering tools.

## Colors

The palette is strictly nocturnal. The foundation is built on deep blacks and charcoal grays, ensuring the primary **Claude Code Orange** (#da7756) acts as a high-contrast beacon for calls to action and progress indicators.

### Functional Palette
- **Primary Accent:** Used for the wordmark, primary actions, and "Solved" status.
- **Difficulty Scale:** These colors follow industry-standard coding platform conventions (Green/Yellow/Red) but are tuned for high legibility against the #1a1a1a surface.
- **Neutral Stack:**
    - `Background`: #0d0d0d (Deepest layer)
    - `Surface`: #1a1a1a (Standard cards and containers)
    - `Surface Elevated`: #222222 (Hover states or modals)
    - `Border`: #2a2a2a (The primary structural tool)

**Strict Constraint:** No gradients are permitted. Opacity scales of the primary orange are used for heatmaps/contribution graphs to show intensity without introducing new hues.

## Typography

This design system uses a dual-font strategy to separate **Interface Narrative** from **Technical Data**.

- **Inter:** Handles all UI instructions, descriptions, and labels where readability and flow are paramount. Headings in Inter should use slightly tighter letter spacing to achieve that "retro warmth" mentioned in the brand pillars.
- **JetBrains Mono:** Reserved for all numerical data, code snippets, the wordmark, and metadata labels. This reinforces the "Grind" aspect of the app—making numbers feel like code output.

**Hierarchy Rules:**
- Use `stats-lg` for big numerical tallies (e.g., "Total Problems Solved").
- Use `code-sm` for problem titles or monospaced inputs.
- Large headings (24px) should be bold to provide strong structural anchors on a dark canvas.

## Layout & Spacing

The system follows a strict **8px grid**. Layouts are structured using a high-density logic, favoring clear borders over excessive whitespace.

### Layout Model
- **Grid:** Use a 12-column system for dashboard layouts.
- **Side Panel:** For problem details or code review, a 35% width side panel slides in from the right.
- **Sidebar:** A narrow 56px fixed sidebar (icons only) maximizes the horizontal real estate for data tables and code.
- **Section Gaps:** Maintain a consistent 24px gap between major card sections.

### Breakpoints
- **Mobile (< 768px):** Sidebar moves to a bottom navigation bar. Side panels become full-screen overlays.
- **Desktop (>= 1280px):** Fixed width layout for the main content (max 1440px) to prevent line lengths from becoming illegible.

## Elevation & Depth

In this system, depth is communicated through **Tonal Layering** and **Borders**, not shadows.

- **Level 0 (Background):** #0d0d0d.
- **Level 1 (Card/Surface):** #1a1a1a with a 1px solid border (#2a2a2a).
- **Level 2 (Hover/Active):** When a card is focused, the border transitions to the primary orange (#da7756).
- **Depth Markers:** There are no soft shadows. For critical overlays (modals), use a solid 2px border of #2a2a2a and a slight background dimming (60% black).

**The "Glow" Exception:**
The only instance of "softness" allowed is a very subtle, tight outer glow (0px 0px 8px) on primary buttons or active "today" calendar squares to simulate a retro CRT or neon-indicator effect.

## Shapes

The shape language is "Soft-Square." We avoid fully circular elements (except for specific status dots) to maintain a structured, engineering-grade appearance.

- **Cards & Containers:** 8px radius (rounded-lg).
- **Buttons & Inputs:** 6px radius (rounded-md).
- **Difficulty Pills:** 4px radius (rounded-sm).
- **Calendar Heatmap Squares:** 2px radius or sharp.

Borders are always 1px solid unless indicating a "Today" state, which increases to 2px.

## Components

### Buttons
- **Primary:** Background #da7756, text #f0f0f0 (bold). On hover, apply a subtle orange glow.
- **Secondary:** Transparent background, 1px border #da7756, text #da7756.
- **Destructive:** Background #e05555, text #f0f0f0.

### Difficulty Pills
Compact labels for problem difficulty:
- **Easy:** BG `#1a3a2a` | Border/Text `#4caf7d`.
- **Medium:** BG `#3a2a0a` | Border/Text `#f0a030`.
- **Hard:** BG `#3a1a1a` | Border/Text `#e05555`.

### Calendar Heatmap
- **Empty Squares:** #1a1a1a background.
- **Solved Squares:** #da7756. Use opacity (20%, 40%, 70%, 100%) based on the volume of problems solved.
- **Revisited:** Solid #f0c040.
- **Today Marker:** Add a 2px solid #f0f0f0 border.

### Inputs & Tables
- **Fields:** Background #0d0d0d, border #2a2a2a, text Inter 14px. Focus state: border #da7756.
- **Tables:** Use #2a2a2a for horizontal dividers only. Rows should use JetBrains Mono for all ID numbers and timestamps.

### Cards
- Standard background #1a1a1a. 1px border #2a2a2a. 
- Hover state: The border color changes to #da7756. This is the primary way to show interactivity.