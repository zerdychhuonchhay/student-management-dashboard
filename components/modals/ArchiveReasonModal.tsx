
import React, { useState } from 'react';
import Modal from './Modal';

interface ArchiveReasonModalProps {
    onConfirm: (reason: string, date: string) => void;
    onClose: () => void;
}

const ArchiveReasonModal: React.FC<ArchiveReasonModalProps> = ({ onConfirm, onClose }) => {
    const [reason, setReason] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = () => {
        if (reason.trim() && date) {
            onConfirm(reason, date);
        }
    };

    return (
        <Modal title="Reason for Archiving" onClose={onClose} maxWidth="max-w-md">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Date Left</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full p-2 border rounded-md bg-white mt-1"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Reason for Archiving</label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full p-2 border rounded-md bg-white mt-1"
                        rows={3}
                        placeholder="e.g., Graduated, Moved to another province, etc."
                    />
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
                <button type="button" onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400">Cancel</button>
                <button onClick={handleSubmit} disabled={!reason.trim() || !date} className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 disabled:bg-yellow-300">Confirm Archive</button>
            </div>
        </Modal>
    );
};

export default ArchiveReasonModal;
