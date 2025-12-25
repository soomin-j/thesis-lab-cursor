# Sensory Route Tracker

A mobile-first web app for tracking walking routes with GPS and tagging places with sensory/mood tags.

## Features

- 🗺️ Real-time GPS route tracking
- 🏷️ Tag places with pre-defined mood/sensory tags
- 📊 View daily sensory history on a map
- 🤖 AI-generated place previews based on user tags

## Tech Stack

- **Frontend**: Next.js 14 (App Router) with TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Maps**: Leaflet.js
- **AI**: OpenAI API
- **Auth**: NextAuth.js with Google OAuth

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Google OAuth credentials
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lab-mvp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: From Google Cloud Console
- `OPENAI_API_KEY`: From OpenAI

4. Set up the database:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
lab-mvp/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (protected)/     # Protected routes (dashboard, map, history, walk)
│   ├── api/             # API routes
│   └── layout.tsx       # Root layout
├── components/
│   ├── map/             # Map components
│   ├── tracking/        # GPS tracking components
│   ├── tags/            # Tag selector and preview components
│   └── ui/              # UI components
├── lib/
│   ├── db.ts           # Prisma client
│   ├── auth.ts         # NextAuth configuration
│   ├── gps.ts          # GPS tracking utilities
│   ├── ai.ts           # AI summary generation
│   └── offline.ts      # Offline storage with IndexedDB
└── prisma/
    └── schema.prisma   # Database schema
```

## Usage

1. **Sign in** with Google OAuth
2. **Start a walk** from the dashboard
3. **Tag places** by tapping on the map during your walk
4. **View history** to see all your past routes and tagged locations
5. **Preview locations** to see AI-generated summaries based on user tags

## Database Schema

- **User**: User accounts
- **Route**: Walking routes with GPS polylines
- **Location**: Individual GPS coordinates
- **Tag**: Pre-defined sensory/mood tags
- **LocationTag**: Many-to-many relationship between locations and tags
- **LocationSummary**: Cached AI summaries for locations

## Development

### Database Migrations

```bash
npx prisma migrate dev
```

### View Database

```bash
npx prisma studio
```

## License

MIT
