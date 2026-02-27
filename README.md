# Warehouse Inventory Management System

A full-stack inventory management application for warehouse operations.

## Tech Stack

- **Frontend**: Next.js, TypeScript, Styled Components
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Notifications**: Firebase Cloud Messaging

## Prerequisites

- Node.js 16+
- PostgreSQL
- npm or yarn

## Quick Start

### Database Setup

1. Create PostgreSQL database named `inventory`
2. Run migrations:

```bash
cd backend
npm run migrate:up
```

### Backend

```bash
cd backend
npm install
npm run dev
```

Server runs on http://localhost:3000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Client runs on http://localhost:3001

## Environment Configuration

Create `backend/.env`:

```env
DATABASE_URL=postgres://username@localhost:5432/inventory
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=24h
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

## Features

- User authentication and authorization
- Inventory item management
- Pallet tracking
- Owner management
- Lot management
- Push notifications
- Role-based access control

## API Endpoints

- `/auth` - Authentication
- `/items` - Inventory items
- `/pallets` - Pallet management
- `/owners` - Owner management
- `/lots` - Lot tracking
- `/notifications` - Push notifications

## Database Migrations

```bash
cd backend
npm run migrate:status    # Check migration status
npm run migrate:up        # Run pending migrations
npm run migrate:down      # Rollback last migration
npm run migrate:create    # Create new migration
```
