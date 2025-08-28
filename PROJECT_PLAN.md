
# Project & Learning Plan: Building a Secure, Full-Stack App from Zero

This document is your roadmap. It's designed for two purposes:
1.  **Building the Project with AI:** It provides clear prompts you can give to an AI to generate the code for each step.
2.  **Your Learning Plan:** It provides a parallel, step-by-step learning path for you to understand the concepts behind the AI-generated code.

**The Goal:** Transform this AI-built prototype into a secure, professional, multi-user application, and learn the fundamentals of web development along the way.

---

### **Milestone 1: Build the Backend Foundation (The Secure Vault)**

**Project Goal:** Create a private server that will act as the single source of truth and the guardian of your data and secrets. All data (students, users, grades) will move from the frontend code into a secure, private database.

#### **1. Prompts for AI (Building the Project)**

Give the AI these prompts one at a time:

1.  *"Create a new folder in my project called `backend`. Inside the `backend` folder, initialize a new Node.js project with a `package.json` file."*
2.  *"Add the `express` library to the `backend` project. Create a `server.js` file that starts a basic Express server on port 3001 and responds with `{ message: 'Hello World' }` at the root URL `/`."*
3.  *"Now, set up a secure login system. Add the `bcryptjs` and `jsonwebtoken` libraries to the backend. Create a new API endpoint `POST /api/auth/login`. For now, it should just check against a hardcoded user email and password. If they match, it should create and return a JSON Web Token (JWT)."*
4.  *"Create a new API endpoint `GET /api/students`. This endpoint should be protected and only accessible if the user provides a valid JWT. If they are authenticated, it should return the list of students from the `initialStudents` data file for now."*

#### **2. Beginner's Learning Roadmap (Your Learning)**

Your goal here is to understand the "what" and "why" behind the backend code.

*   **Step 1: Understand the Client-Server Model (The Big Picture)**
    *   **Concept:** Your browser is the "Client." It makes requests (like asking for data). A "Server" is a computer somewhere else that listens for those requests, does some work (like getting data from a database), and sends back a response.
    *   **Analogy:** It's like ordering at a restaurant. You (the Client) make a request to the waiter. The waiter goes to the kitchen (the Server), which prepares your food and sends it back with the waiter. Your current app has the kitchen inside the dining room, which isn't secure or efficient!
    *   **Action:** Watch a short video on "Client-Server Architecture." (Search on YouTube).

*   **Step 2: What is Node.js and Express?**
    *   **Concept:** Node.js lets you run JavaScript code outside of a browser (on a server). Express is a popular "framework" (a set of tools and rules) that makes building servers with Node.js much easier and more organized.
    *   **Action:** Review the `server.js` file the AI generated. Identify the lines that create the server and define a "route" (`/`).

*   **Step 3: What is an API?**
    *   **Concept:** An API (Application Programming Interface) is a set of specific URLs (like `/api/students`) that the server exposes for the client to interact with. It's the official "menu" that the client can order from.
    *   **Action:** Look at the routes the AI created (`/api/auth/login`, `/api/students`). Notice how they are like addresses for specific pieces of information.

*   **Step 4: Why Hashing Passwords is CRITICAL (Security)**
    *   **Concept:** You **never** store a user's actual password. You store a unique, one-way "hash" of it. `bcrypt` is a tool that creates these hashes.
    *   **Analogy:** It's like taking a fingerprint. You can easily take someone's fingerprint from their finger, but you can't re-create their finger just by looking at the fingerprint. Hashing is a one-way street, which keeps passwords safe even if a database is stolen.
    *   **Action:** Read a short article or watch a video on "Password Hashing."

---

### **Milestone 2: Connect the Frontend Securely (The Armored Truck)**

**Project Goal:** Update the React frontend to stop using local data files and instead fetch all its information securely from our new backend.

#### **1. Prompts for AI (Building the Project)**

1.  *"Refactor the `AppContext.tsx` file. Remove all the `import { initial... }` data files. Instead, when the app loads, use `axios` inside a `useEffect` hook to make an API call to the backend at `GET /api/students` and load the data into the state."*
2.  *"Update the `LoginPage.tsx` component. When the user submits the form, it should now use `axios` to send a `POST` request to the backend at `/api/auth/login`. If the login is successful, store the JWT that the server returns."*
3.  *"Set up `axios` so that after a user logs in, the JWT is automatically attached to the header of every future API request sent to our backend."*
4.  *"Secure the Gemini API key. Create a new, protected backend endpoint `POST /api/ai/check-eligibility`. This endpoint should take student data from the frontend, and then make the call to the Gemini API from the server. The React app should now call this new backend endpoint instead of calling the Gemini API directly."*

#### **2. Beginner's Learning Roadmap (Your Learning)**

*   **Step 1: Asynchronous JavaScript (Fetching Data)**
    *   **Concept:** When you request data from a server, it takes time. "Asynchronous" means your code doesn't wait; it kicks off the request and continues running. `useEffect` in React is the perfect place to start these data requests when a component first loads.
    *   **Tools:** `axios` is a library that makes these data requests (called HTTP requests) simple. `async/await` is modern JavaScript syntax that makes asynchronous code easier to read.
    *   **Action:** Look at the `useEffect` hook in `AppContext.tsx`. Identify the `axios.get` call and the `async/await` keywords. Watch a beginner's guide to `async/await` in JavaScript on a platform like freeCodeCamp.

