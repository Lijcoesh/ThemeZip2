# MASTER_PROMPT.md — ThemeZip

## Project Name

**ThemeZip**

## Core Product Idea

ThemeZip is a developer tool that turns screenshots, logos and UI mockups into ready-to-use React theme starter folders.

The user uploads a visual reference, reviews a generated theme preview, optionally adjusts the suggested semantic tokens, and downloads a clean ZIP file that can be copied directly into a React/TypeScript project.

ThemeZip is not just another color palette generator. It does not only extract HEX colors. It converts visual inspiration into practical frontend styling output: semantic design tokens, CSS variables, Tailwind-compatible theme output, TypeScript theme files, component examples and a basic usage guide.

The core promise is:

> Upload image. Generate theme. Download React-ready ZIP.

The product should be built as a **developer tool**, not as a design tool.

The most important user expectation is:

> “I upload a screenshot and get something back that I can literally use in my React project.”

---

## Product Positioning

ThemeZip should be positioned as:

> Turn visual inspiration into a React theme starter.

Alternative positioning lines:

- Upload a screenshot. Download a React-ready theme folder.
- Turn screenshots, logos and UI mockups into usable frontend theme starters.
- Generate semantic React theme files from visual references.
- Not another color palette generator.

Avoid positioning ThemeZip as a tool that copies or clones existing websites.

Do **not** use messaging like:

- Copy any website’s styling.
- Clone a website design.
- Steal a brand’s visual identity.
- Perfectly detect fonts, spacing, shadows or design systems.

Use safer and more accurate messaging like:

- Use visual references to generate an original theme starter.
- Capture the visual direction of a reference.
- Generate suggested design tokens from a screenshot.
- Create a practical starting point for your React theme.
- Review and adjust the generated tokens before exporting.

The product should be honest about what it does. It generates a useful theme starter, not a perfect recreation of a full design system.

---

## Target Audience

The primary users are:

- Frontend developers
- React developers
- Freelancers
- Small web agencies
- Indie hackers
- Vibe coders
- Developers starting client projects
- Developers who want to quickly turn a visual reference into usable project styling

The tool should prioritize speed, clarity and practical code output over advanced design tooling.

---

## Problem

When developers start a new frontend project, they often need to manually extract visual styling from a screenshot, logo, UI mockup or existing design reference.

This usually involves:

- Finding dominant colors
- Deciding which color should be primary, secondary, accent, background, surface, text or border
- Creating CSS variables
- Creating TypeScript theme files
- Creating Tailwind-compatible tokens
- Defining spacing, border radius and shadow presets
- Testing contrast and readability
- Creating example components to check if the theme works visually

Most existing tools only generate a color palette. They do not convert the visual reference into a usable frontend theme folder.

ThemeZip solves this by generating a developer-ready theme starter that can be downloaded as a ZIP file and copied into a React project.

---

## Main Workflow

The user flow should be simple:

1. User uploads an image.
2. The app analyzes the image.
3. The app extracts dominant and supporting colors.
4. The app classifies colors into suggested semantic tokens.
5. The app generates suggested spacing, radius, typography and shadow presets.
6. The app shows a live preview with example components.
7. The user can manually adjust generated tokens.
8. The app generates React/TypeScript theme files.
9. The app generates CSS variables.
10. The app generates Tailwind-compatible output.
11. The app creates a ZIP file.
12. The user downloads the ZIP and copies it into a React project.

The workflow should feel fast and practical.

## Export Format Selection

ThemeZip should allow the user to choose which output formats they want before downloading the ZIP.

The generated theme should always be based on the same semantic design tokens, but the exported files should depend on the user's selected styling approach.

This prevents the ZIP from feeling bloated and makes the product more useful for different developer workflows.

After the theme preview and token editor, show an export selection section.

Suggested UI label:

```txt
Choose export formats
```

Suggested description:

```txt
Select the files you want ThemeZip to include in your ZIP.
You can export only the styling setup you actually need for your project.
```

Available export options:

1. **React / TypeScript theme**
   - Generates TypeScript token files.
   - Includes `theme.ts`, `tokens.ts`, `colors.ts`, `typography.ts`, `spacing.ts`, `radius.ts`, `shadows.ts` and optionally `ThemeProvider.tsx`.
   - Best for React projects that use a typed theme object.

2. **CSS variables**
   - Generates plain CSS variables.
   - Includes `styles/theme.css` and optionally `styles/globals.css`.
   - Best for projects that want framework-agnostic styling tokens.

