
import React, { useState, useMemo, useEffect } from 'react';
import type { Student, Curriculum, Grade } from '../../types';
import Modal from './Modal';
import { getCategoryForStudent } from '../../utils/helpers';

interface AddGradesModalProps {
    student: Student;
    curriculum: Curriculum;
    onAddGrades: (newGrades: Grade[]) => void;
    onClose: () => void;
}

const AddGradesModal: React.FC<AddGradesModalProps> = ({ student, curriculum, onAddGrades, onClose }) => {
    const isUniversity = student && getCategoryForStudent(student) === 'university';
    const [periodType, setPeriodType] = useState(isUniversity ? 'semester' : 'monthly');
    const [period, setPeriod] = useState('');
    const [scores, setScores] = useState<{ [key: string]: number }>({});
    const [year, setYear] = useState('');
    const [semester, setSemester] = useState('');
    const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

    const subjects = useMemo(() => {
        if (!student || !student.School.name) return [];
        try {
            if (periodType === 'semester') {
                if (year && semester) {
                    return curriculum[student.School.name]?.[student.School.campus]?.[student.Major || '']?.[year]?.[semester] || [];
                }
                return [];
            }
            return curriculum[student.School.name]?.[student.School.campus]?.[student.Grade] || [];
        } catch (error) {
            console.error("Error accessing curriculum:", error);
            return [];
        }
    }, [student, curriculum, year, semester, periodType]);

    useEffect(() => {
        setPeriod('');
        setYear('');
        setSemester('');
        setScores({});
    }, [periodType]);

    const handleScoreChange = (subject: string, score: string) => {
        setScores(prev => ({ ...prev, [subject]: parseInt(score, 10) || 0 }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let date;
        if (periodType === 'semester') {
            const month = semester === 'Semester 1' ? '01' : '07';
            date = `${calendarYear}-${month}-15`;
        } else {
            date = period + '-15';
        }

        const newGrades = Object.entries(scores).map(([subject, score]) => ({
            StudentID: student.StudentID,
            Date: date,
            Subject: subject,
            Score: score
        }));
        onAddGrades(newGrades);
        onClose();
    };

    return (
        <Modal title={`Add Grades for ${student['Given Name']}`} onClose={onClose} maxWidth="max-w-xl">
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Period Type</label>
                    <div className="flex gap-4 mt-1">
                        <label className="flex items-center"><input type="radio" value="monthly" checked={periodType === 'monthly'} onChange={(e) => setPeriodType(e.target.value)} className="mr-1" /> Monthly</label>
                        <label className="flex items-center"><input type="radio" value="semester" checked={periodType === 'semester'} onChange={(e) => setPeriodType(e.target.value)} className="mr-1" /> Semester</label>
                    </div>
                </div>

                {periodType === 'monthly' && (
                     <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Select Month</label>
                        <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} className="mt-1 block w-full p-2 border rounded-md bg-white" required />
                    </div>
                )}

                {periodType === 'semester' && (
                     <div className="mb-4 flex gap-2">
                        <div className="w-1/3">
                            <label className="block text-sm font-medium text-gray-700">Academic Year</label>
                            <select value={year} onChange={(e) => setYear(e.target.value)} className="mt-1 block w-full p-2 border rounded-md bg-white" required>
                                <option value="">Select Year</option>
                                <option>Year 1</option><option>Year 2</option><option>Year 3</option><option>Year 4</option>
                            </select>
                        </div>
                        <div className="w-1/3">
                            <label className="block text-sm font-medium text-gray-700">Semester</label>
                            <select value={semester} onChange={(e) => setSemester(e.target.value)} className="mt-1 block w-full p-2 border rounded-md bg-white" required>
                                <option value="">Select Semester</option>
                                <option>Semester 1</option><option>Semester 2</option>
                            </select>
                        </div>
                         <div className="w-1/3">
                            <label className="block text-sm font-medium text-gray-700">Calendar Year</label>
                            <input type="number" value={calendarYear} onChange={(e) => setCalendarYear(parseInt(e.target.value, 10))} className="mt-1 block w-full p-2 border rounded-md bg-white" required />
                        </div>
                    </div>
                )}
                
                {subjects.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        {subjects.map(subject => (
                            <div key={subject}>
                                <label className="block text-sm font-medium text-gray-700">{subject}</label>
                                <input type="number" min="0" max="100" value={scores[subject] || ''} onChange={(e) => handleScoreChange(subject, e.target.value)} className="mt-1 block w-full p-2 border rounded-md bg-white" required />
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500">Please select a period to see the available subjects, or update the curriculum.</p>
                )}
                <div className="mt-6 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400">Cancel</button>
                    <button type="submit" disabled={subjects.length === 0} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">Save Grades</button>
                </div>
            </form>
        </Modal>
    );
};

export default AddGradesModal;
