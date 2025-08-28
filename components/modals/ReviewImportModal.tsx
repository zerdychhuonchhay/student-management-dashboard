
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import type { Student, UpdatedStudentInfo, PotentialDuplicateInfo, DuplicateResolution, ResolvedUpdates } from '../../types';

interface ReviewImportModalProps {
    newStudents: Student[];
    updatedStudents: UpdatedStudentInfo[];
    potentialDuplicates: PotentialDuplicateInfo[];
    onConfirm: (resolutions: DuplicateResolution, resolvedUpdates: ResolvedUpdates, selectedNewStudentIds: Set<string>) => void;
    onClose: () => void;
}

const ReviewImportModal: React.FC<ReviewImportModalProps> = ({ newStudents, updatedStudents, potentialDuplicates, onConfirm, onClose }) => {
    const [duplicateResolutions, setDuplicateResolutions] = useState<DuplicateResolution>({});
    const [resolvedUpdates, setResolvedUpdates] = useState<ResolvedUpdates>({});
    const [selectedNewStudentIds, setSelectedNewStudentIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Initialize default resolutions for duplicates
        const initialDuplicateResolutions: DuplicateResolution = {};
        potentialDuplicates.forEach(dup => {
            initialDuplicateResolutions[dup.newStudent.StudentID] = 'merge';
        });
        setDuplicateResolutions(initialDuplicateResolutions);

        // Initialize default updates (accept all new data)
        const initialResolvedUpdates: ResolvedUpdates = {};
        updatedStudents.forEach(info => {
            initialResolvedUpdates[info.studentId] = info.updateData;
        });
        potentialDuplicates.forEach(dup => {
            // Also initialize the update data for potential merges
            initialResolvedUpdates[dup.newStudent.StudentID] = dup.newStudent;
        });
        setResolvedUpdates(initialResolvedUpdates);

        // Initialize all new students as selected by default
        setSelectedNewStudentIds(new Set(newStudents.map(s => s.StudentID)));

    }, [potentialDuplicates, updatedStudents, newStudents]);

    const handleDuplicateResolutionChange = (newStudentId: string, resolution: 'merge' | 'create') => {
        setDuplicateResolutions(prev => ({ ...prev, [newStudentId]: resolution }));
    };

    const handleUpdateChoice = (studentId: string, field: string, value: any) => {
        setResolvedUpdates(prev => {
            const newUpdatesForStudent = { ...prev[studentId] };
            if (value === null) {
                // User chose to keep the old value, so we remove the field from the update object
                delete (newUpdatesForStudent as any)[field];
            } else {
                // User chose to accept the new value
                (newUpdatesForStudent as any)[field] = value;
            }
            return { ...prev, [studentId]: newUpdatesForStudent };
        });
    };
    
    const handleSelectNewStudent = (studentId: string) => {
        setSelectedNewStudentIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(studentId)) {
                newSet.delete(studentId);
            } else {
                newSet.add(studentId);
            }
            return newSet;
        });
    };

    const handleSelectAllNewStudents = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedNewStudentIds(new Set(newStudents.map(s => s.StudentID)));
        } else {
            setSelectedNewStudentIds(new Set());
        }
    };

    return (
        <Modal title="Review Import" onClose={onClose} maxWidth="max-w-4xl">
            <div className="space-y-6">
                 {potentialDuplicates.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-orange-600 border-b pb-2 mb-2">Potential Duplicates Found ({potentialDuplicates.length})</h3>
                        <p className="text-sm text-gray-600 mb-4">The following students from your file have names similar to existing students. Please choose whether to merge the data or create a new student.</p>
                        <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                            {potentialDuplicates.map(dup => (
                                <div key={dup.newStudent.StudentID} className="bg-orange-50 p-3 rounded-md border border-orange-200">
                                    <p><strong>Incoming:</strong> {dup.newStudent['Given Name']} {dup.newStudent['Family Name']} (ID: {dup.newStudent.StudentID})</p>
                                    <p className="text-sm"><strong>Similar to existing:</strong> {dup.existingStudent['Given Name']} {dup.existingStudent['Family Name']} (ID: {dup.existingStudent.StudentID}) - ({(dup.similarity * 100).toFixed(0)}% match)</p>
                                    <div className="mt-2 flex gap-4">
                                        <label className="flex items-center text-sm">
                                            <input type="radio" name={`resolution-${dup.newStudent.StudentID}`} checked={duplicateResolutions[dup.newStudent.StudentID] === 'merge'} onChange={() => handleDuplicateResolutionChange(dup.newStudent.StudentID, 'merge')} className="mr-1"/>
                                            Merge with existing student
                                        </label>
                                        <label className="flex items-center text-sm">
                                            <input type="radio" name={`resolution-${dup.newStudent.StudentID}`} checked={duplicateResolutions[dup.newStudent.StudentID] === 'create'} onChange={() => handleDuplicateResolutionChange(dup.newStudent.StudentID, 'create')} className="mr-1"/>
                                            Create as new student
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {newStudents.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-2">
                           New Students to Add ({selectedNewStudentIds.size} of {newStudents.length} selected)
                        </h3>
                        <div className="max-h-40 overflow-y-auto pr-2">
                             <div className="flex items-center p-2 border-b">
                                <input
                                    type="checkbox"
                                    id="select-all"
                                    className="mr-2"
                                    checked={newStudents.length > 0 && selectedNewStudentIds.size === newStudents.length}
                                    onChange={handleSelectAllNewStudents}
                                />
                                <label htmlFor="select-all" className="font-semibold cursor-pointer">Select All</label>
                            </div>
                            <ul className="space-y-1">
                                {newStudents.map(student => (
                                    <li key={student.StudentID} className="flex items-center p-2 hover:bg-gray-50 rounded">
                                        <input
                                            type="checkbox"
                                            id={`select-${student.StudentID}`}
                                            className="mr-2"
                                            checked={selectedNewStudentIds.has(student.StudentID)}
                                            onChange={() => handleSelectNewStudent(student.StudentID)}
                                        />
                                        <label htmlFor={`select-${student.StudentID}`} className="flex-grow cursor-pointer">
                                            {student['Given Name']} {student['Family Name']} ({student.StudentID})
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {updatedStudents.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-2">Students with Updates ({updatedStudents.length})</h3>
                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                            {updatedStudents.map(info => (
                                <div key={info.studentId} className="bg-gray-50 p-3 rounded-md">
                                    <p className="font-semibold">{info.name} ({info.studentId})</p>
                                    <table className="mt-2 text-sm w-full">
                                        <thead>
                                            <tr className="text-left">
                                                <th className="w-1/4 font-medium text-gray-500">Field</th>
                                                <th className="w-1/4 font-medium text-gray-500">Keep Old Value</th>
                                                <th className="w-1/4 font-medium text-gray-500">Use New Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {info.changes.map((change, index) => (
                                                <tr key={index} className="border-t">
                                                    <td className="py-1 font-medium">{change.field}</td>
                                                    <td className="py-1">
                                                        <label className="flex items-center p-1 rounded hover:bg-red-50 cursor-pointer">
                                                            <input type="radio" name={`${info.studentId}-${change.field}`} onChange={() => handleUpdateChoice(info.studentId, change.field, null)} className="mr-2" />
                                                            <span className="text-red-600 line-through">{String(change.oldValue)}</span>
                                                        </label>
                                                    </td>
                                                    <td className="py-1">
                                                        <label className="flex items-center p-1 rounded hover:bg-green-50 cursor-pointer">
                                                            <input type="radio" name={`${info.studentId}-${change.field}`} defaultChecked onChange={() => handleUpdateChoice(info.studentId, change.field, change.newValue)} className="mr-2" />
                                                            <span className="text-green-600 font-semibold">{String(change.newValue)}</span>
                                                        </label>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-6 flex justify-end gap-4">
                <button type="button" onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400">Cancel</button>
                <button type="button" onClick={() => onConfirm(duplicateResolutions, resolvedUpdates, selectedNewStudentIds)} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Confirm & Import</button>
            </div>
        </Modal>
    );
};

export default ReviewImportModal;
