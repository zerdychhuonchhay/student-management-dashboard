import React from 'react';
import { Check, X, Loader, AlertTriangle, BadgeCheck, XCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { Student } from '../types';

const EligibilityBadge: React.FC<{ status: string }> = ({ status }) => {
    switch (status) {
        case 'Eligible':
            return <span className="flex items-center gap-1.5 text-sm font-semibold text-green-700"><BadgeCheck size={16} /> {status}</span>;
        case 'Ineligible':
            return <span className="flex items-center gap-1.5 text-sm font-semibold text-red-700"><XCircle size={16} /> {status}</span>;
        case 'Checking...':
            return <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-600"><Loader size={16} className="animate-spin" /> {status}</span>;
        default:
            return <span className="flex items-center gap-1.5 text-sm font-semibold text-yellow-700"><AlertTriangle size={16} /> {status}</span>;
    }
};

const PendingStudentCard: React.FC<{ student: Student }> = ({ student }) => {
    const { handleApproveStudent, setStudentToReject, setModal } = useAppContext();

    const handleRejectClick = () => {
        setStudentToReject(student);
        setModal('reject-pending');
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-400">
            <div className="flex flex-col sm:flex-row gap-4">
                <img
                    src={student.photoUrl || `https://picsum.photos/seed/${student.StudentID}/400/400`}
                    alt={`${student['Given Name']}`}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm flex-shrink-0"
                />
                <div className="flex-grow">
                    <h3 className="text-xl font-bold text-gray-800">{student['Given Name']} {student['Family Name']}</h3>
                    <p className="text-sm text-gray-500">{student.StudentID}</p>
                    <div className="mt-2 text-sm text-gray-600 space-y-1">
                        <p><strong>Grade:</strong> {student.Grade}</p>
                        <p><strong>Guardian:</strong> {student.guardians?.[0]?.name || 'N/A'} (${student.guardians?.[0]?.income || 0}/month)</p>
                    </div>
                </div>
                <div className="flex-shrink-0 bg-yellow-50 p-4 rounded-lg min-w-[250px]">
                    <h4 className="font-semibold text-gray-700 mb-2">Eligibility Check</h4>
                    <div className="mb-2">
                        <EligibilityBadge status={student.eligibility?.status || 'Unknown'} />
                    </div>
                    <p className="text-sm text-gray-600 italic">"{student.eligibility?.reason || 'No assessment yet.'}"</p>
                </div>
            </div>
            <div className="flex justify-end gap-3 mt-4 border-t pt-4">
                <button
                    onClick={handleRejectClick}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex items-center gap-2 shadow-sm"
                >
                    <X size={16} /> Reject
                </button>
                <button
                    onClick={() => handleApproveStudent(student.StudentID)}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center gap-2 shadow-sm"
                >
                    <Check size={16} /> Approve
                </button>
            </div>
        </div>
    );
};

const PendingListPage: React.FC = () => {
    const { pendingStudents } = useAppContext();

    return (
        <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
            <header className="bg-white shadow-md rounded-lg p-6 mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Pending Student Applications</h1>
                        <p className="text-gray-600 mt-1">Review new applicants and their AI-powered eligibility check before approval.</p>
                    </div>
                    <div className="text-right">
                         <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending Reviews</h3>
                         <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingStudents.length}</p>
                    </div>
                </div>
            </header>
            <main className="space-y-6">
                {pendingStudents.length > 0 ? (
                    pendingStudents.map(student => (
                        <PendingStudentCard key={student.StudentID} student={student} />
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-700">No Pending Applications</h2>
                        <p className="text-gray-500 mt-2">When a new student is added, they will appear here for review.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PendingListPage;