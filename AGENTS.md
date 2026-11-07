<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:titan-project-rules -->
## Mandatory Titan Project Rules

1. **Website ↔ Telegram Bot Parity (`titan-front` ↔ `titan-bot`):**
   Every change made to the website (`titan-front`) — whether adding, updating, modifying, or removing product descriptions, guides, catalog items, pricing, or features — **MUST also be applied to the Telegram Mini-App (`../titan-bot`) and backend (`../titan-back`)**, adapted appropriately to the Telegram Mini-App's format, routes, and mobile-first UI.
2. **Target Branch:**
   All changes in `titan-front` and `titan-back` must be committed and pushed to the **`vercel-deploy`** branch (`origin/vercel-deploy`), and `titan-bot` to **`main`** (`origin/main`).
<!-- END:titan-project-rules -->
