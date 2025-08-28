import express from 'express';
import prisma from '../lib/prisma.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// --- GET ALL STUDENTS ---
router.get('/', async (req, res) => {
    try {
        const students = await prisma.student.findMany({
            include: {
                grades: true,
                guardians: true,
            },
        });
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get students', error: error.message });
    }
});

// --- GET ONE STUDENT BY ID ---
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const student = await prisma.student.findUnique({
            where: { id },
            include: {
                grades: true,
                followUps: true,
                guardians: true,
                financialRecords: true,
                educationHistory: true,
                school: true,
            },
        });
        if (student) {
            res.status(200).json(student);
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to get student', error: error.message });
    }
});

// --- CREATE A NEW STUDENT ---
router.post(
    '/',
    [
        body('studentId').notEmpty().withMessage('Student ID is required'),
        body('givenName').notEmpty().withMessage('Given name is required'),
        body('familyName').notEmpty().withMessage('Family name is required'),
        body('sex').isIn(['M', 'F']).withMessage('Sex must be M or F'),
        body('dob').isISO8601().toDate().withMessage('Valid date of birth is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const newStudent = await prisma.student.create({
                data: {
                    studentId: req.body.studentId,
                    givenName: req.body.givenName,
                    familyName: req.body.familyName,
                    sex: req.body.sex,
                    dob: req.body.dob,
                    grade: req.body.grade,
                    // Add other fields from req.body as needed
                },
            });
            res.status(201).json(newStudent);
        } catch (error) {
             if (error.code === 'P2002') { // Prisma unique constraint violation
                return res.status(400).json({ message: 'A student with this Student ID already exists.' });
            }
            res.status(500).json({ message: 'Failed to create student', error: error.message });
        }
    }
);

// --- UPDATE A STUDENT ---
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const updatedStudent = await prisma.student.update({
            where: { id },
            data: req.body, // Assumes body contains fields to update
        });
        res.status(200).json(updatedStudent);
    } catch (error) {
         if (error.code === 'P2025') { // Prisma record not found
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(500).json({ message: 'Failed to update student', error: error.message });
    }
});

// --- DELETE A STUDENT (Archive logic can be implemented here) ---
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.student.delete({
            where: { id },
        });
        res.status(204).send(); // No content
    } catch (error) {
        if (error.code === 'P2025') { // Prisma record not found
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(500).json({ message: 'Failed to delete student', error: error.message });
    }
});

export default router;
