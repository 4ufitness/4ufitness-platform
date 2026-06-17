# 4UFitness Platform

4UFitness is an AI-powered personal transformation platform: fitness, nutrition, habits, face yoga, sleep, motivation, and progress tracking in one premium experience.

## Foundation v0.1

This repository is structured as a scalable monorepo:

- `apps/mobile` — Expo / React Native app
- `packages/*` — shared packages for future UI, API, types, AI and config
- `supabase` — database migrations and edge functions
- `docs` — product, AI, database and architecture documentation
- `design` — brand and design system assets

## Quick Start

```powershell
cd C:\Projects\4UFitness
pnpm install
pnpm mobile
```

If Expo dependency versions need alignment:

```powershell
cd apps/mobile
npx expo install --fix
npx expo start -c
```
