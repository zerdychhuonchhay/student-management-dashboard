import React, { useRef } from 'react';
import { Users, Archive, Settings, BookCopy, FileText, BarChart2, Building, UserCheck, Calendar, ClipboardList } from 'lucide-react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { useAppContext } from '../../context/AppContext';

interface SidebarProps {
    isOpen: boolean;
    setOpen: (isOpen: boolean) => void;
    menuRef: React.RefObject<HTMLButtonElement>;
    onMouseLeave: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setOpen, menuRef, onMouseLeave }) => {
    const sidebarRef = useRef<HTMLElement>(null);
    const { activeTab, setActiveTab, openModal, pendingStudents } = useAppContext();
    useOnClickOutside(sidebarRef, () => setOpen(false), menuRef);

    const handleOpenSettings = () => {
        openModal('settings');
        if (window.innerWidth < 1024) setOpen(false);
    }

    const Tab = ({ id, icon, children, badgeCount }: { id: string, icon: React.ReactNode, children: React.ReactNode, badgeCount?: number }) => (
        <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab(id); if (window.innerWidth < 1024) setOpen(false); }}
           className={`w-full text-left font-semibold flex items-center gap-3 transition hover:bg-gray-50 p-2 rounded-md ${activeTab === id ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700'}`}>
            {icon} 
            <span>{children}</span>
            {badgeCount > 0 && (
                <span className="ml-auto bg-yellow-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{badgeCount}</span>
            )}
        </a>
    );

    return (
        <aside 
            ref={sidebarRef} 
            className={`bg-white w-64 h-screen shadow-lg p-4 flex flex-col flex-shrink-0 fixed z-40 transform transition-transform duration-300 ease-in-out no-print ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            onMouseLeave={onMouseLeave}
        >
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); if (window.innerWidth < 1024) setOpen(false); }} className="text-2xl font-bold text-gray-800 px-2 mb-2 block">Dashboard</a>
            <nav className="mt-4 space-y-1">
                <Tab id="dashboard" icon={<BarChart2 className="w-5 h-5" />}>Dashboard</Tab>
                <Tab id="pending-list" icon={<ClipboardList className="w-5 h-5" />} badgeCount={pendingStudents.length}>Pending List</Tab>
                <Tab id="student-list" icon={<Users className="w-5 h-5" />}>Student List</Tab>
                <Tab id="events" icon={<Calendar className="w-5 h-5" />}>Events</Tab>
                <Tab id="school-center" icon={<Building className="w-5 h-5" />}>School Center</Tab>
                <Tab id="parents-list" icon={<UserCheck className="w-5 h-5" />}>Parents & Guardians</Tab>
                <Tab id="curriculum" icon={<BookCopy className="w-5 h-5" />}>Curriculum</Tab>
                <Tab id="archive" icon={<Archive className="w-5 h-5" />}>Archive</Tab>
            </nav>
            <div className="mt-auto space-y-1">
                <Tab id="manual-instructions" icon={<FileText className="w-5 h-5" />}>Manual</Tab>
                 <a href="#" onClick={(e) => { e.preventDefault(); handleOpenSettings(); }}
                   className={`w-full text-left font-semibold flex items-center gap-3 transition hover:bg-gray-50 p-2 rounded-md text-gray-700`}>
                    <Settings className="w-5 h-5" /> <span>Settings</span>
                </a>
            </div>
        </aside>
    );
};

export default Sidebar;