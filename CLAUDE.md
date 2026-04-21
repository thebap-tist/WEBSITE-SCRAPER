# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Dev server on http://localhost:3000
npm run build     # Production build to /dist
npm run lint      # TypeScript type check (tsc --noEmit)
npm run preview   # Preview production build
npm run clean     # Remove /dist
```

## Architecture

This is a **single-page React 19 / TypeScript** app built with Vite. The entire landing page lives in a single file: `src/App.tsx` (~900+ lines). There is no routing — everything is one scrollable page.

### Key patterns

- **Tailwind CSS v4** via `@tailwindcss/vite` plugin. Theme is defined with `@theme inline` in `src/index.css`, not in a `tailwind.config.js`.
- **GSAP ScrollTrigger** drives the iPhone mockup parallax animation. The `useEffect` in `App.tsx` pins the mockup section and scrubs message card animations as the user scrolls.
- **Framer Motion** (`motion` package) handles modal open/close transitions via `AnimatePresence`.
- **Forms** submit to the Web3Forms API via a Vercel serverless function (`/api/submit`). Both forms require an hCaptcha token before submission. The Web3Forms access key is read from `VITE_WEB3FORMS_KEY` (`.env.local`, not committed).
- **Stripe** payment links are hardcoded in the pricing section. The Stripe Customer Portal link is in the footer.

### Environment variables

| Variable | Used for |
|----------|----------|
| `VITE_WEB3FORMS_KEY` | Web3Forms API access key for form submissions |

### Serverless / backend

`express` and `dotenv` are in dependencies for a lightweight Vercel serverless handler (`api/submit.ts` or similar). This proxies form submissions server-side so the Web3Forms key is not exposed in the client bundle.

### Sections (in order)

Hero → iPhone Mockup (GSAP parallax, 250vh) → How It Works → Supported Portals → Telegram Notification preview → Free Trial CTA → Pricing (4 tiers, Stripe links) → Final CTA → Footer
