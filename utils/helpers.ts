
import type { Student, FinancialRecord, Guardian } from '../types';

export const normalizeName = (name: string | null | undefined): string => {
    if (!name) return '';
    return name
        .trim() // Remove leading/trailing spaces
        .replace(/\s+/g, ' '); // Replace multiple spaces with a single space
};

export const calculateMonthlyEquivalent = (amount: string, frequency: string): number => {
    const numericAmount = parseFloat(amount) || 0;
    switch (frequency) {
        case 'Quarterly': return numericAmount / 3;
        case 'Semester': return numericAmount / 6;
        case 'Yearly': return numericAmount / 12;
        case 'One-time': return 0;
        case 'Monthly':
        default:
            return numericAmount;
    }
};

export const getCambodianGrade = (score: number): { grade: string; color: string } => {
    if (score >= 90) return { grade: 'A', color: 'text-green-600' };
    if (score >= 80) return { grade: 'B', color: 'text-blue-600' };
    if (score >= 70) return { grade: 'C', color: 'text-yellow-600' };
    if (score >= 60) return { grade: 'D', color: 'text-orange-600' };
    if (score >= 50) return { grade: 'E', color: 'text-red-600' };
    return { grade: 'F', color: 'text-red-800' };
};

export const getCategoryForStudent = (student: Student): string => {
    const grade = student.Grade ? String(student.Grade).toLowerCase() : '';
    if (grade.includes('university') || grade.includes('year')) return 'university';
    const gradeNum = parseInt(grade);
    if (!isNaN(gradeNum)) {
        if (gradeNum >= 9) return 'high-school';
        if (gradeNum >= 6) return 'middle-school';
        return 'elementary';
    }
    return 'other';
};

// Levenshtein distance for string similarity
const levenshtein = (s1: string, s2: string): number => {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i === 0) {
                costs[j] = j;
            } else {
                if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    }
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
};

export const calculateStringSimilarity = (s1: string, s2: string): number => {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    if (longer.length === 0) {
        return 1.0;
    }
    return (longer.length - levenshtein(longer, shorter)) / parseFloat(String(longer.length));
};

export const normalizeDateString = (dateInput: any): string => {
    if (!dateInput) return '';

    let date: Date;

    // Excel dates can be numbers (days since 1900). 
    // The `cellDates: true` option in XLSX.read helps, but this is a robust fallback.
    if (typeof dateInput === 'number') {
        // Formula to convert Excel serial date to JS Date.
        // It's days since 1899-12-30. JS is ms since 1970-01-01. 25569 is the diff.
        const jsDate = new Date((dateInput - 25569) * 86400 * 1000);
        date = jsDate;
    } else {
        // Handles JS Date objects and various string dates (e.g., "5/12/2003", "2003-05-12")
        date = new Date(dateInput);
    }

    // Check if the created date is valid
    if (isNaN(date.getTime())) {
        return '';
    }
    
    // Adjust for timezone offset to prevent the date from being off by one day
    const tzoffset = date.getTimezoneOffset() * 60000; //offset in milliseconds
    const localDate = new Date(date.getTime() - tzoffset);
    
    // Return in the standard YYYY-MM-DD format
    return localDate.toISOString().split('T')[0];
};


