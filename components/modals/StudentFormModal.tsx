
import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import type { Student, FinancialRecord, Guardian, EducationRecord, AcademicStatus } from '../../types';
import Modal from './Modal';

interface StudentFormModalProps {
    student?: Student | null;
    onReview: (formData: Student) => void;
    onClose: () => void;
    onArchive?: () => void;
}

const validateForm = (data: Student): { [key: string]: string } => {
    const newErrors: { [key: string]: string } = {};

    if (!data.StudentID?.trim()) newErrors.StudentID = 'Student ID is required.';
    if (!data['Given Name']?.trim()) newErrors['Given Name'] = 'Given Name is required.';
    if (!data['Family Name']?.trim()) newErrors['Family Name'] = 'Family Name is required.';

    if (data.DOB) {
        const dobDate = new Date(data.DOB);
        if (isNaN(dobDate.getTime())) {
            newErrors.DOB = 'Please enter a valid date.';
        } else if (dobDate > new Date()) {
            newErrors.DOB = 'Date of birth cannot be in the future.';
        }
    }

    if (data.EnrollmentDate) {
        const enrollDate = new Date(data.EnrollmentDate);
        if (isNaN(enrollDate.getTime())) {
            newErrors.EnrollmentDate = 'Please enter a valid date.';
        }
    }

    (data.guardians || []).forEach((guardian, index) => {
        if (guardian.income != null && (isNaN(guardian.income) || guardian.income < 0)) {
            newErrors[`guardian_income_${index}`] = 'Income must be a positive number.';
        }
    });

    (data.financials || []).forEach((financial, index) => {
        if (!financial.item?.trim()) {
            newErrors[`financial_item_${index}`] = 'Item description is required.';
        }
        if (financial.amount == null || financial.amount.trim() === '' || isNaN(Number(financial.amount)) || Number(financial.amount) < 0) {
            newErrors[`financial_amount_${index}`] = 'Amount must be a positive number.';
        }
    });

    return newErrors;
};


