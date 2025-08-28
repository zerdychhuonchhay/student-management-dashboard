import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';

import Sidebar from './layout/Sidebar';
import TopBar from './layout/TopBar';
import ModalManager from './modals/ModalManager';

import HomePage from '../pages/HomePage';
import StudentListPage from '../pages/StudentListPage';
import StudentProfilePage from '../pages/StudentProfilePage';
import ArchivedProfilePage from '../pages/ArchivedProfilePage';
import GradesPage from '../pages/GradesPage';
import SchoolCenterPage from '../pages/SchoolCenterPage';
import CurriculumPage from '../pages/CurriculumPage';
import ArchivePage from '../pages/ArchivePage';
import ManualInstructionsPage from '../pages/ManualInstructionsPage';
import ParentsListPage from '../pages/ParentsListPage';
import EventsPage from '../pages/EventsPage';
import PendingListPage from '../pages/PendingListPage';

const AppContent: React.FC = () => {
    const { activeTab } = useAppContext();
    const [isSidebarPinned, setIsSidebarPinned] = useState(window.innerWidth >= 1024);
    const [isSidebarHovered, setIsSidebarHovered] = useState(false);
    const menuBtnRef = useRef<HTMLButtonElement>(null);

    const isSidebarVisible = isSidebarPinned || isSidebarHovered;

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'dashboard': return <HomePage />;
            case 'pending-list': return <PendingListPage />;
            case 'student-list': return <StudentListPage />;
            case 'events': return <EventsPage />;
            case 'profile': return <StudentProfilePage />;
            case 'archived-profile': return <ArchivedProfilePage />;
            case 'grades': return <GradesPage />;
            case 'school-center': return <SchoolCenterPage />;
            case 'curriculum': return <CurriculumPage />;
            case 'archive': return <ArchivePage />;
            case 'manual-instructions': return <ManualInstructionsPage />;
            case 'parents-list': return <ParentsListPage />;
            default: return <HomePage />;
        }
    };

    return (
        <div className="app-container bg-gray-100 text-gray-800 h-screen overflow-hidden flex font-sans">
            {!isSidebarPinned && (
                 <div
                    className="fixed top-0 left-0 h-full w-4 z-30"
                    onMouseEnter={() => setIsSidebarHovered(true)}
                />
            )}

            <Sidebar
                isOpen={isSidebarVisible}
                setOpen={setIsSidebarPinned}
                menuRef={menuBtnRef}
                onMouseLeave={() => {
                    if (!isSidebarPinned) {
                        setIsSidebarHovered(false);
                    }
                }}
            />
            
            <div className={`main-content-wrapper flex-grow flex flex-col h-screen min-w-0 transition-all duration-300 ${isSidebarVisible && window.innerWidth >= 1024 ? 'lg:ml-64' : ''}`}>
                <TopBar onMenuClick={() => setIsSidebarPinned(!isSidebarPinned)} menuBtnRef={menuBtnRef} />
                <div className="flex-grow min-h-0">
                    {renderActiveTab()}
                </div>
            </div>
            <ModalManager />
        </div>
    );
}

export default AppContent;