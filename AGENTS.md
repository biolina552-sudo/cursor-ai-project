# AGENTS.md

## Cursor Cloud specific instructions

### Repository Structure

This is a monorepo with **6 independent products on separate branches** (the `main` branch contains only this file and `README.md`). All product code lives on `origin/cursor/*` branches:

| Branch | Product | Stack | External API Required |
|--------|---------|-------|-----------------------|
| `cursor/local-demo-video-studio-8647` | Local Demo Video Studio | Flask + Pillow + imageio + numpy | None (fully self-contained) |
| `cursor/avatar-studio-c3d1` | Shoplina Video Studio | Flask + requests | D-ID API key |
| `cursor/free-avatar-studio-2a41` | Free Avatar Studio | Flask + requests + Pillow | HeyGen API key |
| `cursor/ai-marketing-video-tool-5c49` | AI Marketing Video Studio | HTML/CSS/JS + Python http.server | D-ID API key |
| `cursor/ai-video-tool-6f1e` | AI Video Tool | Python CLI + stdlib | Replicate API token |
| `cursor/luxury-ecommerce-store-c3d1` | Aurum Luxe Commerce | Next.js 15 + Prisma + Supabase + Stripe | Supabase + Stripe keys |

### Running Flask-based Products (Branches 1-5)

All Python Flask apps use the same core dependencies: `Flask`, `Pillow`, `imageio`, `imageio-ffmpeg`, `numpy`, `requests`. Install via `pip install Flask Pillow imageio imageio-ffmpeg numpy requests`.

To run any Flask app, use a git worktree: `git worktree add /tmp/projects/<name> origin/cursor/<branch>`, then `cd` into the project directory and run `python3 app.py`. Default port is 5000; use `PORT=<port> python3 app.py` to avoid conflicts when running multiple apps.

### Running Aurum Luxe Commerce (Next.js)

- **Branch:** `cursor/luxury-ecommerce-store-c3d1`
- **Requires PostgreSQL:** Start with `sudo pg_ctlcluster 16 main start`, create database `aurum` if needed.
- **Env vars:** Create `.env.local` in `luxury-store/` with `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `STRIPE_SECRET_KEY`. Placeholder values work for local dev (Supabase auth and Stripe checkout won't function without real keys, but product browsing and cart work).
- **Setup:** `npm install && npx prisma db push && npx prisma generate`
- **Dev server:** `npm run dev` (port 3000)
- **Lint:** `npm run lint`
- **Build:** `npm run build`
- **Gotcha:** If you see `Cannot find module '/vendor-chunks/motion-dom.js'` errors, delete `.next/` and restart the dev server (`rm -rf .next && npm run dev`). This is a stale cache issue.
- **Gotcha:** `next-intl` warns about missing `timeZone` config — this is non-blocking and cosmetic only.

### General Notes

- The `~/.local/bin` path must be on `PATH` for `flask` CLI and `imageio` scripts (the update script handles this).
- PostgreSQL 16 is installed as a system package and must be started manually (`sudo pg_ctlcluster 16 main start`).
- Each product branch is independent — use `git worktree` to work on multiple branches simultaneously without switching.
