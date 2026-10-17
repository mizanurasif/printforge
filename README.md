# PrintForge

A full-stack marketplace for 3D-printable models. Browse a catalog of designs, spin them around in an interactive **3D viewer**, like your favorites, follow creators, and upload your own models.

Built with **Next.js 16 (App Router)**, **TypeScript**, **PostgreSQL**, **NextAuth**, **three.js** and **Tailwind CSS**.

---

## Features

### Interactive 3D viewer
- Every catalog model has a real `.glb` file you can **rotate, pan and zoom** on its detail page
- Animated 3D phoenix in the home page hero
- Built directly on **three.js** (WebGL renderer, `GLTFLoader`, `OrbitControls`, studio lighting from `RoomEnvironment`)
- Auto-framing: each model is centered and the camera is pulled back until it fits, whatever its size or units
- **Code-split and client-only**: three.js loads in its own chunk through `next/dynamic` (`ssr: false`), so pages that don't show a model never download it
- The model's thumbnail is shown while the 3D file loads, with an error state if it fails
- Full cleanup on unmount (geometries, materials, textures, WebGL context) so navigating between models doesn't leak GPU memory
- Touch-friendly: when zoom is off, vertical swipes still scroll the page

### Catalog
- 47 models across 11 categories, each showing its creator
- **Search** by name or description (case-insensitive)
- **Sort** by most popular, A–Z, or most recent
- **Filter** by category
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
- Images up to 5MB (PNG, JPG or WebP), processed with **sharp**: auto-rotated from EXIF data, cropped to 500×500 and converted to WebP under a random file name. Without an image, a placeholder is used
- Server-side validation with **zod**: field lengths, the category must exist in the database, image type and size
- **3D model upload**, required for every model (`.glb`, up to 50MB):
  - **Live 3D preview** in the form before anything is uploaded (the file is shown from a local `blob:` URL)
  - Without an image, a **snapshot of the 3D preview** becomes the catalog picture
  - Sent to its own Route Handler (`PUT /api/models/[id]/file`) with a progress bar, because Server Actions are capped at 6MB. The body **streams to disk** instead of being held in memory
  - The server checks the binary glTF header and the real byte count, not the file name or `Content-Length`, and deletes partial files on failure
  - If the file upload fails, the just-created model is deleted again, so no model exists without its 3D file
  - Saved as `public/models/<category>/upload-<uuid>.glb`, moved if the category changes, and replaceable from the edit page
- **Edit** and **delete** your own models from the dashboard; deleting a model also removes its uploaded image and 3D file
- **Ownership checks on the server**: updates and deletes only touch rows where `user_id` matches the logged-in user, so nobody can change someone else's model by guessing an id
- Login is checked inside every Server Action, not only on the page

### Likes
- Like and unlike models; the heart and count update instantly (optimistic update with `useTransition`), roll back if the request fails, then sync to the real count from the database
- One like per user per model, enforced by the database (composite primary key on `likes`)
- Like counts are computed from the `likes` table, not stored as a number that can drift

### Creator profiles (`/user/[id]`)
- Public page with the creator's name, join date, number of models and likes received
- Grid of everything they've uploaded
- Creator names on model cards and detail pages link to their profile

### Dashboard (`/dashboard`)
- Stats: models uploaded, total likes received (with the average per model), most-liked model
- "My models" table with a sticky header and scrolling; turns into a compact list on mobile
- View, edit and delete actions on every row
- **Delete account**, confirmed with your password, which also removes your uploaded images
- Empty state for users without uploads

### Database
- **PostgreSQL** with a relational schema: `users`, `categories`, `models` (`models.user_id → users.id`) and `likes` (many-to-many between users and models)
- Parameterized queries with [postgres.js](https://github.com/porsager/postgres); sort options come from a whitelist, so user input never becomes SQL
- Seed script that runs in a single transaction, creates demo creators and assigns every model to one of them

---

## Tech stack

| Area | Tools |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, Server Actions, Proxy) |
| Language | TypeScript |
| UI | React 19 (`useActionState`, `useTransition`, React Compiler), Tailwind CSS 4, react-icons |
| 3D | three.js (glTF / `.glb` models) |
| Database | PostgreSQL 18, postgres.js |
| Auth | NextAuth v4 (Credentials, JWT), bcryptjs |
| Images | sharp |
| Validation | zod |

---

## Getting started

### Prerequisites
- Node.js 20.6 or newer
- PostgreSQL (with pgAdmin 4, or `psql`)

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
```

If your database password has special characters, URL-encode them (`@` → `%40`, `#` → `%23`).

### 4. Seed and run
```bash
npm run db:seed   # 3 demo users, 11 categories, 47 models
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
├── user/[id]/            # Public creator profiles
├── dashboard/            # Dashboard, upload and edit pages (protected)
├── login/ register/      # Auth pages
├── about/
├── api/auth/[...nextauth]/route.ts
├── api/models/[id]/file/route.ts   # Streams an uploaded .glb to disk
├── components/
│   ├── Model/            # Cards, grid, like button, ModelPreview + ModelViewer (three.js)
│   ├── HeroModel.tsx     # Animated home page model
│   └── dashboard/        # Dashboard-only components
├── data/                 # Seed data (models and categories)
└── lib/
    ├── auth.ts           # NextAuth options
    ├── imageUtils.ts     # Save / delete uploaded images (sharp)
    ├── modelFileUtils.ts # Save (with glTF checks) / move / delete uploaded .glb files
    ├── models.ts         # Shared types
    └── database/         # db.ts (connection), model, category, user and like queries
public/
├── models/               # .glb files, one folder per category (credits in SOURCES.md)
└── img/thumbnails/       # Catalog thumbnails
scripts/
├── schema.sql            # Table definitions
└── seed.ts               # Demo data
proxy.ts                  # Route protection
```

---

## 3D model credits

The catalog's 3D models come from [Poly Haven](https://polyhaven.com), the [Khronos glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets) and other free sources, under CC0 or CC-BY 4.0 licenses. Authors and licenses for every file are listed in [`public/models/SOURCES.md`](public/models/SOURCES.md), which is also linked from the site footer.

---

## Roadmap

- [ ] **Deploy** to Vercel with a hosted PostgreSQL database
- [ ] Move uploads (images and `.glb` files) to object storage / a CDN. Files written to `public/` at runtime only work with `npm run dev` and a writable disk, not on Vercel
