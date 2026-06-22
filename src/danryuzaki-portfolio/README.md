# danryuzaki.is-a.dev

A "soon" holding page for Daniel Ryuzaki Adan's portfolio domain.

## Stack

- Next.js (App Router)
- Tailwind CSS v4
- TypeScript

## Run locally

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Build for production

```bash
npm run build
npm start
```

## Deploy

This is a static-friendly Next.js app — deploy as-is to Vercel, Netlify,
or any platform that supports Next.js. Point `danryuzaki.is-a.dev` at
your deployment once it's live.

## Structure

- `src/app/page.tsx` — the page itself (header, hero, footer)
- `src/components/StatusLine.tsx` — the blinking-cursor terminal line
- `src/components/Grain.tsx` — subtle film-grain texture overlay
- `src/components/SocialLinks.tsx` — GitHub / LinkedIn / Facebook / email
- `src/app/globals.css` — color tokens, fonts, the cursor keyframe
