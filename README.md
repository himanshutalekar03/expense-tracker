# Fenmo - Modern Expense Tracker

A production-quality minimal expense tracker built with a modern stack focusing on resilience, fluid responsiveness, and clean architecture.

## Tech Stack
- **Frontend**: Next.js (App Router), Tailwind CSS v4, TanStack Query (React Query) v5, React Hook Form, Zod, Recharts, Lucide Icons.
- **Backend**: Node.js, Express, Prisma ORM, Vitest (for unit testing).
- **Database**: SQLite (Zero configuration required for local dev).

## Core Features
1. **Fully Responsive Dashboard**: A fluid, mobile-first design that prioritizes the "Add Expense" action on mobile/tablet devices, and elegantly transitions into a 3-column sticky sidebar layout on desktops.
2. **Advanced Filtering & Search**: Dynamically filter expenses by search terms, specific categories, or timeframes (Today, This Week, This Month, All Time).
3. **Smart Add (NLP Parsing)**: A rule-based engine that extracts amounts, categories, and dates from natural language (e.g., *"Spent 500 on food yesterday"*). Fully covered by Vitest unit tests.
4. **Offline Support & Idempotency**: Network failures gracefully queue requests in `localStorage` for automatic retries when back online. `Idempotency-Key` headers prevent duplicate charges on flaky connections.
5. **Insights & Visualizations**: Real-time calculated metrics for total spending, daily averages, and top categories, accompanied by interactive Recharts (Daily Trend Bar Chart & Category Pie Chart).
6. **Robust Deletion & Undo**: Delete expenses with confidence; a toast notification provides a quick "Undo" action to instantly recreate an accidentally deleted expense.
7. **CSV Export**: Easily download the current filtered view of your expenses.
8. **End-to-End Type Safety**: Shared validation schemas using Zod ensure that both the React client and Express server expect the exact same data structures.

## Project Structure
We utilize a simple monorepo structure:
- `/frontend` - Next.js React Application
- `/backend` - Express API & Prisma Database

## Running Locally

1. **Start Backend:**
   ```bash
   cd backend
   npm install
   npx prisma db push
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Run Backend Tests:**
   ```bash
   cd backend
   npm test
   ```

## Trade-Offs & Architecture Decisions
- **Database Choice**: Used SQLite instead of Postgres for ease of setup. Prisma makes it trivial to swap to Postgres if scaled.
- **NLP Engine**: Implemented a fast, deterministic rule-based parser instead of an LLM integration to avoid API keys and latency, keeping the project self-contained.
- **State Management**: Relies heavily on TanStack Query cache invalidation combined with URL query parameters for filtering, keeping local React state to an absolute minimum.

## Future Improvements
- **Authentication**: Integrate NextAuth for multi-tenant support.
- **PWA Setup**: Convert to a full Progressive Web App using `next-pwa` to enhance offline capabilities with Service Worker caching.
- **Pagination**: Implement cursor-based pagination for the expense list as the database grows.
