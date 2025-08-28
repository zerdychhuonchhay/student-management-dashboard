
# Project Plan: Full-Stack Student Management System

This document outlines the technical roadmap for evolving the application from a frontend-only prototype into a secure, multi-user, full-stack application with advanced AI capabilities.

---

### **Milestone 1: Build the Backend Foundation (The Secure Vault)**

**Goal:** Create a private, authoritative server to manage all data, logic, and secrets. All data will be migrated from frontend files to a secure database.

#### **Technical Implementation:**

1.  **Project Setup:**
    *   Initialize a new Node.js project in a `backend` directory.
    *   Install dependencies: `express`, `pg` (for PostgreSQL), `prisma` (ORM), `bcryptjs` (hashing), `jsonwebtoken` (authentication), `cors`, `dotenv`, `express-validator`.

2.  **Database:**
    *   **Technology:** PostgreSQL.
    *   **Schema:** Use Prisma to define a relational schema with tables for `User`, `Student`, `Guardian`, `Grade`, `FollowUp`, `FinancialRecord`, etc. Define relations (e.g., a `Student` has many `Grades`).
    *   **Action:** Run `prisma migrate dev` to generate and apply the SQL migrations to your database.

3.  **Authentication API:**
    *   **Security:** Implement password hashing using `bcrypt`. **Plain text passwords must not be stored.**
    *   **Endpoints:**
        *   `POST /api/auth/register`: Hashes the password before creating a new `User`.
        *   `POST /api/auth/login`: Compares the provided password against the stored hash. On success, generates and returns a JSON Web Token (JWT).
        *   `POST /api/auth/logout`: Invalidates the user's session (can be implemented with a token blocklist if needed).

4.  **Core Data API:**
    *   Create RESTful endpoints for all data models (e.g., `students`, `grades`).
    *   **Endpoints Example (Students):**
        *   `GET /api/students`: Fetch all students.
        *   `GET /api/students/:id`: Fetch a single student with their related data (grades, guardians).
        *   `POST /api/students`: Create a new student.
        *   `PUT /api/students/:id`: Update a student.
        *   `DELETE /api/students/:id`: Archive a student.
    *   **Validation:** Use `express-validator` middleware on all `POST` and `PUT` routes to validate and sanitize incoming data before it reaches the database logic.

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
