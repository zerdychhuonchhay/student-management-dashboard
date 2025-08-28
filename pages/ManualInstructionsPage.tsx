
import React from 'react';
import { Printer } from 'lucide-react';

const Section: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6 print-section">
        <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4">{title}</h2>
        <div className="prose max-w-none prose-indigo">{children}</div>
    </div>
);

const ManualInstructionsPage: React.FC = () => {
    // By wrapping the content in a dedicated scroll container for the screen view,
    // the inner 'print-area' div remains clean of layout-constraining styles,
    // making it much easier for the print stylesheet to format it correctly.
    return (
        <div className="h-full overflow-y-auto print-area-container">
            <div className="p-4 sm:p-6 lg:p-8 print-area">
                <header className="bg-white shadow-md rounded-lg p-6 mb-6 flex justify-between items-center no-print">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Manual Instructions</h1>
                        <p className="text-gray-600 mt-1">A guide to all features and functions of the Student Management Dashboard.</p>
                    </div>
                    <button
                        onClick={() => window.print()}
                        className="bg-indigo-600 text-white p-2 rounded-md shadow-sm hover:bg-indigo-700 no-print"
                        title="Print / Save as PDF"
                    >
                        <Printer size={20} />
                    </button>
                </header>
                
                <Section title="Dashboard Overview">
                    <p>The Dashboard is the first page you see. It provides a high-level summary of your student data.</p>
                    <ul>
                        <li><strong>Student Overview:</strong> See the total number of students and a breakdown between K-12 and University levels.</li>
                        <li><strong>Financial Overview:</strong> View the total monthly cost equivalent for all students and a pie chart showing the distribution of costs by category.</li>
                        <li><strong>Calendar:</strong> A simple calendar widget for quick date reference.</li>
                        <li><strong>Recently Added Students:</strong> A list of the 5 most recently enrolled students for quick access to their profiles.</li>
                    </ul>
                </Section>

                <Section title="Student List Page">
                    <p>Accessed by clicking "Student List" in the sidebar, this is the main page for viewing and managing all active students.</p>
                    <ul>
                        <li><strong>Sorting:</strong> Click on any column header (e.g., "First Name", "Age") to sort the table by that column. Click again to reverse the sort order.</li>
                        <li><strong>Category Filters:</strong> Use the buttons at the top (e.g., "University", "High School") to quickly filter students by their educational level.</li>
                        <li><strong>Filtering & Searching:</strong> Click the "Filter" button to open a modal with advanced options. You can search by name, or filter by grade, school, sex, age, and record completion status.</li>
                        <li><strong>Importing from Excel:</strong> Click the "Import from Excel" button to upload a <code>.xlsx</code> or <code>.xls</code> file. The application will guide you through reviewing new students, potential duplicates, and updates to existing students before finalizing the import.</li>
                        <li><strong>Adding Grades Quickly:</strong> Click the <code className="text-sm font-bold">+</code> icon in the "Actions" column for any student to quickly open the "Add Grades" modal for them.</li>
                    </ul>
                </Section>

                <Section title="Managing Students">
                    <p>All core student management actions are easily accessible.</p>
                    <h4>Adding a New Student</h4>
                    <ol>
                        <li>Click the "Add New" button in the top right corner and select "Add Student".</li>
                        <li>Fill out the form with the student's information. You can add multiple financial records, guardians, and education history entries.</li>
                        <li>Click "Review & Save".</li>
                        <li>Verify the information in the review modal and click "Confirm & Save".</li>
                    </ol>
                    <h4>Editing a Student</h4>
                     <ol>
                        <li>Navigate to the student's profile page by clicking their name in the Student List.</li>
                        <li>Click the "Edit" button in the profile header.</li>
                        <li>Make your desired changes in the form and proceed with the "Review & Save" process.</li>
                    </ol>
                    <h4>Archiving and Deleting Students</h4>
                     <ol>
                        <li>From a student's profile, click "Edit", then click the "Archive Student" button at the bottom of the form.</li>
                        <li>Provide a reason for archiving and confirm. The student will be moved to the "Archive" section.</li>
                        <li>To permanently delete a student, go to the "Archive" page, find the student, and click "Delete". You must confirm this action as it cannot be undone.</li>
                        <li>You can also restore an archived student from the "Archive" page by clicking "Restore".</li>
                    </ol>
                </Section>

                 <Section title="Student Profile Details">
                    <p>The student profile page provides a comprehensive 360-degree view of the student.</p>
                    <ul>
                        <li><strong>Information Panels:</strong> View detailed personal, academic, financial, and guardian information in organized cards.</li>
                        <li><strong>Managing Photos:</strong> Hover over the student's profile picture to change or remove it. You can do the same for parent/guardian photos on the "Parents & Guardians" page.</li>
                        <li><strong>Sibling Management:</strong> The system automatically suggests possible siblings based on the same family name. You can review these suggestions and click "(Confirm)" to link the student profiles. Confirmed siblings are listed separately.</li>
                        <li><strong>Follow-Up History:</strong> This panel on the right shows a chronological list of all follow-ups. You can add a new follow-up, edit existing ones, or delete them directly from this view.</li>
                    </ul>
                </Section>

                 <Section title="Grades Center">
                    <p>Access the Grades Center by clicking "View Grades" on a student's profile page.</p>
                    <ul>
                        <li><strong>Performance Trend:</strong> A line chart visualizing the student's average score over time.</li>
                        <li><strong>Subject Comparison:</strong> A bar chart comparing the student's average score in each subject against the school average for that same subject and grade.</li>
                        <li><strong>All Grade Records:</strong> A detailed table listing every grade entry for the student, including the calculated Cambodian letter grade.</li>
                        <li><strong>Add Grades:</strong> Use the "Add Grades" button to enter new scores for a specific month or semester. The available subjects are pulled from the Curriculum settings.</li>
                    </ul>
                </Section>

                <Section title="School & Parent Centers">
                    <h4>School Center</h4>
                    <p>This page provides an overview of all schools in the system, separated into Universities and K-12 schools. Each school has a card showing its total student count, average academic performance, and a list of enrolled students with their individual averages.</p>
                    <h4>Parents & Guardians List</h4>
                    <p>Find a list of all unique parents and guardians. Each card displays the guardian's contact information and a list of their associated children in the program. You can click on a child's name to go directly to their profile.</p>
                </Section>

                 <Section title="Data Management">
                    <h4>Curriculum Management</h4>
                    <p>On this page, you can define the subjects for every school, campus, grade, and (for universities) major/year/semester. The subjects you list here will automatically appear in the "Add Grades" modal for students matching that criteria. Simply edit the comma-separated list of subjects in the text boxes to make changes.</p>
                     <h4>Settings</h4>
                     <p>Click the gear icon in the sidebar to open the Settings modal.</p>
                     <ul>
                         <li><strong>Column Visibility:</strong> Check or uncheck column names to show or hide them on the main Student List page.</li>
                         <li><strong>Reset All Data:</strong> This is a powerful feature that will erase all your changes (new students, grades, edits) and restore the application to its original sample data. Use with caution.</li>
                     </ul>
                </Section>

                <Section title="AI Assistant">
                    <p>Click the "AI Assistant" button in the top bar to open the chat modal. You can ask natural language questions about your student data, for example:</p>
                    <ul>
                        <li><em>"How many students are in Grade 9 at SPS?"</em></li>
                        <li><em>"What is Kunthea Yim's major?"</em></li>
                        <li><em>"List all students whose monthly costs are over $200."</em></li>
                    </ul>
                    <p>The AI will analyze the current student data to provide an answer.</p>
                </Section>

            </div>
        </div>
    );
};

export default ManualInstructionsPage;
