
import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import { useAppContext } from '../../context/AppContext';
import { MAPPABLE_APP_FIELDS } from '../../constants';
import type { ColumnMapping } from '../../types';
import { Info } from 'lucide-react';

const normalizeHeader = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

const findBestMatch = (appFieldLabel: string, fileHeaders: string[]): string | null => {
    const normalizedAppField = normalizeHeader(appFieldLabel);
    
    // 1. Look for an exact match (after normalization)
    for (const header of fileHeaders) {
        if (normalizeHeader(header) === normalizedAppField) {
            return header;
        }
    }

    // 2. Look for common alternatives
    const alternatives: { [key: string]: string[] } = {
        'studentid': ['id', 'studentnumber'],
        'givenname': ['firstname', 'first'],
        'familyname': ['lastname', 'surname', 'last'],
        'dateofbirth': ['dob', 'birthdate'],
        'enrollmentdate': ['enrolldate', 'startdate', 'enrolled'],
        'schoolnamecampus': ['school']
    };

    const checkAlts = alternatives[normalizedAppField];
    if (checkAlts) {
        for (const alt of checkAlts) {
            for (const header of fileHeaders) {
                if (normalizeHeader(header) === alt) {
                    return header;
                }
            }
        }
    }
    
    return null;
};


const ColumnMappingModal: React.FC = () => {
    const { fileHeaders, setModal, handleProcessMappedImport } = useAppContext();
    const [mapping, setMapping] = useState<ColumnMapping>({});

    useEffect(() => {
        const initialMapping: ColumnMapping = {};
        MAPPABLE_APP_FIELDS.forEach(field => {
            const bestMatch = findBestMatch(field.label, fileHeaders);
            initialMapping[field.key] = bestMatch;
        });
        setMapping(initialMapping);
    }, [fileHeaders]);

    const handleMappingChange = (appFieldKey: string, fileHeader: string) => {
        setMapping(prev => ({
            ...prev,
            [appFieldKey]: fileHeader === "" ? null : fileHeader
        }));
    };

    const isMappingValid = useMemo(() => {
        return MAPPABLE_APP_FIELDS.every(field => {
            if (!field.required) return true;
            return !!mapping[field.key];
        });
    }, [mapping]);

    const handleSubmit = () => {
        if (isMappingValid) {
            handleProcessMappedImport(mapping);
        }
    };

    return (
        <Modal title="Map Your Columns" onClose={() => setModal(null)} maxWidth="max-w-4xl">
            <div>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <Info className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                Match the columns from your uploaded file to the required application fields. We've made some guesses for you. Please review and correct them as needed.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {MAPPABLE_APP_FIELDS.map(field => (
                        <div key={field.key}>
                            <label className="block text-sm font-medium text-gray-700">
                                {field.label}
                                {field.required && <span className="text-red-500">*</span>}
                            </label>
                            <p className="text-xs text-gray-500 mb-1">e.g., "{field.example}"</p>
                            <select
                                value={mapping[field.key] || ""}
                                onChange={(e) => handleMappingChange(field.key, e.target.value)}
                                className={`mt-1 block w-full p-2 border rounded-md bg-white ${field.required && !mapping[field.key] ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="">-- Do not import --</option>
                                {fileHeaders.map(header => (
                                    <option key={header} value={header}>{header}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex justify-end gap-4 border-t pt-4">
                    <button type="button" onClick={() => setModal(null)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400">Cancel</button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={!isMappingValid}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed"
                        title={isMappingValid ? "Proceed with import" : "Please map all required fields (*)"}
                    >
                        Confirm Mapping & Import
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ColumnMappingModal;