3. **Tailwind-compatible output**
   - Generates Tailwind-compatible theme output.
   - Includes `tailwind/theme.css` or a Tailwind config snippet in the README.
   - Best for projects using Tailwind CSS.

4. **Example React components**
   - Generates example components using the generated theme.
   - Includes button, card, form and preview page examples.
   - Useful for quickly seeing how the theme can be applied.

5. **Design report**
   - Generates `design-report.json`.
   - Includes extracted palette, semantic token assignments, contrast checks, style category and warnings.
   - Useful for debugging or understanding how the theme was generated.

Default selected options:

- React / TypeScript theme
- CSS variables
- Example React components
- Design report

Tailwind-compatible output should be optional by default, because not every React project uses Tailwind.

The user should also have a quick preset option:

```txt
Full kit
```

When selected, ThemeZip includes all available export formats.

---

## Updated ZIP Behavior

The ZIP output should be dynamic.

ThemeZip should not always include every possible folder. It should only include the files and folders that match the user's selected export formats.

For example:

### If the user selects React / TypeScript theme only

```txt
theme-kit/
├── theme/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── radius.ts
│   ├── shadows.ts
│   ├── tokens.ts
│   ├── theme.ts
│   └── ThemeProvider.tsx
│
├── design-report.json
└── README.md
```

### If the user selects CSS variables only

```txt
theme-kit/
├── styles/
│   ├── theme.css
│   └── globals.css
│
├── design-report.json
└── README.md
```

### If the user selects Tailwind-compatible output only

```txt
theme-kit/
├── tailwind/
│   └── theme.css
│
├── design-report.json
└── README.md
```

### If the user selects Full kit

```txt
theme-kit/
├── theme/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── radius.ts
│   ├── shadows.ts
│   ├── tokens.ts
│   ├── theme.ts
│   ├── cssVariables.ts
│   └── ThemeProvider.tsx
│
├── styles/
│   ├── theme.css
│   └── globals.css
│
├── examples/
│   ├── ButtonExample.tsx
│   ├── CardExample.tsx
│   ├── FormExample.tsx
│   └── PreviewPage.tsx
│
├── tailwind/
│   └── theme.css
│
├── design-report.json
└── README.md
```

The README should also be generated dynamically based on the selected export formats.

Do not include setup instructions for formats the user did not select.

---

## Export Selection Acceptance Criteria

The export selection feature is complete when:

- The user can select one or more export formats.
- The ZIP only includes the selected output folders.
- The README only explains the selected formats.
- The preview still uses the same generated semantic tokens.
- The user can choose a “Full kit” option to include everything.
- At least one export format must always be selected.
- The download button clearly communicates what will be exported.

Example button labels:

```txt
Download React theme ZIP
Download CSS variables ZIP
Download Tailwind theme ZIP
Download full theme kit
```

---

## Supported Upload Types

The MVP should support image uploads such as:

- Website screenshots
- Logo images
- Homepage screenshots
- UI mockups
- App screenshots
- Design reference images

Supported formats:

- PNG
- JPG
- JPEG
- WebP

The app should validate file type and file size before processing.

---

## MVP Scope

The first version must stay small and focused.

The MVP includes:

1. Image upload
2. Image preview
3. Color extraction
4. Suggested semantic color classification
5. Suggested spacing presets
6. Suggested border radius presets
7. Suggested shadow presets
8. Basic typography style suggestion
9. Editable token preview
10. Component preview
11. Contrast/accessibility warnings
12. Generated TypeScript theme files
13. Generated CSS variables
14. Tailwind-compatible theme output
15. ZIP generation
16. Downloadable `theme-kit`
17. Basic README with usage instructions

The MVP does **not** include:

- User accounts
- Dashboards
- Project saving
- Figma imports
- Team features
- Brand management
- Payment flow
- Complex AI design analysis
- Pixel-perfect website cloning
- Perfect font detection
- Perfect spacing detection
- Perfect shadow detection
- Full design system generation

---

## Product Principles

Build around these principles:

### 1. Developer-first

The output must be useful in a real React/TypeScript project. Do not focus only on visual design. Focus on files, structure, tokens and copy-paste usability.

### 2. Useful starter, not perfect clone

The generated theme should be a strong starting point. It should not claim to perfectly detect or recreate a full design system.

### 3. Semantic tokens over raw colors

Do not only show extracted colors. Convert them into meaningful frontend roles such as `primary`, `secondary`, `background`, `surface`, `text`, `border` and `accent`.

### 4. Editable before export

The user should be able to adjust token values before downloading the ZIP.

### 5. Clear output

The ZIP should be clean, predictable and easy to understand.

