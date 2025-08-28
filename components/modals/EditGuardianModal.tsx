
import React, { useState, useEffect } from 'react';
import type { Guardian } from '../../types';
import Modal from './Modal';
import { useAppContext } from '../../context/AppContext';

const EditGuardianModal: React.FC = () => {
    const { guardianToEdit, handleUpdateGuardianInfo, setModal } = useAppContext();
    const [formData, setFormData] = useState<Guardian | null>(null);

    useEffect(() => {
        if (guardianToEdit) {
            setFormData(guardianToEdit.guardian);
        }
    }, [guardianToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => (prev ? { ...prev, [name]: name === 'income' ? Number(value) : value } : null));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData) {
            handleUpdateGuardianInfo(formData);
        }
    };

    if (!guardianToEdit || !formData) return null;

    return (
        <Modal title={`Edit ${guardianToEdit.guardian.name}`} onClose={() => setModal(null)} maxWidth="max-w-lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md bg-white border-gray-300" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Relationship</label>
                        <input type="text" name="relationship" value={formData.relationship} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md bg-white border-gray-300" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Contact</label>
                        <input type="text" name="contact" value={formData.contact} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md bg-white border-gray-300" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Job</label>
                        <input type="text" name="job" value={formData.job} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md bg-white border-gray-300" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Monthly Income ($)</label>
                        <input type="number" name="income" value={formData.income} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md bg-white border-gray-300" />
                    </div>
                </div>

                <div className="mt-4 border-t pt-4">
                    <h4 className="font-semibold text-gray-800">This will update the following students:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 mt-2 max-h-24 overflow-y-auto">
                        {guardianToEdit.children.map(c => (
                            <li key={c.StudentID}>
                                {c['Given Name']} {c['Family Name']}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-6 flex justify-end gap-4">
                    <button type="button" onClick={() => setModal(null)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400">Cancel</button>
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Save Changes</button>
                </div>
            </form>
        </Modal>
    );
};

export default EditGuardianModal;
