
import React, { useMemo } from 'react';
import type { Student, Grade } from '../types';
import { useAppContext } from '../context/AppContext';
import { getCategoryForStudent } from '../utils/helpers';

interface SchoolData {
    name: string;
    students: (Student & { averageScore: string | number })[];
    grades: Grade[];
    gradeLevels: { [key: string]: number };
    category: 'university' | 'k12';
    averageScore: string | number;
}

const SchoolCard: React.FC<{ school: SchoolData }> = ({ school }) => {
    const { handleSelectStudent } = useAppContext();
    return (
        <div id={`school-${school.name.replace(/\s+/g, '-')}`} className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4">{school.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <h4 className="text-sm font-medium text-gray-500 uppercase">Total Students</h4>
                    <p className="text-3xl font-bold text-indigo-600 mt-1">{school.students.length}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <h4 className="text-sm font-medium text-gray-500 uppercase">Avg. Performance</h4>
                    <p className="text-3xl font-bold text-indigo-600 mt-1">{school.averageScore}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 uppercase text-center mb-2">Students by Grade</h4>
                    <div className="text-xs text-center">
                        {Object.entries(school.gradeLevels).map(([grade, count]) => (
                            <span key={grade} className="inline-block bg-indigo-100 text-indigo-800 rounded-full px-2 py-1 mr-1 mb-1">
                                Grade {grade}: <strong>{count}</strong>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
            <div>
               <h4 className="text-lg font-semibold mb-2">Student List</h4>
               <div className="max-h-72 overflow-y-auto border rounded-md">
                   <table className="min-w-full">
                       <thead className="bg-gray-50 sticky top-0">
                           <tr>
                               <th className="px-4 py-2 text-left text-sm">Name</th>
                               <th className="px-4 py-2 text-left text-sm">Grade</th>
                               <th className="px-4 py-2 text-left text-sm">Average Score</th>
                           </tr>
                       </thead>
                       <tbody>
                           {school.students.map(student => (
                               <tr key={student.StudentID} className="border-b">
                                   <td className="px-4 py-2">
                                       <a href="#" onClick={(e) => { e.preventDefault(); handleSelectStudent(student); }} className="text-indigo-600 hover:underline">{student['Given Name']} {student['Family Name']}</a>
                                   </td>
                                   <td className="px-4 py-2">{student.Grade}</td>
                                   <td className="px-4 py-2 font-semibold">{student.averageScore}</td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
           </div>
        </div>
    );
}

const SchoolCenterPage: React.FC = () => {
    const { studentsWithAge, grades } = useAppContext();

    const schoolData = useMemo(() => {
        const schools: { [key: string]: Omit<SchoolData, 'averageScore'> } = {};

        studentsWithAge.forEach(student => {
            if (!student.School || !student.School.name) return;

            const schoolName = student.School.name;
            if (!schools[schoolName]) {
                schools[schoolName] = {
                    name: schoolName,
                    students: [],
                    grades: [],
                    gradeLevels: {},
                    category: getCategoryForStudent(student) === 'university' ? 'university' : 'k12'
                };
            }
            schools[schoolName].students.push(student as any);
            if (getCategoryForStudent(student) === 'university') {
                schools[schoolName].category = 'university';
            }
            if (!schools[schoolName].gradeLevels[student.Grade]) {
                schools[schoolName].gradeLevels[student.Grade] = 0;
            }
            schools[schoolName].gradeLevels[student.Grade]++;
        });

        grades.forEach(grade => {
            const student = studentsWithAge.find(s => s.StudentID === grade.StudentID);
            if (student && student.School && student.School.name && schools[student.School.name]) {
                schools[student.School.name].grades.push(grade);
            }
        });

        const categorizedSchools: { university: SchoolData[], k12: SchoolData[] } = { university: [], k12: [] };

        Object.values(schools).forEach(school => {
            const totalScore = school.grades.reduce((sum, g) => sum + g.Score, 0);
            const averageScore = school.grades.length > 0 ? (totalScore / school.grades.length).toFixed(2) : 'N/A';
            
            const studentsWithAvg = school.students.map(stud => {
                 const studentGrades = grades.filter(g => g.StudentID === stud.StudentID);
                 const total = studentGrades.reduce((sum, g) => sum + g.Score, 0);
                 const avg = studentGrades.length > 0 ? (total / studentGrades.length).toFixed(2) : 'N/A';
                 return {...stud, averageScore: avg };
            });

            const finalSchoolData: SchoolData = {
                ...school,
                averageScore,
                students: studentsWithAvg,
            };

            if (school.category === 'university') {
                categorizedSchools.university.push(finalSchoolData);
            } else {
                categorizedSchools.k12.push(finalSchoolData);
            }
        });

        return categorizedSchools;

    }, [studentsWithAge, grades]);


    return (
        <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
            <header className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h1 className="text-3xl font-bold text-gray-900">School Center</h1>
                <p className="text-gray-600 mt-1">An overview of all schools, organized by level.</p>
            </header>
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-semibold mb-2">Jump to School</h3>
                <div className="flex flex-wrap gap-2">
                    {schoolData.university.map(school => (
                        <a key={school.name} href={`#school-${school.name.replace(/\s+/g, '-')}`} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm hover:bg-indigo-200">
                            {school.name}
                        </a>
                    ))}
                    {schoolData.k12.map(school => (
                        <a key={school.name} href={`#school-${school.name.replace(/\s+/g, '-')}`} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm hover:bg-blue-200">
                            {school.name}
                        </a>
                    ))}
                </div>
            </div>
            <div>
                <h2 className="text-3xl font-bold text-gray-700 border-b-2 border-indigo-300 pb-2 mb-4">Universities</h2>
                {schoolData.university.length > 0 ? schoolData.university.map(school => <SchoolCard key={school.name} school={school} />) : <p className="text-gray-500">No university data available.</p>}
            </div>
            <div className="mt-8">
                <h2 className="text-3xl font-bold text-gray-700 border-b-2 border-indigo-300 pb-2 mb-4">K-12 Schools</h2>
                {schoolData.k12.length > 0 ? schoolData.k12.map(school => <SchoolCard key={school.name} school={school} />) : <p className="text-gray-500">No K-12 school data available.</p>}
            </div>
        </div>
    );
};

export default SchoolCenterPage;
