
import React from 'react';
import type { Guardian } from '../../types';
import { useAppContext } from '../../context/AppContext';
import Modal from './Modal';
import { formatCambodianPhoneNumber } from '../../utils/helpers';

const GuardianInfoCard: React.FC<{ name: string; guardians: Guardian[] | undefined }> = ({ name, guardians }) => (
    <div className="border p-4 rounded-lg bg-gray-50 flex-1">
        <h4 className="font-semibold text-lg">{name}</h4>
        {guardians && guardians.length > 0 ? (
            <div className="text-sm mt-2 space-y-1">
                <p><strong>Name:</strong> {guardians[0].name}</p>
                <p><strong>Contact:</strong> {formatCambodianPhoneNumber(guardians[0].contact)}</p>
                <p><strong>Job:</strong> {guardians[0].job || 'N/A'}</p>
                <p><strong>Income:</strong> ${guardians[0].income || '0'}</p>
            </div>
        ) : (
            <p className="text-sm mt-2 text-gray-500">No guardian information on file.</p>
        )}
    </div>
);


const ResolveGuardiansModal: React.FC<{ onClose: () => void; }> = ({ onClose }) => {
    const { pendingSiblingConfirmation, handleResolveSiblingGuardians } = useAppContext();

    if (!pendingSiblingConfirmation) return null;

    const { student1, student2 } = pendingSiblingConfirmation;

    return (
        <Modal title="Resolve Guardian Information" onClose={onClose}>
            <div>
                <p className="mb-4 text-gray-700">The two students you are linking as siblings have different guardian information. Please choose which information is correct for the family, or choose to keep them separate.</p>
                
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <GuardianInfoCard name={`${student1['Given Name']} ${student1['Family Name']}`} guardians={student1.guardians} />
                    <GuardianInfoCard name={`${student2['Given Name']} ${student2['Family Name']}`} guardians={student2.guardians} />
                </div>
                
                <div className="space-y-3">
                    <button 
                        onClick={() => handleResolveSiblingGuardians(student1.StudentID)}
                        className="w-full text-left p-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg"
                    >
                        Use <strong>{student1['Given Name']}'s</strong> guardian information for both students.
                    </button>
                    <button 
                        onClick={() => handleResolveSiblingGuardians(student2.StudentID)}
                        className="w-full text-left p-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg"
                    >
                        Use <strong>{student2['Given Name']}'s</strong> guardian information for both students.
                    </button>
                    <button 
                        onClick={() => handleResolveSiblingGuardians(null)}
                        className="w-full text-left p-3 bg-gray-100 hover:bg-gray-200 border rounded-lg"
                    >
                        <strong>Keep information separate</strong> (e.g., for adoptions, different legal guardians).
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ResolveGuardiansModal;
