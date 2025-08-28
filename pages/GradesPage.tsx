
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getCambodianGrade } from '../utils/helpers';

const GradesPage: React.FC = () => {
    const { selectedStudent: student, studentGrades, openModal, setActiveTab, schoolAverages } = useAppContext();

    const performanceTrendData = useMemo(() => {
        if (!studentGrades || studentGrades.length === 0) return [];
        
        const dataByDate = studentGrades.reduce((acc, grade) => {
            const dateKey = grade.Date.substring(0, 7); // Group by month (YYYY-MM)
            if (!acc[dateKey]) {
                acc[dateKey] = { total: 0, count: 0, date: grade.Date };
            }
            acc[dateKey].total += grade.Score;
            acc[dateKey].count++;
            return acc;
        }, {} as { [key: string]: { total: number, count: number, date: string } });

        return Object.values(dataByDate)
            .map(({ date, total, count }) => ({
                date: new Date(date).toLocaleString('default', { month: 'short', year: 'numeric' }),
                "Average Score": parseFloat((total / count).toFixed(2)),
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [studentGrades]);
    
    const subjectComparisonData = useMemo(() => {
        if (!studentGrades || !student || studentGrades.length === 0) return [];
        const subjectScores: { [key: string]: number[] } = {};
        studentGrades.forEach(grade => {
            if (!subjectScores[grade.Subject]) {
                subjectScores[grade.Subject] = [];
            }
            subjectScores[grade.Subject].push(grade.Score);
        });

        return Object.entries(subjectScores).map(([subject, scores]) => {
            const studentAvg = scores.reduce((a, b) => a + b, 0) / scores.length;
            const schoolAvgKey = `${student.School.name}-${student.Grade}-${subject}`;
            return {
                subject,
                "Student Score": parseFloat(studentAvg.toFixed(2)),
                "School Average": schoolAverages[schoolAvgKey] || 0,
            };
        });
    }, [studentGrades, student, schoolAverages]);

    if (!student) {
        return <div className="p-8 text-center text-gray-600">Please select a student to view their grades.</div>;
    }

    const onBack = () => setActiveTab('profile');

    return (
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col h-full overflow-y-auto">
            <header className="bg-white shadow-md rounded-lg p-6 mb-6 flex-shrink-0">
                 <div className="flex justify-between items-center">
                    <div>
                        <button onClick={onBack} className="text-sm text-indigo-600 hover:underline flex items-center gap-1 mb-2">
                            <ArrowLeft size={14} /> Back to Profile
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">Grade Center: {student['Given Name']}</h1>
                        <p className="text-gray-600">Student ID: {student.StudentID}</p>
                    </div>
                    <button onClick={() => openModal('add-grades', student)} className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-700 flex items-center gap-2"><PlusCircle size={16} /> Add Grades</button>
                </div>
            </header>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Performance Trend</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={performanceTrendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="Average Score" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Subject Strengths & Weaknesses</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={subjectComparisonData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="subject" />
                            <YAxis domain={[0, 100]}/>
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Student Score" fill="#8884d8" />
                            <Bar dataKey="School Average" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
                <h2 className="text-xl font-semibold mb-4">All Grade Records</h2>
                <div className="max-h-80 overflow-y-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-4 py-2 text-left">Date</th>
                                <th className="px-4 py-2 text-left">Subject</th>
                                <th className="px-4 py-2 text-left">Score</th>
                                <th className="px-4 py-2 text-left">School Average</th>
                                <th className="px-4 py-2 text-left">Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                        {studentGrades.map((gradeItem, index) => {
                            const cambodianGrade = getCambodianGrade(gradeItem.Score);
                            const schoolAvgKey = `${student.School.name}-${student.Grade}-${gradeItem.Subject}`;
                            const schoolAvg = schoolAverages[schoolAvgKey] ? schoolAverages[schoolAvgKey].toFixed(2) : 'N/A';
                            return (
                                <tr key={index} className="border-b">
                                    <td className="px-4 py-2">{gradeItem.Date}</td>
                                    <td className="px-4 py-2">{gradeItem.Subject}</td>
                                    <td className="px-4 py-2 font-semibold">{gradeItem.Score}</td>
                                    <td className="px-4 py-2">{schoolAvg}</td>
                                    <td className={`px-4 py-2 font-bold ${cambodianGrade.color}`}>{cambodianGrade.grade}</td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GradesPage;
