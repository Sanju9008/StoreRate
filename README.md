# StoreRate

A robust, full-stack Store Rating Management System that connects **System Administrators**, **Store Owners**, and **Regular Users** through a secure, role-based platform. Built with Next.js App Router, a clean **service layer architecture**, and a raw MySQL backend for full data control.

## 🚀 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router) |
| **UI** | React, Tailwind CSS, Lucide React |
| **Backend** | Next.js API Routes (Node.js) — thin controllers + service layer |
| **Database** | MySQL 8.0+ via `mysql2/promise` (Raw Parameterized Queries) |
| **Auth** | JWT (`jsonwebtoken`), `bcryptjs`, DB-level Token Revocation |

---

## ✨ Core Features

### 🔐 Unified Authentication & RBAC
- Single login/register flow with dynamic redirect to role-specific dashboard
- JWT-based auth backed by a `jwt_tokens` revocation table — real server-side logout
- Multi-layer validation (client + API) enforcing name, address, and password rules
- `ProtectedRoute` component blocks access to unauthorized roles client-side

### 🛡️ System Administrator Dashboard
- Live metrics: total users, total stores, total ratings
- Multi-column sortable, searchable, filterable data tables for users and stores
- Single **Add New User** modal with role selector (`SYSTEM_ADMIN` / `STORE_OWNER` / `NORMAL_USER`)
- **Add New Store** modal with dynamic owner dropdown (fetches all `STORE_OWNER` accounts)

### 🛍️ Normal User Dashboard
- Browse all stores with debounced real-time search (name & address)
- Sort by newest, highest rated, lowest rated, or alphabetical
- Interactive 5-star rating widget — submit or modify ratings with live average updates

### 🏢 Store Owner Dashboard
- Overview card showing their store's average rating and total review count
- Sortable reviewer log: name, email, address, rating, date

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── api/                    ← Lean controllers (validate → call service → respond)
│   │   ├── auth/               login | logout | me | register | update-password
│   │   ├── admin/              dashboard | users | stores
│   │   ├── owner/              dashboard
│   │   ├── stores/             public store listing
│   │   └── ratings/            upsert rating
│   ├── admin/dashboard/        System Admin UI
│   ├── owner/dashboard/        Store Owner UI
│   ├── dashboard/              Normal User UI
│   ├── login/ & register/      Auth pages
│   └── page.jsx                Root redirect
│
├── services/                   ← Data Access Layer (all raw SQL lives here)
│   ├── auth.service.js
│   ├── admin.service.js
│   ├── store.service.js
│   ├── rating.service.js
│   └── user.service.js
│
├── lib/
│   ├── db.js                   MySQL connection pool
│   ├── auth.js                 bcrypt, JWT sign/verify, token CRUD
│   ├── middleware.js            authorize() — token verification + role check
│   ├── validators.js            Field validation functions
│   └── api.js                  Client-side fetch wrapper (auto-auth + 401 logout)
│
├── components/
│   ├── ui/                     Alert | StarRating | SortableHeader | StatCard
│   ├── common/                 Navbar | ProtectedRoute | ChangePasswordModal
│   └── admin/                  AddUserModal | AddStoreModal
│
└── context/
    └── AuthContext.jsx          Global auth state, login/logout/register actions
```

---

## 🛠️ Quick Start Guide

### Prerequisites
- Node.js v18+
- MySQL 8.0+ Server

### 1. Clone & Install
```bash
git clone https://github.com/Sanju9008/StoreRate.git
cd StoreRate
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env` and fill in your MySQL credentials:
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

### 3. Database Setup
```bash
# Create schema and tables
npm run db:setup

# Seed demo users, stores, and ratings
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **System Admin** | `admin@platform.com` | `Admin@1234` |
| **Store Owner** | `owner@platform.com` | `Owner@1234` |
| **Normal User** | `user@platform.com` | `User@1234` |

> All accounts satisfy the platform's validation rules: Name 20–60 chars, Password 8–16 chars with ≥1 uppercase and ≥1 special character.

---

## 🗄️ Database Schema

Four normalized MySQL tables:

| Table | Purpose |
| :--- | :--- |
| `users` | Identity: id, name, email, password (bcrypt), address, role (ENUM), timestamps |
| `stores` | Store entities: id, name, email, address, owner_id (FK → users) |
| `ratings` | Association: user_id × store_id, rating 1–5, UNIQUE(user_id, store_id) |
| `jwt_tokens` | Token revocation: id, user_id, token, expires_at, is_revoked |

---

## 📡 API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register as `NORMAL_USER` |
| `POST` | `/api/auth/login` | Public | Authenticate, receive JWT |
| `GET` | `/api/auth/me` | Authenticated | Verify session & fetch profile |
| `POST` | `/api/auth/logout` | Authenticated | Revoke JWT from DB |
| `PUT` | `/api/auth/update-password` | Authenticated | Change password, invalidate sessions |
| `GET` | `/api/admin/dashboard` | `SYSTEM_ADMIN` | Platform metrics (users/stores/ratings) |
| `GET` | `/api/admin/users` | `SYSTEM_ADMIN` | List users with search/filter/sort |
| `POST` | `/api/admin/users` | `SYSTEM_ADMIN` | Create any role user |
| `GET` | `/api/admin/stores` | `SYSTEM_ADMIN` | List stores with search/sort |
| `POST` | `/api/admin/stores` | `SYSTEM_ADMIN` | Create store, optionally assign owner |
| `GET` | `/api/owner/dashboard` | `STORE_OWNER` | Own store info + reviewer log |
| `GET` | `/api/stores` | `NORMAL_USER` | All stores with avg rating + user's rating |
| `POST` | `/api/ratings` | `NORMAL_USER` | Submit or update rating (UPSERT) |

---

## ✅ Validation Rules

| Field | Rule |
| :--- | :--- |
| **Name** | Required, 1–60 characters |
| **Email** | Valid email format, must be unique |
| **Password** | Min 6 characters (API); 8–16 chars + uppercase + special char (Change Password UI) |
| **Address** | Required, max 400 characters |
| **Rating** | Integer, 1–5 inclusive |
