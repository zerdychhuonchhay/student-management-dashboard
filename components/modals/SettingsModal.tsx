import React, { useState } from 'react';
import type { ColumnConfig } from '../../types';
import Modal from './Modal';
import { GripVertical, Pin, PinOff } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface SettingsModalProps {
    columnConfig: ColumnConfig[];
    setColumnConfig: React.Dispatch<React.SetStateAction<ColumnConfig[]>>;
    onReset: () => void;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ columnConfig, setColumnConfig, onReset, onClose }) => {
    const [draggedItemKey, setDraggedItemKey] = useState<string | null>(null);
    const { eligibilityPrompt, setEligibilityPrompt, handleResetEligibilityPrompt } = useAppContext();

    const handleToggleVisibility = (key: string) => {
        setColumnConfig(prev => prev.map(c => c.key === key ? { ...c, visible: !c.visible } : c));
    };

    const handleToggleLocked = (key: string) => {
        setColumnConfig(prev => prev.map(c => c.key === key ? { ...c, locked: !c.locked } : c));
    };

    const handleDragStart = (e: React.DragEvent<HTMLLIElement>, key: string) => {
        setDraggedItemKey(key);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLLIElement>, dropKey: string) => {
        if (!draggedItemKey) return;

        const draggedIndex = columnConfig.findIndex(c => c.key === draggedItemKey);
        const dropIndex = columnConfig.findIndex(c => c.key === dropKey);
        
        const newConfig = [...columnConfig];
        const [reorderedItem] = newConfig.splice(draggedIndex, 1);
        newConfig.splice(dropIndex, 0, reorderedItem);
        
        setColumnConfig(newConfig);
        setDraggedItemKey(null);
    };

    return (
        <Modal title="Settings" onClose={onClose} maxWidth="max-w-2xl">
            <div>
                <h3 className="text-lg font-semibold mb-2">Column Management</h3>
                <p className="text-sm text-gray-600 mb-4">Click and drag to reorder columns. Use the pin to lock a column to the left side of the table.</p>
                <ul className="space-y-2">
                    {columnConfig.filter(c => c.key !== 'Actions').map(col => (
                        <li
                            key={col.key}
                            draggable
                            onDragStart={(e) => handleDragStart(e, col.key)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, col.key)}
                            className={`flex items-center space-x-3 p-2 rounded-md border transition-all ${draggedItemKey === col.key ? 'opacity-50' : ''}`}
                        >
                            <GripVertical className="cursor-grab text-gray-400" />
                            <label className="flex items-center space-x-2 flex-grow">
                                <input
                                    type="checkbox"
                                    checked={col.visible}
                                    onChange={() => handleToggleVisibility(col.key)}
                                    className="rounded"
                                />
                                <span>{col.label}</span>
                            </label>
                            <button onClick={() => handleToggleLocked(col.key)} className="p-1 rounded-full hover:bg-gray-200" title={col.locked ? "Unlock column" : "Lock column"}>
                                {col.locked ? <Pin size={16} className="text-indigo-600" /> : <PinOff size={16} className="text-gray-500" />}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            
            <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">AI Eligibility Criteria</h3>
                <p className="text-sm text-gray-600 mb-2">
                    Edit the instructions given to the AI when it evaluates a new student's eligibility for the scholarship program.
                </p>
                <textarea
                    value={eligibilityPrompt}
                    onChange={(e) => setEligibilityPrompt(e.target.value)}
                    className="w-full p-2 border rounded-md bg-white font-mono text-sm"
                    rows={6}
                />
                <button 
                    onClick={handleResetEligibilityPrompt}
                    className="text-sm text-gray-600 hover:underline mt-2"
                >
                    Reset to Default
                </button>
            </div>

            <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">Data Management</h3>
                <button onClick={onReset} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">Reset All Data</button>
                <p className="text-sm text-gray-600 mt-1">This will erase all changes and restore the original student list.</p>
            </div>
        </Modal>
    );
};

export default SettingsModal;