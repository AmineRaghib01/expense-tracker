# Finora

**Financial clarity for modern businesses.**

Finora is a full-stack financial management platform for freelancers, small businesses, and teams. Track income and expenses, manage budgets, generate reports, and receive AI-powered insights — all from a modern, responsive web application.

![Tech Stack](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue) ![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-blue)

## Features

- **Authentication** – Register, login, password reset, JWT with refresh tokens
- **Dashboard** – Real-time KPIs, charts, cash flow, financial health score
- **Transactions** – Full CRUD with search, filters, sort, and pagination
- **Categories** – Custom categories with icons and colors
- **Budgets** – Monthly and category budgets with progress tracking
- **Reports** – Monthly, quarterly, yearly reports with PDF & Excel export
- **AI Assistant** – Spending analysis and recommendations (mock service, OpenAI-ready)
- **Notifications** – Budget alerts and financial tips
- **Settings** – Profile, currency, theme, notification preferences

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Shadcn UI, Zustand, Recharts |
| Backend | Node.js, Express, TypeScript, Prisma ORM, JWT, Bcrypt |
| Database | PostgreSQL |

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm 9+

## Getting Started

### 1. Create the database

```sql
CREATE DATABASE finora;
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` with your PostgreSQL credentials:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/finora?schema=public"
JWT_ACCESS_SECRET=your-super-secret-access-key-min-16-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-16-chars
```

Run migrations:

```bash
npm run db:generate
npm run db:migrate
npm run dev
```

API: `http://localhost:5000/api/v1`

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

App: `http://localhost:5173`

### 4. Create your account

Open the app and click **Create account**. Default income and expense categories are set up automatically when you register. Add your own transactions, budgets, and data from there.

> **Note:** The seed script does not create any default users or sample data. All financial information in your account is data you enter yourself.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Access token secret (min 16 characters) |
| `JWT_REFRESH_SECRET` | Refresh token secret (min 16 characters) |
| `CORS_ORIGIN` | Frontend origin (default: `http://localhost:5173`) |
| `FRONTEND_URL` | Used for password reset links |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (default: `http://localhost:5000/api/v1`) |

## Project Structure

```
finora/
├── backend/          # Express REST API
│   ├── prisma/       # Schema & migrations
│   └── src/          # Controllers, services, repositories
├── frontend/         # React SPA
│   └── src/          # Pages, components, stores
└── README.md
```

## API Documentation

See [backend/API.md](backend/API.md) for the full API reference.

## Scripts

### Backend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Compile TypeScript |
| `npm run test` | Run unit tests |
| `npm run db:migrate` | Apply database migrations |
| `npm run db:seed` | Run seed (no default data) |
| `npm run db:studio` | Open Prisma Studio |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## AI Integration

The AI module ships with a mock analysis service. To connect OpenAI:

1. Implement `AIServiceInterface` in `backend/src/ai/`
2. Swap `MockAIService` for your implementation
3. Add `OPENAI_API_KEY` to your environment

## License

MIT
