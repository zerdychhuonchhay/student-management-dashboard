import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import * as XLSX from 'https://cdn.sheetjs.com/xlsx-latest/package/xlsx.mjs';
import { GoogleGenAI, Type } from '@google/genai';
import { useStickyState } from '../hooks/useStickyState';
import { initialStudents } from '../data/students';
import { initialGrades } from '../data/grades';
import { initialCurriculum } from '../data/curriculum';
import { initialFollowUps } from '../data/followUps';
import { initialParentProfiles } from '../data/parentProfiles';
import { initialEvents } from '../data/events';
import { initialUsers } from '../data/users';
import { ALL_COLUMNS, ALL_ARCHIVED_COLUMNS, generateDefaultColumnConfig } from '../constants';
import { calculateMonthlyEquivalent, getCategoryForStudent, mapExcelRowToStudent, calculateStringSimilarity, areGuardiansEffectivelyTheSame, normalizeSearchableName } from '../utils/helpers';
import type { User, Student, Grade, FollowUp, FollowUps, Curriculum, Sort, Filters, ParentProfiles, UpdatedStudentInfo, PotentialDuplicateInfo, DuplicateResolution, AppContextType, ChatMessage, ResolvedUpdates, Attachment, ColumnConfig, Event, ColumnMapping, GuardianToEdit, Guardian, AtRiskStudent, FollowUpToEdit } from '../types';

const SIMILARITY_THRESHOLD = 0.8;

const DEFAULT_ELIGIBILITY_PROMPT = "You are an admissions officer for a non-profit organization that provides educational scholarships. Your task is to evaluate a student's application based on their financial and family situation to determine if they are eligible for aid. Focus on signs of financial hardship like low guardian income (e.g., under $300/month), unstable jobs (e.g., vendor, cleaner, construction), or high educational costs relative to income. Provide your assessment in JSON format.";

const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === null) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
};


