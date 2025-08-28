# Project & Learning Plan: Building a Secure, Full-Stack Student Management System

This document outlines the transition from a frontend-only prototype to a secure, multi-user, full-stack application. It is designed to be both a project roadmap and a learning guide.

#### **Guiding Principles:**

*   **Security First:** The API Key and user data must never be exposed to the browser. The backend is the single source of truth and authority.
*   **Clear Separation of Concerns:** The Frontend (React) is responsible for the User Interface. The Backend (Node.js) is responsible for business logic, data storage, and security.
*   **Scalability:** The architecture should be able to grow to handle more users, data, and features in the future.

---

### **Phase 1: Build the Backend Foundation (The Secure Vault)**

**Goal:** Create a secure, private server that will manage all data and logic.

#### **Project Plan & Technical Suggestions:**

1.  **Initialize a Node.js Project:**
    *   Create a new folder named `backend`.
    *   Inside it, run `npm init -y` to create a `package.json` file.
    *   Install Express: `npm install express`.
    *   Create a basic `server.js` file to start your Express server.

2.  **Set Up the Database:**
    *   **Technology:** Use **PostgreSQL**. It's a powerful, reliable, and industry-standard relational database.
    *   **Suggestion:** Use an **ORM (Object-Relational Mapper)** like **Prisma** or **Sequelize**. This makes interacting with the database much safer and easier than writing raw SQL queries. It helps prevent common security vulnerabilities like SQL injection.
    *   **Action:** Define your database schema (tables for `users`, `students`, `grades`, `guardians`, etc.) using the ORM's schema language.

3.  **Implement Secure User Authentication:**
    *   **Technology:** Use the **`bcrypt`** library (`npm install bcryptjs`).
    *   **Action:** When a user is created, do **not** store their password. Store the `bcrypt` hash of their password.
    *   Create an API endpoint `POST /api/auth/login`. This endpoint will take an email and password, hash the provided password, and compare it to the hash stored in the database.

4.  **Build Core API Endpoints:**
    *   Create a set of secure REST API endpoints for managing students.
        *   `GET /api/students` (gets all students)
        *   `GET /api/students/:id` (gets a single student)
        *   `POST /api/students` (creates a new student)
        *   `PUT /api/students/:id` (updates a student)
        *   `DELETE /api/students/:id` (archives or deletes a student)

5.  **Implement API Data Validation:**
    *   **Technology:** Use a library like **`express-validator`**.
    *   **Action:** Before any data is saved to your database, use this library to validate it. For example, ensure that `email` is a valid email format, `income` is a number, and required fields are not empty. **This is a critical security step.**

---
#### **Learning Plan for Phase 1:**

*   **Node.js & Express Basics:** Learn how to create routes, handle requests and responses, and structure an Express application.
*   **REST API Design Principles:** Understand what makes a good API (using correct HTTP verbs like GET, POST, PUT, DELETE; consistent URL structures).
*   **SQL Fundamentals & Database Modeling:** Learn how to design database tables and define relationships (e.g., the one-to-many relationship between a student and their grades).
*   **ORM Concepts (Prisma is highly recommended):** Learn how to define a schema and use the ORM client to perform safe database queries.
*   **Password Security:** Understand *why* you must hash passwords and how `bcrypt` works.

---

### **Phase 2: Connect the Frontend Securely (The Armored Truck)**

**Goal:** Refactor the React application to communicate exclusively with the new secure backend.

#### **Project Plan & Technical Suggestions:**

1.  **Refactor Data Fetching:**
    *   **Technology:** Use **`axios`** (`npm install axios`) in your React app for making API calls. It's more powerful than the native `fetch` for this use case.
    *   **Action:** In `context/AppContext.tsx`, remove all the `import { initialStudents } from ...` statements. Replace them with API calls inside a `useEffect` hook to fetch data from your backend when the app first loads.

2.  **Implement Token-Based Authentication Flow:**
    *   **Technology:** Use **JSON Web Tokens (JWTs)** (`npm install jsonwebtoken` on the backend).
    *   **Action (Login Flow):**
        1.  The `LoginPage` will now call `POST /api/auth/login`.
        2.  If successful, the backend creates a JWT (containing the user's ID and role) and sends it back to the frontend.
        3.  **Crucial:** The frontend should store this JWT in a secure **`httpOnly` cookie**. This is more secure than `localStorage` as it prevents access from client-side scripts (XSS attacks).
    *   **Action (Authenticated Requests):** Use an `axios` interceptor to automatically attach the JWT to every subsequent API request, proving to the backend that the user is logged in.

3.  **Secure the Gemini API Key:**
    *   **Action:** The React frontend will **never** call the Gemini API directly again.
    *   Create a new, authenticated endpoint on your backend: `POST /api/ai/check-eligibility`.
    *   The frontend will send the new student's data to this endpoint.
    *   Your backend server will receive this request, verify the user is logged in, and *then* make the call to the Gemini API using the key stored securely on the server. The server then returns the result to the frontend.

---
#### **Learning Plan for Phase 2:**

*   **Making API calls in React:** Master using `useEffect` to fetch data and manage loading/error states.
*   **JWT Authentication Flow:** Deeply understand the login -> get token -> store token -> send token on future requests cycle.
*   **`axios` Interceptors:** Learn how to use interceptors to automate attaching tokens to requests and handling global errors (like a `401 Unauthorized` error when a token expires).
*   **Frontend Environment Variables:** Learn how to use a `.env` file in your React/Vite project to store the URL of your backend API (e.g., `VITE_API_BASE_URL=http://localhost:3001`).

---

### **Phase 3 & 4: Permissions and Production Readiness**

**Goal:** Enforce user roles and deploy the application to the internet.

#### **Project Plan & Technical Suggestions:**

1.  **Implement Backend Authorization Middleware:**
    *   **Action:** In your Express backend, create a middleware function called `isAdmin`. This function will run on specific routes. It will decode the JWT from the incoming request, check if the user's `role` is `'Admin'`, and if not, immediately reject the request with a `403 Forbidden` error.
    *   Apply this middleware to all sensitive endpoints, like `DELETE /api/students/:id` or `POST /api/users`.

2.  **Implement Conditional Rendering in Frontend:**
    *   **Action:** In the React code, use the `currentUser.role` from the `AppContext` to conditionally render UI elements. For example, the "Settings" button in the sidebar and the "Delete" button on a profile should only be rendered if `currentUser.role === 'Admin'`.

3.  **Deploy the Application:**
    *   **Frontend Hosting:** Use a service like **Vercel** or **Netlify**. They are optimized for modern frontend applications, offer free tiers, and provide automatic HTTPS.
    *   **Backend & Database Hosting:** Use a service like **Render** or **Heroku**. They can host your Node.js application and your PostgreSQL database together and have excellent free/hobby tiers to get started.
    *   **Environment Variables in Production:** You will **not** upload your `.env` files. Instead, you will copy the values (your database connection string, your Gemini API key, your JWT secret) into the secure "Environment Variables" section of your hosting provider's dashboard.

---
#### **Learning Plan for Phase 3 & 4:**

*   **Express Middleware:** Understand how middleware intercepts and processes requests in the Express pipeline.
*   **Conditional Rendering in React:** Master this fundamental React concept.
*   **Basic DevOps:** Learn the core concepts of deployment—how your code gets from your computer to a live server on the internet.
*   **Managing Environment Variables in Production:** Understand the crucial difference between local `.env` files and a production environment.