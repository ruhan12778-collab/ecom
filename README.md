# CodeEd

An e-commerce platform for purchasing and learning coding courses, featuring an AI-powered chatbot assistant, gamified progress tracking, and a modern responsive UI.

## Features

- **Course Marketplace** - Browse, search and purchase coding courses across multiple difficulty levels and categories
- **AI Chatbot** - Integrated AI assistant (powered by Groq) for personalised course recommendations and learning support
- **User Authentication** - Secure registration and login with JWT-based auth and refresh tokens
- **Shopping Cart** - Add courses to cart with persistent cart syncing for logged-in users
- **Order Management** - Complete checkout flow with order history tracking
- **Gamification** - Earn points, unlock badges, maintain learning streaks and level up
- **Progress Tracking** - Track course enrolment, module completion and watch time
- **User Profiles** - Personalised dashboard with skill level, enrolled courses and achievements

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** SQLite with Prisma ORM
- **State Management:** Zustand
- **AI Integration:** Groq SDK
- **Authentication:** JWT with bcrypt password hashing
- **Validation:** Zod
- **Testing:** Vitest (unit) + Playwright (E2E)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/ruhan12778-collab/ecom
cd codeed
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

- `DATABASE_URL` - SQLite database path (default: `file:./dev.db`)
- `JWT_SECRET` - Secret key for JWT token signing
- `JWT_REFRESH_SECRET` - Secret key for refresh tokens
- `GROQ_API_KEY` - API key from [console.groq.com](https://console.groq.com)

4. Set up the database:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

5. Start the development server:

```bash
npm run dev
```

The app will be running at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    (auth)/          # Login and registration pages
    (main)/          # Course browsing, cart, profile, dashboard
    api/
      auth/          # Auth endpoints (login, register, logout, refresh)
      cart/           # Cart management
      chatbot/        # AI chatbot endpoint
      courses/        # Course listing and details
      enrollments/    # Course enrolment
      gamification/   # Points, badges, streaks
      orders/         # Order processing
  components/
    chatbot/         # Chat widget component
    layout/          # Header, Footer
  lib/               # Prisma client, auth helpers, Groq client
  services/          # Gamification service
  store/             # Zustand stores (auth, cart)
  types/             # TypeScript type definitions
prisma/
  schema.prisma      # Database schema
  seed.ts            # Seed data
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with sample data |

## Author

**Ruhan Khan**

## License

ISC
