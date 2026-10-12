# PrintForge

A full-stack marketplace for 3D-printable models. Browse and search a catalog of designs, like your favorites, follow creators, and upload your own models with help from an AI listing assistant.

Built with **Next.js 16 (App Router)**, **TypeScript**, **PostgreSQL**, **NextAuth**, **Tailwind CSS** and the **Claude API**.

---

## Features

### Catalog
- Browse 50+ models in a responsive grid, each showing its creator
- **Search** by name or description (case-insensitive)
- **Sort** by most popular, A–Z, or most recent
- **Filter** by category (10 categories)
- **Server-side pagination**: only the current page is fetched from the database
- Model detail pages with creator, category, likes and upload date
- Loading states and custom 404 pages

### Authentication
- Register and log in with email + password (NextAuth Credentials provider)
- Passwords hashed with **bcrypt**; the plain password is never stored
- Encrypted JWT session cookie (HttpOnly)
- Same error for "unknown email" and "wrong password", so accounts can't be discovered through the login form
- Private routes protected by **Next.js Proxy** (`proxy.ts`), with a redirect back to the requested page after login
- Open-redirect protection on the `callbackUrl` parameter

### Upload, edit and delete your models
- Upload page with an image picker, preview, and a live preview card that updates as you type
- Images up to 5MB (PNG, JPG or WebP); without one, a placeholder is used
- Server-side validation with **zod**: field lengths, the category must exist in the database, image type and size
- **Edit** and **delete** your own models from the dashboard
- **Ownership checks on the server**: updates and deletes only touch rows where `user_id` matches the logged-in user, so nobody can change someone else's model by guessing an id
- Login is checked inside every Server Action, not only on the page

### ✨ AI listing assistant
On the upload page, pick an image and click **"Suggest details"**. Claude looks at the image and fills in a name, description and category, which you can edit before saving.
- **Vision**: the listing is written from the uploaded image
- **Structured outputs**: the response always matches a schema, and the category is limited to the real category slugs, so it can't invent one
- Runs in a **Server Action**: the API key never reaches the browser
- **Per-user daily limit** to keep API costs under control
- Suggestions only: you always review before saving, and the form still works if the AI call fails

### Likes
- Like and unlike models; the heart updates instantly with **`useOptimistic`** and rolls back if the request fails
- One like per user per model, enforced by the database (composite primary key on `likes`)
- Like counts are computed from the `likes` table, not stored as a number that can drift

### Creator profiles (`/users/[id]`)
- Public page with the creator's name, join date, number of models and likes received
- Grid of everything they've uploaded
- Creator names on model cards and detail pages link to their profile

### Dashboard (`/dashboard`)
- Stats: models uploaded, total likes received (with the average per model), most-liked model
- "My models" table with a sticky header and scrolling; turns into a compact list on mobile
- View, edit and delete actions on every row
- Empty state for users without uploads

### Database
- **PostgreSQL** with a relational schema: `users`, `categories`, `models` (`models.user_id → users.id`) and `likes` (many-to-many between users and models)
- Parameterized queries with [postgres.js](https://github.com/porsager/postgres); sort options come from a whitelist, so user input never becomes SQL
- Seed script that creates demo creators and assigns every model to one of them

---

## Tech stack

| Area | Tools |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, Server Actions, Proxy) |
| Language | TypeScript |
| UI | React 19 (`useActionState`, `useOptimistic`), Tailwind CSS 4, react-icons |
| Database | PostgreSQL 18, postgres.js |
| Auth | NextAuth v4 (Credentials, JWT), bcryptjs |
| AI | Claude API (`@anthropic-ai/sdk`): vision + structured outputs |
| Validation | zod |

---

## Getting started

### Prerequisites
- Node.js 20.6 or newer
- PostgreSQL (with pgAdmin 4, or `psql`)
- An [Anthropic API key](https://console.anthropic.com/) for the AI listing assistant

### 1. Install dependencies
```bash
npm install
```

### 2. Create the database
In pgAdmin create a database called `printforge`, open **Tools → Query Tool** and run [`scripts/schema.sql`](scripts/schema.sql).

### 3. Environment variables
Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/printforge
NEXTAUTH_SECRET=generate-one-with-npx-auth-secret
NEXTAUTH_URL=http://localhost:3000
ANTHROPIC_API_KEY=your-anthropic-api-key
```

If your database password has special characters, URL-encode them (`@` → `%40`, `#` → `%23`).

### 4. Seed and run
```bash
npm run db:seed   # 3 demo users, 10 categories, 52 models
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts
| Email | Password |
|---|---|
| `maya@printforge.dev` | `password123` |
| `leo@printforge.dev` | `password123` |
| `sara@printforge.dev` | `password123` |

---

## Project structure

```
app/
├── 3d-models/            # Catalog, category pages, model detail page
├── users/[id]/           # Public creator profiles
├── dashboard/            # Dashboard, upload and edit pages (protected)
├── login/ register/      # Auth pages
├── api/auth/[...nextauth]/route.ts
├── components/           # UI components (dashboard/ holds dashboard-only ones)
└── lib/
    ├── auth.ts           # NextAuth options
    ├── models.ts         # Shared types
    └── database/         # db.ts (connection), model, category, user and like queries
scripts/
├── schema.sql            # Table definitions
└── seed.ts               # Demo data
proxy.ts                  # Route protection
docs/POSTGRES_MIGRATION.md  # Notes from moving SQLite → PostgreSQL
```

---

## Roadmap

- [ ] **Deploy** to Vercel with a hosted PostgreSQL database
