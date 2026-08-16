# StoreRate

StoreRate is a full-stack web application I built to let users discover and rate stores, while giving store owners a dashboard to see how their store is performing and who's reviewing them. Admins can manage the whole platform — users, stores, and everything in between.

The app has three completely separate experiences depending on your role, all protected by JWT authentication with real server-side logout (tokens get deleted from the database on logout, not just cleared from the browser).

---

## What it's built with

- **Next.js 14** (App Router) — handles both the frontend and the backend API routes
- **React + Tailwind CSS** — UI, with Lucide for icons
- **MySQL 8** — raw parameterized queries via `mysql2/promise`, no ORM
- **JWT + bcryptjs** — authentication and password hashing
- **Service layer pattern** — all SQL lives in `src/services/`, API routes are thin controllers
- **Toast Notifications** — custom lightweight `ToastContext` for non-blocking alerts
- **UX Enhancements** — custom debounce hooks (`useDebounce`) & skeleton UI components for loading states

---

## How the code is organized

I went with a clean separation of concerns. The API routes just validate the request and call a service function — they don't touch SQL directly.

```
src/
├── app/
│   ├── api/              ← API routes (controllers only)
│   │   ├── auth/         login, logout, me, register, update-password
│   │   ├── admin/        dashboard, users, stores
│   │   ├── owner/        dashboard
│   │   ├── stores/       public store listing
│   │   └── ratings/      submit/update rating
│   ├── admin/dashboard/  Admin panel
│   ├── owner/dashboard/  Store owner view
│   ├── dashboard/        Normal user store browser
│   ├── login/
│   ├── register/
│   └── page.jsx          Root redirect based on role
│
├── services/             ← All raw SQL queries live here
│   ├── auth.service.js
│   ├── admin.service.js
│   ├── store.service.js
│   ├── rating.service.js
│   └── user.service.js
│
├── lib/
│   ├── db.js             MySQL connection pool
│   ├── auth.js           JWT generation, token storage/deletion, bcrypt
│   ├── middleware.js     authorize() — verifies token + checks role
│   ├── validators.js     Input validation helpers
│   ├── api.js            Client-side fetch wrapper with auto-auth headers
│   └── useDebounce.js    Custom debounce hook for search inputs
│
├── components/
│   ├── ui/               Alert, StarRating, SortableHeader, StatCard, Toast, Skeleton
│   ├── common/           Navbar, Sidebar, ProtectedRoute, ChangePasswordModal
│   └── admin/            AddUserModal, AddStoreModal
│
└── context/
    ├── AuthContext.jsx   Global auth state
    └── ToastContext.jsx  Global toast notification state
```

---

## Getting it running locally

### Prerequisites
- Node.js 18+
- MySQL 8 running locally

### Steps

**1. Clone and install**
```bash
git clone https://github.com/Sanju9008/StoreRate.git
cd StoreRate
npm install
```

**2. Set up your environment**

Copy `.env.example` to `.env` and fill in your database credentials:
```bash
cp .env.example .env
```

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=storerate_db
DB_PORT=3306
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=1d
```

**3. Create the database and seed it**
```bash
npm run db:setup   # creates the tables
npm run db:seed    # adds demo users, stores, and ratings
```

**4. Start the dev server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you'll be redirected to login.

---

## Demo accounts

After seeding, these accounts are ready to use:

| Role | Email | Password |
| --- | --- | --- |
| System Admin | `admin@platform.com` | `Admin@1234` |
| Store Owner | `owner@platform.com` | `Owner@1234` |
| Normal User | `user@platform.com` | `User@1234` |

---

## What each role can do

**System Admin**
- See total users, stores, and ratings on the dashboard
- Add new users (any role) through a single form with a role dropdown
- Add new stores and assign them to an existing store owner
- Search and sort the user/store tables by any column

**Store Owner**
- See their store's average rating and total review count
- View a sortable table of everyone who rated their store (name, email, address, rating, date)
- If no store has been assigned to them yet, they see a message explaining that

**Normal User**
- Browse all stores with a search bar (searches name and address)
- Sort stores by newest, highest rated, lowest rated, or name
- Rate any store from 1–5 stars — submitting again updates their previous rating (no duplicates)

---

## ⚡ Performance & UX Improvements

- **Optimistic UI Updates**: User star ratings update instantly on the screen before the network request resolves, with automatic rollback if the API fails.
- **Search Debouncing (300ms)**: Added debouncing across all search bars (user marketplace, admin tables, owner feedback log) to prevent unnecessary database queries on every keystroke.
- **SQL Query Optimization & Indexes**: Eliminated N+1 query loops using a single-pass `LEFT JOIN` with aggregated `AVG()` and `COUNT()` scores, backed by database indexes on `ratings(user_id, store_id)`, `stores(name, address)`, and `users(email)`.
- **Toast Notifications**: Added lightweight, non-blocking toast alerts for password updates, store creations, and rating changes.
- **Fully Responsive Design**: Mobile slide-over navigation drawer for Admin and Owner sidebars, horizontal scroll-safe data tables, and adaptive grids across all screen sizes.

---

## Database schema

Four tables, kept simple:

- **`users`** — stores name, email, bcrypt-hashed password, address, and role (`SYSTEM_ADMIN`, `STORE_OWNER`, `NORMAL_USER`)
- **`stores`** — name, email, address, and an optional `owner_id` foreign key pointing to a user
- **`ratings`** — links a user to a store with a 1–5 rating. Has a unique constraint on `(user_id, store_id)` so each user can only have one rating per store
- **`jwt_tokens`** — stores active tokens so we can properly invalidate them on logout instead of just waiting for expiry

---

## API routes

| Method | Endpoint | Who can use it | What it does |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Create a new normal user account |
| POST | `/api/auth/login` | Public | Log in, get a JWT back |
| GET | `/api/auth/me` | Any logged-in user | Verify the current session |
| POST | `/api/auth/logout` | Any logged-in user | Delete the token from the DB |
| PUT | `/api/auth/update-password` | Any logged-in user | Change password, invalidates all sessions |
| GET | `/api/admin/dashboard` | Admin only | Get platform-wide counts |
| GET | `/api/admin/users` | Admin only | List users with search/filter/sort |
| POST | `/api/admin/users` | Admin only | Create a user with any role |
| GET | `/api/admin/stores` | Admin only | List stores with search/sort |
| POST | `/api/admin/stores` | Admin only | Create a store, optionally link an owner |
| GET | `/api/owner/dashboard` | Store owner only | Get their store data + reviewer list |
| GET | `/api/stores` | Normal users | Browse stores with ratings |
| POST | `/api/ratings` | Normal users | Submit or update a rating |

---

## Validation

- **Name**: 1–60 characters
- **Email**: standard format, must be unique
- **Password**: minimum 6 characters at the API level; the Change Password form enforces 8–16 chars with at least one uppercase letter and one special character
- **Address**: up to 400 characters
- **Rating**: must be a whole number between 1 and 5
