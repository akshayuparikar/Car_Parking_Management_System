# Parking Management Backend

## Setup

1. Copy `.env.example` to `.env` and fill in your MongoDB URI and JWT secret.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the server in development mode:
   ```sh
   npm run dev
   ```
   Or in production mode:
   ```sh
   npm start
   ```

## Project Structure
- `src/models`: Mongoose models
- `src/routes`: Express routes
- `src/controllers`: Route handlers
- `src/middleware`: Auth and role middleware
- `src/config`: DB and config files

## Features
- JWT Auth
- Role-based access (ADMIN, USER)
- CRUD for Floor, Slot, Vehicle, PaymentHistory
- User management
- Dashboard APIs

---

See seed data and further instructions in the codebase.
