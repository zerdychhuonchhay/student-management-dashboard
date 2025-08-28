
import React from 'react';
import Modal from './Modal';
import { useAppContext } from '../../context/AppContext';
import { AlertCircle } from 'lucide-react';

const ImportErrorsModal: React.FC = () => {
    const { importErrors, setModal } = useAppContext();

    return (
        <Modal title="Import Failed" onClose={() => setModal(null)} maxWidth="max-w-2xl">
            <div>
                 <div className="flex items-center text-red-700 mb-4">
                    <AlertCircle className="w-6 h-6 mr-2" />
                    <p className="font-semibold">The following errors were found in your file. Please correct them and try uploading again.</p>
                </div>
                <div className="bg-red-50 p-4 rounded-md max-h-80 overflow-y-auto border border-red-200">
                    <ul className="space-y-2 text-sm text-red-900">
                        {importErrors.map((error, index) => (
                            <li key={index} className="font-mono bg-white p-2 rounded-md shadow-sm">{error}</li>
                        ))}
                    </ul>
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={() => setModal(null)} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">Close</button>
                </div>
            </div>
        </Modal>
    );
};

export default ImportErrorsModal;
