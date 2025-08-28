import React, { useState, useRef } from 'react';
import { Menu, PlusCircle, Sparkles, RefreshCw, User, LogOut } from 'lucide-react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { useAppContext } from '../../context/AppContext';

interface TopBarProps {
    onMenuClick: () => void;
    menuBtnRef: React.RefObject<HTMLButtonElement>;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick, menuBtnRef }) => {
    const [isAddMenuOpen, setAddMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const addMenuRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const { handleAddMenuSelect, setModal, handleRefreshData, currentUser, handleLogout } = useAppContext();
    useOnClickOutside(addMenuRef, () => setAddMenuOpen(false));
    useOnClickOutside(userMenuRef, () => setIsUserMenuOpen(false));

    return (
        <div className="p-4 bg-white shadow-md flex justify-between items-center flex-shrink-0 no-print">
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} ref={menuBtnRef} className="p-2 rounded-md hover:bg-gray-100">
                    <Menu />
                </button>
            </div>

            <div className="flex items-center gap-2">
                 <button
                    onClick={handleRefreshData}
                    className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
                    title="Refresh Data"
                >
                    <RefreshCw size={18} />
                </button>
                 <button 
                    onClick={() => setModal('ai-assistant')} 
                    className="bg-purple-100 text-purple-700 px-4 py-2 rounded-md shadow-sm hover:bg-purple-200 flex items-center gap-2"
                    title="AI Assistant"
                >
                    <Sparkles size={16} />
                    <span className="hidden sm:inline">AI Assistant</span>
                </button>

                <div className="relative" ref={addMenuRef}>
                    <button onClick={() => setAddMenuOpen(!isAddMenuOpen)} className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-700 flex items-center gap-2">
                        <PlusCircle size={16} /> Add New
                    </button>
                    {isAddMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                            <a href="#" onClick={(e) => { e.preventDefault(); handleAddMenuSelect('student'); setAddMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Add Student</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleAddMenuSelect('grades'); setAddMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Add Grades</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleAddMenuSelect('follow-up'); setAddMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Add Follow-up</a>
                        </div>
                    )}
                </div>

                <div className="relative" ref={userMenuRef}>
                    <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300">
                        <User size={20} />
                    </button>
                    {isUserMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50 p-2">
                            <div className="px-2 py-2 border-b">
                                <p className="text-sm text-gray-500">Signed in as</p>
                                <p className="text-sm font-medium text-gray-800 truncate">{currentUser?.email}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left mt-1 px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center gap-2"
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopBar;