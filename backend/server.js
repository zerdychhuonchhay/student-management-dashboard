import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/students.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
// Enable CORS for all routes and origins (for development)
// In production, you should restrict this to your frontend's domain.
app.use(cors()); 

// Parse incoming JSON requests
app.use(express.json());

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);


// --- Health Check Route ---
app.get('/', (req, res) => {
    res.send('Student Dashboard API is running...');
});


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
