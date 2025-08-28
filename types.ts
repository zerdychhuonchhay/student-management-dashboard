import React from 'react';

export interface FinancialRecord {
    category: string;
    item: string;
    amount: string;
    frequency: 'One-time' | 'Monthly' | 'Quarterly' | 'Semester' | 'Yearly';
    date: string;
}

export interface Guardian {
    name: string;
    relationship: string;
    contact: string;
    job: string;
    income: number;
}

export interface EducationRecord {
    school: string;
    grade: string; // e.g., "Grade 11", "Year 1"
    startDate: string;
    endDate: string;
}

export interface Attachment {
    name: string;
    size: number;
    type: string;
    data: string; // base64 encoded data URL
}

export type AcademicStatus = 'Active' | 'On Hold' | 'Pursuing Skills' | 'Working';

export interface Student {
    StudentID: string;
    'Given Name': string;
    'Family Name': string;
    Sex: 'M' | 'F';
    DOB: string;
    Grade: string;
    School: {
        name: string;
        campus: string;
    };
    financials?: FinancialRecord[];
    guardians?: Guardian[];
    educationHistory?: EducationRecord[];
    Major?: string;
    Comments?: string;
    EnrollmentDate?: string;
    Location?: string;
    photoUrl?: string;
    siblings?: string[]; // Array of StudentIDs
    attachments?: Attachment[];
    academicStatus?: AcademicStatus;
    Age?: number | 'N/A';
    DateLeft?: string;
    ReasonLeft?: string;
    eligibility?: {
        status: string; // e.g., 'Pending', 'Eligible', 'Ineligible', 'Error'
        reason: string;
    };
}

export interface Grade {
    StudentID: string;
    Date: string;
    Subject: string;
    Score: number;
}

export interface Curriculum {
    [schoolName: string]: {
        [campus: string]: {
            [gradeOrMajor: string]: string[] | {
                [year: string]: {
                    [semester: string]: string[];
                };
            };
        };
    };
}

export interface Wellbeing {
    rating: 'Good' | 'Average' | 'Poor' | 'No' | 'Yes';
    details: string;
}

export interface FollowUp {
    date: string;
    physicalHealth: Wellbeing;
    socialInteraction: Wellbeing;
    homeLife: Wellbeing;
    drugsAlcoholViolence: Wellbeing;
    riskFactors: string[];
    riskFactorsDetails: string;

    learningDifficulties: Wellbeing;
    behaviourInClass: Wellbeing;
    peerIssues: Wellbeing;
    teacherInvolvement: Wellbeing;
    transportation: Wellbeing;
    tutoringParticipation: Wellbeing;
    notes: string;
    recommendations: string;
    childProtectionConcerns: 'No' | 'Yes';
    humanTraffickingRisk: 'No' | 'Yes';
}

export interface FollowUps {
    [studentId: string]: FollowUp[];
}

export interface Event {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    type: 'Holiday' | 'School Event' | 'Staff Meeting' | 'Other';
    description?: string;
}

export interface Column {
    key: string;
    label: string;
}

export interface ColumnConfig extends Column {
    visible: boolean;
    locked: boolean;
}

export interface Filters {
    search: string;
    grade: string;
    school: string;
    sex: string;
    age: string;
    status: string;
    academicStatus: string;
}

export interface Sort {
    column: string;
    direction: 'asc' | 'desc';
}

export interface ParentProfile {
    photoUrl?: string;
}

export interface ParentProfiles {
    [parentName: string]: ParentProfile;
}

export interface UpdatedStudentInfo {
    studentId: string;
    name: string;
    changes: {
        field: string;
        oldValue: any;
        newValue: any;
    }[];
    updateData: Partial<Student>;
}

export interface PotentialDuplicateInfo {
    newStudent: Student;
    existingStudent: Student;
    similarity: number;
}

export interface DuplicateResolution {
    [newStudentId: string]: 'merge' | 'create';
}

