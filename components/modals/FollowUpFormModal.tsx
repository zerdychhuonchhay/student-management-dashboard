
import React, { useState } from 'react';
import type { Student, FollowUp, Wellbeing } from '../../types';
import { ALL_RISK_FACTORS } from '../../constants';
import Modal from './Modal';

interface FollowUpFormModalProps {
    student: Student;
    followUp?: FollowUp;
    onSave: (studentId: string, data: FollowUp) => void;
    onClose: () => void;
}

const FollowUpFormModal: React.FC<FollowUpFormModalProps> = ({ student, followUp, onSave, onClose }) => {
    const isEditMode = !!followUp;
    const [formData, setFormData] = useState<FollowUp>(isEditMode ? followUp : {
        date: new Date().toISOString(),
        physicalHealth: { rating: 'Good', details: '' },
        socialInteraction: { rating: 'Good', details: '' },
        homeLife: { rating: 'Good', details: '' },
        drugsAlcoholViolence: { rating: 'No', details: '' },
        riskFactors: [],
        riskFactorsDetails: '',
        learningDifficulties: { rating: 'No', details: '' },
        behaviourInClass: { rating: 'Good', details: '' },
        peerIssues: { rating: 'No', details: '' },
        teacherInvolvement: { rating: 'No', details: '' },
        transportation: { rating: 'Good', details: '' },
        tutoringParticipation: { rating: 'Good', details: '' },
        notes: '',
        recommendations: '',
        childProtectionConcerns: 'No',
        humanTraffickingRisk: 'No'
    });

    const handleWellbeingChange = (field: keyof FollowUp, subfield: keyof Wellbeing, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: { ...(prev[field] as Wellbeing), [subfield]: value }
        }));
    };

    const handleRiskFactorChange = (risk: string) => {
        setFormData(prev => {
            const newRiskFactors = prev.riskFactors.includes(risk)
                ? prev.riskFactors.filter(r => r !== risk)
                : [...prev.riskFactors, risk];
            return { ...prev, riskFactors: newRiskFactors };
        });
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(student.StudentID, formData);
    };

    const WellbeingInput = ({ label, fieldName, options = ['Good', 'Average', 'Poor'] }: { label: string, fieldName: keyof FollowUp, options?: string[] }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <select
                value={(formData[fieldName] as Wellbeing).rating}
                onChange={(e) => handleWellbeingChange(fieldName, 'rating', e.target.value)}
                className="mt-1 block w-full p-2 border rounded-md bg-white"
            >
                {options.map(opt => <option key={opt}>{opt}</option>)}
            </select>
            {(formData[fieldName] as Wellbeing).rating !== options[0] && (
                <textarea
                    placeholder="Please provide details."
                    value={(formData[fieldName] as Wellbeing).details}
                    onChange={(e) => handleWellbeingChange(fieldName, 'details', e.target.value)}
                    className="mt-2 block w-full p-2 border rounded-md text-sm bg-white"
                    rows={2}
                />
            )}
        </div>
    );

    return (
        <Modal title={isEditMode ? "Edit Follow-Up" : "Add Follow-Up"} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <fieldset>
                    <legend className="text-lg font-semibold text-gray-800 border-b w-full pb-1 mb-2">Well-being Progress</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <WellbeingInput label="Physical Health" fieldName="physicalHealth" />
                        <WellbeingInput label="Social Interaction" fieldName="socialInteraction" />
                        <WellbeingInput label="Home Life" fieldName="homeLife" />
                        <WellbeingInput label="Drugs/Alcohol/Violence" fieldName="drugsAlcoholViolence" options={['No', 'Yes']} />
                    </div>
                </fieldset>
                
                <fieldset>
                    <legend className="text-lg font-semibold text-gray-800 border-b w-full pb-1 mb-2">Risk Factors</legend>
                    <p className="text-sm text-gray-500 mb-2">Select ALL that apply.</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                        {ALL_RISK_FACTORS.map(risk => (
                            <label key={risk} className="flex items-center space-x-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={formData.riskFactors.includes(risk)}
                                    onChange={() => handleRiskFactorChange(risk)}
                                    className="rounded"
                                />
                                <span>{risk}</span>
                            </label>
                        ))}
                    </div>
                     {formData.riskFactors.length > 0 && (
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700">Details for ALL selected risk factors</label>
                             <textarea
                                name="riskFactorsDetails"
                                value={formData.riskFactorsDetails}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 border rounded-md bg-white"
                                rows={3}
                                placeholder="Example: Housing Insecurity - family unable to pay rent and must move every month or two."
                            />
                        </div>
                    )}
                </fieldset>

                <fieldset>
                    <legend className="text-lg font-semibold text-gray-800 border-b w-full pb-1 mb-2">Educational Progress</legend>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <WellbeingInput label="Learning Difficulties" fieldName="learningDifficulties" options={['No', 'Yes']} />
                        <WellbeingInput label="Behaviour in Class" fieldName="behaviourInClass" />
                        <WellbeingInput label="Peer Issues" fieldName="peerIssues" options={['No', 'Yes']} />
                        <WellbeingInput label="Teacher Involvement" fieldName="teacherInvolvement" options={['No', 'Yes']} />
                        <WellbeingInput label="Transportation" fieldName="transportation" />
                        <WellbeingInput label="Tutoring Participation" fieldName="tutoringParticipation" />
                    </div>
                </fieldset>
                
                <fieldset>
                     <legend className="text-lg font-semibold text-gray-800 border-b w-full pb-1 mb-2">Staff Notes</legend>
                     <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Notes</label>
                             <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 border rounded-md bg-white"
                                rows={3}
                                placeholder="Please write any information you learned that is not included in this form."
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Changes / Recommendations</label>
                             <textarea
                                name="recommendations"
                                value={formData.recommendations}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 border rounded-md bg-white"
                                rows={3}
                                placeholder="Please share any changes that you believe may be helpful."
                            />
                        </div>
                     </div>
                </fieldset>
                
                <fieldset>
                     <legend className="text-lg font-semibold text-gray-800 border-b w-full pb-1 mb-2">Conclusion</legend>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                             <label className="block text-sm font-medium text-gray-700">Child Protection Concerns?</label>
                             <select name="childProtectionConcerns" value={formData.childProtectionConcerns} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md bg-white">
                                 <option>No</option>
                                 <option>Yes</option>
                             </select>
                         </div>
                         <div>
                             <label className="block text-sm font-medium text-gray-700">Increased Risk of Trafficking/Abuse?</label>
                             <select name="humanTraffickingRisk" value={formData.humanTraffickingRisk} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md bg-white">
                                 <option>No</option>
                                 <option>Yes</option>
                             </select>
                         </div>
                     </div>
                </fieldset>

                <div className="mt-6 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400">Cancel</button>
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Save</button>
                </div>
            </form>
        </Modal>
    );
};

export default FollowUpFormModal;
