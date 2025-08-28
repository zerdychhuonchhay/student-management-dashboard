
import type { Curriculum } from '../types';

export const initialCurriculum: Curriculum = {
    "NewLife": {
        "": {
            "4": ["Math", "Science", "Khmer", "English"],
            "6": ["Math", "Science", "Khmer", "English"],
            "7": ["Math", "Science", "Khmer", "English"],
            "9": ["Math", "Science", "Khmer", "English", "Social Studies"],
            "10": ["Algebra", "Biology", "Khmer Literature", "English II", "World History"],
            "11": ["Algebra II", "Chemistry", "Khmer Literature", "English III", "World History"],
        }
    },
    "SPS": {
        "Tep": {
            "9": ["Math", "Physics", "Khmer", "English"],
            "12": ["Calculus", "Physics", "Chemistry", "Advanced English", "Cambodian History"]
        },
        "TK": {
            "10": ["Math", "Science", "Khmer", "English"]
        }
    },
    "UEF": {
        "": {
            "Accounting and Finance": {
                "Year 1": {
                    "Semester 1": ["Business English I", "History", "Contract Law", "Business Mathematics", "Microeconomics", "Accounting in Business I (FI)"],
                    "Semester 2": ["Business English II", "Philosophy", "Business Statistics", "Macroeconomics", "Human Resource Management"]
                }
            }
        }
    },
    "RULE": {
        "": {
            "Laws": {
                "Year 1": {
                    "Semester 1": ["Contract Law", "Constitutional Law"],
                    "Semester 2": ["Criminal Law", "Legal Research"]
                }
            }
        }
    },
    "RUPP": {
        "": {
            "Business": {
                "Year 1": {
                    "Semester 1": ["Principles of Management", "Principles of Marketing"],
                    "Semester 2": ["Business Law", "Business Communication"]
                }
            }
        }
    },
    "PPIU": {
        "": {
            "Business": {
                "Year 1": {
                    "Semester 1": ["Intro to Business", "Accounting I"],
                    "Semester 2": ["Microeconomics", "Business Statistics"]
                }
            }
        }
    }
};