export interface ResolvedUpdates {
    [studentId: string]: Partial<Student>;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export type ColumnMapping = {
    [appField: string]: string | null;
};

export interface GuardianToEdit {
    guardian: Guardian;
    children: Student[];
}

export interface AtRiskStudent {
    student: Student;
    reasons: string[];
}

export interface FollowUpToEdit {
    followUp: FollowUp;
    index: number;
}

export interface User {
    id: string;
    email: string;
    password?: string;
    role: 'Admin' | 'Teacher';
}

export interface AppContextType {
    currentUser: User | null;
    students: Student[];
    archivedStudents: Student[];
    pendingStudents: Student[];
    grades: Grade[];
    curriculum: Curriculum;
    followUps: FollowUps;
    parentProfiles: ParentProfiles;
    events: Event[];
    eventToEdit: Event | null;
    columnConfig: ColumnConfig[];
    archiveColumnConfig: ColumnConfig[];
    activeTab: string;
    previousTab: string;
    selectedStudent: Student | null;
    modal: string | null;
    reviewData: Student | null;
    studentToDelete: Student | null;
    studentToReject: Student | null;
    postSelectionAction: string | null;
    followUpToEdit: FollowUpToEdit | null;
    pendingNewStudents: Student[];
    pendingUpdatedStudents: UpdatedStudentInfo[];
    pendingPotentialDuplicates: PotentialDuplicateInfo[];
    pendingSiblingConfirmation: { student1: Student; student2: Student } | null;
    importErrors: string[];
    fileHeaders: string[];
    importFileData: ArrayBuffer | null;
    guardianToEdit: GuardianToEdit | null;
    filters: Filters;
    category: string;
    sort: Sort;
    archiveSort: Sort;
    studentsWithAge: Student[];
    schoolAverages: { [key: string]: number };
    filteredAndSortedStudents: Student[];
    sortedArchivedStudents: Student[];
    studentGrades: Grade[];
    atRiskStudents: AtRiskStudent[];
    totals: { count: number; costs: number };
    aiChatHistory: ChatMessage[];
    isAiLoading: boolean;
    // FIX: Add state properties for AI summary feature
    isAiSummaryLoading: boolean;
    aiSummary: string;
    studentHistory: Student[];
    eligibilityPrompt: string;
    setEligibilityPrompt: React.Dispatch<React.SetStateAction<string>>;
    handleResetEligibilityPrompt: () => void;
    handleLogin: (email: string, password: string) => boolean;
    handleLogout: () => void;
    setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
    setArchivedStudents: React.Dispatch<React.SetStateAction<Student[]>>;
    setPendingStudents: React.Dispatch<React.SetStateAction<Student[]>>;
    setGrades: React.Dispatch<React.SetStateAction<Grade[]>>;
    setCurriculum: React.Dispatch<React.SetStateAction<Curriculum>>;
    setFollowUps: React.Dispatch<React.SetStateAction<FollowUps>>;
    setParentProfiles: React.Dispatch<React.SetStateAction<ParentProfiles>>;
    setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
    setEventToEdit: React.Dispatch<React.SetStateAction<Event | null>>;
    setColumnConfig: React.Dispatch<React.SetStateAction<ColumnConfig[]>>;
    setArchiveColumnConfig: React.Dispatch<React.SetStateAction<ColumnConfig[]>>;
    setActiveTab: React.Dispatch<React.SetStateAction<string>>;
    setPreviousTab: React.Dispatch<React.SetStateAction<string>>;
    setSelectedStudent: React.Dispatch<React.SetStateAction<Student | null>>;
    setModal: React.Dispatch<React.SetStateAction<string | null>>;
    setReviewData: React.Dispatch<React.SetStateAction<Student | null>>;
    setStudentToDelete: React.Dispatch<React.SetStateAction<Student | null>>;
    setStudentToReject: React.Dispatch<React.SetStateAction<Student | null>>;
    setPostSelectionAction: React.Dispatch<React.SetStateAction<string | null>>;
    setFollowUpToEdit: React.Dispatch<React.SetStateAction<FollowUpToEdit | null>>;
    setPendingNewStudents: React.Dispatch<React.SetStateAction<Student[]>>;
    setPendingUpdatedStudents: React.Dispatch<React.SetStateAction<UpdatedStudentInfo[]>>;
    setPendingPotentialDuplicates: React.Dispatch<React.SetStateAction<PotentialDuplicateInfo[]>>;
    setPendingSiblingConfirmation: React.Dispatch<React.SetStateAction<{ student1: Student; student2: Student; } | null>>;
    setImportErrors: React.Dispatch<React.SetStateAction<string[]>>;
    setFileHeaders: React.Dispatch<React.SetStateAction<string[]>>;
    setImportFileData: React.Dispatch<React.SetStateAction<ArrayBuffer | null>>;
    setGuardianToEdit: React.Dispatch<React.SetStateAction<GuardianToEdit | null>>;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
    setCategory: React.Dispatch<React.SetStateAction<string>>;
    setSort: React.Dispatch<React.SetStateAction<Sort>>;
    setArchiveSort: React.Dispatch<React.SetStateAction<Sort>>;
    setStudentHistory: React.Dispatch<React.SetStateAction<Student[]>>;
    handleSort: (columnKey: string) => void;
    handleArchiveSort: (columnKey: string) => void;
    handleSelectSchool: () => void;
    handleSelectStudent: (student: Student) => void;
    handleReviewStudent: (formData: Student) => void;
    handleSaveStudent: () => void;
    handleApproveStudent: (studentId: string) => void;
    handleRejectStudent: () => void;
    handleImportStudents: (data: ArrayBuffer) => void;
    handleProcessMappedImport: (mapping: ColumnMapping) => void;
    handleConfirmImport: (resolutions: DuplicateResolution, resolvedUpdates: ResolvedUpdates, selectedNewStudentIds: Set<string>) => void;
    handleUpdateStudentPhoto: (studentId: string, photoUrl: string) => void;
    handleUpdateParentPhoto: (parentName: string, photoUrl: string) => void;
    handleArchiveStudent: (reason: string, date: string) => void;
    handleUpdateArchivedStudent: (studentId: string, updates: { DateLeft: string; ReasonLeft: string }) => void;
    handleRestoreStudent: (studentToRestore: Student) => void;
    handlePermanentDelete: () => void;
    handleResetData: () => void;
    openModal: (modalType: string, data?: Student | Event | null) => void;
    handleAddGrades: (newGrades: Grade[]) => void;
    handleAddFollowUp: (studentId: string, followUpData: FollowUp) => void;
    handleUpdateFollowUp: (studentId: string, index: number, updatedFollowUp: FollowUp) => void;
    handleDeleteFollowUp: (studentId: string, index: number) => void;
    handleOpenEditFollowUpModal: (student: Student, followUp: FollowUp, index: number) => void;
    handleAddEvent: (eventData: Omit<Event, 'id'>) => void;
    handleUpdateEvent: (eventData: Event) => void;
    handleDeleteEvent: (eventId: string) => void;
    handleAddMenuSelect: (type: string) => void;
    handleStudentSelectionForAction: (student: Student) => void;
    handleAiQuery: (query: string) => Promise<void>;
    // FIX: Add handler for AI summary feature
    handleGenerateAiSummary: (student: Student) => Promise<void>;
    handleBack: () => void;
    handleConfirmSibling: (studentId1: string, studentId2: string) => void;
    handleResolveSiblingGuardians: (studentIdToCopyFrom: string | null) => void;
    handleManageAttachments: (studentId: string, action: 'add' | 'delete', fileOrIndex: File | number) => void;
    handleUpdateGuardianInfo: (updatedGuardian: Guardian) => void;
    handleRefreshData: () => void;
}