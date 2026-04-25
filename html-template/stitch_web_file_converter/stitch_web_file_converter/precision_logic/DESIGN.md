---
name: Precision Logic
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3d4947'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fd'
  on-secondary-container: '#57657b'
  tertiary: '#924628'
  on-tertiary: '#ffffff'
  tertiary-container: '#b05e3d'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#d5e3fd'
  secondary-fixed-dim: '#b9c7e0'
  on-secondary-fixed: '#0d1c2f'
  on-secondary-fixed-variant: '#3a485c'
  tertiary-fixed: '#ffdbce'
  tertiary-fixed-dim: '#ffb59a'
  on-tertiary-fixed: '#370e00'
  on-tertiary-fixed-variant: '#773215'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  h1:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  h3:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.05em
  mono-label:
    fontFamily: Manrope
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: '0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin: 32px
---

## Brand & Style

This design system is built on the principles of **Corporate Modernism** with a heavy emphasis on **Minimalism**. The core personality is one of quiet competence—the interface should never get in the way of the task. It is designed to evoke a sense of security and systematic efficiency, ensuring users feel their data is being handled by a professional-grade tool.

The visual language relies on generous whitespace to reduce cognitive load, high-contrast functional elements to guide the eye, and a disciplined adherence to a grid. The aesthetic is "industrial-chic," stripping away decorative fluff in favor of purposeful utility and technical precision.

## Colors

The palette is anchored by a professional **Teal**, chosen for its balance between the trust of blue and the growth/action of green. This color is reserved strictly for primary actions and active progress states.

- **Primary (Teal):** Used for "Convert" buttons, active upload states, and primary navigation.
- **Secondary (Slate):** Used for structural elements, secondary buttons, and technical metadata labels.
- **Neutral (Slate-Grey):** A range of cool greys that define the background layers, borders, and disabled states.
- **Semantic Colors:** Clear Red for errors/deletions and Emerald for successful conversion completion.

The background uses a subtle off-white to reduce eye strain, while cards and containers use pure white to pop against the base layer.

## Typography

This design system utilizes **Manrope** for its balance between geometric modernity and high legibility. The typeface is systematic and scales beautifully from large, bold headlines to tiny, technical labels.

Technical data—such as file sizes (e.g., 2.4 MB) or file extensions (e.g., .SVG)—should use the **mono-label** or **label-caps** styles to distinguish them from descriptive prose. Line heights are kept generous in body text to ensure instructions are easy to parse, while headlines are tightly tracked for a compact, authoritative look.

## Layout & Spacing

The layout follows a **12-column fluid grid** system. For a utility application, density is important, but whitespace is used strategically to prevent the interface from feeling cluttered during complex multi-file operations.

- **The Main Action Hub:** A centered container (max-width 1024px) holds the primary conversion tool.
- **Rhythm:** An 8px baseline grid dictates all vertical and horizontal rhythm. 
- **Margins:** Consistent 32px margins on the screen edges ensure the content feels framed and stable.
- **Alignment:** All technical data (file sizes, status) is right-aligned in list views for easier scanning and comparison.

## Elevation & Depth

To maintain a clean, modern feel, the design system utilizes **Tonal Layers** and **Ambient Shadows**. We avoid heavy dropshadows in favor of subtle depth that communicates hierarchy.

- **Level 0 (Background):** Neutral Slate-50.
- **Level 1 (Cards/Upload Zone):** Pure White with a 1px border (#E2E8F0) and a very soft, diffused shadow (0px 4px 20px rgba(0,0,0,0.04)).
- **Level 2 (Popovers/Tooltips):** Pure White with a slightly sharper shadow to indicate temporary overlay.
- **Interaction:** When a file is dragged over the upload zone, the elevation should increase visually through a slightly darker border and a subtle inner glow using the primary Teal color.

## Shapes

The shape language is **Rounded**, using an 8px (0.5rem) corner radius for most components. This softens the "industrial" feel of the utility, making it more approachable for casual users while remaining structured enough for professional environments.

- **Standard Elements:** 8px radius (Buttons, Input Fields, Cards).
- **Large Elements:** 16px radius (Upload Zone, Modals).
- **Small Elements:** 4px radius (Checkboxes, Tag/Chips).
- **Progress Bars:** Fully rounded (pill-shaped) to represent movement and fluidity.

## Components

### Upload Zones
The primary upload area uses a dashed border (2px) in a medium slate color. On drag-over, the background shifts to a very faint teal tint, and the border becomes solid primary teal. Include a prominent "plus" icon and a clear "Browse Files" call-to-action.

### Progress Bars
Progress bars consist of a 8px tall track in light grey. The fill is a solid primary teal. For indeterminate states (processing), use a subtle animated diagonal stripe pattern within the teal fill. Success states turn the entire bar emerald green.

### File Type Icons
Icons are designed on a 24px grid. Use a duotone style where the icon background is a light tint of a color associated with the file type (e.g., light red for PDF, light blue for DOCX) and the foreground glyph is a darker shade.

### Action Buttons
- **Primary:** Solid Teal background with white text. High-contrast, bold weight.
- **Secondary:** Outlined Slate-700 with a 1px border.
- **Ghost:** No border or background, used for "Clear All" or "Remove" actions to reduce visual noise.

### File List Items
Each file in the queue is a horizontal row with a 1px bottom border. It contains: File Icon -> File Name -> Progress/Status -> Action (X to remove). Use the `mono-label` typography for the file size metadata.