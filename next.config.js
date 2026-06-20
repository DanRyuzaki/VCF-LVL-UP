// next.config.js
//
// VCF: LVL UP! previously had no next.config.js at all. Next.js runs fine
// with zero config, but an explicit file documents intent and gives Vercel
// (and any future maintainer) one place to look. Kept deliberately minimal —
// add to this as real requirements show up rather than pre-guessing them.

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;