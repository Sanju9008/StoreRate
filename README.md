# StoreRate

A robust, full-stack Store Rating Management System designed to seamlessly connect system administrators, store owners, and regular consumers through a unified, secure platform. Built with a modern Next.js architecture and powered by a highly optimized raw MySQL backend, StoreRate enforces strict role-based access control and high data integrity.

## 🚀 Tech Stack
- **Frontend**: Next.js (App Router), React, Tailwind CSS, Lucide React
- **Backend**: Next.js API Routes (Node.js)
- **Database**: MySQL 8.0+ via `mysql2/promise` (Raw Parameterized Queries)
- **Security**: JSON Web Tokens (JWT), bcryptjs for password hashing, Token Revocation Tables

---

## ✨ Core Features

### Unified Authentication & RBAC
- **Single Entry Point**: A unified login and registration flow that dynamically routing users to role-specific dashboards based on their assigned `role` (`SYSTEM_ADMIN`, `STORE_OWNER`, `NORMAL_USER`).
- **Token Lifecycle**: JWT-based stateless authentication coupled with a `jwt_tokens` database table enabling instantaneous, server-side token revocation on logout.
- **Data Integrity Validation**: Multi-layer (Client + API) strict validation enforcing:
  - Name: 20–60 characters
  - Address: Max 400 characters
  - Password: 8–16 characters containing at least 1 uppercase letter and 1 special character.

### 🛡️ System Administrator Dashboard
- **Executive Metrics**: Live statistics on total users, total stores, and total ratings across the platform.
- **Data Grids**: Interactive, multi-column sortable data tables for managing users and stores.
- **Search & Filter**: Real-time debounced search by name, email, or address, combined with role dropdown filtering.
- **Entity Creation**: Dedicated modals to create verified Users and link new Stores to existing `STORE_OWNER` accounts securely.

### 🛍️ Normal User Dashboard
- **Discovery**: A clean, accessible directory to browse available stores, featuring dynamic debounced search querying both Name and Address.
- **Interactive Ratings**: Instant visual feedback via an integrated `<StarRating />` component, allowing users to submit new ratings (1-5 stars) or dynamically modify existing ones through atomic UPSERT database operations without reloading the page.

### 🏢 Store Owner Dashboard
- **Store Performance**: A focused, high-level summary header showcasing their assigned store's average decimal rating and aggregate review count.
- **Customer Logs**: A sortable, structured ledger detailing all customer feedback, exposing reviewer credentials (Name, Email, Address, Date) alongside their submitted score.

---

## 🛠️ Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- MySQL Workbench / Server (v8.0+)

### 2. Installation
Clone the repository and install the dependencies:
```bash
git clone <repository_url>
cd My_Dashboard
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and configure your credentials (reference `.env.example`):
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=storerate_db
DB_PORT=3306

JWT_SECRET=your_super_secret_jwt_key_here
```

### 4. Database Initialization & Seeding
Use the automated npm scripts to bootstrap your MySQL database. This creates the schema, necessary tables, and injects the demo credentials.
```bash
# Execute schema creation
npm run db:setup

# Inject Demo Data
npm run db:seed
```

### 5. Run the Application
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) to access the platform.

---

## 🔑 Demo Credentials

All seed accounts adhere strictly to the 20-60 character name restriction and the secure password requirements.

| Role | Email | Password | Assigned Name |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@platform.com` | `Admin@1234` | System Platform Administrator Lead |
| **Store Owner** | `owner@platform.com` | `Owner@1234` | Registered Store Owner Representative |
| **Normal User** | `user@platform.com` | `User@1234` | Verified Regular Customer Profile |

---

## 🏗️ Database Architecture

The system utilizes four cleanly normalized MySQL tables:

1. **`users`**: Centralized identity management tracking `id`, `name`, `email`, `password` (hashed), `address`, `role` (ENUM), and timestamps.
2. **`stores`**: Independent entities tracking `id`, `name`, `email`, `address`, and an optional `owner_id` Foreign Key linked to the `users` table.
3. **`ratings`**: Association table mapping a `user_id` to a `store_id` containing an integer `rating` (1-5). Enforces `UNIQUE(user_id, store_id)` to ensure one rating per user per store.
4. **`jwt_tokens`**: Security table used for token validation and instantaneous logout capabilities storing `id`, `user_id`, `token`, `expires_at`.

---

## 📡 API Reference

All API routes utilize strict validation and Role-Based Access Control middleware.

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new `NORMAL_USER` |
| `POST` | `/api/auth/login` | Public | Authenticate and issue JWT |
| `GET` | `/api/auth/me` | Authenticated | Verify active session & retrieve profile |
| `POST` | `/api/auth/logout` | Authenticated | Revoke active JWT |
| `PUT` | `/api/auth/update-password`| Authenticated | Secure password modification |
| `GET` | `/api/admin/dashboard` | `SYSTEM_ADMIN` | Fetch aggregate system metrics |
| `GET` | `/api/admin/users` | `SYSTEM_ADMIN` | Query, filter, and sort users |
| `POST` | `/api/admin/users` | `SYSTEM_ADMIN` | Provision new platform users |
| `GET` | `/api/admin/stores` | `SYSTEM_ADMIN` | Query and sort stores |
| `POST` | `/api/admin/stores` | `SYSTEM_ADMIN` | Provision and assign new stores |
| `GET` | `/api/owner/dashboard` | `STORE_OWNER` | Fetch assigned store & review log |
| `GET` | `/api/stores` | `NORMAL_USER` | Discover available stores w/ ratings |
| `POST` | `/api/ratings` | `NORMAL_USER` | Submit or modify a store rating (UPSERT) |