const StudentFormModal: React.FC<StudentFormModalProps> = ({ student, onReview, onClose, onArchive }) => {
    const [formData, setFormData] = useState<Student>(student || { StudentID: '', 'Given Name': '', 'Family Name': '', DOB: '', Sex: 'M', Grade: '', School: { name: '', campus: '' }, financials: [{ category: 'Education', item: '', amount: '', frequency: 'Monthly', date: '' }], guardians: [{ name: '', relationship: '', contact: '', job: '', income: 0 }], educationHistory: [], Major: '', Comments: 'No comments yet.', EnrollmentDate: '', Location: '', photoUrl: '', academicStatus: 'Active' });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

    useEffect(() => {
        if (hasAttemptedSubmit) {
            setErrors(validateForm(formData));
        }
    }, [formData, hasAttemptedSubmit]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'schoolName' || name === 'schoolCampus') {
            const field = name === 'schoolName' ? 'name' : 'campus';
            setFormData(prev => ({ ...prev, School: { ...prev.School, [field]: value } }));
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };
    
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFinancialChange = (index: number, field: keyof FinancialRecord, value: string) => {
        const newFinancials = (formData.financials || []).map((record, i) => {
            if (i !== index) {
                return record;
            }

            if (field === 'frequency') {
                return { ...record, frequency: value as FinancialRecord['frequency'] };
            }

            return { ...record, [field]: value };
        });
        setFormData({ ...formData, financials: newFinancials });
    };

    const addFinancial = () => {
        const newFinancials = [...(formData.financials || []), { category: 'Education', item: '', amount: '', frequency: 'Monthly' as const, date: new Date().toISOString().split('T')[0] }];
        setFormData({ ...formData, financials: newFinancials });
    };

    const removeFinancial = (index: number) => {
        const newFinancials = (formData.financials || []).filter((_, i) => i !== index);
        setFormData({ ...formData, financials: newFinancials });
    };

    const handleGuardianChange = (index: number, field: keyof Guardian, value: string | number) => {
        const newGuardians = [...(formData.guardians || [])];
        newGuardians[index] = { ...newGuardians[index], [field]: value };
        setFormData({ ...formData, guardians: newGuardians });
    };

    const addGuardian = () => {
        const newGuardians = [...(formData.guardians || []), { name: '', relationship: '', contact: '', job: '', income: 0 }];
        setFormData({ ...formData, guardians: newGuardians });
    };

    const removeGuardian = (index: number) => {
        const newGuardians = (formData.guardians || []).filter((_, i) => i !== index);
        setFormData({ ...formData, guardians: newGuardians });
    };

    const handleEducationHistoryChange = (index: number, field: keyof EducationRecord, value: string) => {
        const newHistory = [...(formData.educationHistory || [])];
        newHistory[index] = { ...newHistory[index], [field]: value };
        setFormData({ ...formData, educationHistory: newHistory });
    };

    const addEducationHistory = () => {
        const newHistory = [...(formData.educationHistory || []), { school: '', grade: '', startDate: '', endDate: '' }];
        setFormData({ ...formData, educationHistory: newHistory });
    };

    const removeEducationHistory = (index: number) => {
        const newHistory = (formData.educationHistory || []).filter((_, i) => i !== index);
        setFormData({ ...formData, educationHistory: newHistory });
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setHasAttemptedSubmit(true);
        const formErrors = validateForm(formData);
        if (Object.keys(formErrors).length === 0) {
            onReview(formData);
        } else {
            setErrors(formErrors);
        }
    };

    const formFields = (Object.keys(formData) as Array<keyof Student>).filter(k => {
        // FIX: Removed 'followUpToEdit' and 'followUpIndex' as they are not keys of Student type.
        const fieldsToExclude: Array<keyof Student> = ['StudentID', 'Age', 'DateLeft', 'ReasonLeft', 'financials', 'School', 'guardians', 'educationHistory', 'photoUrl', 'siblings', 'academicStatus'];
        if (formData.Grade !== 'University') {
            fieldsToExclude.push('Major');
        }
        return !fieldsToExclude.includes(k);
    });

    return (
        <Modal title={student ? "Edit Student" : "Add New Student"} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Student ID</label>
                        <input type="text" name="StudentID" value={formData.StudentID || ''} onChange={handleChange} className={`mt-1 block w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${student ? 'bg-gray-100' : 'bg-white'} ${errors.StudentID ? 'border-red-500' : 'border-gray-300'}`} disabled={!!student} required />
                         {errors.StudentID && <p className="text-red-500 text-xs mt-1">{errors.StudentID}</p>}
                    </div>
                    <div className="md:col-span-1 grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">School Name</label>
                            <input type="text" name="schoolName" value={formData.School.name || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md bg-white border-gray-300" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Campus/Branch</label>
                            <input type="text" name="schoolCampus" value={formData.School.campus || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md bg-white border-gray-300" />
                        </div>
                    </div>
                    {formFields.map(key => {
                        const errorKey = key as keyof typeof errors;
                        const hasError = !!errors[errorKey];
                        const inputClass = `mt-1 block w-full p-2 border rounded-md bg-white ${hasError ? 'border-red-500' : 'border-gray-300'}`;
                        return (
                            <div key={key} className={key === 'Comments' ? 'md:col-span-2' : ''}>
                                <label className="block text-sm font-medium text-gray-700">{key}</label>
                                {key === 'Comments' ? (
                                    <textarea name={key} value={formData[key] || ''} onChange={handleChange} className={inputClass} rows={3} />
                                ) : key === 'Sex' ? (
                                    <select name="Sex" value={formData.Sex} onChange={handleSelectChange} className={inputClass}>
                                        <option value="M">Male</option>
                                        <option value="F">Female</option>
                                    </select>
                                 ) : (
                                    <input type={key === 'DOB' || key === 'EnrollmentDate' ? 'date' : 'text'} name={key} value={String(formData[key] || '')} onChange={handleChange} className={inputClass} />
                                )}
                                {hasError && <p className="text-red-500 text-xs mt-1">{errors[errorKey]}</p>}
                            </div>
                        );
                    })}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Academic Status</label>
                        <select
                            name="academicStatus"
                            value={formData.academicStatus || 'Active'}
                            onChange={(e) => setFormData(prev => ({ ...prev, academicStatus: e.target.value as AcademicStatus }))}
                            className="mt-1 block w-full p-2 border rounded-md bg-white border-gray-300"
                        >
                            <option value="Active">Active</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Pursuing Skills">Pursuing Skills</option>
                            <option value="Working">Working</option>
                        </select>
                    </div>
                </div>
                
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-1 mb-2">Education History</h3>
                    {(formData.educationHistory || []).map((record, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 mb-2 p-2 border rounded-md">
                            <div className="col-span-6 md:col-span-5"><label className="block text-sm font-medium text-gray-700">School</label><input type="text" value={record.school} onChange={(e) => handleEducationHistoryChange(index, 'school', e.target.value)} className="mt-1 block w-full p-2 border rounded-md bg-white border-gray-300" /></div>
                            <div className="col-span-6 md:col-span-2"><label className="block text-sm font-medium text-gray-700">Grade/Year</label><input type="text" value={record.grade} onChange={(e) => handleEducationHistoryChange(index, 'grade', e.target.value)} className="mt-1 block w-full p-2 border rounded-md bg-white border-gray-300" /></div>
                            <div className="col-span-6 md:col-span-2"><label className="block text-sm font-medium text-gray-700">Start Date</label><input type="date" value={record.startDate} onChange={(e) => handleEducationHistoryChange(index, 'startDate', e.target.value)} className="mt-1 block w-full p-2 border rounded-md bg-white border-gray-300" /></div>
                            <div className="col-span-6 md:col-span-2"><label className="block text-sm font-medium text-gray-700">End Date</label><input type="date" value={record.endDate} onChange={(e) => handleEducationHistoryChange(index, 'endDate', e.target.value)} className="mt-1 block w-full p-2 border rounded-md bg-white border-gray-300" /></div>
                            <div className="col-span-12 md:col-span-1 flex items-end"><button type="button" onClick={() => removeEducationHistory(index)} className="p-2 text-red-500 hover:text-red-700 mt-6"><Trash2 size={16}/></button></div>
                        </div>
                    ))}
                    <button type="button" onClick={addEducationHistory} className="text-sm text-indigo-600 hover:underline">+ Add Education Record</button>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-1 mb-2">Guardians</h3>
                    {(formData.guardians || []).map((guardian, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 mb-2 p-2 border rounded-md">
                            <div className="col-span-6"><label className="block text-sm font-medium text-gray-700">Name</label><input type="text" value={guardian.name} onChange={(e) => handleGuardianChange(index, 'name', e.target.value)} className="mt-1 block w-full p-2 border rounded-md bg-white border-gray-300" /></div>
                            <div className="col-span-6"><label className="block text-sm font-medium text-gray-700">Relationship</label><input type="text" value={guardian.relationship} onChange={(e) => handleGuardianChange(index, 'relationship', e.target.value)} className="mt-1 block w-full p-2 border rounded-md bg-white border-gray-300" /></div>
                            <div className="col-span-6"><label className="block text-sm font-medium text-gray-700">Contact</label><input type="text" value={guardian.contact} onChange={(e) => handleGuardianChange(index, 'contact', e.target.value)} className="mt-1 block w-full p-2 border rounded-md bg-white border-gray-300" /></div>
                            <div className="col-span-6"><label className="block text-sm font-medium text-gray-700">Job</label><input type="text" value={guardian.job} onChange={(e) => handleGuardianChange(index, 'job', e.target.value)} className="mt-1 block w-full p-2 border rounded-md bg-white border-gray-300" /></div>
                            <div className="col-span-11"><label className="block text-sm font-medium text-gray-700">Monthly Income ($)</label><input type="number" value={guardian.income} onChange={(e) => handleGuardianChange(index, 'income', Number(e.target.value))} className={`mt-1 block w-full p-2 border rounded-md bg-white ${errors[`guardian_income_${index}`] ? 'border-red-500' : 'border-gray-300'}`} /> {errors[`guardian_income_${index}`] && <p className="text-red-500 text-xs mt-1">{errors[`guardian_income_${index}`]}</p>}</div>
                            <div className="col-span-1 flex items-end"><button type="button" onClick={() => removeGuardian(index)} className="p-2 text-red-500 hover:text-red-700 mt-6"><Trash2 size={16}/></button></div>
                        </div>
                    ))}
                    <button type="button" onClick={addGuardian} className="text-sm text-indigo-600 hover:underline">+ Add Guardian</button>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-1 mb-2">Financial Records</h3>
                    {(formData.financials || []).map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 mb-2 p-2 border rounded-md items-start">
                            <div className="col-span-full md:col-span-6">
                                <label className="block text-sm font-medium text-gray-700">Item Description</label>
                                <input type="text" value={item.item} onChange={(e) => handleFinancialChange(index, 'item', e.target.value)} className={`mt-1 block w-full p-2 border rounded-md bg-white ${errors[`financial_item_${index}`] ? 'border-red-500' : 'border-gray-300'}`} placeholder="e.g., Tuition Fee, Books" />
                                {errors[`financial_item_${index}`] && <p className="text-red-500 text-xs mt-1">{errors[`financial_item_${index}`]}</p>}
                            </div>
                            <div className="col-span-6 md:col-span-3"><label className="block text-sm font-medium text-gray-700">Category</label><select value={item.category} onChange={(e) => handleFinancialChange(index, 'category', e.target.value)} className="mt-1 block w-full p-2 border rounded-md bg-white border-gray-300"><option>Education</option><option>Supplies</option><option>Transportation</option><option>Healthcare</option><option>Other</option></select></div>
                            <div className="col-span-6 md:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Amount ($)</label>
                                <input type="number" step="0.01" value={item.amount} onChange={(e) => handleFinancialChange(index, 'amount', e.target.value)} className={`mt-1 block w-full p-2 border rounded-md bg-white ${errors[`financial_amount_${index}`] ? 'border-red-500' : 'border-gray-300'}`} />
                                {errors[`financial_amount_${index}`] && <p className="text-red-500 text-xs mt-1">{errors[`financial_amount_${index}`]}</p>}
                            </div>
                            <div className="col-span-6 md:col-span-4"><label className="block text-sm font-medium text-gray-700">Frequency</label><select value={item.frequency} onChange={(e) => handleFinancialChange(index, 'frequency', e.target.value)} className="mt-1 block w-full p-2 border rounded-md bg-white border-gray-300"><option>One-time</option><option>Monthly</option><option>Quarterly</option><option>Semester</option><option>Yearly</option></select></div>
                            <div className="col-span-6 md:col-span-4"><label className="block text-sm font-medium text-gray-700">Date</label><input type="date" value={item.date} onChange={(e) => handleFinancialChange(index, 'date', e.target.value)} className="mt-1 block w-full p-2 border rounded-md bg-white border-gray-300" /></div>
                            <div className="col-span-11 md:col-span-3"></div>
                            <div className="col-span-1 flex items-end h-full"><button type="button" onClick={() => removeFinancial(index)} className="p-2 text-red-500 hover:text-red-700"><Trash2 size={16}/></button></div>
                        </div>
                    ))}
                    <button type="button" onClick={addFinancial} className="text-sm text-indigo-600 hover:underline">+ Add Financial Record</button>
                </div>
                <div className="mt-6 flex justify-between items-center">
                    {student && onArchive && <button type="button" onClick={onArchive} className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600">Archive Student</button>}
                    <div className="flex gap-4 ml-auto">
                        <button type="button" onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400">Cancel</button>
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                            disabled={hasAttemptedSubmit && Object.keys(errors).length > 0}
                            title={hasAttemptedSubmit && Object.keys(errors).length > 0 ? "Please fix the errors before saving" : "Review and save changes"}
                        >
                            Review & Save
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default StudentFormModal;