export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // ===================================================================================
    // --- AUTH STATE ---
    // ===================================================================================
    const [currentUser, setCurrentUser] = useStickyState<User | null>(null, 'currentUser');
    const [users, setUsers] = useState<User[]>([]);

    // ===================================================================================
    // --- CORE STATE ---
    // ===================================================================================
    const [students, setStudents] = useStickyState<Student[]>([], 'studentDashboardData');
    const [pendingStudents, setPendingStudents] = useStickyState<Student[]>([], 'pendingStudentsData');
    const [archivedStudents, setArchivedStudents] = useStickyState<Student[]>([], 'archivedStudentData');
    const [grades, setGrades] = useStickyState<Grade[]>([], 'studentGradesData');
    const [curriculum, setCurriculum] = useStickyState<Curriculum>({}, 'studentCurriculumData');
    const [followUps, setFollowUps] = useStickyState<FollowUps>({}, 'studentFollowUpsData');
    const [parentProfiles, setParentProfiles] = useStickyState<ParentProfiles>({}, 'parentProfilesData');
    const [events, setEvents] = useStickyState<Event[]>([], 'calendarEventsData');

    // Simulate initial data loading from an API
    useEffect(() => {
        // In a real app, this would be an API call, e.g., axios.get('/api/data')
        // For now, we load from the initial data files. This prepares the app
        // for the async nature of real data fetching in Milestone 2.
        setStudents(initialStudents);
        setGrades(initialGrades);
        setCurriculum(initialCurriculum);
        setFollowUps(initialFollowUps);
        setParentProfiles(initialParentProfiles);
        setEvents(initialEvents);
        setUsers(initialUsers);
    }, []);

    // ===================================================================================
    // --- UI & FILTERING STATE ---
    // ===================================================================================
    const [columnConfig, setColumnConfig] = useStickyState<ColumnConfig[]>(generateDefaultColumnConfig(ALL_COLUMNS), 'studentColumnConfig');
    const [archiveColumnConfig, setArchiveColumnConfig] = useStickyState<ColumnConfig[]>(generateDefaultColumnConfig(ALL_ARCHIVED_COLUMNS), 'archiveColumnConfig');

    const [activeTab, setActiveTab] = useStickyState<string>('dashboard', 'activeTab');
    const [previousTab, setPreviousTab] = useStickyState<string>('dashboard', 'previousTab');
    const [selectedStudent, setSelectedStudent] = useStickyState<Student | null>(null, 'selectedStudent');
    const [modal, setModal] = useState<string | null>(null);
    const [reviewData, setReviewData] = useState<Student | null>(null);
    const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
    const [studentToReject, setStudentToReject] = useState<Student | null>(null);
    const [postSelectionAction, setPostSelectionAction] = useState<string | null>(null);
    const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
    const [guardianToEdit, setGuardianToEdit] = useState<GuardianToEdit | null>(null);
    const [followUpToEdit, setFollowUpToEdit] = useState<FollowUpToEdit | null>(null);

    // Import-specific state
    const [pendingNewStudents, setPendingNewStudents] = useState<Student[]>([]);
    const [pendingUpdatedStudents, setPendingUpdatedStudents] = useState<UpdatedStudentInfo[]>([]);
    const [pendingPotentialDuplicates, setPendingPotentialDuplicates] = useState<PotentialDuplicateInfo[]>([]);
    const [pendingSiblingConfirmation, setPendingSiblingConfirmation] = useState<{ student1: Student, student2: Student } | null>(null);
    const [importErrors, setImportErrors] = useState<string[]>([]);
    const [fileHeaders, setFileHeaders] = useState<string[]>([]);
    const [importFileData, setImportFileData] = useState<ArrayBuffer | null>(null);

    // Navigation state
    const [studentHistory, setStudentHistory] = useStickyState<Student[]>([], 'studentProfileHistory');

    // Filtering & Sorting
    const [filters, setFilters] = useState<Filters>({ search: '', grade: '', school: '', sex: '', age: '', status: '', academicStatus: '' });
    const [category, setCategory] = useState<string>('all');
    const [sort, setSort] = useState<Sort>({ column: 'Given Name', direction: 'asc' });
    const [archiveSort, setArchiveSort] = useState<Sort>({ column: 'Given Name', direction: 'asc' });
    
    // AI state
    const [aiChatHistory, setAiChatHistory] = useState<ChatMessage[]>([]);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [eligibilityPrompt, setEligibilityPrompt] = useStickyState<string>(DEFAULT_ELIGIBILITY_PROMPT, 'eligibilityPrompt');
    // FIX: Add state for AI summary feature
    const [aiSummary, setAiSummary] = useState<string>('');
    const [isAiSummaryLoading, setIsAiSummaryLoading] = useState(false);

    
    // ===================================================================================
    // --- MEMOIZED DERIVED DATA ---
    // ===================================================================================

    const studentsWithAge = useMemo<Student[]>(() => {
        return students.map((s): Student => {
            if (s.DOB) {
                const birthDate = new Date(s.DOB);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                return { ...s, Age: age };
            }
            return { ...s, Age: 'N/A' };
        });
    }, [students]);

    const schoolAverages = useMemo(() => {
        const averages: { [key: string]: { total: number; count: number } } = {};
        grades.forEach(grade => {
            const student = students.find(s => s.StudentID === grade.StudentID);
            if (student) {
                const key = `${student.School.name}-${student.Grade}-${grade.Subject}`;
                if (!averages[key]) {
                    averages[key] = { total: 0, count: 0 };
                }
                averages[key].total += grade.Score;
                averages[key].count++;
            }
        });
        return Object.entries(averages).reduce((acc, [key, { total, count }]) => {
            acc[key] = total / count;
            return acc;
        }, {} as { [key: string]: number });
    }, [grades, students]);

    const getGradeSortValue = (gradeStr: string): number => {
        const grade = String(gradeStr).toLowerCase();
        if (grade.includes('university')) return 100;
        if (grade.includes('year')) {
            const year = parseInt(grade.replace(/\D/g, ''), 10);
            return isNaN(year) ? 100 : 13 + year; // Year 1 -> 14, etc.
        }
        const num = parseInt(grade, 10);
        return isNaN(num) ? 0 : num;
    };

    const filteredAndSortedStudents = useMemo(() => {
        return studentsWithAge
            .filter(student => {
                const studentCategory = getCategoryForStudent(student);
                if (category !== 'all' && category !== studentCategory) return false;

                if (filters.search) {
                    const searchLower = filters.search.toLowerCase();
                    const searchTerms = searchLower.split(/\s+/).filter(Boolean); // Split by space and remove empty strings
        
                    const searchableString = [
                        student.StudentID,
                        student['Given Name'],
                        student['Family Name'],
                        student.School.name
                    ].join(' ').toLowerCase();
                    
                    if (!searchTerms.every(term => searchableString.includes(term))) {
                        return false;
                    }
                }

                if (filters.grade && student.Grade !== filters.grade) return false;
                if (filters.school && student.School.name !== filters.school) return false;
                if (filters.sex && student.Sex !== filters.sex) return false;
                if (filters.age && String(student.Age) !== filters.age) return false;
                if (filters.academicStatus && student.academicStatus !== filters.academicStatus) return false;

                if (filters.status) {
                     const isComplete = student.DOB && student.EnrollmentDate && student.guardians && student.guardians.length > 0;
                     if(filters.status === 'complete' && !isComplete) return false;
                     if(filters.status === 'incomplete' && isComplete) return false;
                }
                return true;
            })
            .sort((a, b) => {
                if (!sort.column || sort.column === 'Actions') return 0;

                if (sort.column === 'Grade') {
                    const aGrade = getGradeSortValue(a.Grade);
                    const bGrade = getGradeSortValue(b.Grade);
                    if (aGrade < bGrade) return sort.direction === 'asc' ? -1 : 1;
                    if (aGrade > bGrade) return sort.direction === 'asc' ? 1 : -1;
                    return 0;
                }
                
                if (sort.column === 'MonthlyCosts') {
                     const aCost = (a.financials || []).reduce((total, item) => total + calculateMonthlyEquivalent(String(item.amount), item.frequency), 0);
                     const bCost = (b.financials || []).reduce((total, item) => total + calculateMonthlyEquivalent(String(item.amount), item.frequency), 0);
                     if (aCost < bCost) return sort.direction === 'asc' ? -1 : 1;
                     if (aCost > bCost) return sort.direction === 'asc' ? 1 : -1;
                     return 0;
                }

                const aValue = a[sort.column as keyof Student];
                const bValue = b[sort.column as keyof Student];
                
                if (aValue === undefined || aValue === null) return 1;
                if (bValue === undefined || bValue === null) return -1;
                
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                     if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
                     if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
                } else {
                     if (String(aValue).localeCompare(String(bValue)) < 0) return sort.direction === 'asc' ? -1 : 1;
                     if (String(aValue).localeCompare(String(bValue)) > 0) return sort.direction === 'asc' ? 1 : -1;
                }

                return 0;
            });
    }, [studentsWithAge, filters, sort, category]);
    
     const sortedArchivedStudents = useMemo<Student[]>(() => {
        return archivedStudents
            .map((s): Student => {
                if (s.DOB) {
                    const birthDate = new Date(s.DOB);
                    const today = new Date();
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const m = today.getMonth() - birthDate.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                    }
                    return { ...s, Age: age };
                }
                return { ...s, Age: 'N/A' };
            })
            .sort((a, b) => {
                if (!archiveSort.column) return 0;
                const aValue = a[archiveSort.column as keyof Student];
                const bValue = b[archiveSort.column as keyof Student];
                if (aValue === null || aValue === undefined) return 1;
                if (bValue === null || bValue === undefined) return -1;
                if (String(aValue) < String(bValue)) return archiveSort.direction === 'asc' ? -1 : 1;
                if (String(aValue) > String(bValue)) return archiveSort.direction === 'asc' ? 1 : -1;
                return 0;
            });
    }, [archivedStudents, archiveSort]);

    const studentGrades = useMemo(() => {
        if (!selectedStudent) return [];
        return grades.filter(g => g.StudentID === selectedStudent.StudentID);
    }, [grades, selectedStudent]);
    
    const totals = useMemo(() => ({
        count: filteredAndSortedStudents.length,
        costs: filteredAndSortedStudents.reduce((acc, student) => {
            const studentCost = (student.financials || []).reduce((total, item) => {
                return total + calculateMonthlyEquivalent(String(item.amount), item.frequency);
            }, 0);
            return acc + studentCost;
        }, 0)
    }), [filteredAndSortedStudents]);
    
    const atRiskStudents = useMemo<AtRiskStudent[]>(() => {
        const riskData: AtRiskStudent[] = [];
        const studentAverages: { [key: string]: number } = {};

        const gradesByStudent: { [key: string]: Grade[] } = {};
        grades.forEach(grade => {
            if (!gradesByStudent[grade.StudentID]) {
                gradesByStudent[grade.StudentID] = [];
            }
            gradesByStudent[grade.StudentID].push(grade);
        });

        Object.keys(gradesByStudent).forEach(studentId => {
            const studentGrades = gradesByStudent[studentId];
            if (studentGrades.length > 0) {
                const totalScore = studentGrades.reduce((sum, g) => sum + g.Score, 0);
                studentAverages[studentId] = totalScore / studentGrades.length;
            }
        });

        studentsWithAge.forEach(student => {
            const reasons = new Set<string>();
            
            const avg = studentAverages[student.StudentID];
            if (avg !== undefined && avg < 60) {
                reasons.add(`Low Score (${avg.toFixed(1)})`);
            }

            const studentFollowUps = followUps[student.StudentID];
            if (studentFollowUps && studentFollowUps.length > 0) {
                const latestFollowUp = studentFollowUps.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                
                if (latestFollowUp.homeLife?.rating === 'Poor') reasons.add('Poor Home Life');
                if (latestFollowUp.physicalHealth?.rating === 'Poor') reasons.add('Poor Physical Health');
                if (latestFollowUp.socialInteraction?.rating === 'Poor') reasons.add('Poor Social Interaction');
                if (latestFollowUp.drugsAlcoholViolence?.rating === 'Yes') reasons.add('Substance/Violence');
                if (latestFollowUp.childProtectionConcerns === 'Yes') reasons.add('Protection Concern');
                if (latestFollowUp.humanTraffickingRisk === 'Yes') reasons.add('Trafficking Risk');
                if (latestFollowUp.riskFactors?.length > 2) reasons.add(`${latestFollowUp.riskFactors.length}+ Risk Factors`);
            }
            
            if (reasons.size > 0) {
                riskData.push({ student, reasons: Array.from(reasons) });
            }
        });
        
        return riskData.sort((a, b) => {
            if (b.reasons.length !== a.reasons.length) {
                return b.reasons.length - a.reasons.length;
            }
            return a.student['Given Name'].localeCompare(b.student['Given Name']);
        });

    }, [studentsWithAge, grades, followUps]);

    // ===================================================================================
    // --- HANDLER FUNCTIONS ---
    // ===================================================================================

    const handleLogin = (email: string, password: string): boolean => {
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            const { password, ...userToStore } = user;
            setCurrentUser(userToStore);
            return true;
        }
        return false;
    };

    const handleLogout = () => {
        setCurrentUser(null);
    };
    
    const _updateStudentLists = (...updatedStudents: Student[]) => {
        const updatesMap = new Map(updatedStudents.map(s => [s.StudentID, s]));

        const updater = (student: Student): Student => {
            return updatesMap.get(student.StudentID) || student;
        };

        setStudents(prev => prev.map(updater));
        setArchivedStudents(prev => prev.map(updater));
    };


    const handleSort = (columnKey: string) => {
        setSort(prev => ({
            column: columnKey,
            direction: prev.column === columnKey && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };
    
    const handleArchiveSort = (columnKey: string) => {
        setArchiveSort(prev => ({
            column: columnKey,
            direction: prev.column === columnKey && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleSelectSchool = () => {
        setPreviousTab(activeTab);
        setActiveTab('school-center');
    };

    const handleSelectStudent = (student: Student) => {
        if ((activeTab === 'profile' || activeTab === 'archived-profile') && selectedStudent) {
            if (selectedStudent.StudentID !== student.StudentID) {
                 setStudentHistory(prev => [...prev, selectedStudent]);
            }
        } else {
            setStudentHistory([]);
            setPreviousTab(activeTab);
        }
        
        setSelectedStudent(student);
        
        const isTargetArchived = archivedStudents.some(s => s.StudentID === student.StudentID);
        setActiveTab(isTargetArchived ? 'archived-profile' : 'profile');
    };
    
    const handleBack = () => {
        if (studentHistory.length > 0) {
            const previousStudent = studentHistory[studentHistory.length - 1];
            const newHistory = studentHistory.slice(0, -1);
            
            setStudentHistory(newHistory);
            setSelectedStudent(previousStudent);
            
            const isArchived = archivedStudents.some(s => s.StudentID === previousStudent.StudentID);
            setActiveTab(isArchived ? 'archived-profile' : 'profile');
        } else {
            setActiveTab(previousTab || 'student-list');
        }
    };

    const handleReviewStudent = (formData: Student) => {
        setReviewData(formData);
        setModal('review');
    };

    const handleCheckEligibility = async (student: Student) => {
        if (!ai) {
            setPendingStudents(prev => prev.map(p => p.StudentID === student.StudentID
                ? { ...p, eligibility: { status: 'Error', reason: 'AI client is not configured.' } }
                : p
            ));
            return;
        }

        try {
            const studentProfile = {
                guardianIncome: student.guardians?.[0]?.income,
                guardianJob: student.guardians?.[0]?.job,
                numberOfGuardians: student.guardians?.length,
                totalMonthlyCosts: (student.financials || []).reduce((total, item) => total + calculateMonthlyEquivalent(String(item.amount), item.frequency), 0),
                comments: student.Comments,
            };
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Please evaluate the following student profile for scholarship eligibility: ${JSON.stringify(studentProfile)}`,
                config: {
                    systemInstruction: eligibilityPrompt,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            status: { type: Type.STRING, description: "Either 'Eligible' or 'Ineligible'." },
                            reason: { type: Type.STRING, description: "A brief, one-sentence explanation for the decision." }
                        },
                        propertyOrdering: ["status", "reason"],
                    }
                }
            });
            
            const jsonStr = response.text.trim();
            const result = JSON.parse(jsonStr);

            setPendingStudents(prev => prev.map(p =>
                p.StudentID === student.StudentID
                    ? { ...p, eligibility: { status: result.status, reason: result.reason } }
                    : p
            ));
        } catch (error) {
            console.error("AI Eligibility Check Error:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setPendingStudents(prev => prev.map(p => p.StudentID === student.StudentID
                ? { ...p, eligibility: { status: 'Error', reason: `AI check failed: ${errorMessage}` } }
                : p
            ));
        }
    };

    const handleSaveStudent = () => {
        if (!reviewData) return;
        const dataToSave = { ...reviewData, academicStatus: reviewData.academicStatus || 'Active' };
        const isExisting = students.some(s => s.StudentID === dataToSave.StudentID);
    
        if (isExisting) {
            setStudents(prev => prev.map(s => s.StudentID === dataToSave.StudentID ? dataToSave : s));
            handleSelectStudent(dataToSave);
        } else {
            const newStudentWithStatus = { ...dataToSave, eligibility: { status: 'Checking...', reason: 'AI is evaluating this student...' } };
            setPendingStudents(prev => [...prev, newStudentWithStatus]);
            handleCheckEligibility(newStudentWithStatus);
            setActiveTab('pending-list');
        }
    
        setModal(null);
        setReviewData(null);
    };

    const handleApproveStudent = (studentId: string) => {
        const studentToApprove = pendingStudents.find(s => s.StudentID === studentId);
        if (!studentToApprove) return;
        setStudents(prev => [...prev, studentToApprove]);
        setPendingStudents(prev => prev.filter(s => s.StudentID !== studentId));
    };

    const handleRejectStudent = () => {
        if (!studentToReject) return;
        setPendingStudents(prev => prev.filter(s => s.StudentID !== studentToReject.StudentID));
        setModal(null);
        setStudentToReject(null);
    };
    
    const handleImportStudents = (data: ArrayBuffer) => {
        try {
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            const headers: string[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];

            setFileHeaders(headers.filter(h => h));
            setImportFileData(data);
            setModal('column-mapping');
        } catch (error) {
            console.error("Error reading Excel file headers:", error);
            setImportErrors(["There was a critical error reading the Excel file. It might be corrupted or in an unsupported format."]);
            setModal('import-errors');
        }
    };

    const handleProcessMappedImport = (mapping: ColumnMapping) => {
        if (!importFileData) return;

        try {
            const workbook = XLSX.read(importFileData, { type: 'array', cellDates: true });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json: { [key: string]: any }[] = XLSX.utils.sheet_to_json(worksheet);

            const mappedJson = json.map(row => {
                const mappedRow: { [key: string]: any } = {};
                for (const appField in mapping) {
                    const fileHeader = mapping[appField];
                    if (fileHeader && row[fileHeader] !== undefined) {
                        mappedRow[appField] = row[fileHeader];
                    }
                }
                return mappedRow;
            });

            const validationErrors: string[] = [];
            const validMappedStudents: Partial<Student>[] = [];

            mappedJson.forEach((row, index) => {
                const { student, error } = mapExcelRowToStudent(row);
                if (error) {
                    validationErrors.push(`Row ${index + 2}: ${error}`);
                } else if (student) {
                    validMappedStudents.push(student);
                }
            });

            if (validationErrors.length > 0) {
                setImportErrors(validationErrors);
                setModal('import-errors');
                return;
            }

            const newStudentsToReview: Student[] = [];
            const updatedStudentsToReview: UpdatedStudentInfo[] = [];
            const potentialDuplicatesToReview: PotentialDuplicateInfo[] = [];
            const studentMap = new Map(students.map(s => [s.StudentID, s]));

            validMappedStudents.forEach(mappedStudent => {
                if (!mappedStudent || !mappedStudent.StudentID) return;
                const existingStudent = studentMap.get(mappedStudent.StudentID);
                if (existingStudent) {
                    const changes: UpdatedStudentInfo['changes'] = [];
                    const updateData: Partial<Student> = {};
                    Object.keys(mappedStudent).forEach(key => {
                        const newStudentKey = key as keyof Student;
                        const oldValue = existingStudent[newStudentKey];
                        const newValue = mappedStudent[newStudentKey];
                        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                            changes.push({ field: key, oldValue, newValue });
                            (updateData as any)[key] = newValue;
                        }
                    });
                    if (changes.length > 0) updatedStudentsToReview.push({ studentId: existingStudent.StudentID, name: `${existingStudent['Given Name']} ${existingStudent['Family Name']}`, changes, updateData });
                } else {
                    const normalizedNewName = normalizeSearchableName(mappedStudent['Given Name'] + ' ' + mappedStudent['Family Name']);
                    let bestMatch: { student: Student, similarity: number } | null = null;
                    students.forEach(s => {
                        const normalizedExistingName = normalizeSearchableName(s['Given Name'] + ' ' + s['Family Name']);
                        const similarity = calculateStringSimilarity(normalizedExistingName, normalizedNewName);
                        if (similarity > SIMILARITY_THRESHOLD && (!bestMatch || similarity > bestMatch.similarity)) {
                            bestMatch = { student: s, similarity };
                        }
                    });
                     if (bestMatch) {
                        potentialDuplicatesToReview.push({ newStudent: mappedStudent as Student, existingStudent: bestMatch.student, similarity: bestMatch.similarity });
                    } else {
                        newStudentsToReview.push(mappedStudent as Student);
                    }
                }
            });

            setPendingNewStudents(newStudentsToReview);
            setPendingUpdatedStudents(updatedStudentsToReview);
            setPendingPotentialDuplicates(potentialDuplicatesToReview);
            setModal('review-import');
        } catch (error) {
            console.error("Error processing mapped Excel file:", error);
            setImportErrors(["There was an error processing the file with the selected mapping."]);
            setModal('import-errors');
        }
    };
    
    const handleConfirmImport = (resolutions: DuplicateResolution, resolvedUpdates: ResolvedUpdates, selectedNewStudentIds: Set<string>) => {
        let newStudentsToAdd: Student[] = [];

        newStudentsToAdd = pendingNewStudents.filter(s => selectedNewStudentIds.has(s.StudentID));

        pendingPotentialDuplicates.forEach(dup => {
            const resolution = resolutions[dup.newStudent.StudentID];
            if (resolution === 'create') {
                newStudentsToAdd.push(dup.newStudent);
            } else if (resolution === 'merge') {
                const updatesForMerge = resolvedUpdates[dup.newStudent.StudentID];
                if (updatesForMerge) {
                     setStudents(prev => prev.map(s => {
                        if (s.StudentID === dup.existingStudent.StudentID) {
                            return { ...s, ...updatesForMerge };
                        }
                        return s;
                    }));
                }
            }
        });

        const finalUpdates: { [studentId: string]: Partial<Student> } = {};
        pendingUpdatedStudents.forEach(info => {
            const chosenUpdates = resolvedUpdates[info.studentId];
            if (chosenUpdates && Object.keys(chosenUpdates).length > 0) {
                finalUpdates[info.studentId] = chosenUpdates;
            }
        });
        
        setStudents(prev => {
            const updated = prev.map(s => {
                if (finalUpdates[s.StudentID]) {
                    return { ...s, ...finalUpdates[s.StudentID] };
                }
                return s;
            });
            return [...updated, ...newStudentsToAdd];
        });

        setModal(null);
        alert(`${newStudentsToAdd.length} new students added and ${Object.keys(finalUpdates).length + pendingPotentialDuplicates.filter(d => resolutions[d.newStudent.StudentID] === 'merge').length} students updated.`);
    };
    
    const handleUpdateStudentPhoto = (studentId: string, photoUrl: string) => {
        setStudents(prev => prev.map(s => s.StudentID === studentId ? { ...s, photoUrl } : s));
    }
    
    const handleUpdateParentPhoto = (parentName: string, photoUrl: string) => {
        setParentProfiles(prev => {
            const newProfiles = { ...prev };
            if (!newProfiles[parentName]) {
                newProfiles[parentName] = {};
            }
            if (photoUrl) {
                newProfiles[parentName].photoUrl = photoUrl;
            } else {
                delete newProfiles[parentName].photoUrl;
            }
            return newProfiles;
        });
    };

    const handleArchiveStudent = (reason: string, date: string) => {
        if (!selectedStudent) return;
        const studentToArchive = { ...selectedStudent, ReasonLeft: reason, DateLeft: date, academicStatus: 'On Hold' as const };
        setArchivedStudents(prev => [...prev, studentToArchive]);
        setStudents(prev => prev.filter(s => s.StudentID !== selectedStudent.StudentID));
        setModal(null);
        handleBack();
    };

    const handleUpdateArchivedStudent = (studentId: string, updates: { DateLeft: string; ReasonLeft: string }) => {
        setArchivedStudents(prev => prev.map(s => s.StudentID === studentId ? { ...s, ...updates } : s));
        setModal(null);
    };

    const handleRestoreStudent = (studentToRestore: Student) => {
        const restoredStudent = { ...studentToRestore, academicStatus: 'Active' as const };
        delete restoredStudent.DateLeft;
        delete restoredStudent.ReasonLeft;
        setStudents(prev => [...prev, restoredStudent]);
        setArchivedStudents(prev => prev.filter(s => s.StudentID !== studentToRestore.StudentID));
    };

    const handlePermanentDelete = () => {
        if (!studentToDelete) return;
        setArchivedStudents(prev => prev.filter(s => s.StudentID !== studentToDelete.StudentID));
        setModal(null);
        setStudentToDelete(null);
    };

    const handleResetEligibilityPrompt = () => {
        setEligibilityPrompt(DEFAULT_ELIGIBILITY_PROMPT);
    };

    const handleResetData = () => {
        if (window.confirm("Are you sure you want to reset all data? This will restore the application to its original state and cannot be undone.")) {
            setStudents(initialStudents);
            setPendingStudents([]);
            setArchivedStudents([]);
            setGrades(initialGrades);
            setCurriculum(initialCurriculum);
            setFollowUps(initialFollowUps);
            setParentProfiles(initialParentProfiles);
            setEvents(initialEvents);
            setActiveTab('dashboard');
            setModal(null);
        }
    };

    const openModal = (modalType: string, data?: Student | Event | null) => {
        if (data && typeof data === 'object') {
            if ('StudentID' in data) {
                 setSelectedStudent(data as Student);
            } else if ('id' in data) {
                 setEventToEdit(data as Event);
            }
        } else {
             setSelectedStudent(null);
             setEventToEdit(null);
        }
        setModal(modalType);
    };

    const handleAddGrades = (newGrades: Grade[]) => {
        setGrades(prev => [...prev, ...newGrades]);
    };

    const handleAddFollowUp = (studentId: string, followUpData: FollowUp) => {
        setFollowUps(prev => ({
            ...prev,
            [studentId]: [...(prev[studentId] || []), followUpData]
        }));
        setModal(null);
    };

    const handleUpdateFollowUp = (studentId: string, index: number, updatedFollowUp: FollowUp) => {
        setFollowUps(prev => {
            const newFollowUps = [...(prev[studentId] || [])];
            newFollowUps[index] = updatedFollowUp;
            return { ...prev, [studentId]: newFollowUps };
        });
        setModal(null);
        setFollowUpToEdit(null);
    };

    const handleDeleteFollowUp = (studentId: string, index: number) => {
        if (window.confirm("Are you sure you want to delete this follow-up?")) {
            setFollowUps(prev => {
                const currentFollowUps = prev[studentId] || [];
                const updatedFollowUps = currentFollowUps.filter((_, i) => i !== index);
                return { ...prev, [studentId]: updatedFollowUps };
            });
        }
    };

    const handleOpenEditFollowUpModal = (student: Student, followUp: FollowUp, index: number) => {
        setSelectedStudent(student);
        setFollowUpToEdit({ followUp, index });
        setModal('edit-follow-up');
    };
    
    const handleAddEvent = (eventData: Omit<Event, 'id'>) => {
        const newEvent: Event = { ...eventData, id: Date.now().toString() };
        setEvents(prev => [...prev, newEvent]);
        setModal(null);
    };

    const handleUpdateEvent = (eventData: Event) => {
        setEvents(prev => prev.map(e => e.id === eventData.id ? eventData : e));
        setModal(null);
    };

    const handleDeleteEvent = (eventId: string) => {
        setEvents(prev => prev.filter(e => e.id !== eventId));
    };

    const handleAddMenuSelect = (type: string) => {
        switch (type) {
            case 'student':
                setSelectedStudent(null);
                setModal('add');
                break;
            case 'grades':
            case 'follow-up':
                setPostSelectionAction(`${type}`);
                setModal('select-student');
                break;
            default:
                break;
        }
    };

    const handleStudentSelectionForAction = (student: Student) => {
        setSelectedStudent(student);
        setModal(`add-${postSelectionAction}`);
        setPostSelectionAction(null);
    };

    const handleAiQuery = async (query: string) => {
        if (!ai) {
            setAiChatHistory(prev => [...prev, { role: 'user', text: query }, { role: 'model', text: "AI client is not configured. Please check API key." }]);
            return;
        }

        setIsAiLoading(true);
        setAiChatHistory(prev => [...prev, { role: 'user', text: query }]);

        try {
            const systemInstruction = `You are an expert data analyst for a student management system. The user is a staff member. Analyze the provided JSON data to answer their questions. Be concise and clear. The current date is ${new Date().toDateString()}.
            
Student data is in this format: ${JSON.stringify({
    StudentID: "string",
    'Given Name': "string",
    'Family Name': "string",
    Sex: "M | F",
    DOB: "YYYY-MM-DD",
    Age: "number | 'N/A'",
    Grade: "string",
    School: { name: "string", campus: "string" },
    financials: [{ category: "string", item: "string", amount: "string", frequency: "string" }],
    guardians: [{ name: "string", relationship: "string" }],
    Major: "string",
    EnrollmentDate: "YYYY-MM-DD",
    Location: "string",
    academicStatus: "string",
} , null, 2)}
            
Here is the complete student dataset:
${JSON.stringify(studentsWithAge, null, 2)}
`;
            
            const fullPrompt = `${query}\n\nAnalyze the data provided in the system instruction. Do not mention the JSON data in your response.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
                config: {
                    systemInstruction: systemInstruction
                }
            });

            const text = response.text;

            setAiChatHistory(prev => [...prev, { role: 'model', text }]);
        } catch (error) {
            console.error("AI Query Error:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setAiChatHistory(prev => [...prev, { role: 'model', text: `Sorry, I encountered an error: ${errorMessage}` }]);
        } finally {
            setIsAiLoading(false);
        }
    };

    // FIX: Implement AI summary generation function
    const handleGenerateAiSummary = async (student: Student) => {
        if (!ai) {
            setAiSummary("AI client is not configured. Please check API key.");
            setModal('ai-summary');
            return;
        }

        setIsAiSummaryLoading(true);
        setAiSummary(''); // Clear previous summary
        setModal('ai-summary');

        try {
            // Gather student data
            const studentGrades = grades.filter(g => g.StudentID === student.StudentID);
            const averageGrade = studentGrades.length > 0
                ? (studentGrades.reduce((sum, g) => sum + g.Score, 0) / studentGrades.length).toFixed(2)
                : 'N/A';

            const monthlyCosts = (student.financials || []).reduce((total, item) => {
                return total + calculateMonthlyEquivalent(String(item.amount), item.frequency);
            }, 0).toFixed(2);

            const studentFollowUps = followUps[student.StudentID] || [];
            const latestFollowUp = studentFollowUps.length > 0
                ? studentFollowUps.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
                : null;
            
            const followUpHighlights = latestFollowUp ? {
                date: latestFollowUp.date,
                homeLife: latestFollowUp.homeLife?.rating,
                physicalHealth: latestFollowUp.physicalHealth?.rating,
                riskFactors: latestFollowUp.riskFactors,
                notes: latestFollowUp.notes,
                recommendations: latestFollowUp.recommendations,
            } : 'No follow-up data available.';

            const studentDataForSummary = {
                profile: {
                    givenName: student['Given Name'],
                    familyName: student['Family Name'],
                    age: student.Age,
                    grade: student.Grade,
                    school: student.School.name,
                    major: student.Major,
                    academicStatus: student.academicStatus,
                },
                academicPerformance: {
                    averageGrade: averageGrade,
                },
                financialSituation: {
                    totalMonthlyCosts: monthlyCosts,
                    guardianIncome: student.guardians?.[0]?.income,
                    guardianJob: student.guardians?.[0]?.job,
                },
                wellbeing: {
                    latestFollowUp: followUpHighlights,
                }
            };
            
            const prompt = `You are a case manager for a non-profit. Write a concise, one-paragraph summary of the following student's profile for a report. Be objective and focus on the key data points provided.
            
Student Data:
${JSON.stringify(studentDataForSummary, null, 2)}`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            setAiSummary(response.text);

        } catch (error) {
            console.error("AI Summary Generation Error:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setAiSummary(`Sorry, I encountered an error while generating the summary: ${errorMessage}`);
        } finally {
            setIsAiSummaryLoading(false);
        }
    };


    const handleConfirmSibling = (studentId1: string, studentId2: string) => {
        const student1 = [...students, ...archivedStudents].find(s => s.StudentID === studentId1);
        const student2 = [...students, ...archivedStudents].find(s => s.StudentID === studentId2);

        if (!student1 || !student2) return;

        const g1 = student1.guardians?.[0];
        const g2 = student2.guardians?.[0];

        if (g1 && g2 && !areGuardiansEffectivelyTheSame(g1, g2)) {
            setPendingSiblingConfirmation({ student1, student2 });
            setModal('resolve-guardians');
        } else {
             handleResolveSiblingGuardians(g1 ? student1.StudentID : (g2 ? student2.StudentID : null), student1, student2);
        }
    };
    
    const handleResolveSiblingGuardians = (studentIdToCopyFrom: string | null, s1?: Student, s2?: Student) => {
        const student1 = s1 || pendingSiblingConfirmation?.student1;
        const student2 = s2 || pendingSiblingConfirmation?.student2;

        if (!student1 || !student2) return;

        let finalStudent1 = { ...student1, siblings: [...(student1.siblings || []), student2.StudentID] };
        let finalStudent2 = { ...student2, siblings: [...(student2.siblings || []), student1.StudentID] };
        
        if (studentIdToCopyFrom) {
            const sourceStudent = studentIdToCopyFrom === student1.StudentID ? student1 : student2;
            if (studentIdToCopyFrom === student1.StudentID) {
                finalStudent2.guardians = sourceStudent.guardians;
            } else {
                finalStudent1.guardians = sourceStudent.guardians;
            }
        }
        
        _updateStudentLists(finalStudent1, finalStudent2);
        setSelectedStudent(finalStudent1); // Update view to show changes

        setPendingSiblingConfirmation(null);
        setModal(null);
    };

    const handleManageAttachments = (studentId: string, action: 'add' | 'delete', fileOrIndex: File | number) => {
         const studentToUpdate = students.find(s => s.StudentID === studentId);
        if (!studentToUpdate) return;

        let newAttachments: Attachment[] = [...(studentToUpdate.attachments || [])];

        if (action === 'add' && fileOrIndex instanceof File) {
            const file = fileOrIndex;
            const reader = new FileReader();
            reader.onload = (e) => {
                const newAttachment: Attachment = {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    data: e.target?.result as string,
                };
                newAttachments.push(newAttachment);
                const updatedStudent = { ...studentToUpdate, attachments: newAttachments };
                 _updateStudentLists(updatedStudent);
                 setSelectedStudent(updatedStudent);
            };
            reader.readAsDataURL(file);
        } else if (action === 'delete' && typeof fileOrIndex === 'number') {
            newAttachments.splice(fileOrIndex, 1);
            const updatedStudent = { ...studentToUpdate, attachments: newAttachments };
            _updateStudentLists(updatedStudent);
            setSelectedStudent(updatedStudent);
        }
    };
    
    const handleUpdateGuardianInfo = (updatedGuardianData: Guardian) => {
        if (!guardianToEdit) return;

        const originalGuardian = guardianToEdit.guardian;

        const updateStudentGuardians = (studentList: Student[]) => {
            return studentList.map(student => {
                const guardianIndex = (student.guardians || []).findIndex(g => 
                    areGuardiansEffectivelyTheSame(g, originalGuardian)
                );
                
                if (guardianIndex > -1) {
                    const newGuardians = [...student.guardians!];
                    newGuardians[guardianIndex] = { ...newGuardians[guardianIndex], ...updatedGuardianData };
                    return { ...student, guardians: newGuardians };
                }
                return student;
            });
        };

        setStudents(updateStudentGuardians);
        setArchivedStudents(updateStudentGuardians);

        if (originalGuardian.name !== updatedGuardianData.name && parentProfiles[originalGuardian.name]) {
            setParentProfiles(prev => {
                const newProfiles = { ...prev };
                newProfiles[updatedGuardianData.name] = newProfiles[originalGuardian.name];
                delete newProfiles[originalGuardian.name];
                return newProfiles;
            });
        }
        
        setModal(null);
        setGuardianToEdit(null);
    };

    const handleRefreshData = () => {
        window.location.reload();
    };

    const contextValue: AppContextType = {
        currentUser, handleLogin, handleLogout,
        students, archivedStudents, pendingStudents, grades, curriculum, followUps, parentProfiles, events, eventToEdit, columnConfig, archiveColumnConfig, activeTab, previousTab, selectedStudent, modal, reviewData, studentToDelete, studentToReject, postSelectionAction, followUpToEdit, pendingNewStudents, pendingUpdatedStudents, pendingPotentialDuplicates, pendingSiblingConfirmation, importErrors, fileHeaders, importFileData, guardianToEdit, filters, category, sort, archiveSort, studentsWithAge, schoolAverages, filteredAndSortedStudents, sortedArchivedStudents, studentGrades, atRiskStudents, totals, aiChatHistory, isAiLoading, studentHistory, 
        aiSummary, isAiSummaryLoading,
        eligibilityPrompt, setEligibilityPrompt, handleResetEligibilityPrompt,
        setStudents, setArchivedStudents, setPendingStudents, setGrades, setCurriculum, setFollowUps, setParentProfiles, setEvents, setEventToEdit, setColumnConfig, setArchiveColumnConfig, setActiveTab, setPreviousTab, setSelectedStudent, setModal, setReviewData, setStudentToDelete, setStudentToReject, setPostSelectionAction, setFollowUpToEdit, setPendingNewStudents, setPendingUpdatedStudents, setPendingPotentialDuplicates, setPendingSiblingConfirmation, setImportErrors, setFileHeaders, setImportFileData, setGuardianToEdit, setFilters, setCategory, setSort, setArchiveSort, setStudentHistory, handleSort, handleArchiveSort, handleSelectSchool, handleSelectStudent, handleReviewStudent, handleSaveStudent, handleApproveStudent, handleRejectStudent, handleImportStudents, handleProcessMappedImport, handleConfirmImport, handleUpdateStudentPhoto, handleUpdateParentPhoto, handleArchiveStudent, handleUpdateArchivedStudent, handleRestoreStudent, handlePermanentDelete, handleResetData, openModal, handleAddGrades, handleAddFollowUp, handleUpdateFollowUp, handleDeleteFollowUp, handleOpenEditFollowUpModal, handleAddEvent, handleUpdateEvent, handleDeleteEvent, handleAddMenuSelect, handleStudentSelectionForAction, handleAiQuery, handleGenerateAiSummary, handleBack, handleConfirmSibling, handleResolveSiblingGuardians, handleManageAttachments, handleUpdateGuardianInfo, handleRefreshData
    };

    return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};