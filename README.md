# Backend Server

Express.js backend server for the e-commerce application.

## Setup

1. Install dependencies (from project root):
```bash
npm install
```

2. Create `.env` file in the `backend/` directory:
```bash
cp backend/.env.example backend/.env
```

3. Update `.env` with your configuration:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `BACKEND_PORT` - Server port (default: 5000)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:3000)

## Running

### Development
```bash
npm run dev:backend
```

### Production
```bash
npm run start:backend
```

### Run Both Frontend and Backend
```bash
npm run dev:all
```

## Project Structure

```
backend/
├── server.js              # Main Express server entry point
├── config/
│   └── prisma.js         # Prisma client configuration
├── controllers/          # Business logic (request handlers)
│   └── admin/
│       └── orderController.js
├── routes/               # API route definitions
│   ├── index.js          # Main router
│   └── admin/
│       ├── index.js
│       └── order.js
└── utils/                # Utility functions
    ├── response.js       # Response formatting
    ├── auth.js           # Authentication utilities
    └── orderStatuses.js  # Order status constants
```

## API Endpoints

All endpoints are prefixed with `/api`

### Admin Routes
- `GET /api/admin/order` - Get all orders (with pagination)
- `PATCH /api/admin/order/:id` - Update order

### Health Check
- `GET /health` - Server health check

## Migration Status

✅ **Completed:**
- Server setup
- Admin order routes (GET, PATCH)

⏳ **In Progress:**
- Other routes are placeholders and need to be migrated

See `BACKEND_MIGRATION_GUIDE.md` for detailed migration instructions.

# ecommerce-korean-backend
