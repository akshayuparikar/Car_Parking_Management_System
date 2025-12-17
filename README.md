## Car_Parking_Management_System
The Car Parking Management System is a full-stack web application built using the MERN stack. It is designed to automate and streamline the management of parking spaces in commercial, residential, and public areas. The system enables real-time tracking of parking slot availability, vehicle entry/exit logging, billing, and user management.

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
