# Vocab Learning

A daily vocabulary learning app that serves you 2 new English words each day with Russian and Kazakh translations. Built with Next.js 14, MongoDB, and Tailwind CSS.

## Features

- **Daily Words** — Learn 2 new vocabulary words every day, selected randomly from a curated list of 100 words
- **Multilingual Examples** — Each word includes example sentences with a language switcher for English, Russian, and Kazakh
- **Word Translations** — Every word comes with Russian and Kazakh translations
- **Pronunciation** — Phonetic pronunciation guide and a text-to-speech button for each word
- **Progress Tracking** — Previously learned words are saved and displayed in an expandable history list with dates
- **User Authentication** — JWT-based login with secure cookie sessions
- **Responsive Design** — Works on both desktop and mobile

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** MongoDB
- **Styling:** Tailwind CSS
- **Auth:** JWT via `jose` + `bcryptjs` for password hashing
- **Icons:** Lucide React
- **Deployment:** Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Setup

1. Clone the repository:

   ```bash
   git clone <repo-url>
   cd vocab-site
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file from the example:

   ```bash
   cp .env.local.example .env.local
   ```

   Then fill in your values:

   ```
   MONGODB_URI=mongodb://localhost:27017/vocab-site
   JWT_SECRET=your-secret-key-change-in-production
   ```

4. Create a user:

   ```bash
   npm run create-user -- -u <username> -p <password>
   ```

5. Import the word list:

   ```bash
   npm run import-words -- -f data/words.json
   ```

6. Start the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) and log in.

## Project Structure

```
src/
  app/
    api/
      auth/route.ts       # Login (POST) and logout (DELETE)
      words/route.ts      # Daily words endpoint
    login/page.tsx        # Login page
    page.tsx              # Home page
    layout.tsx            # Root layout
  components/
    word-info.tsx         # Word card with pronunciation, examples, translations
  lib/
    auth.ts               # Server-side auth (bcrypt, JWT creation, session)
    auth-edge.ts          # Edge-compatible auth (JWT verification)
    interfaces.ts         # TypeScript types and collection names
    mongodb.ts            # MongoDB singleton manager
  scripts/
    create-user.ts        # CLI script to create users
    import-words.ts       # CLI script to import/update words from JSON
data/
  words.json              # 100 vocabulary words with translations
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run create-user -- -u <user> -p <pass>` | Create a new user |
| `npm run import-words -- -f <file>` | Import or update words from a JSON file |

## Word Data Format

Words in `data/words.json` follow this structure:

```json
{
  "word": "ambitious",
  "pronunciation": "am-BISH-us",
  "definition": "Having a strong desire to succeed or achieve goals",
  "examples": [
    {
      "en": "She is an ambitious entrepreneur.",
      "ru": "Она амбициозный предприниматель.",
      "kk": "Ол амбициялы кәсіпкер."
    }
  ],
  "translations": {
    "ru": "амбициозный",
    "kk": "мақсатты"
  }
}
```

## Deploying to Vercel

1. Push your repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add `MONGODB_URI` and `JWT_SECRET` as environment variables
4. If using MongoDB Atlas, add `0.0.0.0/0` to Network Access to allow Vercel's dynamic IPs