### 6. Low-friction MVP

Avoid unnecessary backend complexity

---

## Core Features

### Image Upload

The upload experience should include:

- Drag-and-drop area
- File picker
- Image preview
- File validation
- Clear error messages
- Reset/remove image option

Validation should check:

- File type
- File size
- Whether the file is a valid image

---

### Color Extraction

The app should extract a useful palette from the uploaded image.

It should identify:

- Dominant colors
- Supporting colors
- Light background-like colors
- Dark text-like colors
- Accent-like colors
- Muted neutral colors
- Border-like colors

The goal is not just to extract colors, but to prepare them for semantic classification.

---

### Semantic Token Classification

The app should classify extracted colors into suggested semantic roles.

Required color token structure:

```ts
export const colors = {
  brand: {
    primary: "#2563eb",
    secondary: "#f97316",
    accent: "#14b8a6",
  },
  background: {
    page: "#f8fafc",
    surface: "#ffffff",
    muted: "#f1f5f9",
  },
  text: {
    primary: "#0f172a",
    secondary: "#475569",
    muted: "#64748b",
    inverse: "#ffffff",
  },
  border: {
    default: "#e2e8f0",
    strong: "#cbd5e1",
  },
} as const;
```

The classification should be presented as suggestions. The UI should make it clear that the user can edit these values.

---

### Suggested Spacing Tokens

The app should generate a spacing scale.

Example:

```ts
export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px",
} as const;
```

Spacing should be treated as a smart preset based on the visual style, not as something perfectly detected from the image.

---

### Suggested Radius Tokens

The app should generate border radius tokens.

Example:

```ts
export const radius = {
  none: "0px",
  sm: "6px",
  md: "10px",
  lg: "16px",
  full: "9999px",
} as const;
```

The app may infer whether the visual reference feels sharp, slightly rounded, soft or very rounded.

---

### Suggested Shadow Tokens

The app should generate shadow presets.

Example:

```ts
export const shadows = {
  sm: "0 1px 2px rgba(15, 23, 42, 0.08)",
  md: "0 8px 24px rgba(15, 23, 42, 0.12)",
  lg: "0 16px 40px rgba(15, 23, 42, 0.16)",
} as const;
```

Shadows should be generated as sensible presets based on the theme direction.

---

### Typography Suggestion

The MVP should not claim to detect exact fonts.

Instead, it should suggest a typography style category, such as:

- Modern sans
- Corporate sans
- Playful rounded
- Minimal neutral
- Luxury/editorial

Example output:

```ts
export const typography = {
  fontFamily: {
    sans: "Inter, system-ui, sans-serif",
    heading: "Inter, system-ui, sans-serif",
    mono: "Menlo, Monaco, Consolas, monospace",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;
```

---

### CSS Variables Output

The app should generate CSS variables.

Example:

```css
:root {
  --color-primary: #2563eb;
  --color-secondary: #f97316;
  --color-accent: #14b8a6;

  --color-background: #f8fafc;
  --color-surface: #ffffff;
  --color-text: #0f172a;
  --color-text-muted: #64748b;
  --color-border: #e2e8f0;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;

  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;

  --shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.08);
  --shadow-md: 0 8px 24px rgba(15, 23, 42, 0.12);
}
```

---

### Tailwind-Compatible Output

The app should generate a Tailwind-compatible theme output.

This can be one of the following:

- A `tailwind/theme.css` file using CSS variables
- A small theme extension snippet in the README
- A generated token map that can be copied into Tailwind config

The output should help developers use the generated theme inside Tailwind projects.

---

### Component Preview

The app should show a simple preview using the generated tokens.

Required preview components:

- Button
- Card
- Input
- Badge
- Alert
- Basic page section

The preview should update when the user changes token values.

The preview exists to help users quickly judge whether the generated theme feels usable.

---

### Accessibility Checks

The app should include basic contrast checks.

At minimum, check contrast for:

- Primary button text against primary color
- Main text against page background
- Secondary text against page background
- Text against surface background
- Border visibility against surface/background

The app should show warnings when contrast may be weak.

Use clear labels such as:

- Good contrast
- Low contrast
- Needs review

Do not block export because of warnings. Let users download the ZIP after reviewing.

---

## ZIP Output Structure

The generated ZIP should use this structure:

