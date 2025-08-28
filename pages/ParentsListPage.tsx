
import React, { useMemo, useRef } from 'react';
import { Phone, Briefcase, DollarSign, Camera, Trash2, Edit } from 'lucide-react';
import type { Student, Guardian, ParentProfiles } from '../types';
import { useAppContext } from '../context/AppContext';
import { formatCambodianPhoneNumber } from '../utils/helpers';

const ParentCard: React.FC<{
    parent: Guardian & { children: Student[] };
    photoUrl?: string;
}> = ({ parent, photoUrl }) => {
    const { handleSelectStudent, handleUpdateParentPhoto, setGuardianToEdit, setModal } = useAppContext();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                handleUpdateParentPhoto(parent.name, e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        handleUpdateParentPhoto(parent.name, '');
    };
    
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    const handleEdit = () => {
        const { children, ...guardianInfo } = parent;
        setGuardianToEdit({ guardian: guardianInfo, children: children });
        setModal('edit-guardian');
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                     <div className="relative group w-20 h-20 flex-shrink-0">
                        {photoUrl ? (
                            <img src={photoUrl} alt={parent.name} className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-sm" />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-sm">
                                <span className="text-2xl text-gray-500">{getInitials(parent.name)}</span>
                            </div>
                        )}
                         <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center gap-2 transition-opacity">
                            <button onClick={() => fileInputRef.current?.click()} className="p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity" title="Change photo">
                                <Camera size={20} />
                            </button>
                            {photoUrl && (
                               <button onClick={handleRemovePhoto} className="p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity" title="Remove photo">
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-2xl font-semibold text-gray-800 break-words">{parent.name}</h2>
                        <p className="text-sm text-gray-500">{parent.relationship}</p>
                    </div>
                </div>
                <div className="text-left sm:text-right flex-shrink-0">
                    <p className="text-sm text-gray-600 flex items-center sm:justify-end gap-2"><Phone size={14} /> <span className="break-all">{formatCambodianPhoneNumber(parent.contact)}</span></p>
                    <p className="text-sm text-gray-600 flex items-center sm:justify-end gap-2"><Briefcase size={14} /> <span className="break-words">{parent.job || 'N/A'}</span></p>
                    <p className="text-sm text-gray-600 flex items-center sm:justify-end gap-2"><DollarSign size={14} /> ${parent.income || '0'}/month</p>
                </div>
            </div>
            <div className="mt-4 border-t pt-4 flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-semibold">Children</h3>
                    <ul className="mt-2 space-y-2">
                        {parent.children.map(child => (
                            <li key={child.StudentID}>
                                <a href="#" onClick={(e) => {e.preventDefault(); handleSelectStudent(child)}} className="text-indigo-600 hover:underline">
                                    {child['Given Name']} {child['Family Name']}
                                </a>
                                <span className="text-sm text-gray-500 ml-2">({child.Grade})</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <button 
                    onClick={handleEdit} 
                    className="bg-gray-200 text-gray-800 px-3 py-1 rounded-md text-sm hover:bg-gray-300 flex items-center gap-1.5 flex-shrink-0"
                >
                    <Edit size={14} />
                    Edit Info
                </button>
            </div>
        </div>
    );
};

const ParentsListPage: React.FC = () => {
    const { studentsWithAge, parentProfiles } = useAppContext();
    
    const parentsData = useMemo(() => {
        const parents: { [key: string]: Guardian & { children: Student[] } } = {};
        studentsWithAge.forEach(student => {
            (student.guardians || []).forEach(guardian => {
                if (!guardian.name) return;
                if (!parents[guardian.name]) {
                    parents[guardian.name] = {
                        ...guardian,
                        children: []
                    };
                }
                parents[guardian.name].children.push(student);
            });
        });
        return Object.values(parents);
    }, [studentsWithAge]);

    return (
        <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
            <header className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Parents & Guardians</h1>
                <p className="text-gray-600 mt-1">A list of all parents and the students they are associated with.</p>
            </header>
            <div className="space-y-6">
                {parentsData.map(parent => (
                    <ParentCard 
                        key={parent.name}
                        parent={parent}
                        photoUrl={parentProfiles[parent.name]?.photoUrl}
                    />
                ))}
            </div>
        </div>
    );
};

export default ParentsListPage;
