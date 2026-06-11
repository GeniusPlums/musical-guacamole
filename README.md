# BarIQ — Interactive Inventory Intelligence Demo

> **When inventory goes missing, the system tells you where to investigate.**

Fully interactive in-browser simulation for bars and pubs. No database, no auth — all state persists in **localStorage**.

## Demo Flow

1. **Command Center** — Quick actions change metrics instantly
2. **Receive stock** — Live Inventory or Receive Delivery
3. **Run Service** — Simulate POS sales (beer, whiskey, cocktails)
4. **Create leakage** — Simulate theft, kitchen waste, unauthorized adjustments
5. **Stock Count** — Submit physical count → variance → auto investigation
6. **Investigation Center** — Timeline, staff, AI-style deterministic analysis
7. **Audit Center** — Generate reports, export to PDF

## Routes

| Page | Path | Purpose |
|------|------|---------|
| Command Center | `/` | KPIs, quick actions, live activity feed |
| Live Inventory | `/inventory` | Editable SKUs, receive/adjust/wastage |
| Run Service | `/service` | POS sale simulator |
| Stock Count | `/stock-count` | Closing counts with variance detection |
| Investigations | `/investigations` | Open discrepancy cases |
| Demo Scenarios | `/scenarios` | One-click prebuilt stories |
| Stock Ledger | `/ledger` | Immutable event timeline |
| Variance | `/variance` | Expected vs actual engine |
| Audit Center | `/audit` | Weekly reports + PDF export |

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use **Reset Demo** in the sidebar to restore seeded data.

## Tech Stack

- Next.js App Router + TypeScript + Tailwind
- Zustand + localStorage persistence
- shadcn/ui + Recharts
