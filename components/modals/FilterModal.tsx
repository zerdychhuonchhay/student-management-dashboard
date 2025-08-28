
import React, { useState, useMemo } from 'react';
import type { Student, Filters } from '../../types';
import Modal from './Modal';

interface FilterModalProps {
    currentFilters: Filters;
    onApply: (filters: Filters) => void;
    onClose: () => void;
    allStudents: Student[];
}

const FilterModal: React.FC<FilterModalProps> = ({ currentFilters, onApply, onClose, allStudents }) => {
    const [filters, setFilters] = useState<Filters>(currentFilters);
    const options = useMemo(() => ({
        grades: [...new Set(allStudents.map(s => s.Grade).filter(Boolean))].sort(),
        schools: [...new Set(allStudents.map(s => s.School.name).filter(Boolean))].sort(),
        sexes: [...new Set(allStudents.map(s => s.Sex).filter(Boolean))].sort(),
        ages: [...new Set(allStudents.map(s => s.Age).filter((age): age is number => typeof age === 'number'))].sort((a, b) => a - b).map(String),
    }), [allStudents]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFilters({ ...filters, [e.target.name]: e.target.value });

    return (
        <Modal title="Advanced Filters" onClose={onClose} maxWidth="max-w-sm">
            <div className="space-y-4">
                <select name="grade" value={filters.grade} onChange={handleChange} className="w-full p-2 border rounded-md bg-white"><option value="">All Grades</option>{options.grades.map(o => <option key={o} value={o}>{o}</option>)}</select>
                <select name="school" value={filters.school} onChange={handleChange} className="w-full p-2 border rounded-md bg-white"><option value="">All Schools</option>{options.schools.map(o => <option key={o} value={o}>{o}</option>)}</select>
                <select name="sex" value={filters.sex} onChange={handleChange} className="w-full p-2 border rounded-md bg-white"><option value="">All Sexes</option>{options.sexes.map(o => <option key={o} value={o}>{o === 'M' ? 'Male' : 'Female'}</option>)}</select>
                <select name="age" value={filters.age} onChange={handleChange} className="w-full p-2 border rounded-md bg-white"><option value="">All Ages</option>{options.ages.map(o => <option key={o} value={o}>{o}</option>)}</select>
                <select name="academicStatus" value={filters.academicStatus} onChange={handleChange} className="w-full p-2 border rounded-md bg-white">
                    <option value="">All Academic Statuses</option>
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Pursuing Skills">Pursuing Skills</option>
                    <option value="Working">Working</option>
                </select>
                <select name="status" value={filters.status} onChange={handleChange} className="w-full p-2 border rounded-md bg-white"><option value="">All Records</option><option value="complete">Complete Info</option><option value="incomplete">Incomplete Info</option></select>
            </div>
            <div className="mt-6 flex justify-end gap-4">
                <button onClick={() => { setFilters(prev => ({ ...prev, grade: '', school: '', sex: '', age: '', status: '', academicStatus: '' })) }} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">Clear</button>
                <button onClick={() => { onApply(filters); onClose(); }} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Apply</button>
            </div>
        </Modal>
    );
};

export default FilterModal;
