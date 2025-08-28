
import React, { useMemo, useRef } from 'react';
import { User, Calendar, MapPin, School, GraduationCap, Briefcase, DollarSign, Edit, Eye, ArrowLeft, PlusCircle, Trash2, Phone, Camera, Check, BookOpen, Download } from 'lucide-react';
import type { Student, AcademicStatus } from '../types';
import DetailItem from '../components/ui/DetailItem';
import { useAppContext } from '../context/AppContext';
import { calculateStringSimilarity, normalizeSearchableName, formatCambodianPhoneNumber } from '../utils/helpers';

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

const StatusBadge: React.FC<{ status: AcademicStatus }> = ({ status }) => {
    const statusColors: { [key in AcademicStatus]: string } = {
        'Active': 'bg-green-100 text-green-800',
        'On Hold': 'bg-yellow-100 text-yellow-800',
        'Pursuing Skills': 'bg-blue-100 text-blue-800',
        'Working': 'bg-purple-100 text-purple-800',
    };
    return (
        <span className={`px-3 py-1 text-sm leading-5 font-semibold rounded-full ${statusColors[status]}`}>
            {status}
        </span>
    );
};

const StudentProfilePage: React.FC = () => {
    const {
        selectedStudent: student,
        students,
        archivedStudents,
        handleSelectStudent,
        openModal,
        followUps,
        handleDeleteFollowUp,
        handleOpenEditFollowUpModal,
        handleUpdateStudentPhoto,
        handleConfirmSibling,
        handleManageAttachments,
        handleBack,
        setActiveTab,
    } = useAppContext();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const attachmentFileInputRef = useRef<HTMLInputElement>(null);

    const archivedStudentIds = useMemo(() => new Set(archivedStudents.map(s => s.StudentID)), [archivedStudents]);

    const confirmedSiblings = useMemo(() => {
        if (!student?.siblings) return [];
        const allStudents = [...students, ...archivedStudents];
        return student.siblings
            .map(siblingId => allStudents.find(s => s.StudentID === siblingId))
            .filter((s): s is Student => s !== undefined);
    }, [students, archivedStudents, student]);

    const possibleSiblings = useMemo(() => {
        if (!student) return [];
        const allStudents = [...students, ...archivedStudents];
        const currentStudentFamilyName = normalizeSearchableName(student['Family Name']);
        const currentStudentGuardianNames = new Set((student.guardians || []).map(g => normalizeSearchableName(g.name)).filter(Boolean));
        const confirmedSiblingIds = new Set(student.siblings || []);

        return allStudents.filter(s => {
            if (s.StudentID === student.StudentID) return false; // Not the student themselves
            if (confirmedSiblingIds.has(s.StudentID)) return false; // Not already confirmed

            // 1. Strong match: Shared Guardian Name (high confidence)
            if (currentStudentGuardianNames.size > 0) {
                const otherStudentGuardianNames = new Set((s.guardians || []).map(g => normalizeSearchableName(g.name)).filter(Boolean));
                const hasSharedGuardian = [...currentStudentGuardianNames].some(name => otherStudentGuardianNames.has(name));
                if (hasSharedGuardian) return true;
            }

            // 2. Weaker match: Similar Family Name (good confidence)
            if (currentStudentFamilyName) {
                const otherStudentFamilyName = normalizeSearchableName(s['Family Name']);
                if (otherStudentFamilyName) {
                    const SIBLING_SIMILARITY_THRESHOLD = 0.9;
                    const similarity = calculateStringSimilarity(currentStudentFamilyName, otherStudentFamilyName);
                    if (similarity >= SIBLING_SIMILARITY_THRESHOLD) return true;
                }
            }
            
            return false;
        });
    }, [students, archivedStudents, student]);


    if (!student) {
        return <div className="p-8 text-center text-gray-600">No student selected. Please go back to the dashboard.</div>;
    }

    const studentFollowUps = followUps[student.StudentID] || [];

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                handleUpdateStudentPhoto(student.StudentID, e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleRemovePhoto = () => {
        const defaultPhoto = `https://picsum.photos/seed/${student.StudentID}/400/400`;
        handleUpdateStudentPhoto(student.StudentID, defaultPhoto);
    };

    const handleAttachmentFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && student) {
            handleManageAttachments(student.StudentID, 'add', file);
        }
        if (attachmentFileInputRef.current) {
            attachmentFileInputRef.current.value = '';
        }
    };

    return (
        <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
             <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
             <input type="file" ref={attachmentFileInputRef} onChange={handleAttachmentFileChange} className="hidden" />
            <header className="bg-white shadow-md rounded-lg p-6 mb-6">
                <div className="flex justify-between items-start">
                     <div className="flex items-center gap-4">
                        <div className="relative group">
                            {student.photoUrl ? (
                                <img src={student.photoUrl} alt={`${student['Given Name']}`} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm" />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-sm">
                                    <User className="w-12 h-12 text-gray-500" />
                                </div>
                            )}
                             <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center gap-2 transition-opacity">
                                <button onClick={() => fileInputRef.current?.click()} className="p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity" title="Change photo">
                                    <Camera size={24} />
                                </button>
                                <button onClick={handleRemovePhoto} className="p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity" title="Remove photo">
                                    <Trash2 size={24} />
                                </button>
                            </div>
                        </div>
                        <div>
                            <button onClick={handleBack} className="text-sm text-indigo-600 hover:underline flex items-center gap-1 mb-2">
                                <ArrowLeft size={14} /> Back
                            </button>
                            <div className="flex items-center gap-4">
                                <h1 className="text-3xl font-bold text-gray-900">{student['Given Name']} {student['Family Name']}</h1>
                                <StatusBadge status={student.academicStatus || 'Active'} />
                            </div>
                            <p className="text-gray-600">Student Profile</p>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-8">
                        <button onClick={() => openModal('edit', student)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 flex items-center gap-2"><Edit size={16}/> Edit</button>
                        <button onClick={() => { setActiveTab('grades'); }} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"><Eye size={16}/> View Grades</button>
                    </div>
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
                            {student.Grade === 'University' && <DetailItem icon={<Briefcase size={16} className="text-gray-400"/>} label="Major" value={student.Major} />}
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
                     {(student.educationHistory || []).length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                                <BookOpen size={18} /> Education History
                            </h3>
                            <div className="space-y-3">
                                {(student.educationHistory || []).map((record, index) => (
                                    <div key={index} className="text-sm">
                                        <p className="font-semibold">{record.school} - <span className="font-normal">{record.grade}</span></p>
                                        <p className="text-xs text-gray-500">{record.startDate} to {record.endDate}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Guardian Contact</h3>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                           {student.guardians && student.guardians.length > 0 ? (
                                <>
                                    <DetailItem icon={<User size={16} className="text-gray-400"/>} label="Guardian Name" value={student.guardians[0].name} />
                                    <DetailItem icon={<Phone size={16} className="text-gray-400"/>} label="Contact" value={formatCambodianPhoneNumber(student.guardians[0].contact)} />
                                    <DetailItem icon={<Briefcase size={16} className="text-gray-400"/>} label="Job" value={student.guardians[0].job} />
                                    <DetailItem icon={<DollarSign size={16} className="text-gray-400"/>} label="Income" value={`$${student.guardians[0].income}`} />
                                </>
                            ) : (
                                <p className="col-span-2 text-gray-500">No guardian information available.</p>
                            )}
                        </dl>
                    </div>
                     {confirmedSiblings.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold text-green-700 border-b pb-2 mb-4 flex items-center gap-2"><Check size={20}/> Confirmed Siblings</h3>
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
                                                {isArchived ? (
                                                    <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">Archived</span>
                                                ) : (
                                                    <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Active</span>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                    {possibleSiblings.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Possible Siblings</h3>
                            <ul className="space-y-2">
                                {possibleSiblings.map(sibling => {
                                    const isArchived = archivedStudentIds.has(sibling.StudentID);
                                    return (
                                        <li key={sibling.StudentID} className="flex justify-between items-center">
                                            <div>
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
                                                <span className="text-sm text-gray-500 ml-2">({sibling.Grade})</span>
                                                {isArchived && <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full ml-2">Archived</span>}
                                            </div>
                                            <button onClick={() => handleConfirmSibling(student.StudentID, sibling.StudentID)} className="text-xs text-green-600 hover:underline font-semibold">(Confirm)</button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center border-b pb-2 mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Attachments</h3>
                            <button
                                onClick={() => attachmentFileInputRef.current?.click()}
                                className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 flex items-center gap-1">
                                <PlusCircle size={14} /> Upload
                            </button>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {(student.attachments || []).length > 0 ? student.attachments.map((file, index) => (
                                <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                                    <div className="truncate min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate" title={file.name}>{file.name}</p>
                                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0 ml-2">
                                        <a href={file.data} download={file.name} className="p-1 text-indigo-600 hover:bg-indigo-100 rounded-full" title="Download">
                                            <Download size={16} />
                                        </a>
                                        <button onClick={() => handleManageAttachments(student.StudentID, 'delete', index)} className="p-1 text-red-600 hover:bg-red-100 rounded-full" title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            )) : <p className="text-center text-sm text-gray-500 py-4">No files attached.</p>}
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center border-b pb-2 mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Follow-up History</h3>
                        <button onClick={() => openModal('add-follow-up', student)} className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 flex items-center gap-1"><PlusCircle size={14}/> Add</button>
                    </div>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {studentFollowUps.length > 0 ? studentFollowUps.slice().reverse().map((followUp, index) => {
                            const originalIndex = studentFollowUps.length - 1 - index;
                            return (
                                <div key={originalIndex} className="bg-gray-50 p-4 rounded-md border">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm text-gray-500">{new Date(followUp.date).toLocaleString()}</p>
                                        <div className="flex gap-2 flex-shrink-0 ml-4">
                                            <button onClick={() => handleOpenEditFollowUpModal(student, followUp, originalIndex)} className="text-blue-600 hover:underline"><Edit size={14}/></button>
                                            <button onClick={() => handleDeleteFollowUp(student.StudentID, originalIndex)} className="text-red-600 hover:underline"><Trash2 size={14}/></button>
                                        </div>
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
                            );
                        }) : <p className="text-center text-gray-500 py-4">No follow-up records found.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfilePage;
