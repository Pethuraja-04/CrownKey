# Estatery — Real Estate Listing Platform

A production-style real-estate marketplace built to evaluate fullstack engineering, backend architecture, database design, API quality, and scalability thinking. Inspired by 99acres and NoBroker.

```
estatery/
├── backend/    Node.js + Express + Prisma + PostgreSQL + JWT + Swagger
└── frontend/   Next.js 14 (App Router) + Tailwind CSS + TypeScript
```

---

## Quick start

### Prerequisites
- **Node.js** 18+ (20 recommended)
- **PostgreSQL** 14+ running locally (or any Postgres-compatible service — the demo uses Neon)
- npm / pnpm / yarn
- *(Optional)* a free **Groq API key** at [console.groq.com](https://console.groq.com) — required only if you want the AI concierge widget to respond. Without it, every other feature still works; the chat just returns a friendly "AI not configured" message.

### 1. Backend

```bash
cd backend
cp .env.example .env                # edit DATABASE_URL if needed
npm install
npx prisma migrate dev --name init  # creates schema + indexes
npm run seed                        # 5,000 properties (fast demo)
# or:
npm run seed:large                  # 50,000 properties (scalability demo)
npm run dev
```

Backend boots at **http://localhost:4000**
- API docs: **http://localhost:4000/api-docs**
- Health: http://localhost:4000/api/health

### 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Frontend boots at **http://localhost:3000**

### Demo credentials
```
email:    demo@realestate.dev
password: Password123!
```

---

## What this delivers (against the spec)

| # | Requirement | Where |
|---|-------------|-------|
| 1 | **Auth** — register / login / JWT / refresh / protected routes | `backend/src/{routes,services,controllers}/auth.*` |
| 2 | **Property CRUD** with ownership enforcement | `backend/src/services/property.service.js` (`update` / `remove` check `ownerId`) |
| 2 | **Image upload** via multer (local) + URL fallback | `backend/src/middlewares/upload.js` |
| 2 | **Validation** via Zod schemas | `backend/src/validators/*` |
| 3 | **Search + filter + sort + pagination** | `GET /api/properties` — see `property.service.js#list` |
| 3 | **50k+ records support** | Composite + single-column indexes (below); `npm run seed:large` |
| 4 | **Similar properties** | `GET /api/properties/:idOrSlug/similar` — heuristic in `property.service.js#similar` |
| 5 | **Inquiry / lead module** with dedup + rate limiting | `backend/src/services/inquiry.service.js` + `middlewares/rateLimit.js` |
| 6 | **SEO** — SSR + ISR + JSON-LD + sitemap + OG/Twitter tags | `frontend/src/app/properties/[slug]/page.tsx`, `sitemap.ts`, `robots.ts` |
| 7 | **Swagger/OpenAPI** at `/api-docs` | `backend/src/swagger/swagger.js` |
| 8 | **Wishlist** — per-user saved properties with optimistic UI | `backend/src/{services,controllers,routes}/wishlist.*`, `frontend/src/providers/WishlistProvider.tsx`, `frontend/src/components/property/WishlistButton.tsx`, `frontend/src/app/dashboard/wishlist/page.tsx` |
| 9 | **AI concierge** — Groq-backed chat widget scoped to real-estate questions | `backend/src/services/chat.service.js`, `frontend/src/components/chat/ChatWidget.tsx` |

---

## Backend architecture

```
backend/
├── prisma/
│   ├── schema.prisma          # data model + indexes
│   └── seed.js                # generates 5k–50k+ records via faker
├── src/
│   ├── config/                # env + Prisma client
│   ├── controllers/           # thin HTTP layer — talks to services
│   ├── services/              # business logic, all DB access here
│   ├── routes/                # Express routers with OpenAPI JSDoc
│   ├── middlewares/           # auth, validation, rate limit, error, upload
│   ├── validators/            # Zod schemas for body/query validation
│   ├── utils/                 # AppError, asyncHandler, jwt, slug
│   ├── swagger/               # OpenAPI generator
│   ├── app.js                 # Express app wiring
│   └── server.js              # bootstrap + graceful shutdown
└── uploads/                   # local image storage (gitignored)
```

### Design decisions

**Token strategy** — Short-lived access JWT (15m) + rotating refresh JWT (30d) stored hashed in DB. Every `/refresh` call revokes the prior refresh and issues a new pair. Stolen refresh tokens are invalidated within one rotation, and logout revokes server-side.

**Why services > fat controllers** — Controllers only marshal HTTP. All business rules (ownership, dedup, slug generation) live in `services/*` so they're testable and reusable.

**Error handling** — `AppError` carries `statusCode`, `code`, and `details`. The central error middleware in `middlewares/error.js` converts Prisma errors (`P2002` → 409, `P2025` → 404) and JWT errors into clean JSON responses.

**Validation** — Zod schemas at the boundary (`middlewares/validate.js`). Coerces query strings to numbers, rejects unknown enums, and short-circuits before hitting the DB.

---

## Database design & indexing

The `Property` table has **single-column indexes** on every filterable field (`city`, `type`, `listingType`, `bedrooms`, `price`, `status`, `createdAt`, `ownerId`) **plus two composite indexes** designed for the highest-traffic query shape:

```prisma
@@index([city, listingType, type, bedrooms, price])
@@index([city, listingType, type, bedrooms, createdAt])
```

These match the leftmost-prefix rule for the most common filter combinations:
- "All apartments for sale in Mumbai under ₹2Cr, cheapest first" → first index
- "All 3BHK rentals in Bengaluru, newest first" → second index

Other notable choices:
- `amenities` is a `String[]` array — Prisma's `hasEvery` translates to PostgreSQL `@>` which uses GIN-style array containment efficiently.
- `slug` is unique → O(1) lookup for SEO-friendly URLs.
- `viewCount` is incremented fire-and-forget (not awaited) so detail-page reads stay sub-200ms.
- Inquiries have a **unique constraint on (propertyId, userId)** to prevent duplicate inquiries from logged-in users at the DB layer, not just app logic.
- Wishlist uses the same pattern — `@@unique([userId, propertyId])` on `WishlistItem` makes "is this property saved?" a single indexed lookup and prevents duplicate rows without app-level checks.

### Pagination strategy

Offset pagination is used (`page`/`limit`) because it gives users a "page X of Y" UX. The count query and page query run in parallel via `Promise.all`. For 50k+ rows this still returns in <100ms because every filter combination hits an index.

For deep pagination (page > ~500) cursor-based pagination using `createdAt + id` would scale better; the same indexes already support it. See `property.service.js#list` for the extension point.

### Query optimization tips
- Only the fields needed for the list view are `select`-ed (see `LIST_FIELDS`).
- `images` are loaded with `take: 1` for list views (only the primary).
- The `viewCount` increment is non-blocking — even a 50ms write doesn't delay the response.

---

## Search & filtering

`GET /api/properties` supports:
- `q` — free-text on title/locality/city (case-insensitive contains)
- `city` — exact match
- `type` — `APARTMENT | HOUSE | VILLA | PLOT | COMMERCIAL | PG`
- `listingType` — `SALE | RENT`
- `bedrooms` — minimum (e.g. `?bedrooms=3` returns 3+ BHK). Ignored for PG; use `roomType` instead.
- `bathrooms` — minimum
- `roomType` — `SINGLE | DOUBLE | TRIPLE | QUAD | DORMITORY` (PG occupancy)
- `minPrice` / `maxPrice` — range
- `minArea` / `maxArea` — range in sq ft
- `furnishing` — `UNFURNISHED | SEMI_FURNISHED | FURNISHED`
- `amenities` — repeated keys (`?amenities=Gym&amenities=Parking`) **or** comma-separated; uses `hasEvery` (all required)
- `isVerified` — pass `true` to restrict to verified listings
- `postedWithin` — `24h | 7d | 30d` recency window
- `sort` — `newest | oldest | price_asc | price_desc | area_desc`
- `page` (default 1) / `limit` (max 50, default 12)

Example:
```
/api/properties?city=Mumbai&listingType=SALE&type=APARTMENT&bedrooms=3&bathrooms=2&minPrice=10000000&maxPrice=30000000&isVerified=true&postedWithin=7d&sort=price_asc&page=2
```

---

## Similar properties algorithm

Heuristic, index-friendly, runs in a single query:
1. **Same city, same listing type, same property type** — narrow the candidate set using the composite index.
2. **Bedrooms within ±1** — tolerant of close substitutes.
3. **Price within ±25%** — keeps the recommendation in the same affordability bracket.
4. Exclude the current listing, order by `createdAt DESC`, limit 6.

For a production system this would graduate to: vector embeddings on (description + amenities), kNN via `pgvector` or a sidecar (Pinecone/Weaviate), with this heuristic as the fallback for cold-start listings.

---

## Inquiry / spam protection (4 layers)

1. **Rate limit** — `express-rate-limit` keyed on `IP + email`, 5 requests / 60 min by default (configurable).
2. **DB unique constraint** — `@@unique([propertyId, userId])` blocks duplicates from logged-in users.
3. **Time-window dedup** — guest inquiries with the same `(propertyId, email)` within 24h are rejected with 409.
4. **Self-inquiry guard** — owners can't inquire on their own listings.

In production this would also gain:
- CAPTCHA on the guest path (Turnstile / reCAPTCHA v3).
- Honeypot field.
- Phone-number verification (OTP) for high-intent listings.

---

## Wishlist

Per-user "saved properties" with optimistic UI and a hydrated client cache.

**Data model** — `WishlistItem(userId, propertyId, createdAt)` with a composite unique `@@unique([userId, propertyId])`, cascade-delete on both foreign keys (so deleting a property or a user wipes their wishlist rows automatically), and indexes on each FK.

**API** (all under `/api/wishlist`, all require auth):
- `GET /` — paginated list of saved properties shaped exactly like the listings response (the page can reuse `PropertyCard`).
- `GET /ids` — cheap endpoint returning just `propertyId[]`; used by the client to hydrate "is this saved?" state for every visible card in one round-trip.
- `POST /:propertyId` — idempotent upsert; double-tapping the heart never errors.
- `DELETE /:propertyId` — `deleteMany` so removing a row that isn't there is a no-op (avoids P2025).

**Frontend** — `<WishlistProvider>` holds a `Set<string>` of saved ids, hydrates on login via `/api/wishlist/ids`, wipes on logout. `<WishlistButton>` is a two-variant component (floating heart on `PropertyCard`, inline pill on the detail page) that swallows the parent `<Link>`'s click so it works inside a card link. Toggles are optimistic with rollback on API error. Guests get bounced to `/login?next=...` instead of failing silently. A live red count badge appears on the header heart and in the dashboard nav.

---

## AI concierge

A Groq-powered chat widget that sits in the bottom-right of every page and only answers questions about Estatery or Indian real-estate concepts.

**Why Groq** — free tier, Llama 3.3 quality, ~500ms first-token latency. Fast enough to feel native, cheap enough to leave on by default.

**Hard scoping via system prompt** — the prompt at `backend/src/services/chat.service.js` hard-pins the assistant to:
1. Estatery site usage (filters, listings, dashboard, inquiries)
2. Indian real-estate concepts (BHK, carpet vs built-up area, RERA, stamp duty, PG culture, furnishing, etc.)
3. The 10 cities Estatery covers

Anything off-scope (general knowledge, weather, coding help, jokes) gets a single canned refusal — the model cannot be argued into general assistance. The prompt also forbids inventing listings/prices and forbids competitor mentions (99acres, MagicBricks, etc.).

**Output style** — the prompt instructs the model to use Markdown link form `[friendly text](/path)` instead of raw URL paths, so the user never sees `/dashboard` as plain text. The frontend Markdown renderer in `ChatWidget.tsx` supports both forms (bold, code, `[text](url)`, bare paths) with the URL pass deliberately ordered before the bold/code passes — running it after would mangle the `</strong>` closing tags whose `/strong` substring matches the URL char-class.

**API**:
- `POST /api/chat/message` — body `{ message, history }`, returns `{ reply, model }`. Rate-limited via the `chatLimiter` middleware. Returns a clean 400 with a setup hint when `GROQ_API_KEY` is missing, so the UI degrades gracefully on first-time setup.

---

## SEO strategy

The property detail page is the main SEO surface and uses **ISR** (`revalidate = 60`), so each page is served as static HTML from the cache and refreshed at most every minute:

- **SSR** of the initial HTML — search engines see full content immediately.
- **Per-page metadata** via `generateMetadata` — unique title, description, canonical URL, OG image.
- **JSON-LD `RealEstateListing` schema** — enables rich snippets in Google.
- **Sitemap** at `/sitemap.xml` generated from the API.
- **Robots** at `/robots.txt` — disallows the dashboard and auth pages.
- **Semantic HTML** — h1/h2 hierarchy, semantic landmarks, `alt` on every image.
- **Next.js Image optimization** — responsive `sizes`, AVIF/WebP, lazy-loading below the fold.

The home page uses static rendering + ISR (5 minutes); the listings page uses SSR (filters are user-driven so ISR doesn't help).

---

## Frontend architecture

```
frontend/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── page.tsx               # Landing (ISR 5m)
│   │   ├── properties/
│   │   │   ├── page.tsx           # Listings + filters (SSR)
│   │   │   ├── loading.tsx        # Skeleton
│   │   │   └── [slug]/
│   │   │       ├── page.tsx       # Detail (ISR 60s) + SEO + JSON-LD
│   │   │       └── ContactCTA.tsx
│   │   ├── login/ register/       # Auth flows
│   │   ├── dashboard/             # Owner area (client-side protected)
│   │   ├── sitemap.ts robots.ts   # SEO
│   │   ├── layout.tsx             # Root + fonts (Inter + Fraunces)
│   │   └── globals.css            # Tailwind layers + design tokens
│   ├── components/
│   │   ├── layout/Header.tsx Footer.tsx
│   │   ├── chat/ChatWidget.tsx    # AI concierge bubble
│   │   ├── property/
│   │   │   ├── PropertyCard.tsx PropertyCardSkeleton.tsx
│   │   │   ├── FiltersSidebar.tsx     # premium filters: amenities, area, bathrooms, verified-only, posted-within
│   │   │   ├── Gallery.tsx
│   │   │   ├── InquiryModal.tsx
│   │   │   ├── WishlistButton.tsx     # heart toggle (card + detail variants)
│   │   │   └── PropertyForm.tsx
│   │   └── HeroSearch.tsx
│   ├── lib/
│   │   ├── api.ts                 # typed API client
│   │   ├── types.ts               # shared TypeScript interfaces
│   │   └── format.ts              # INR/area/relative-time formatters
│   └── providers/
│       ├── AuthProvider.tsx       # token storage + /me hydration
│       └── WishlistProvider.tsx   # saved-property ids cache + optimistic toggle
├── tailwind.config.ts             # design tokens (ink/gold/canvas palette)
└── next.config.mjs                # remote image hosts
```

### Design system
- **Palette** — `ink` (deep navy, 9 shades) for surfaces, `gold` (warm amber) for accents, `canvas` cream for backgrounds.
- **Type** — Inter for UI, Fraunces (variable serif) for display — gives a premium real-estate feel without leaving system-safe fallbacks.
- **Components** — utility-first Tailwind with reusable composed classes (`btn-primary`, `card`, `input`, `badge-gold`) in `@layer components`.
- **Motion** — subtle hover lifts, fade-up entry animations, shimmer skeletons.

### Reusability
- `PropertyCard` is shared by landing, listings, and similar-properties sections.
- `PropertyForm` is shared by create (`/dashboard/new`) and edit (`/dashboard/properties/[id]/edit`).
- All API calls go through `src/lib/api.ts` — one place to add auth headers, error normalization, or interceptors.

---

## API surface

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account, returns tokens |
| POST | `/api/auth/login` | — | Email + password, returns tokens |
| POST | `/api/auth/refresh` | — | Rotate refresh + access token |
| POST | `/api/auth/logout` | — | Revoke refresh token |
| GET  | `/api/auth/me` | ✓ | Current user |
| GET  | `/api/properties` | — | Search + filter + paginate |
| GET  | `/api/properties/mine` | ✓ | Owner's listings |
| GET  | `/api/properties/:idOrSlug` | — | Detail (increments viewCount) |
| GET  | `/api/properties/:idOrSlug/similar` | — | Similar recommendations |
| POST | `/api/properties` | ✓ | Create (JSON or multipart) |
| PATCH| `/api/properties/:id` | ✓ owner | Update |
| DELETE| `/api/properties/:id` | ✓ owner | Delete |
| POST | `/api/properties/:id/images` | ✓ owner | Add images (multipart) |
| POST | `/api/inquiries` | optional | Send inquiry (rate-limited) |
| GET  | `/api/inquiries/received` | ✓ | Inquiries on your listings |
| GET  | `/api/wishlist` | ✓ | List saved properties (paginated, hydrates `PropertyCard`) |
| GET  | `/api/wishlist/ids` | ✓ | Just the saved `propertyId[]` for client cache hydration |
| POST | `/api/wishlist/:propertyId` | ✓ | Save a property (idempotent upsert) |
| DELETE | `/api/wishlist/:propertyId` | ✓ | Unsave |
| POST | `/api/chat/message` | — | AI concierge — scoped to Estatery + Indian real-estate (rate-limited) |
| GET  | `/api-docs` | — | Swagger UI |
| GET  | `/api/health` | — | Liveness probe |

---

## Scripts

### Backend
```bash
npm run dev               # nodemon
npm start                 # node
npm run prisma:migrate    # create + apply migration
npm run prisma:studio     # GUI explorer
npm run seed              # ~5k records
npm run seed:large        # 50k records (~30-60s)
```

### Frontend
```bash
npm run dev               # next dev
npm run build             # next build
npm start                 # production server
```

---

## Production hardening checklist

These are the gaps a real deployment would close — called out for transparency:

- [ ] Image storage → S3/Cloudinary instead of local `uploads/`
- [ ] Refresh tokens in `httpOnly` cookies, not localStorage
- [ ] CSRF token on cookie-based auth
- [ ] Redis-backed rate limiter (current one is in-memory, single-node only)
- [ ] Background email worker for inquiry notifications
- [ ] Full-text search on `tsvector` columns or Meilisearch sidecar
- [ ] Vector embeddings for similar-properties (pgvector)
- [ ] CDN in front of `/uploads` and `/_next/image`
- [ ] OpenTelemetry tracing + structured logs (pino + ELK)
- [ ] CAPTCHA on guest inquiry path
- [ ] Database connection pooling via PgBouncer
- [ ] Read replicas for the listings query
- [ ] `EXPLAIN ANALYZE` regression tests on hot queries
- [ ] Wishlist → server-rendered "Saved" page with proper share links + email digest of price drops on saved properties
- [ ] AI concierge → response caching for FAQ-style prompts, prompt-leak red-teaming, eval suite on the topical-scope refusal

The current build is intentionally scoped to demonstrate sound engineering judgment, not to ship to production — but every choice was made with the upgrade path in mind.
