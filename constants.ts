
import type { Column, ColumnConfig } from './types';

export const ALL_COLUMNS: Column[] = [
    { key: 'StudentID', label: 'Student ID' },
    { key: 'Given Name', label: 'First Name' },
    { key: 'Family Name', label: 'Family Name' },
    { key: 'Age', label: 'Age' },
    { key: 'Sex', label: 'Sex' },
    { key: 'Grade', label: 'Grade' },
    { key: 'academicStatus', label: 'Status' },
    { key: 'School', label: 'School' },
    { key: 'MonthlyCosts', label: 'Monthly Costs' },
    { key: 'EnrollmentDate', label: 'Enrolled' },
    { key: 'Comments', label: 'Comments' },
    { key: 'Actions', label: 'Add Grade' }
];

export const ALL_ARCHIVED_COLUMNS: Column[] = [
    { key: 'StudentID', label: 'Student ID' },
    { key: 'Given Name', label: 'First Name' },
    { key: 'Family Name', label: 'Family Name' },
    { key: 'Age', label: 'Age' },
    { key: 'Sex', label: 'Sex' },
    { key: 'Grade', label: 'Grade' },
    { key: 'School', label: 'School' },
    { key: 'DateLeft', label: 'Date Left' },
    { key: 'ReasonLeft', label: 'Reason for Leaving' },
    { key: 'Actions', label: 'Actions' }
];


export const ALL_RISK_FACTORS: string[] = [
    "Abandonment", "Emotional Abuse", "Physical Abuse", "Sexual Abuse", "Addiction (family members)",
    "Addiction (child)", "Bullying", "Family Debt", "Forced Begging", "Garbage Collection", "Gang Involvement",
    "Sexual Grooming", "Housing Insecurity", "Mental Health Challenges", "Neglect", "Orphan",
    "Parent/ Guardian Marital Status Change", "Parent/ Guardian in Jail", "Physical Health Challenges",
    "Drug use/ Drug selling (family members)", "Drugs use/ Drug selling (child)", "Single Parent/ Guardian"
];

export const MAPPABLE_APP_FIELDS = [
    { key: 'StudentID', label: 'Student ID', required: true, example: 'S001' },
    { key: 'Given Name', label: 'Given Name', required: true, example: 'John' },
    { key: 'Family Name', label: 'Family Name', required: true, example: 'Doe' },
    { key: 'Sex', label: 'Sex', required: false, example: 'M or F' },
    { key: 'DOB', label: 'Date of Birth', required: false, example: 'YYYY-MM-DD' },
    { key: 'Grade', label: 'Grade', required: false, example: '9 or University' },
    { key: 'Major', label: 'Major (for University)', required: false, example: 'Business' },
    { key: 'School', label: 'School Name_Campus', required: false, example: 'SPS_TK or just SPS' },
    { key: 'EnrollmentDate', label: 'Enrollment Date', required: false, example: 'YYYY-MM-DD' },
    { key: 'Location', label: 'Location', required: false, example: 'Phnom Penh' },
    { key: 'Comments', label: 'Comments', required: false, example: 'Good student' },
    // Guardian fields
    { key: 'Guardian Name', label: 'Guardian Name', required: false, example: 'Jane Doe' },
    { key: 'Guardian Relationship', label: 'Guardian Relationship', required: false, example: 'Mother' },
    { key: 'Guardian Contact', label: 'Guardian Contact', required: false, example: '012345678' },
    { key: 'Guardian Job', label: 'Guardian Job', required: false, example: 'Vendor' },
    { key: 'Guardian Income', label: 'Guardian Income (USD)', required: false, example: '250' },
    // Financial fields
    { key: 'Financial Item', label: 'Financial Item', required: false, example: 'Tuition Fee' },
    { key: 'Financial Category', label: 'Financial Category', required: false, example: 'Education' },
    { key: 'Financial Amount', label: 'Financial Amount (USD)', required: false, example: '300' },
    { key: 'Financial Frequency', label: 'Financial Frequency', required: false, example: 'Monthly' },
    { key: 'Financial Date', label: 'Financial Date', required: false, example: 'YYYY-MM-DD' },
];

export const generateDefaultColumnConfig = (columns: Column[]): ColumnConfig[] => {
    return columns.map(col => ({
        ...col,
        visible: true,
        locked: false,
    }));
};
