# Expense tracker

Personal finance app to record income and expenses, set monthly budgets per category and see where the money goes. It sends alerts when a budget is close to its limit and exports reports to PDF and Excel.

## Features

- Accounts with JWT authentication
- Income and expense transactions, with custom categories
- Monthly budgets per category and alerts when spending gets close to the limit
- Dashboard with totals, charts and spending by category
- Spending insights: monthly analysis, a "financial health" score and a simple forecast for next month (rule-based, no external AI API)
- Reports exported as PDF (PDFKit) or Excel (ExcelJS)

## Stack

| Part | Tools |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Radix UI components, React Hook Form + Zod |
| Backend | Node.js, Express, TypeScript, Prisma, PostgreSQL, Zod, Winston (logs) |
| Tests | Vitest |
| Security | bcrypt, Helmet, rate limiting, CORS |

## Run it locally

Requirements: Node.js 20+ and PostgreSQL.

```bash
# backend
cd backend
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev

# frontend (in another terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

Run the backend tests with `npm test` inside `backend/`.
