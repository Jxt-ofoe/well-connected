# Well Connected — E-Commerce MVP

A premium e-commerce platform with a customer storefront and admin dashboard.

## Tech Stack

- **Frontend**: Next.js (App Router) + React
- **Backend**: Node.js + Express
- **Database**: Turso (SQLite-based)
- **Auth**: JWT + bcrypt
- **Styling**: Vanilla CSS (Black & Gold theme)

## Getting Started

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit .env with your Turso credentials:
# - TURSO_DATABASE_URL=libsql://your-db.turso.io
# - TURSO_AUTH_TOKEN=your-token
# - JWT_SECRET=your-secret-key

# Seed the database (creates admin user + sample products)
npm run seed

# Start the server
npm run dev
```

**Default admin credentials:**
- Email: `admin@wellconnected.com`
- Password: `admin123`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs on `http://localhost:3000`
Backend runs on `http://localhost:5000`

## Project Structure

```
well connected/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/       # Auth, validation, rate limiting
│   │   ├── routes/           # API route definitions
│   │   ├── db.js             # Turso database connection
│   │   ├── index.js          # Express server entry
│   │   └── seed.js           # Database seeder
│   ├── .env                  # Environment variables
│   └── package.json
│
└── frontend/
    └── src/
        ├── app/              # Next.js pages (App Router)
        │   ├── admin/        # Admin dashboard
        │   ├── cart/          # Shopping cart
        │   ├── checkout/     # Checkout flow
        │   ├── products/     # Product listing & detail
        │   └── order-confirmation/
        ├── components/       # Shared components
        ├── context/          # React contexts (Cart, Auth)
        └── lib/              # API helpers
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/admin/login` | — | Admin login |
| GET | `/api/products` | — | List products |
| GET | `/api/products/:id` | — | Product detail |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| POST | `/api/orders` | — | Place order |
| GET | `/api/orders` | Admin | List orders |
| PUT | `/api/orders/:id` | Admin | Update status |

## Deployment

### Frontend (Vercel)
1. Push frontend to GitHub
2. Import repo in Vercel
3. Set `NEXT_PUBLIC_API_URL` env var to your deployed backend URL

### Backend
1. Deploy to Railway, Render, or Fly.io
2. Set environment variables (Turso URL, token, JWT secret)
3. Run `npm run seed` once to initialize the database
