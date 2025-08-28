import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Loader, Copy, Check } from 'lucide-react';

import StudentFormModal from './StudentFormModal';
import ReviewModal from './ReviewModal';
import FilterModal from './FilterModal';
import SettingsModal from './SettingsModal';
import ArchiveReasonModal from './ArchiveReasonModal';
import ConfirmationModal from './ConfirmationModal';
import AddGradesModal from './AddGradesModal';
import FollowUpFormModal from './FollowUpFormModal';
import SelectStudentModal from './SelectStudentModal';
import ReviewImportModal from './ReviewImportModal';
import AiAssistantModal from './AiAssistantModal';
import EditArchivedInfoModal from './EditArchivedInfoModal';
import ResolveGuardiansModal from './ResolveGuardiansModal';
import AddEventModal from './AddEventModal';
import ImportErrorsModal from './ImportErrorsModal';
import ColumnMappingModal from './ColumnMappingModal';
import EditGuardianModal from './EditGuardianModal';
import Modal from './Modal';

// FIX: Define and implement AiSummaryModal component
const AiSummaryModal: React.FC = () => {
    const { setModal, aiSummary, isAiSummaryLoading } = useAppContext();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (aiSummary) {
            navigator.clipboard.writeText(aiSummary);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Modal title="AI-Generated Summary" onClose={() => setModal(null)} maxWidth="max-w-xl">
            {isAiSummaryLoading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader className="w-8 h-8 animate-spin text-indigo-600" />
                    <span className="ml-3 text-gray-700">Generating summary...</span>
                </div>
            ) : (
                <div>
                    <div className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-4 rounded-md min-h-[12rem]">
                        {aiSummary}
                    </div>
                    <div className="mt-6 flex justify-end gap-4">
                        <button
                            onClick={handleCopy}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 flex items-center gap-2 transition-colors"
                        >
                            {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                            {copied ? 'Copied!' : 'Copy to Clipboard'}
                        </button>
                        <button type="button" onClick={() => setModal(null)} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Close</button>
                    </div>
                </div>
            )}
        </Modal>
    );
};


const ModalManager: React.FC = () => {
    const {
        modal, setModal, selectedStudent, reviewData, handleSaveStudent, filters, setFilters, studentsWithAge,
        columnConfig, setColumnConfig, handleResetData, handleArchiveStudent, studentToDelete, handlePermanentDelete,
        curriculum, handleAddGrades, handleAddFollowUp, handleUpdateFollowUp, handleStudentSelectionForAction,
        postSelectionAction, pendingNewStudents, pendingUpdatedStudents, pendingPotentialDuplicates, handleConfirmImport,
        handleReviewStudent, handleUpdateArchivedStudent, pendingSiblingConfirmation,
        eventToEdit, handleAddEvent, handleUpdateEvent, guardianToEdit,
        followUpToEdit, setFollowUpToEdit,
        studentToReject, handleRejectStudent, setStudentToReject
    } = useAppContext();

    if (!modal) return null;

    switch (modal) {
        case 'add':
            return <StudentFormModal onReview={handleReviewStudent} onClose={() => setModal(null)} />;
        case 'edit':
            return selectedStudent && <StudentFormModal student={selectedStudent} onReview={handleReviewStudent} onClose={() => setModal(null)} onArchive={() => setModal('archive-reason')} />;
        case 'review':
            return reviewData && <ReviewModal data={reviewData} onConfirm={handleSaveStudent} onEdit={() => setModal(reviewData.StudentID ? 'edit' : 'add')} onClose={() => setModal(null)} />;
        case 'filter':
            return <FilterModal currentFilters={filters} onApply={setFilters} onClose={() => setModal(null)} allStudents={studentsWithAge} />;
        case 'settings':
            return <SettingsModal columnConfig={columnConfig} setColumnConfig={setColumnConfig} onReset={handleResetData} onClose={() => setModal(null)} />;
        case 'archive-reason':
            return <ArchiveReasonModal onConfirm={(reason, date) => handleArchiveStudent(reason, date)} onClose={() => setModal(null)} />;
        case 'edit-archived-info':
            return selectedStudent && <EditArchivedInfoModal student={selectedStudent} onSave={handleUpdateArchivedStudent} onClose={() => setModal(null)} />;
        case 'delete':
            return studentToDelete && <ConfirmationModal title="Confirm Permanent Deletion" message={`Are you sure you want to permanently delete ${studentToDelete['Given Name']}? This action cannot be undone.`} onConfirm={handlePermanentDelete} onClose={() => setModal(null)} />;
        case 'reject-pending':
            return studentToReject && <ConfirmationModal title="Confirm Rejection" message={`Are you sure you want to reject the application for ${studentToReject['Given Name']}? This cannot be undone.`} onConfirm={handleRejectStudent} onClose={() => { setModal(null); setStudentToReject(null); }} />;
        case 'add-grades':
            return selectedStudent && <AddGradesModal student={selectedStudent} curriculum={curriculum} onAddGrades={handleAddGrades} onClose={() => setModal(null)} />;
        case 'add-follow-up':
            return selectedStudent && <FollowUpFormModal student={selectedStudent} onSave={handleAddFollowUp} onClose={() => setModal(null)} />;
        case 'edit-follow-up': {
            if (selectedStudent && followUpToEdit) {
                return (
                    <FollowUpFormModal
                        student={selectedStudent}
                        followUp={followUpToEdit.followUp}
                        onSave={(studentId, data) => handleUpdateFollowUp(studentId, followUpToEdit.index, data)}
                        onClose={() => {
                            setModal(null);
                            setFollowUpToEdit(null);
                        }}
                    />
                );
            }
            return null;
        }
        case 'select-student':
            return <SelectStudentModal students={studentsWithAge} onSelect={handleStudentSelectionForAction} onClose={() => setModal(null)} actionType={postSelectionAction === 'add-grades' ? 'Adding Grades' : 'Adding Follow-up'} />;
        case 'review-import':
            return <ReviewImportModal newStudents={pendingNewStudents} updatedStudents={pendingUpdatedStudents} potentialDuplicates={pendingPotentialDuplicates} onConfirm={handleConfirmImport} onClose={() => setModal(null)} />;
        case 'import-errors':
            return <ImportErrorsModal />;
        case 'column-mapping':
            return <ColumnMappingModal />;
        case 'ai-assistant':
            return <AiAssistantModal onClose={() => setModal(null)} />;
        case 'resolve-guardians':
            return pendingSiblingConfirmation && <ResolveGuardiansModal onClose={() => setModal(null)} />;
        case 'add-event':
            return <AddEventModal onSave={handleAddEvent} onClose={() => setModal(null)} />;
        case 'edit-event':
            return eventToEdit && <AddEventModal eventToEdit={eventToEdit} onSave={handleUpdateEvent} onClose={() => setModal(null)} />;
        case 'edit-guardian':
            return guardianToEdit && <EditGuardianModal />;
        // FIX: Add case for AI summary modal
        case 'ai-summary':
            return <AiSummaryModal />;
        default:
            return null;
    }
};

export default ModalManager;