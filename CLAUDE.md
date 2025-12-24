# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (Next.js)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

This is a **Next.js 16 App Router** project for a Twitch streamer's community hub. It uses:
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **Supabase** for database (community messages, strategies, reactions)
- **Twitch Helix API** for live status, clips, and VOD data
- **Vercel Analytics/Speed Insights** for monitoring

### Project Structure

```
app/
├── page.tsx              # Landing page with live stream status
├── layout.tsx            # Root layout with Navbar/Footer
├── clips/page.tsx        # Twitch clips gallery (hover to preview)
├── social/page.tsx       # Social media links and embeds
├── discord/page.tsx      # Discord invite page
├── community/page.tsx    # Message board + strategies with reactions
├── api/
│   ├── twitch/
│   │   ├── live/route.ts     # Live status + last VOD
│   │   ├── clips/route.ts    # Paginated clips
│   │   └── schedule/route.ts # Stream schedule
│   └── community/
│       ├── messages/route.ts   # CRUD for messages
│       ├── strategies/route.ts # CRUD for strategies
│       └── reactions/route.ts  # Reaction system
├── components/           # Shared components (Navbar, CursorGlow, etc.)
└── lib/
    ├── supabaseAdmin.ts  # Server-side Supabase client
    ├── supabaseBrowser.ts # Browser Supabase client
    ├── rateLimit.ts      # In-memory rate limiting
    └── moderation.ts     # Profanity filter using bad-words
```

### Key Patterns

- **API Routes**: All external API calls (Twitch) go through `/api/` routes to keep secrets server-side
- **Twitch Token Caching**: `app/api/twitch/live/route.ts` caches OAuth tokens in memory with expiry tracking
- **Supabase Admin Client**: Uses service role key for server-side DB operations; browser client for real-time features
- **Reaction System**: Anonymous reactions stored per-device using `localStorage` for user ID; persisted to Supabase
- **Content Moderation**: Uses `bad-words` library to filter profanity (can reject or clean)

### Environment Variables

Required in `.env.local`:
- `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`, `TWITCH_USER_LOGIN` - Twitch API auth
- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` - Supabase connection
- `NEXT_PUBLIC_TWITCH_PARENT` - Domain for Twitch embeds (e.g., `sleazyg27.me`)

### Supabase Tables

- `messages` - Community message board posts
- `strategies` - Valorant strategy posts with weapon/action/duration metadata
- `reactions` - Per-post reactions (love, fire, brain, rip) linked to anonymous user IDs