export const mapExcelRowToStudent = (row: { [key: string]: any }): { student: Partial<Student> | null, error: string | null } => {
    // 1. Mandatory Fields Validation
    if (!row['StudentID']) return { student: null, error: 'StudentID is missing.' };
    if (!row['Given Name']) return { student: null, error: `'Given Name' is missing.` };
    if (!row['Family Name']) return { student: null, error: `'Family Name' is missing.` };

    try {
        const studentData: Partial<Student> & { StudentID: string } = { StudentID: String(row['StudentID']) };

        // 2. Map and Validate other fields
        studentData['Given Name'] = normalizeName(String(row['Given Name']));
        studentData['Family Name'] = normalizeName(String(row['Family Name']));
        
        if (row['Sex'] != null) {
            const sex = String(row['Sex']).toUpperCase();
            if (sex === 'M' || sex === 'F') {
                studentData.Sex = sex;
            } else {
                return { student: null, error: `Invalid value for Sex: "${row['Sex']}". Must be 'M' or 'F'.` };
            }
        }
        
        if (row['DOB'] != null) {
            const dob = normalizeDateString(row['DOB']);
            if (!dob) return { student: null, error: `Invalid date format for DOB: "${row['DOB']}". Should be YYYY-MM-DD.` };
            studentData.DOB = dob;
        }

        if (row['EnrollmentDate'] != null) {
            const enrollmentDate = normalizeDateString(row['EnrollmentDate']);
            if (!enrollmentDate) return { student: null, error: `Invalid date format for EnrollmentDate: "${row['EnrollmentDate']}". Should be YYYY-MM-DD.` };
            studentData.EnrollmentDate = enrollmentDate;
        }

        if (row['Grade'] != null) studentData.Grade = String(row['Grade']);
        if (row['Major'] != null) studentData.Major = String(row['Major']);
        if (row['Comments'] != null) studentData.Comments = String(row['Comments']);
        if (row['Location'] != null) studentData.Location = String(row['Location']);

        studentData.academicStatus = 'Active';

        const schoolString = row['School'] != null ? String(row['School']) : null;
        if (schoolString) {
            const parts = schoolString.split('_');
            studentData.School = { name: parts[0] || '', campus: parts[1] || '' };
        } else if (row['School Name'] != null || row['School Campus'] != null) {
            studentData.School = { name: String(row['School Name'] || ''), campus: String(row['School Campus'] || '') };
        } else {
            studentData.School = { name: '', campus: ''};
        }

        if (row['Guardian Name'] != null) {
            const income = row['Guardian Income'];
            if (income != null && isNaN(Number(income))) {
                 return { student: null, error: `Invalid number for Guardian Income: "${income}".` };
            }
            studentData.guardians = [{
                name: normalizeName(String(row['Guardian Name'])),
                relationship: String(row['Guardian Relationship'] || ''),
                contact: String(row['Guardian Contact'] || ''),
                job: String(row['Guardian Job'] || ''),
                income: Number(income || 0)
            }];
        }

        if (row['Financial Item'] != null) {
            const amount = row['Financial Amount'];
            if (amount == null || isNaN(Number(amount))) {
                return { student: null, error: `Invalid or missing number for Financial Amount: "${amount}".` };
            }
            
            const frequency = row['Financial Frequency'];
            const validFrequencies: FinancialRecord['frequency'][] = ['One-time', 'Monthly', 'Quarterly', 'Semester', 'Yearly'];
            if (frequency != null && !validFrequencies.includes(frequency)) {
                return { student: null, error: `Invalid value for Financial Frequency: "${frequency}". Must be one of: ${validFrequencies.join(', ')}.` };
            }

            const financialDate = row['Financial Date'];
            if (financialDate != null && !normalizeDateString(financialDate)) {
                 return { student: null, error: `Invalid date format for Financial Date: "${financialDate}".` };
            }

            studentData.financials = [{
                category: String(row['Financial Category'] || 'Education'),
                item: String(row['Financial Item']),
                amount: String(amount),
                frequency: (frequency || 'Monthly') as FinancialRecord['frequency'],
                date: normalizeDateString(financialDate || '')
            }];
        }

        return { student: studentData, error: null };
    } catch (e) {
        return { student: null, error: `An unexpected error occurred: ${e instanceof Error ? e.message : String(e)}` };
    }
};

export const normalizeSearchableName = (name: string | null | undefined): string => {
    if (!name) return '';
    return name
        .trim()
        .toLowerCase()
        .replace(/\s*\(.*\)\s*/g, '') // remove parenthetical parts e.g. "Sok (Mao)" -> "sok"
        .replace(/\s+/g, ' '); // collapse multiple spaces
};

export const formatCambodianPhoneNumber = (phoneStr: string | null | undefined): string => {
    if (!phoneStr || String(phoneStr).trim().toLowerCase() === 'n/a' || String(phoneStr).trim() === '') return 'N/A';

    // 1. Remove all non-digit characters
    let cleaned = String(phoneStr).replace(/\D/g, '');

    // 2. Handle country code (855)
    if (cleaned.startsWith('855')) {
        cleaned = cleaned.substring(3);
    }

    // 3. Ensure it starts with a '0' for local numbers if it's the right length
    if (!cleaned.startsWith('0') && (cleaned.length === 8 || cleaned.length === 9)) {
        cleaned = '0' + cleaned;
    }

    // 4. Format based on length for typical 9 or 10 digit numbers
    if (cleaned.startsWith('0') && (cleaned.length === 9 || cleaned.length === 10)) {
        // Format: 0XX XXX XXX(X)
        const part1 = cleaned.slice(0, 3);
        const part2 = cleaned.slice(3, 6);
        const part3 = cleaned.slice(6);
        return `${part1} ${part2} ${part3}`;
    }

    // 5. If it's an unrecognized format, return the original string to avoid breaking it.
    return phoneStr;
};

export const normalizePhoneNumberForComparison = (phoneStr: string | null | undefined): string => {
    if (!phoneStr || String(phoneStr).trim().toLowerCase() === 'n/a' || String(phoneStr).trim() === '') return '';
    let cleaned = String(phoneStr).replace(/\D/g, ''); // Remove non-digits
    if (cleaned.startsWith('855')) {
        cleaned = cleaned.substring(3);
    }
    // Now we have a local number, which might or might not have a leading 0.
    // For comparison, we can strip it.
    if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
    }
    return cleaned; // returns just the core 8 or 9 digits
};

export const areGuardiansEffectivelyTheSame = (g1: Guardian, g2: Guardian): boolean => {
    if (!g1 && !g2) return true; // both are null/undefined
    if (!g1 || !g2) return false; // one is null/undefined

    return normalizeName(g1.name).toLowerCase() === normalizeName(g2.name).toLowerCase() &&
           normalizeName(g1.relationship).toLowerCase() === normalizeName(g2.relationship).toLowerCase() &&
           normalizePhoneNumberForComparison(g1.contact) === normalizePhoneNumberForComparison(g2.contact) &&
           normalizeName(g1.job).toLowerCase() === normalizeName(g2.job).toLowerCase() &&
           (g1.income || 0) === (g2.income || 0);
};
