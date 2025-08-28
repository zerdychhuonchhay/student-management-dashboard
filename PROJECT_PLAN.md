# Project Plan: Full-Stack Student Management System

This document outlines the technical roadmap for evolving the application from a frontend-only prototype into a secure, multi-user, full-stack application with advanced AI capabilities.

---

### **Milestone 1: Build the Backend Foundation (The Secure Vault) - COMPLETE**

**Goal:** Create a private, authoritative server to manage all data, logic, and secrets. All data will be migrated from frontend files to a secure database.

#### **Technical Implementation:**

*   **Project Setup:** A Node.js project has been created in the `backend` directory with all necessary dependencies.
*   **Database:** A Prisma schema (`prisma/schema.prisma`) now defines the entire database structure for PostgreSQL.
*   **Authentication API:** Secure endpoints for user registration (with `bcrypt` password hashing) and login (with JWT generation) are complete.
*   **Core Data API:** RESTful endpoints for managing students (`GET`, `POST`, `PUT`, `DELETE`) have been created.
*   **Validation:** Basic data validation has been implemented on the API routes.

#### **How to Run Your New Backend:**

1.  **Navigate to the Backend:** Open a new terminal and change directory into the new `backend` folder:
    ```bash
    cd backend
    ```
2.  **Install Dependencies:** Run `npm install` to download all the required libraries.
    ```bash
    npm install
    ```
3.  **Set Up Environment Variables:**
    *   Create a new file in the `backend` folder named `.env`.
    *   Copy the contents of `.env.example` into your new `.env` file.
    *   **Crucially, you must replace the `DATABASE_URL` with your actual PostgreSQL connection string.** You can get a free database from services like Supabase or Render.
    *   The `JWT_SECRET` is a random string you should create for security.
4.  **Set Up the Database:** Run the Prisma migrate command. This will read your `schema.prisma` file and create all the necessary tables in your database.
    ```bash
    npx prisma migrate dev --name init
    ```
5.  **Seed the Database:** (Optional but recommended) Run the seed script to create the initial 'Admin' and 'Teacher' users so you can log in.
    ```bash
    npx prisma db seed
    ```
6.  **Start the Server:** Run the development server.
    ```bash
    npm run dev
    ```
    Your backend API will now be running, typically on `http://localhost:3001`.

---

### **Milestone 2: Secure Frontend Integration**

**Goal:** Refactor the React application to communicate exclusively and securely with the new backend API.

#### **Technical Implementation:**

1.  **API Client Setup:**
    *   Use `axios` for all HTTP requests from the frontend.
    *   Create a centralized `axios` instance with a base URL configured via environment variables (`VITE_API_BASE_URL`).

2.  **Data Fetching Refactor:**
    *   In `AppContext.tsx`, remove all local data imports (`initialStudents`, etc.).
    *   Use a `useEffect` hook to fetch initial data (`/api/students`, `/api/users`, etc.) from the backend when the application loads. Manage loading and error states.

3.  **Authentication Flow:**
    *   The `LoginPage` will call `POST /api/auth/login`.
    *   On a successful response, the JWT received from the backend will be stored in a secure, **`httpOnly` cookie**. This is a critical security measure against XSS attacks. The backend will be responsible for setting this cookie.
    *   Configure the `axios` instance to automatically include credentials (the cookie) with every subsequent request (`withCredentials: true`).

4.  **Secure the Gemini API Key:**
    *   **CRITICAL:** Remove all direct calls to the Gemini API from the frontend. The API key must be removed from the frontend's environment.
    *   Create a new, authenticated backend endpoint: `POST /api/ai/check-eligibility`.
    *   This endpoint receives student data from the frontend, verifies the user is authenticated via their JWT cookie, and *then* makes the call to the Gemini API using the key stored securely in the backend's environment variables.

---

### **Milestone 3: Role-Based Access Control (RBAC)**

**Goal:** Enforce different permissions for 'Admin' and 'Teacher' roles throughout the application.

#### **Technical Implementation:**

1.  **Backend Authorization Middleware:**
    *   Create an Express middleware function (e.g., `requireRole('Admin')`).
    *   This middleware will run on protected routes. It will decode the JWT from the request, check if the user's `role` payload matches the required role, and reject with a `403 Forbidden` error if it does not.
    *   Apply this middleware to all sensitive API endpoints (e.g., `DELETE` routes, user management routes, settings updates should be Admin-only).

2.  **Frontend Conditional UI:**
    *   The `currentUser` object in the `AppContext` will contain the user's role.
    *   Refactor UI components to conditionally render elements based on this role.
    *   **Example:** The "Settings" link in the `Sidebar` and the "Delete" button on the `ArchivePage` should only be rendered if `currentUser.role === 'Admin'`. This provides a clean UX but does not replace the need for backend enforcement.

---

### **Milestone 4: Advanced AI-Powered Features**

**Goal:** Leverage the secure backend and aggregated student data to provide new generative AI insights.

#### **Technical Implementation:**

1.  **AI-Generated Follow-up Recommendations:**
    *   **Frontend:** Add a "Get AI Recommendations" button to the `StudentProfilePage`.
    *   **Backend:** Create a new endpoint: `POST /api/ai/followup-recommendations/:studentId`.
        *   This endpoint will be protected and require authentication.
        *   It will fetch the specified student's complete history from the database (grades, recent follow-ups, at-risk status).
        *   It will construct a detailed prompt for the Gemini API, instructing it to act as a school counselor and suggest 3-5 key talking points or questions for the next follow-up meeting.
        *   The AI's response will be streamed back to the frontend.
    *   **Frontend:** Display the AI's recommendations in a modal.

2.  **AI-Generated Student Profile Summaries:**
    *   **Frontend:** Add a "Generate Summary" button to the `StudentProfilePage` header.
    *   **Backend:** Create a new endpoint: `GET /api/ai/student-summary/:studentId`.
        *   This endpoint will gather the student's profile, calculate their average grade, and count key follow-up indicators.
        *   It will prompt the Gemini API to write a concise, one-paragraph summary of the student's current academic and personal status, suitable for a report.
        *   The summary will be returned as a string.
    *   **Frontend:** Display the summary in a new "AI Summary" card on the profile, perhaps with a "copy to clipboard" button.

---

### **Milestone 5: Deployment & Production Readiness**

**Goal:** Deploy the full-stack application to the internet securely and reliably.

#### **Technical Implementation:**

1.  **Hosting:**
    *   **Frontend (React App):** Deploy to a static hosting provider like **Vercel** or **Netlify**.
    *   **Backend (Node.js App & PostgreSQL DB):** Deploy to a platform-as-a-service (PaaS) like **Render** or **Heroku**.

2.  **Environment Variables:**
    *   Configure all secrets (Database Connection URL, JWT Secret, Gemini API Key) in the secure environment variable settings of the hosting providers. **`.env` files must not be committed to Git or uploaded.**

3.  **CORS (Cross-Origin Resource Sharing):**
    *   Configure the Express `cors` middleware on the backend to only accept requests from your deployed frontend's domain. This prevents other websites from making requests to your API.

4.  **HTTPS:**
    *   Ensure both frontend and backend are served over HTTPS. All recommended hosting providers offer free, automatic SSL certificates.