*   **Step 2: What is a JWT (JSON Web Token)?**
    *   **Concept:** A JWT is a secure, digitally signed "ID card" that the server gives to the client after they log in. The client then shows this ID card with every future request to prove who they are.
    *   **Analogy:** It's like a concert wristband. You show your ticket once at the main gate (login) and get a wristband. Now you can walk around the venue and get into different areas just by showing your wristband, without having to show your main ticket every single time.
    *   **Action:** Look at the login function. See where it receives the "token" (the JWT) from the server response.

---

### **Milestone 3: Implement Permissions (The VIP Pass)**

**Project Goal:** Make the application behave differently based on the user's role (Admin vs. Teacher).

#### **1. Prompts for AI (Building the Project)**

1.  *"In the backend, create an Express 'middleware' function called `isAdmin`. This function should check the JWT from the request to see if the user's role is 'Admin'. If it's not, it should block the request and send back a '403 Forbidden' error."*
2.  *"Apply the `isAdmin` middleware to the backend routes for deleting a student and resetting all data. Only Admins should be able to perform these actions."*
3.  *"In the React frontend, update the `Sidebar.tsx` component. The 'Settings' and 'Pending List' menu items should only be visible if the `currentUser.role` is 'Admin'."*
4.  *"Update the `ArchivePage.tsx` component. The 'Delete' and 'Restore' buttons should only be visible to Admin users."*

#### **2. Beginner's Learning Roadmap (Your Learning)**

*   **Step 1: What is Middleware?**
    *   **Concept:** Middleware is code that runs *in the middle* of a request-response cycle on the server. It can check, modify, or block a request before it reaches its final destination.
    *   **Analogy:** It's like a security guard at the door of a club (the API route). The guard checks your ID (your JWT and role) before you're allowed to enter. Our `isAdmin` middleware is this security guard.
    *   **Action:** Review the `server.js` or routes file the AI creates. Find where the `isAdmin` middleware is applied to a route.

*   **Step 2: Conditional Rendering in React**
    *   **Concept:** This is a fundamental React pattern where you show or hide parts of the UI based on a condition (like the user's role).
    *   **Syntax:** You'll often see this pattern: `{currentUser.role === 'Admin' && <AdminButton />}`. This literally means "if the user's role is Admin, then render the AdminButton component."
    *   **Action:** Find the `Sidebar.tsx` and `ArchivePage.tsx` files after the AI modifies them. Identify where this `{condition && ...}` pattern is used to hide buttons and links.

---

### **Milestone 4: Add New AI-Powered Features**

**Project Goal:** Leverage our secure backend and student data to create new, intelligent features.

#### **1. Prompts for AI (Building the Project)**

1.  **AI-Generated Follow-up Recommendations:**
    *   *"Create a new 'Get AI Recommendations' button on the `StudentProfilePage.tsx` in the Follow-up History section. When clicked, it should call a new, secure backend endpoint: `POST /api/ai/followup-recommendations/:studentId`."*
    *   *"The backend endpoint should fetch the specified student's complete history (grades, past follow-ups, guardian info). It should then send this data to the Gemini API with a prompt asking it to act as a school counselor and suggest 3-5 key talking points or questions for the next follow-up meeting with this student. The AI's response should be sent back to the frontend."*
    *   *"Display the AI's recommendations in a new modal on the frontend."*

2.  **AI-Generated Student Profile Summaries:**
    *   *"Add a 'Generate Summary' button to the header of the `StudentProfilePage.tsx`. This should call a new backend endpoint: `GET /api/ai/student-summary/:studentId`."*
    *   *"The backend endpoint should gather the student's profile, average grade, and a count of their positive and negative follow-up indicators. It should then ask the Gemini API to write a concise, one-paragraph summary of the student's current status, suitable for a report. The summary should be returned to the frontend."*
    *   *"Display this summary in a new 'AI Summary' card on the student's profile page."*

#### **2. Beginner's Learning Roadmap (Your Learning)**

*   **Step 1: The Backend as an AI Proxy**
    *   **Concept:** At this stage, you'll see a clear pattern: the frontend *never* talks to the Gemini API directly. It asks our backend for information, and the backend securely talks to the Gemini API on its behalf. This is called a "proxy."
    *   **Action:** Review the new backend API routes. Notice how they are the ones that contain the `await ai.models.generateContent(...)` call, keeping the API key and complex logic hidden from the client.

*   **Step 2: Prompt Engineering**
    *   **Concept:** The quality of the AI's output depends almost entirely on the quality of the "prompt" (the instructions) you give it. This is a skill called prompt engineering.
    *   **Action:** Look at the prompts the AI writes on the backend. Notice how it gives the AI a specific role ("act as a school counselor"), a clear task ("suggest talking points"), and provides the necessary context (the student's data). Experiment with changing these prompts to see how it affects the AI's response.
