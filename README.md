# ThemeZip

ThemeZip is a React + TypeScript web app that generates a practical starter theme from a reference image or a saved HTML page.
Upload a screenshot, logo, or UI mockup — or import an HTML file saved from any page (Ctrl+S) — and ThemeZip extracts colors, maps them into semantic tokens, previews the result, and exports theme assets.

## About This Project

This is a completely vibe coded project.

The goal is to move fast from visual inspiration to usable theme tokens and exports, with everything handled locally in the browser for the MVP.

## Features (MVP)

- Image upload and preview
- HTML page import (from a locally saved .html file)
- Color extraction from uploaded image or HTML page
- Semantic theme token generation
- Editable token panel
- Live component/theme preview
- CSS variables export
- React/TypeScript theme export
- ZIP download package
- Dynamic README generation in exported output

## Tech Stack

- React
- TypeScript
- Vite
- JSZip

## Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- npm

### Install

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```text
ThemeZip/
  src/
    components/
    lib/
      color/
      export/
      file/
      html/
      image/
      theme/
    types/
```

## Notes

- This MVP currently focuses on local, browser-based processing.
- Planned non-MVP features (such as auth, saved projects, and integrations) are intentionally out of scope right now.
