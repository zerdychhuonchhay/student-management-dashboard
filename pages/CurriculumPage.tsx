
import React from 'react';
import { useAppContext } from '../context/AppContext';

const CurriculumPage: React.FC = () => {
    const { curriculum, setCurriculum } = useAppContext();
    
    const handleSubjectChange = (path: string[], newSubjects: string) => {
        setCurriculum(prev => {
            const newCurriculum = JSON.parse(JSON.stringify(prev));
            let current: any = newCurriculum;
            for (let i = 0; i < path.length - 1; i++) {
                current = current[path[i]];
            }
            current[path[path.length - 1]] = newSubjects.split(',').map(s => s.trim()).filter(Boolean);
            return newCurriculum;
        });
    };

    return (
        <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
            <header className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Curriculum Management</h1>
                <p className="text-gray-600 mt-1">Define subjects for different schools, grades, and majors.</p>
            </header>
            <div className="space-y-8">
                {Object.entries(curriculum).map(([schoolName, schoolData]) => (
                    <div key={schoolName} className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4">{schoolName}</h2>
                        <div className="space-y-4">
                            {Object.entries(schoolData).map(([campus, campusData]) => (
                                <div key={campus} className="pl-4 border-l-2 border-gray-200">
                                    <h3 className="text-xl font-semibold text-gray-700">{campus || 'Main Campus'}</h3>
                                    <div className="space-y-3 mt-2">
                                        {Object.entries(campusData).map(([gradeOrMajor, gradeOrMajorData]) => {
                                            if (Array.isArray(gradeOrMajorData)) {
                                                return (
                                                    <div key={gradeOrMajor}>
                                                        <label className="block text-lg font-semibold text-gray-700">Grade {gradeOrMajor}</label>
                                                        <textarea
                                                            className="w-full p-2 border rounded-md mt-1 bg-white"
                                                            rows={2}
                                                            defaultValue={gradeOrMajorData.join(', ')}
                                                            onChange={(e) => handleSubjectChange([schoolName, campus, gradeOrMajor], e.target.value)}
                                                        />
                                                    </div>
                                                );
                                            } else {
                                                return (
                                                    <div key={gradeOrMajor} className="pl-4 border-l-2 border-indigo-200">
                                                        <h4 className="text-lg font-semibold text-gray-600">{gradeOrMajor}</h4>
                                                        <div className="space-y-2 mt-1">
                                                            {Object.entries(gradeOrMajorData).map(([year, yearData]) => (
                                                                <div key={year} className="pl-4">
                                                                    <h5 className="font-semibold text-gray-500">{year}</h5>
                                                                    {Object.entries(yearData).map(([semester, subjects]) => (
                                                                        <div key={semester} className="mt-1">
                                                                            <label className="block font-medium text-gray-500">{semester}</label>
                                                                            <textarea
                                                                                className="w-full p-2 border rounded-md mt-1 bg-white"
                                                                                rows={2}
                                                                                defaultValue={(subjects as string[]).join(', ')}
                                                                                onChange={(e) => handleSubjectChange([schoolName, campus, gradeOrMajor, year, semester], e.target.value)}
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CurriculumPage;
