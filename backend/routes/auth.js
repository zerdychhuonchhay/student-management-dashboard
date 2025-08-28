import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// --- Register a new user ---
router.post(
    '/register',
    // Basic validation
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, role } = req.body;

        try {
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'User with this email already exists' });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    role: role || 'Teacher', // Default to Teacher if not specified
                },
            });
            
            // Don't send password back
            const { password: _, ...userWithoutPassword } = user;

            res.status(201).json({ message: 'User created successfully', user: userWithoutPassword });
        } catch (error) {
            res.status(500).json({ message: 'Server error during registration', error: error.message });
        }
    }
);

// --- Login a user ---
router.post(
    '/login',
    body('email').isEmail(),
    body('password').notEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Generate JWT
            const token = jwt.sign(
                { userId: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1d' } // Token expires in 1 day
            );

            // Don't send password back
            const { password: _, ...userWithoutPassword } = user;

            res.status(200).json({
                message: 'Login successful',
                token,
                user: userWithoutPassword,
            });

        } catch (error) {
            res.status(500).json({ message: 'Server error during login', error: error.message });
        }
    }
);

export default router;
