
import React, { useState } from 'react';
import type { Event } from '../../types';
import Modal from './Modal';

interface AddEventModalProps {
    eventToEdit?: Event;
    onSave: (eventData: any) => void;
    onClose: () => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ eventToEdit, onSave, onClose }) => {
    const isEditMode = !!eventToEdit;
    const [formData, setFormData] = useState({
        title: eventToEdit?.title || '',
        date: eventToEdit?.date || new Date().toISOString().split('T')[0],
        type: eventToEdit?.type || 'School Event',
        description: eventToEdit?.description || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditMode && eventToEdit) {
            onSave({ ...eventToEdit, ...formData });
        } else {
            onSave(formData);
        }
    };

    return (
        <Modal title={isEditMode ? "Edit Event" : "Add New Event"} onClose={onClose} maxWidth="max-w-lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Event Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border rounded-md bg-white"
                        required
                    />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border rounded-md bg-white"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Event Type</label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border rounded-md bg-white"
                        >
                            <option>School Event</option>
                            <option>Holiday</option>
                            <option>Staff Meeting</option>
                            <option>Other</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="mt-1 block w-full p-2 border rounded-md bg-white"
                    />
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400">Cancel</button>
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Save Event</button>
                </div>
            </form>
        </Modal>
    );
};

export default AddEventModal;
