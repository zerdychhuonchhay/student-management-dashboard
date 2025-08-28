
import React from 'react';
import type { Student, EducationRecord, FinancialRecord, Guardian } from '../../types';
import Modal from './Modal';
import { formatCambodianPhoneNumber } from '../../utils/helpers';

interface ReviewModalProps {
    data: Student;
    onConfirm: () => void;
    onEdit: () => void;
    onClose: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ data, onConfirm, onEdit, onClose }) => (
    <Modal title="Review Student Details" onClose={onClose} maxWidth="max-w-lg">
        <div className="space-y-2 mb-6">
            {(Object.keys(data) as Array<keyof Student>).map((key) => {
                const value = data[key];
                // FIX: Removed 'followUpToEdit' and 'followUpIndex' as they are not keys of Student type.
                const keysToIgnore: Array<keyof Student> = ['Age', 'siblings'];
                if(keysToIgnore.includes(key)) return null;

                if (key === 'financials' && Array.isArray(value)) {
                    return (
                        <div key={key}>
                            <strong className="font-medium text-gray-600">Financial Records:</strong>
                            {(value as FinancialRecord[]).map((item, index) => (
                                <div key={index} className="pl-4 text-sm mt-1">
                                    <p className="font-semibold">{item.item} ({item.category})</p>
                                    <p>${item.amount} / {item.frequency} (Date: {item.date || 'N/A'})</p>
                                </div>
                            ))}
                        </div>
                    );
                }
                 if (key === 'educationHistory' && Array.isArray(value)) {
                    return (
                        <div key={key}>
                            <strong className="font-medium text-gray-600">Education History:</strong>
                            {(value as EducationRecord[]).map((item: EducationRecord, index: number) => (
                                <div key={index} className="pl-4 text-sm mt-1">
                                    <p className="font-semibold">{item.school} - {item.grade}</p>
                                    <p>{item.startDate} to {item.endDate}</p>
                                </div>
                            ))}
                        </div>
                    );
                }
                if (key === 'School' && typeof value === 'object' && value !== null && 'name' in value) {
                    return <p key={key}><strong className="font-medium text-gray-600">School:</strong> {value.name}{value.campus && ` (${value.campus})`}</p>;
                }
                if (key === 'guardians' && Array.isArray(value)) {
                    return (
                        <div key={key}>
                            <strong className="font-medium text-gray-600">Guardians:</strong>
                            {(value as Guardian[]).map((guardian, index) => (
                                <div key={index} className="pl-4">
                                    <p>{guardian.name} ({guardian.relationship})</p>
                                    <p className="text-sm text-gray-500">{guardian.job} - ${guardian.income}/month</p>
                                    <p className="text-sm text-gray-500">{formatCambodianPhoneNumber(guardian.contact)}</p>
                                </div>
                            ))}
                        </div>
                    );
                }
                if (typeof value !== 'object' || value === null) {
                   return <p key={key}><strong className="font-medium text-gray-600">{key}:</strong> {String(value) || 'N/A'}</p>;
                }
                return null;
            })}
        </div>
        <div className="mt-6 flex justify-end gap-4">
            <button type="button" onClick={onEdit} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400">Go Back & Edit</button>
            <button type="button" onClick={onConfirm} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Confirm & Save</button>
        </div>
    </Modal>
);

export default ReviewModal;