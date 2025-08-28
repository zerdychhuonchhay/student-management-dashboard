
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Filter, ArrowUpDown, PlusCircle, Upload, Search, Pin, PinOff } from 'lucide-react';
import type { Student, AcademicStatus, ColumnConfig } from '../types';
import { calculateMonthlyEquivalent } from '../utils/helpers';
import { useAppContext } from '../context/AppContext';

const CategoryFilters: React.FC = () => {
    const { category, setCategory } = useAppContext();
    const categories = ['all', 'university', 'high-school', 'middle-school', 'elementary'];
    return (
        <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                        className={`px-4 py-2 text-sm font-semibold rounded-md shadow-sm capitalize ${category === cat ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
                    {cat.replace('-', ' ')}
                </button>
            ))}
        </div>
    );
};

const StudentTable: React.FC = () => {
    const { filteredAndSortedStudents, sort, handleSort, columnConfig, setColumnConfig, handleSelectStudent, handleSelectSchool, openModal } = useAppContext();
    const [draggedItemKey, setDraggedItemKey] = useState<string | null>(null);
    const [lockedColumnOffsets, setLockedColumnOffsets] = useState<number[]>([]);
    const headerRefs = useRef<(HTMLTableCellElement | null)[]>([]);

    const visibleColumns = useMemo(() => columnConfig.filter(c => c.visible), [columnConfig]);
    const lockedColumns = useMemo(() => visibleColumns.filter(c => c.locked), [visibleColumns]);

    useEffect(() => {
        const calculateOffsets = () => {
            const offsets = [0];
            let currentOffset = 0;
            for (let i = 0; i < lockedColumns.length - 1; i++) {
                const th = headerRefs.current[i];
                if (th) {
                    currentOffset += th.getBoundingClientRect().width;
                    offsets.push(currentOffset);
                }
            }
            setLockedColumnOffsets(offsets);
        };
        calculateOffsets();
        // Recalculate on window resize for responsiveness
        window.addEventListener('resize', calculateOffsets);
        return () => window.removeEventListener('resize', calculateOffsets);
    }, [lockedColumns]);

    const handleDragStart = (e: React.DragEvent<HTMLTableCellElement>, key: string) => {
        setDraggedItemKey(key);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLTableCellElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLTableCellElement>, dropKey: string) => {
        if (!draggedItemKey) return;
        const newConfig = [...columnConfig];
        const draggedIndex = newConfig.findIndex(c => c.key === draggedItemKey);
        const dropIndex = newConfig.findIndex(c => c.key === dropKey);
        const [reorderedItem] = newConfig.splice(draggedIndex, 1);
        newConfig.splice(dropIndex, 0, reorderedItem);
        setColumnConfig(newConfig);
        setDraggedItemKey(null);
    };

    const handleToggleLock = (key: string) => {
        setColumnConfig(prev => prev.map(c => c.key === key ? { ...c, locked: !c.locked } : c));
    };

    return (
        <table className="min-w-full divide-y divide-gray-200 border-separate border-spacing-0">
            <thead className="bg-gray-50 sticky top-0 z-20">
                <tr>
                    {visibleColumns.map((col, index) => {
                        const isLocked = col.locked;
                        const lockedIndex = lockedColumns.findIndex(c => c.key === col.key);
                        const style: React.CSSProperties = {};

                        if (isLocked) {
                            style.position = 'sticky';
                            style.left = lockedColumnOffsets[lockedIndex] || 0;
                            style.zIndex = 30;
                        }
                        
                        return (
                            <th
                                key={col.key}
                                ref={el => { if (isLocked) headerRefs.current[lockedIndex] = el; }}
                                draggable={col.key !== 'Actions'}
                                onDragStart={(e) => handleDragStart(e, col.key)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, col.key)}
                                onClick={() => col.key !== 'Actions' && handleSort(col.key)}
                                className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b group ${draggedItemKey === col.key ? 'opacity-50' : ''} ${isLocked ? 'bg-gray-50 shadow-[inset_-1px_0_0_0_#e5e7eb]' : ''}`}
                                style={style}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className={`flex items-center gap-2 ${col.key !== 'Actions' ? 'cursor-pointer' : ''}`}>
                                        {col.label}
                                        {col.key !== 'Actions' && (sort.column === col.key ? (sort.direction === 'asc' ? '↑' : '↓') : <ArrowUpDown size={12} />)}
                                    </span>
                                    {col.key !== 'Actions' && (
                                        <button onClick={(e) => { e.stopPropagation(); handleToggleLock(col.key); }} className="p-1 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity" title={col.locked ? "Unlock column" : "Lock column"}>
                                            {col.locked ? <Pin size={14} className="text-indigo-600" /> : <PinOff size={14} />}
                                        </button>
                                    )}
                                </div>
                            </th>
                        );
                    })}
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedStudents.map(student => (
                    <tr key={student.StudentID} className="group">
                        {visibleColumns.map((col, index) => {
                             const isLocked = col.locked;
                             const lockedIndex = lockedColumns.findIndex(c => c.key === col.key);
                             const style: React.CSSProperties = {};
 
                             if (isLocked) {
                                 style.position = 'sticky';
                                 style.left = lockedColumnOffsets[lockedIndex] || 0;
                                 style.zIndex = 10;
                             }
                             
                            return (
                            <td
                                key={col.key}
                                className={`px-4 py-4 whitespace-nowrap text-sm text-gray-600 ${isLocked ? 'shadow-[inset_-1px_0_0_0_#e5e7eb]' : ''} ${isLocked ? 'bg-white group-hover:bg-gray-50' : 'group-hover:bg-gray-50'}`}
                                style={style}
                            >
                                {col.key === 'Given Name' ? (
                                    <a href="#" onClick={(e) => { e.preventDefault(); handleSelectStudent(student); }}
                                       className="font-semibold text-indigo-600 hover:underline">
                                        {student[col.key] || 'N/A'}
                                    </a>
                                ) : col.key === 'School' ? (
                                    <a href="#" onClick={(e) => { e.preventDefault(); handleSelectSchool(); }}
                                       className="font-semibold text-blue-600 hover:underline">
                                        {student.School.name}{student.School.campus && ` (${student.School.campus})`}
                                    </a>
                                ) : col.key === 'MonthlyCosts' ? (
                                    `$${(student.financials || []).reduce((total, item) => {
                                        return total + calculateMonthlyEquivalent(String(item.amount), item.frequency);
                                    }, 0).toFixed(2)} / Monthly Eq.`
                                ) : col.key === 'academicStatus' ? (
                                    (() => {
                                        const status = student.academicStatus || 'Active';
                                        const statusColors: { [key in AcademicStatus]: string } = {
                                            'Active': 'bg-green-100 text-green-800',
                                            'On Hold': 'bg-yellow-100 text-yellow-800',
                                            'Pursuing Skills': 'bg-blue-100 text-blue-800',
                                            'Working': 'bg-purple-100 text-purple-800',
                                        };
                                        return (
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[status]}`}>
                                                {status}
                                            </span>
                                        );
                                    })()
                                ) : col.key === 'Actions' ? (
                                    <button
                                        onClick={() => openModal('add-grades', student)}
                                        className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-100"
                                        title="Add Grades"
                                    >
                                        <PlusCircle size={20} />
                                    </button>
                                ) : (
                                    String(student[col.key as keyof Student] || 'N/A')
                                )}
                            </td>
                        )})}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const StudentListPage: React.FC = () => {
    const { totals, openModal, handleImportStudents, filters, setFilters } = useAppContext();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    handleImportStudents(event.target.result as ArrayBuffer);
                }
            };
            reader.readAsArrayBuffer(file);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col h-full">
            <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleFileChange} />
            <header className="bg-white shadow-md rounded-lg p-6 mb-6 flex-shrink-0">
                <div className="flex flex-col md:flex-row justify-between md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Student Information</h1>
                        <p className="text-gray-600 mt-1">Search, filter, and manage student records.</p>
                    </div>
                    <div className="flex gap-6 text-right mt-4 md:mt-0">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Students</h3>
                            <p className="text-2xl font-bold text-indigo-600 mt-1">{totals.count}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Monthly Costs</h3>
                            <p className="text-2xl font-bold text-indigo-600 mt-1">${totals.costs.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-4 flex-wrap">
                        <CategoryFilters />
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                className="pl-10 pr-4 py-2 border rounded-md shadow-sm w-full sm:w-64 bg-white"
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={() => fileInputRef.current?.click()} className="bg-green-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-green-700 flex items-center gap-2"><Upload size={16} /> Import from Excel</button>
                        <button onClick={() => openModal('filter')} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md shadow-sm hover:bg-gray-300 flex items-center gap-2"><Filter size={16} /> Advanced Filters</button>
                    </div>
                </div>
            </header>
            <main className="flex-grow bg-white shadow-md rounded-lg overflow-x-auto">
                <StudentTable />
            </main>
        </div>
    );
};

export default StudentListPage;