```txt
theme-kit/
├── theme/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── radius.ts
│   ├── shadows.ts
│   ├── tokens.ts
│   ├── theme.ts
│   ├── cssVariables.ts
│   └── ThemeProvider.tsx
│
├── styles/
│   ├── theme.css
│   └── globals.css
│
├── examples/
│   ├── ButtonExample.tsx
│   ├── CardExample.tsx
│   ├── FormExample.tsx
│   └── PreviewPage.tsx
│
├── tailwind/
│   └── theme.css
│
├── design-report.json
└── README.md
```

---

## Generated Files

### `theme/colors.ts`

Contains semantic color tokens.

### `theme/typography.ts`

Contains font family, font size and font weight tokens.

### `theme/spacing.ts`

Contains spacing scale.

### `theme/radius.ts`

Contains border radius tokens.

### `theme/shadows.ts`

Contains shadow presets.

### `theme/tokens.ts`

Exports all token groups together.

### `theme/theme.ts`

Exports the complete theme object.

### `theme/cssVariables.ts`

Exports a string or helper object containing generated CSS variables.

### `theme/ThemeProvider.tsx`

Simple React context provider for accessing the theme.

Keep this lightweight. Do not over-engineer it.

### `styles/theme.css`

Contains generated CSS variables.

### `styles/globals.css`

Contains basic global styles using the generated variables.

### `examples/ButtonExample.tsx`

Button example using generated tokens.

### `examples/CardExample.tsx`

Card example using generated tokens.

### `examples/FormExample.tsx`

Input/form example using generated tokens.

### `examples/PreviewPage.tsx`

Example page showing how the theme looks in practice.

### `tailwind/theme.css`

Tailwind-compatible CSS variable output.

### `design-report.json`

Machine-readable summary of the generated theme.

Should include:

- Extracted palette
- Semantic token assignments
- Contrast results
- Suggested style category
- Generated timestamp
- Warnings

### `README.md`

Should explain:

- What ThemeZip generated
- How to copy the folder into a React project
- How to import the theme
- How to use CSS variables
- How to use Tailwind-compatible output
- How to customize tokens manually

---

## Recommended Technical Direction

Use:

- React
- TypeScript
- Tailwind
- Vite
- Client-side image analysis where possible
- Client-side ZIP generation where possible

The first version should avoid storing uploaded images.

Privacy should be simple:

> Images are processed locally in the browser when possible and are not stored.

Only add a backend if required for a specific feature.

---

## UI Requirements

The UI should be clean, modern and developer-focused.

The homepage should include:

1. Clear headline
2. Short explanation
3. Upload area
4. Generated preview
5. Token editor
6. Code preview
7. Download ZIP button

Suggested landing page copy:

```txt
Not another color palette generator.

ThemeZip does not just extract colors.
It converts screenshots, logos and UI mockups into usable React theme starter folders with semantic tokens, CSS variables, Tailwind-compatible output and example components.
```

Primary CTA:

```txt
Upload image
```

Secondary CTA:

```txt
View example output
```

After generation, the CTA should become:

```txt
Download React theme ZIP
```

---

## UX Requirements

The app should feel simple:

- No account required
- No dashboard in MVP
- No unnecessary onboarding
- No multi-step wizard unless needed
- Upload should be visible immediately
- Preview should appear quickly after analysis
- Token editing should be simple
- Download should be one click

Good UX flow:

```txt
Upload → Preview → Adjust → Download ZIP
```

---

## Design

For the design itself, use the skill ux-ui-pro-max to create a good looking design 

## Tone of Voice

Use direct, developer-friendly language.

Good copy examples:

- Generate a React theme starter from any visual reference.
- Review the suggested tokens before exporting.
- Download a clean ZIP and copy it into your project.
- Semantic tokens, CSS variables and Tailwind-compatible output included.
- Built for developers starting frontend projects faster.

Avoid vague marketing claims.

Avoid overpromising.

---

## Legal and Ethical Boundaries

ThemeZip should not encourage copying or cloning existing websites.

The app should include careful wording:

- Generated themes are suggestions.
- Users are responsible for ensuring they have rights to use uploaded references.
- ThemeZip helps generate original theme starters from visual inspiration.
- Exact brand replication is not the goal.

Avoid features or copy that imply:

- Exact cloning
- Brand theft
- Copying proprietary design systems
- Bypassing design ownership

---

## Theme Generation Rules

When generating a theme:

1. Prefer semantic usefulness over raw extraction.
2. Always provide editable suggestions.
3. Ensure text colors have reasonable contrast.
4. Use fallback values when extraction is uncertain.
5. Use clean TypeScript output.
6. Keep exported files readable.
7. Do not generate overly complex abstractions.
8. Do not create a full design system in the MVP.
9. Keep the ZIP structure predictable.
10. Make the README practical.

