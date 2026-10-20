# Infinity Invoice

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/krutik/invoice)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/lO3C20ZjoXX)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Monorepo layout

This is a [Turborepo](https://turborepo.com) using pnpm workspaces.

| Path | What it is | Dev URL |
| --- | --- | --- |
| `apps/web` | The invoicing app (dashboard, auth, API) | http://localhost:3000 |
| `apps/landing` | Marketing landing page | http://localhost:3001 |
| `packages/ui` | Shared theme tokens (`theme.css`) and `cn()` | |
| `packages/typescript-config` | Shared `tsconfig` presets | |

```bash
pnpm install          # install everything
pnpm dev              # run both apps
pnpm dev:web          # run only the app
pnpm dev:landing      # run only the landing page
pnpm build            # build everything
```

Each app reads its own env file (`apps/web/.env.local`, `apps/landing/.env.local`). The landing page links to the app via `NEXT_PUBLIC_APP_URL`.

On Vercel, each app is its own project with **Root Directory** set to `apps/web` or `apps/landing`.

## Deployment

Your project is live at:

**[https://vercel.com/krutik/invoice](https://vercel.com/krutik/invoice)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/lO3C20ZjoXX](https://v0.app/chat/lO3C20ZjoXX)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Open Source

We welcome community contributions.

- [Contributing Guide](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Security Policy](./SECURITY.md)
- [Support](./SUPPORT.md)

If you’d like to support development, check the **Sponsor** button on GitHub.