# LinkedEnd Collab

Work in progress skeleton. Not the real site, a scaffold to build the real site on top of.

## What this is

LinkedEnd is a LinkedIn clone for after everything falls apart: a network for skill sharing and mutual aid, anonymous by design. This repo is the front end prototype used to nail down the interaction model before any of it gets built on a real backend. Pushed here so it's easier to iterate on and hand off pieces of, not because it's done.

## Current state

- Static client side SPA. No framework, no build step, no backend. Plain HTML/CSS/JS.
- No persistence past a single browser session. Refresh a different browser and the state is gone.
- 10 pages stubbed out and clickable: landing, signup/login, onboarding, feed (The Wire), profile (Dossier), Allies, Comms, Enclaves, Recon, Settings.
- Mock data only: 15 seeded survivor accounts, 6 enclaves, canned Comms threads. None of it is real.
- Core mechanics prototyped, not production logic:
  - RPG style skill leveling on the Dossier, level tied to vouch count.
  - Dunbar layer closeness tiers (Inner Circle, Trusted Circle, Camp/Band, Network, Recon) gating what a given ally can see on your profile.
  - Per skill vouching, restricted to allies only.
- Desktop and mobile (375px) pass done. Contrast checked against actual composited backgrounds, not eyeballed.

## Files

- `index.html`, `app.js`, `views.js`, `data.js`: app shell, router, views, seeded data.
- `base.css`, `style.css`, `app.css`: design tokens and component styles.
- `assets/`: logo, favicon, OG image, all SVG.

## What is explicitly not here yet

- Real backend, real accounts, real database.
- Actual encryption on Comms. The lock badge is UI only right now, don't read anything into it.
- Real anonymity guarantees: email storage, rate limiting, abuse and moderation handling all still need real design, not just a mockup of the idea.

## Why it's public

Wanted a place to point collaborators and pull requests at while the real architecture gets worked out. Expect this to get gutted or rewritten once the backend direction is locked in, nothing here should be treated as load bearing.
