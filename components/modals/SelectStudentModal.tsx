
import React, { useState } from 'react';
import type { Student } from '../../types';
import Modal from './Modal';

interface SelectStudentModalProps {
    students: Student[];
    onSelect: (student: Student) => void;
    onClose: () => void;
    actionType: string;
}

const SelectStudentModal: React.FC<SelectStudentModalProps> = ({ students, onSelect, onClose, actionType }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredStudents = students.filter(s =>
        `${s['Given Name']} ${s['Family Name']}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Modal title={`Select a Student for ${actionType}`} onClose={onClose} maxWidth="max-w-lg">
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search for a student..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border rounded-md bg-white"
                />
            </div>
            <ul className="max-h-80 overflow-y-auto divide-y">
                {filteredStudents.map(student => (
                    <li key={student.StudentID}
                        onClick={() => onSelect(student)}
                        className="p-2 hover:bg-indigo-50 cursor-pointer"
                    >
                        {student['Given Name']} {student['Family Name']} ({student.StudentID})
                    </li>
                ))}
            </ul>
        </Modal>
    );
};

export default SelectStudentModal;
