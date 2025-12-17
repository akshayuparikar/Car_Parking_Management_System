# Car Parking Management System

The Car Parking Management System is a full-stack web application built using the MERN stack. It is designed to automate and streamline the management of parking spaces in commercial, residential, and other facilities.

---

## Parking Management Backend

### Setup

1. **Copy `.env` file**  
   Copy the `.env.example` file to `.env` and fill in your MongoDB URI and JWT secret.

2. **Install dependencies**  
   Run the following command to install all required dependencies:
   ```sh
   npm install
   ```

3. **Start the server**  
   - **Development mode**:
     ```sh
     npm run dev
     ```
   - **Production mode**:
     ```sh
     npm start
     ```

---

### Project Structure

- **`src/models`**: Mongoose models
- **`src/routes`**: Express routes
- **`src/controllers`**: Route handlers
- **`src/middleware`**: Authentication and role middleware
- **`src/config`**: Database and configuration files

---

### Features

- JWT Authentication
- Role-based access control (ADMIN, USER)
- CRUD operations for:
  - Floors
  - Slots
  - Vehicles
  - Payment History
- User management
- Dashboard APIs

---

**Note**:  
Check the codebase for seed data and further instructions.
