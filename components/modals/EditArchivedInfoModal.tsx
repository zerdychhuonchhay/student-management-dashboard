
import React, { useState } from 'react';
import type { Student } from '../../types';
import Modal from './Modal';

interface EditArchivedInfoModalProps {
    student: Student;
    onSave: (studentId: string, updates: { DateLeft: string; ReasonLeft: string }) => void;
    onClose: () => void;
}

const EditArchivedInfoModal: React.FC<EditArchivedInfoModalProps> = ({ student, onSave, onClose }) => {
    const [dateLeft, setDateLeft] = useState(student.DateLeft || '');
    const [reasonLeft, setReasonLeft] = useState(student.ReasonLeft || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(student.StudentID, { DateLeft: dateLeft, ReasonLeft: reasonLeft });
    };

    return (
        <Modal title="Edit Archived Information" onClose={onClose} maxWidth="max-w-md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Date Left</label>
                    <input
                        type="date"
                        value={dateLeft}
                        onChange={(e) => setDateLeft(e.target.value)}
                        className="w-full p-2 border rounded-md bg-white mt-1"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Reason for Leaving</label>
                    <textarea
                        value={reasonLeft}
                        onChange={(e) => setReasonLeft(e.target.value)}
                        className="w-full p-2 border rounded-md bg-white mt-1"
                        rows={3}
                        placeholder="e.g., Graduated, Moved to another province, etc."
                        required
                    />
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400">Cancel</button>
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Save Changes</button>
                </div>
            </form>
        </Modal>
    );
};

export default EditArchivedInfoModal;