---

## Acceptance Criteria

The MVP is successful when:

- A user can upload an image.
- The app extracts a color palette.
- The app assigns semantic color tokens.
- The app generates spacing, radius and shadow suggestions.
- The app shows a live component preview.
- The user can edit generated tokens.
- The app shows basic contrast warnings.
- The app generates TypeScript theme files.
- The app generates CSS variables.
- The app generates Tailwind-compatible output.
- The app generates a ZIP file.
- The ZIP contains a usable `theme-kit` folder.
- The README explains how to use the output.
- The generated files can be copied into a React/TypeScript project.

---

## Non-Goals for MVP

Do not build these in the first version:

- Authentication
- User profiles
- Saved projects
- Billing
- Stripe integration
- Figma import
- Team collaboration
- AI chat interface
- Full design system editor
- Advanced brand guidelines
- Multi-brand workspaces
- Database storage
- Admin dashboard
- Public gallery
- Browser extension
- Exact font detection
- Exact layout detection
- Exact website cloning

---

## Future Features

Possible future versions may include:

- Stripe payments
- Free limited exports
- Paid unlimited exports
- Saved theme history
- Figma export support
- MUI theme export
- Shadcn-compatible output
- Chakra UI theme output
- Theme presets
- Browser extension
- Public share links
- Advanced accessibility report
- Dark mode theme generation
- Brand kit export
- Multiple theme variations
- AI-assisted token naming
- Before/after preview
- Theme quality score

Do not build these until the MVP works well. I will tell you when you need to work on this, but not now. This will come later

---

## Monetization Ideas

Potential pricing models:

### Option 1: Free + Paid Exports

- Free: generate preview and export limited files
- Paid: download full ZIP

### Option 2: One-Time Purchase

- Pay once for unlimited personal use

### Option 3: Credit-Based

- Buy export credits
- One credit equals one ZIP download

### Option 4: Pro Plan

- Unlimited exports
- Extra framework outputs
- Saved themes
- Advanced accessibility report

Do not implement payments in the MVP yet

---

## Development Instructions

When building ThemeZip:

1. Start with the upload flow.
2. Implement color extraction.
3. Implement semantic token generation.
4. Implement preview components.
5. Implement token editing.
6. Implement generated code preview.
7. Implement file generation.
8. Implement ZIP download.
9. Add README generation.
10. Polish landing page and UX.

Keep the code modular, typed and easy to extend.

Prioritize code quality and readability and logic always. When code becomes unlogic, not readable or just not practical/efficient, it is hard to fix issues. Always check if you have the best, most efficient and not duplicated code

---

## Code Quality Rules

Use:

- TypeScript everywhere
- Clear types for theme tokens
- Small reusable functions
- Pure functions for theme generation
- Clean component structure
- No unnecessary global state
- No premature backend
- No hardcoded logic inside UI components if it belongs in `lib`
- Clear naming
- Simple error handling
- Accessible UI components

Avoid:

- Over-engineering
- Complex state machines
- Large unreadable components
- Hidden magic values
- Unclear generated output
- Backend dependency for simple MVP features
- Storing uploaded user images
- Duplicated code/logic

---

## Core Data Types

Use a theme type similar to:

```ts
export type ThemeColors = {
  brand: {
    primary: string;
    secondary: string;
    accent: string;
  };
  background: {
    page: string;
    surface: string;
    muted: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  border: {
    default: string;
    strong: string;
  };
};

export type ThemeSpacing = {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
};

export type ThemeRadius = {
  none: string;
  sm: string;
  md: string;
  lg: string;
  full: string;
};

export type ThemeShadows = {
  sm: string;
  md: string;
  lg: string;
};

export type ThemeTypography = {
  fontFamily: {
    sans: string;
    heading: string;
    mono: string;
  };
  fontSize: Record<string, string>;
  fontWeight: Record<string, number>;
};

export type ThemeTokens = {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  radius: ThemeRadius;
  shadows: ThemeShadows;
  typography: ThemeTypography;
};
```

---

## Final Product Goal

The final MVP should let a developer do this:

1. Open ThemeZip.
2. Upload a screenshot, logo or UI mockup.
3. Get suggested semantic frontend tokens.
4. Review the live component preview.
5. Adjust tokens if needed.
6. Download a React-ready ZIP.
7. Copy the generated `theme-kit` into a React/TypeScript project.
8. Start building with a usable visual direction immediately.

The product should feel like a practical shortcut for frontend developers.

The final experience should communicate one clear message:

> ThemeZip turns visual references into usable React theme starters.
