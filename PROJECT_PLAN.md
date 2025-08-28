# Project Plan: Full-Stack Student Management System (Django Backend)

This document outlines the technical roadmap for evolving the application from a frontend-only prototype into a secure, multi-user, full-stack application with an advanced Python/Django backend.

---

### **Milestone 1: Build the Django Backend Foundation - COMPLETE**

**Goal:** Create a private, authoritative server using Python and Django to manage all data, logic, and secrets. All data will be migrated from frontend files to a secure database.

#### **Technical Implementation:**

*   **Project Setup:** A new Django project has been created in the `django_backend` directory with all necessary apps and dependencies defined in `requirements.txt`.
*   **Database:** Django's built-in ORM is used to define the entire database schema in `api/models.py`. The default database is SQLite for easy setup, but it is configured to be easily switched to PostgreSQL for production.
*   **Authentication API:** Secure endpoints for user registration and token-based login (using Django REST Framework's TokenAuthentication) are complete.
*   **Core Data API:** RESTful endpoints for managing students (`GET`, `POST`, `PUT`, `DELETE`) have been created using Django REST Framework's `ModelViewSet`.
*   **Validation:** Data validation is handled automatically by the API serializers (`api/serializers.py`).

#### **How to Run Your New Django Backend:**

1.  **Prerequisites:** You must have **Python** (version 3.8 or newer) and `pip` installed on your system.

2.  **Navigate to the Backend:** Open a new terminal and change directory into the new `django_backend` folder:
    ```bash
    cd django_backend
    ```
3.  **Create a Virtual Environment:** This is a best practice for Python projects to keep dependencies isolated.
    ```bash
    python -m venv venv
    ```
4.  **Activate the Virtual Environment:**
    *   On macOS/Linux: `source venv/bin/activate`
    *   On Windows: `venv\Scripts\activate`
    Your terminal prompt should now show `(venv)` at the beginning.

5.  **Install Dependencies:** Use `pip` to install all the libraries listed in `requirements.txt`.
    ```bash
    pip install -r requirements.txt
    ```
6.  **Set Up Environment Variables:**
    *   Create a new file in the `django_backend` folder named `.env`.
    *   Copy the contents of `django_backend/.env.example` into your new `.env` file.
    *   The `SECRET_KEY` is critical for security. You can generate a new one or use the example for development. For production, always generate a new one.

7.  **Set Up the Database:** Run the Django migrate command. This will read your `api/models.py` file and create a `db.sqlite3` file with all the necessary tables.
    ```bash
    python manage.py migrate
    ```
8.  **Create a Superuser:** This will be your first 'Admin' account, allowing you to access Django's built-in admin interface.
    ```bash
    python manage.py createsuperuser
    ```
    You will be prompted to create a username, email, and password.

9.  **Start the Server:** Run the development server.
    ```bash
    python manage.py runserver
    ```
    Your Django backend API will now be running, typically on `http://127.0.0.1:8000/`. You can visit this URL in your browser to confirm it's working. You can also log into the admin panel at `http://127.0.0.1:8000/admin/`.

---

### **Milestone 2: Secure Frontend Integration**

**Goal:** Refactor the React application to communicate exclusively and securely with the new Django backend API.

#### **Technical Implementation:**

1.  **API Client Setup:** Use `axios` to make API calls from the React frontend to the Django backend (e.g., to `http://127.0.0.1:8000/api/`).
2.  **Data Fetching Refactor:** In `AppContext.tsx`, remove local data imports and use `useEffect` to fetch initial data from the Django API.
3.  **Authentication Flow:**
    *   `LoginPage` calls `POST /api/login/` with a username and password.
    *   On success, the backend returns an authentication token.
    *   The frontend stores this token and includes it in the `Authorization` header for all subsequent requests (e.g., `Authorization: Token <your_token>`).
4.  **Secure the Gemini API Key:** Create a new, authenticated endpoint on the Django backend (e.g., `POST /api/ai/check-eligibility/`). The frontend calls this endpoint, and the backend securely calls the Gemini API, keeping the key private.

---

### **Milestone 3: Role-Based Access Control (RBAC)**

**Goal:** Enforce different permissions for 'Admin' and 'Teacher' roles.

#### **Technical Implementation:**

1.  **Backend Authorization:** Use Django REST Framework's built-in permission classes (e.g., `IsAdminUser`) to protect sensitive API endpoints.
2.  **Frontend Conditional UI:** In React, conditionally render UI elements based on the `currentUser.role` stored in the `AppContext`.

---

### **Milestone 4 & 5: Advanced AI Features & Deployment**

**Goal:** Build new AI features and deploy the full-stack application.

#### **Technical Implementation:**

1.  **Advanced AI Features:** Create new Django API endpoints that fetch data, construct detailed prompts, and call the Gemini API from the backend to generate follow-up recommendations and student summaries.
2.  **Deployment:** Deploy the frontend (React) to a service like Vercel and the backend (Django) to a service like Render or Heroku. Configure CORS and environment variables in the production environment.
