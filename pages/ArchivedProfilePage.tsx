
import React, { useMemo } from 'react';
import { User, Calendar, MapPin, School, GraduationCap, Briefcase, DollarSign, ArrowLeft, Phone, Edit, Check, Download } from 'lucide-react';
import type { Student } from '../types';
import DetailItem from '../components/ui/DetailItem';
import { useAppContext } from '../context/AppContext';

const FollowUpDetail: React.FC<{ label: string, rating: string, details?: string }> = ({ label, rating, details }) => {
    const color = rating === 'Good' ? 'text-green-600' : rating === 'Average' ? 'text-yellow-600' : 'text-red-600';
    return (
        <div>
            <strong>{label}:</strong>
            <span className={`font-semibold ml-2 ${color}`}>{rating}</span>
            {details && <p className="text-sm text-gray-600 pl-4">- {details}</p>}
        </div>
    );
};

const ArchivedProfilePage: React.FC = () => {
    const {
        selectedStudent: student,
        followUps,
        openModal,
        students,
        archivedStudents,
        handleSelectStudent,
        handleBack
    } = useAppContext();

    const confirmedSiblings = useMemo(() => {
        if (!student?.siblings) return [];
        const allStudents = [...students, ...archivedStudents];
        return student.siblings
            .map(siblingId => allStudents.find(s => s.StudentID === siblingId))
            .filter((s): s is Student => s !== undefined);
    }, [students, archivedStudents, student]);
    
    const archivedStudentIds = useMemo(() => new Set(archivedStudents.map(s => s.StudentID)), [archivedStudents]);
    
    if (!student) {
        return <div className="p-8 text-center text-gray-600">No student selected.</div>;
    }

    const studentFollowUps = followUps[student.StudentID] || [];

    return (
        <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
             <header className="bg-white shadow-md rounded-lg p-6 mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{student['Given Name']} {student['Family Name']}</h1>
                        <p className="text-red-600 font-semibold">Archived Student</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => openModal('edit-archived-info', student)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 flex items-center gap-2"><Edit size={16}/> Edit Info</button>
                        <button onClick={handleBack} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 flex items-center gap-2"><ArrowLeft size={16}/> Back</button>
                    </div>
                </div>
                <div className="mt-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md">
                    <p><strong>Date Left:</strong> {student.DateLeft}</p>
                    <p><strong>Reason:</strong> {student.ReasonLeft}</p>
                </div>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                     <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Personal Details</h3>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                            <DetailItem icon={<User size={16} className="text-gray-400"/>} label="Student ID" value={student.StudentID} />
                            <DetailItem icon={<User size={16} className="text-gray-400"/>} label="Age" value={student.Age} />
                            <DetailItem icon={<User size={16} className="text-gray-400"/>} label="Sex" value={student.Sex === 'M' ? 'Male' : 'Female'} />
                            <DetailItem icon={<Calendar size={16} className="text-gray-400"/>} label="Date of Birth" value={student.DOB} />
                            <DetailItem icon={<Calendar size={16} className="text-gray-400"/>} label="Enrollment Date" value={student.EnrollmentDate} />
                            <DetailItem icon={<MapPin size={16} className="text-gray-400"/>} label="Location" value={student.Location} />
                        </dl>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Academic & Financial Info</h3>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                            <DetailItem icon={<School size={16} className="text-gray-400"/>} label="School" value={`${student.School.name}${student.School.campus ? ` (${student.School.campus})` : ''}`} />
                            <DetailItem icon={<GraduationCap size={16} className="text-gray-400"/>} label="Grade" value={student.Grade} />
                            <DetailItem icon={<Briefcase size={16} className="text-gray-400"/>} label="Major" value={student.Major} />
                             <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                    <DollarSign size={16} className="text-gray-400" /> Financial Records
                                </dt>
                                {(student.financials || []).length > 0 ? (student.financials || []).map((item, index) => (
                                    <dd key={index} className="mt-2 text-md text-gray-900 pl-4 border-l ml-2 py-1">
                                         <p className="font-semibold">{item.item} <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{item.category}</span></p>
                                         <p className="text-sm">${parseFloat(item.amount || '0').toFixed(2)} ({item.frequency})</p>
                                         <p className="text-xs text-gray-500">Date: {item.date || 'N/A'}</p>
                                    </dd>
                                )) : <dd className="mt-1 text-md text-gray-900 pl-6">No financial records.</dd>}
                            </div>
                        </dl>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Guardian Contact</h3>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                           {student.guardians && student.guardians.length > 0 ? (
                                <>
                                    <DetailItem icon={<User size={16} className="text-gray-400"/>} label="Guardian Name" value={student.guardians[0].name} />
                                    <DetailItem icon={<Phone size={16} className="text-gray-400"/>} label="Contact" value={student.guardians[0].contact} />
                                </>
                            ) : (
                                <p className="col-span-2 text-gray-500">No guardian information available.</p>
                            )}
                        </dl>
                    </div>
                    {confirmedSiblings.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2"><Check size={18}/> Confirmed Siblings</h3>
                            <ul className="space-y-2">
                                {confirmedSiblings.map(sibling => {
                                    const isArchived = archivedStudentIds.has(sibling.StudentID);
                                    return (
                                        <li key={sibling.StudentID} className="flex justify-between items-center">
                                            <a 
                                                href="#" 
                                                onClick={(e) => { 
                                                    e.preventDefault(); 
                                                    handleSelectStudent(sibling);
                                                }} 
                                                className="text-indigo-600 hover:underline"
                                            >
                                                {sibling['Given Name']} {sibling['Family Name']}
                                            </a>
                                            <div>
                                                 <span className="text-sm text-gray-500 mr-2">({sibling.Grade})</span>
                                                {!isArchived ? 
                                                    <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Active</span>
                                                    : <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">Archived</span>
                                                }
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                    {(student.attachments || []).length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Attachments</h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {student.attachments.map((file, index) => (
                                    <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                                        <div className="truncate min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate" title={file.name}>{file.name}</p>
                                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                        </div>
                                        <div className="flex-shrink-0 ml-2">
                                            <a href={file.data} download={file.name} className="p-1 text-indigo-600 hover:bg-indigo-100 rounded-full" title="Download">
                                                <Download size={16} />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center border-b pb-2 mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Follow-up History</h3>
                    </div>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {studentFollowUps.length > 0 ? studentFollowUps.slice().reverse().map((followUp, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-md border">
                                <div className="flex justify-between items-start">
                                    <p className="text-sm text-gray-500">{new Date(followUp.date).toLocaleString()}</p>
                                </div>
                                <div className="prose prose-sm max-w-none mt-2">
                                    <h4>Well-being Progress</h4>
                                    <FollowUpDetail label="Physical Health" {...followUp.physicalHealth} />
                                    <FollowUpDetail label="Social Interaction" {...followUp.socialInteraction} />
                                    <FollowUpDetail label="Home Life" {...followUp.homeLife} />
                                    
                                    <h4 className="mt-4">Risk Factors</h4>
                                    {(followUp.riskFactors && followUp.riskFactors.length > 0) ? (
                                        <>
                                            <p><strong>Identified:</strong> {followUp.riskFactors.join(', ')}</p>
                                            {followUp.riskFactorsDetails && <p className="text-sm text-gray-600 whitespace-pre-wrap"><strong>Details:</strong> {followUp.riskFactorsDetails}</p>}
                                        </>
                                    ) : <p>None reported.</p>}
                                    
                                    <h4 className="mt-4">Notes & Recommendations</h4>
                                    {followUp.notes && <p className="text-sm text-gray-600 whitespace-pre-wrap"><strong>Notes:</strong> {followUp.notes}</p>}
                                    {followUp.recommendations && <p className="text-sm text-gray-600 whitespace-pre-wrap"><strong>Recommendations:</strong> {followUp.recommendations}</p>}
                                </div>
                            </div>
                        )) : <p className="text-center text-gray-500 py-4">No follow-up records found.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArchivedProfilePage;
