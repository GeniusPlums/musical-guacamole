# BarIQ — Inventory Intelligence Platform

> **Where did my inventory go?**

BarIQ solves inventory leakage, auditability, and accountability for bars and pubs. It is **not** a POS replacement — it is an inventory intelligence layer that sits alongside your existing billing and menu systems.

## Features

- **Owner Dashboard** — KPIs, loss trends, wastage trends, top missing products, alerts
- **Inventory Module** — 200+ SKUs across Beer, Whiskey, Vodka, Rum, Gin, Kitchen Ingredients
- **Stock Movement Ledger** — Immutable event timeline (received, sale, wastage, adjustment, transfer, closing count)
- **Variance Engine** — Expected vs actual stock with loss value calculation
- **Variance Investigation** — Detective dashboard with timeline, staff accountability, AI insights
- **Audit Center** — Weekly reports with top missing products, shift/employee variance
- **Kitchen Wastage** — Purchased/used/spoiled/unaccounted tracking
- **Multi-Outlet View** — Compare 2 outlets side by side

## Tech Stack

- Next.js 15+ (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui components
- PostgreSQL + Prisma ORM
- Recharts
- Zustand

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The MVP runs with **in-memory mock data** — no database required for the demo.

## Database Setup (Optional)

```bash
docker compose up -d
cp .env.example .env
npx prisma db push
npm run db:seed
```

## Demo Narrative

1. Receive inventory → Stock Ledger shows +12 Cases of Black Dog
2. Process sales → Sale events logged with employee attribution
3. Record wastage → Broken bottle during Saturday night shift
4. Conduct stock count → Closing count reveals discrepancy
5. Detect variance → Variance Engine flags 15 bottles missing
6. Investigate → Click Black Dog → see timeline, staff, AI insights
7. Generate audit report → Audit Center shows weekly loss breakdown

## Project Structure

```
src/
├── app/              # Next.js pages
├── components/       # UI components
├── lib/
│   ├── data/         # Data service layer
│   ├── mock-data/    # Mock data generator
│   └── variance-engine.ts
├── store/            # Zustand state
prisma/
├── schema.prisma     # PostgreSQL schema
└── seed.ts           # Database seed script
```
