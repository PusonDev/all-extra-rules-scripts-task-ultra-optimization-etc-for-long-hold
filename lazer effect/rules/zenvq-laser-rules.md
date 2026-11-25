---
name: zenvq laser rules
description: Master rules and engineering standards for ZenVQ Universal Precision Laser Cursor across all websites and projects.
trigger: model_decision
---

# ⚡ MASTER RULE: `zenvq laser rules` (UNIVERSAL PRECISION LASER CURSOR)

Whenever laser cursor effects, interactive cursors or beam particles are requested across ANY website, template or project within the ZenVQ Ecosystem (Next.js, React, Vite, HTML, Webflow, Shopify or custom CMS), adhere strictly to the following architectural laws:

---

## 1. CORE ARCHITECTURAL LAWS
- **Zero Raw CSS / DOM Cursor Bloat:** NEVER create multiple DOM elements (`div` tags) for cursor trails or particle dots. ALWAYS use a single full-viewport HTML5 Canvas (`#zenvq-laser-canvas` / `<canvas>`) running a hardware-accelerated 60-120fps `requestAnimationFrame` loop.
- **Precision Laser Optics (Calibrated Sizing & Visibility across All Sites):**
  - Focal Dot Radius: Calibrated needle-sharp `2.0px` (normal) and `2.6px` (interactive hover) across all sites.
  - Dual-Layer Bloom Halo: Outer halo `5.5px-6.5px` (normal) and `7.5px-8.5px` (hover) paired with inner corona `3.2px-3.8px` (normal) and `4.2px-5.0px` (hover).
  - Shadow Blur: Crisp `4.0px` to `7.5px`.
  - Ribbon Width: Sleek `1.6px` to `2.2px` (filament inner core `0.6px` to `1.3px`).
  - HUD Reticle Box: Micro `8.5px` corners (`2.4px` bracket arms) with hairline stroke (`0.9px`).
- **Double-Pass Laser Ribbon Trailing:**
  - Pass 1 (Outer Bloom): Subtle stroke with controlled `shadowBlur` and progressive alpha decay matching the active theme glow color.
  - Pass 2 (Filament Core): Crisp thin stroke with high alpha matching dark/light mode core color.
- **Micro-Sparks & Energetic Photons:** High-speed cursor movement (`speed > 22`) dynamically ejects directional micro-sparks opposing motion vectors. Clicks produce radial burst photons.
- **Shockwave Ripples:** Mouse click creates an expanding radial ring shockwave with smooth alpha decay.
- **Interactive HUD Reticle:** On hovering interactive elements (`a`, `button`, `[data-interactive]`, `.cursor-pointer`), smooth lerp expands rotating precision corner brackets `[ ]` with center tick crosshairs.
- **Canonical Central Hub Source:** The master repository and single source of truth for this tool is:
  `D:\All coding installation tools\All My Main Project in real world\all extra rules, scripts, task etc for long hold\lazer effect`

---

## 2. ACCESSIBILITY & ERGONOMIC INTEGRITY
- **Dual Pointer Engine (Precision Mouse + Touch Finger Gestures):** Seamlessly operate across both desktop precision mouse pointers and mobile/tablet touchscreens. When touched with a finger (`touchstart`), deploy an expanding shockwave ripple and radial micro-photons from beneath the touch point. When dragging (`touchmove`), draw a smooth continuous laser ribbon trailing the finger and emit directional sparks on fast swipes. Use passive event listeners (`{ passive: true }`) so native scrolling performance is 100% unimpeded. On finger lift (`touchend`), allow the trail to naturally fade over a 220ms decay cycle.
- **Reduced Motion Respect (`prefers-reduced-motion: reduce`):** Disable high-speed spark ejection and rapid shockwaves when reduced motion is preferred by the user.
- **Text Selection Preservation:** Keep native text selection I-beam (`cursor: text !important`) over `input`, `textarea` and `[contenteditable="true"]`. Suppress cursor trail rendering over active text fields.
- **Native Pointer Suppression:** Add `.laser-cursor-active` and `.zenvq-laser-active` to `<html>` to set `cursor: none !important` exclusively on desktop interactive elements (`@media (hover: hover) and (pointer: fine)`).

---

## 3. COLOR TOKENS, DARK/LIGHT POLICIES & CONTEXTUAL PAGE PRESERVATION
- **Universal Dark/Light Theme Law (Zero Exception):**
  - **Dark Theme (`.dark`, `data-theme="dark"` or dark canvas `#09090B`, `#050505`):** Laser MUST BE PURE WHITE (`#FFFFFF`, glow `rgba(255, 255, 255, 0.85)`).
  - **Light Theme (`.light`, `data-theme="light"` or light canvas `#FAFAFA`, `#FFFFFF`):** Laser MUST BE PURE BLACK (`#000000`, glow `rgba(0, 0, 0, 0.75)`).
- **Agency Ecosystem Theme Preservation (`agency.zenvq.com`):**
  - **Engineering Foundry (Homepage `/`, `[data-hub="engineering"]`):**
    - Dark mode: Electric Cyan `#6FFFE9` (RGB: `111, 255, 233`), secondary `#A5FFEF`, white core `#FFFFFF`.
    - Light mode: Deep Teal `#0F766E`, secondary `#0D9488`.
  - **Creative Studio (`/creative` route, `tab=creative`, `[data-hub="creative"]`):**
    - Dark mode: Luxury Purple/Violet `#A855F7` (RGB: `168, 85, 247`), secondary `#C084FC`, core `#FAF5FF`.
    - Light mode: Deep Purple `#7C3AED`, secondary `#A855F7`.
    - Strict lock: When on `/creative`, cursor remains 100% locked to Creative Purple.
  - **Contextual Hover Morphing:** Hovering over elements with `data-theme="creative"`, `data-particle-theme="creative"` or `a[href*="/creative"]` smoothly transforms the laser into Creative Purple. Hovering `data-theme="engineering"` smoothly transforms into Engineering Cyan.
- **Other Presets:**
  - `luxury`: Gold / Amber (`#F59E0B`, `#FDE68A`)
  - `cyberpunk`: Pink / Neon (`#EC4899`, `#00E599`)

---

## 4. 1-LINE DEPLOYMENT ACROSS ALL ECOSYSTEM SITES
- **Vanilla HTML / Static / Webflow / Shopify:**
  ```html
  <script src="https://laser-api.zenvq.com/v1/laser.js" data-auto-laser="true" data-theme="auto" defer></script>
  ```
- **Next.js App Router (`app/layout.tsx`):**
  ```tsx
  import { LaserCursor } from "@/components/LaserCursor";

  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="en">
        <body>
          {children}
          <LaserCursor theme="auto" />
        </body>
      </html>
    );
  }
  ```

---

## 5. STRICT HALAL CONTENT & ZERO OXFORD COMMA ENFORCEMENT
- **Halal Content:** Zero female imagery, zero music and zero un-Islamic sectors across all demo templates and visual cards.
- **Zero Oxford Comma:** Never write a comma before "and" or "&" in any code comment, markdown documentation or user interface text (`A, B and C`).
