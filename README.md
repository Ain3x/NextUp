# NextUp

A personal entertainment queue manager for **Android + iOS**, built with Expo / React Native. NextUp solves "what should I watch tonight?" — a unified queue across anime, movies, and TV shows, with an AI-powered mood-based picker that reasons through your queue and explains *why* it's recommending something.

> Hobby project, non-commercial. Foundation, Auth, Queue, Search, AI Pick (with Discover), Detail Modal, and Profile (with Taste Card, Pace, and rating insights) are complete. Episode notifications and Social features are in progress.

## Features

- 📋 **Unified Queue** — track anime, movies, and shows in one list with drag-and-drop reordering and status tracking (not started → watching → paused → completed / dropped)
- 🎯 **AI Pick** — tell it your mood and time available, and Gemini ranks picks from your own queue with reasoning
- 🧭 **Discover** — get 5 external recommendations (not yet in your queue) personalized to your taste profile, complete with posters and a "why this fits you" explanation
- 🔍 **Unified Search** — search anime, movies, and shows in one place across TMDB and AniList
- 📖 **Detail View** — per-item progress, ratings, notes, and reminders
- 📊 **Profile & Insights** — watch stats, a Gemini-generated "Taste Card" viewer identity, pace tracking, completion rate, and rating distribution
- 🔔 **Episode Reminders** *(in progress)* — local notifications for upcoming episodes

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 55, React Native 0.83.6, React 19.2.6 |
| Language | TypeScript 5.9.2 (strict mode) |
| Navigation | Expo Router (file-based) |
| Database & Auth | Supabase (Postgres + Row Level Security) |
| Session storage | AsyncStorage |
| Anime metadata | AniList GraphQL API |
| Movie/show metadata | TMDB REST API |
| AI recommendations | Google Gemini API (`gemini-2.5-flash`), structured JSON output via `responseSchema` |
| Drag & drop | react-native-draggable-flatlist |
| Overlays | react-native-portalize |

## Architecture

The codebase follows a strict **screens compose, hooks compute** philosophy — dependencies only flow inward, and all business logic lives in hooks so any backend (e.g. Supabase) can be swapped by changing one file.

```
app/          → screens/                                    (routing only, one line per file)
screens/      → components/business + components/shared + hooks + context
business/     → components/shared + types + ThemeContext
shared/       → ThemeContext + types only (zero domain knowledge)
hooks/        → lib + types + AuthContext                    (all logic, zero UI)
context/      → lib + types
```

**Core rules:**
- `app/` files import and re-export a screen — nothing else
- No raw Supabase/API calls in screens — everything goes through a hook
- `components/shared/` has zero domain knowledge and could be copied into any app
- Prompt builders and API clients are pure functions in `lib/`, not hooks
- One hook, one responsibility (`useAIPick` ≠ `useDiscover`, even though both call Gemini)

## Project Structure

```
nextup/
├── app/                    # Expo Router — navigation only
│   ├── (auth)/             # sign-in, sign-up
│   ├── (tabs)/             # queue, pick, search, profile
│   └── (modals)/           # item-detail, add-to-queue, history-list
├── screens/                # Screen logic + composition
├── components/
│   ├── shared/              # Pure UI primitives (Button, Card, Input, ...)
│   └── business/            # Domain components (QueueCard, AIPickCard, ...)
├── hooks/                  # All business logic (useQueue, useAIPick, useDiscover, ...)
├── context/                # AuthContext, ThemeContext, QueueContext
├── lib/                    # Supabase/TMDB/AniList/Gemini clients + prompt builders
├── types/                  # Single source of truth for all TypeScript types
└── constants/
```

## App Modules

| Module | Description |
|---|---|
| **Queue** | Unified content list — add, reorder, track progress, mark complete |
| **AI Pick** | *From Queue* tab (mood + time → ranked picks from your queue with reasoning) and *Discover* tab (5 personalized external recommendations with posters) |
| **Search** | Debounced unified search across TMDB and AniList |
| **Detail View** | Per-item progress, ratings, notes, reminders |
| **Profile** | Watch stats, Gemini-generated Taste Card, pace sparkline, completion rate, rating distribution |
| **Social** *(planned)* | Friends, activity feed, sending completed-item cards |

## Getting Started

### Prerequisites
- Node.js + npm
- Expo CLI (`npx expo`)
- A Supabase project
- API keys: TMDB, Google Gemini

### Environment Variables

Create `.env.local` in the project root (never commit this file):

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_TMDB_TOKEN=eyJ...          # Bearer token, not the short API key
EXPO_PUBLIC_GEMINI_API_KEY=AIza...
```

All variables must use the `EXPO_PUBLIC_` prefix to be accessible in the app bundle.

### Install & Run

```bash
git clone https://github.com/<your-username>/nextup.git
cd nextup
npm install
npx expo start
```

### Database Setup

Run the Supabase schema (see `queue` table + Row Level Security policy) and create the `get_watch_stats` RPC function in the Supabase SQL editor — both are required for the app to function. RLS means the Supabase anon key is safe to ship in the client; every query is automatically scoped to `auth.uid()`.

## Notable Design Decisions

- **Supabase over Firebase** — Postgres + RLS, no vendor lock-in on queries
- **Gemini 2.5 Flash with `responseSchema`** — forces valid structured JSON output, avoiding markdown-fence and truncation issues
- **Pace over Streak** — average titles/month (6-month window) is more meaningful than a streak that resets on busy weeks
- **Taste Card cached 7 days** — regenerated only when stale or when completed count changes, never blocking the screen
- **Sent cards are immutable snapshots** — not live references to queue items, so edits/deletes don't retroactively change what was shared

## Known Gotchas

- `DateTimePicker` must be used imperatively on Android (`DateTimePickerAndroid.open()`) — rendering it as a component crashes with `dismiss undefined`
- Never write a JSX comment directly after a self-closing tag (`<View /> {/* comment */}`) — crashes the Fabric renderer
- `expo-notifications` requires a native build (`expo prebuild` + `expo run:android/ios`) — won't work in Expo Go
- Supabase `upsert` on partial payloads can trigger null constraint violations — use targeted `.update()` calls instead
- Never run `npm audit fix --force` — it downgrades Expo to v49

## Roadmap

- [ ] Episode reminder notifications (scheduling logic in progress)
- [ ] Social module — friends, activity feed, shared cards

## Author

**Ainoras Marčiukaitis**
