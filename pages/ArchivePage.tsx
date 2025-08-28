
import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { calculateMonthlyEquivalent } from '../utils/helpers';
import type { Student } from '../types';

const ArchivedStudentTable: React.FC = () => {
    const { 
        sortedArchivedStudents, 
        archiveSort, 
        handleArchiveSort, 
        archiveColumnConfig, 
        handleSelectStudent, 
        handleRestoreStudent, 
        setStudentToDelete,
        setModal
    } = useAppContext();
    
    const visibleColumns = archiveColumnConfig.filter(c => c.visible);

    return (
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                    {visibleColumns.map(col => (
                        <th key={col.key} onClick={() => col.key !== 'Actions' && handleArchiveSort(col.key)}
                            className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.key !== 'Actions' ? 'cursor-pointer' : ''} ${col.key === 'Actions' ? 'sticky right-0 bg-gray-50' : ''}`}>
                            <span className="flex items-center gap-2">
                                {col.label}
                                {col.key !== 'Actions' && (archiveSort.column === col.key ? (archiveSort.direction === 'asc' ? '↑' : '↓') : <ArrowUpDown size={12} />)}
                            </span>
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {sortedArchivedStudents.map(student => (
                    <tr key={student.StudentID} className="group hover:bg-gray-50">
                        {visibleColumns.map(col => (
                            <td key={col.key} className={`px-4 py-4 whitespace-nowrap text-sm text-gray-600 ${col.key === 'Actions' ? 'sticky right-0 bg-white group-hover:bg-gray-50' : ''}`}>
                                {col.key === 'Given Name' ? (
                                    <a href="#" onClick={(e) => { e.preventDefault(); handleSelectStudent(student); }}
                                       className="font-semibold text-indigo-600 hover:underline">
                                        {student[col.key] || 'N/A'}
                                    </a>
                                ) : col.key === 'School' ? (
                                    `${student.School.name}${student.School.campus && ` (${student.School.campus})`}`
                                ) : col.key === 'MonthlyCosts' ? (
                                    `$${(student.financials || []).reduce((total, item) => {
                                        return total + calculateMonthlyEquivalent(String(item.amount), item.frequency);
                                    }, 0).toFixed(2)} / Monthly Eq.`
                                ) : col.key === 'Actions' ? (
                                    <div className="flex gap-4">
                                        <button onClick={() => handleRestoreStudent(student)} className="text-indigo-600 hover:underline">Restore</button>
                                        <button onClick={() => { setStudentToDelete(student); setModal('delete'); }} className="text-red-600 hover:underline">Delete</button>
                                    </div>
                                ) : (
                                    String(student[col.key as keyof Student] || 'N/A')
                                )}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};


const ArchivePage: React.FC = () => {
    const { sortedArchivedStudents } = useAppContext();
    return (
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col h-full">
            <header className="bg-white shadow-md rounded-lg p-6 mb-6 flex-shrink-0">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Archived Students</h1>
                    <p className="text-lg text-gray-500 font-semibold">{sortedArchivedStudents.length} students</p>
                </div>
            </header>
            <main className="flex-grow bg-white shadow-md rounded-lg overflow-auto">
                {sortedArchivedStudents.length > 0 ? (
                    <ArchivedStudentTable />
                ) : (
                    <p className="p-8 text-center text-gray-500">No archived students found.</p>
                )}
            </main>
        </div>
    );
};

export default ArchivePage;
