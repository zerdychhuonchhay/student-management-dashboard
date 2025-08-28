
import React from 'react';
import { Printer } from 'lucide-react';

const Section: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6 print-section">
        <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4">{title}</h2>
        <div className="prose max-w-none prose-indigo">{children}</div>
    </div>
);

const ManualInstructionsPage: React.FC = () => {
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
                        <li><strong>Student & Financial Overviews:</strong> See the total number of students and a breakdown of their monthly financial costs.</li>
                        <li><strong>Students Requiring Attention:</strong> This important widget automatically flags students who may need extra support based on low grades or negative follow-up reports.</li>
                        <li><strong>Calendar & Agenda:</strong> View upcoming events, student birthdays, and enrollment anniversaries at a glance.</li>
                    </ul>
                </Section>
                
                <Section title="Managing Students">
                    <p>All core student management actions are easily accessible.</p>
                    <h4>Adding a New Student (New Workflow)</h4>
                    <ol>
                        <li>Click the "Add New" button in the top right corner and select "Add Student".</li>
                        <li>Fill out the form with the applicant's information.</li>
                        <li>After clicking "Review & Save" and confirming, the student is sent to the <strong>Pending List</strong> for a final review.</li>
                        <li>An AI-powered eligibility check is automatically run on the new applicant.</li>
                        <li>Navigate to the "Pending List" page (from the sidebar) to approve or reject the application.</li>
                    </ol>
                    <h4>Editing a Student</h4>
                     <ol>
                        <li>Navigate to an active student's profile page by clicking their name in the Student List.</li>
                        <li>Click the "Edit" button in the profile header.</li>
                        <li>Make your desired changes in the form and proceed with the "Review & Save" process.</li>
                    </ol>
                    <h4>Archiving and Deleting Students</h4>
                     <ol>
                        <li>From an active student's profile, click "Edit", then click the "Archive Student" button at the bottom of the form.</li>
                        <li>Provide a reason for archiving and confirm. The student will be moved to the "Archive" section.</li>
                        <li>To permanently delete a student, go to the "Archive" page, find the student, and click "Delete". You must confirm this action as it cannot be undone.</li>
                     </ol>
                </Section>

                <Section title="Pending List & AI Eligibility Check">
                    <p>Accessed from the sidebar, this page is your admissions hub for new applicants. The number in the yellow badge indicates how many applications are awaiting review.</p>
                    <ul>
                        <li><strong>Automatic AI Evaluation:</strong> When a new student is added to the pending list, their profile (guardian income, job, etc.) is automatically sent to the AI. The AI acts as an admissions officer and provides:
                            <ul>
                                <li>An <strong>Eligibility Status</strong> (e.g., "Eligible", "Ineligible").</li>
                                <li>A <strong>Reason</strong> summarizing its decision based on the criteria you set.</li>
                            </ul>
                        </li>
                        <li><strong>Review & Approve/Reject:</strong> On the Pending List page, you can see each applicant's details alongside the AI's recommendation. This AI assessment is a powerful tool to help you make informed decisions quickly.
                            <ul>
                                <li>Click <strong>"Approve"</strong> to move the student to the main "Student List" and make them an active student.</li>
                                <li>Click <strong>"Reject"</strong> to permanently remove the application.</li>
                            </ul>
                        </li>
                    </ul>
                </Section>

                <Section title="Student List Page">
                    <p>This is the main page for viewing and managing all **active** students.</p>
                    <ul>
                        <li><strong>Sorting & Filtering:</strong> Use the column headers to sort, and use the search bar and "Advanced Filters" button to find specific students.</li>
                        <li><strong>Customizable View:</strong> Hover over a column header to see a "pin" icon to lock it to the left side. Go to <strong>Settings</strong> to reorder columns or hide them from view.</li>
                        <li><strong>Importing from Excel:</strong> Click the "Import from Excel" button to upload a spreadsheet. The application will guide you through mapping your columns and reviewing potential duplicates before finalizing the import.</li>
                    </ul>
                </Section>

                 <Section title="Data Management & Settings">
                     <p>Click the gear icon in the sidebar to open the Settings modal.</p>
                     <ul>
                         <li><strong>Column Management:</strong> Drag and drop to reorder columns, check/uncheck to show/hide them, and use the pin icon to lock columns in place on the Student List page.</li>
                         <li><strong>AI Eligibility Criteria:</strong> This powerful feature lets you change the instructions the AI uses for its eligibility check. Edit the text to change the AI's focus (e.g., prioritize different risk factors, adjust income thresholds). Click "Reset to Default" to restore the original instructions.</li>
                         <li><strong>Curriculum Management:</strong> On this page, you can define the subjects for every school and grade. The subjects you list here will automatically appear in the "Add Grades" modal for relevant students.</li>
                         <li><strong>Reset All Data:</strong> This will erase all your changes and restore the application to its original sample data. Use with caution.</li>
                     </ul>
                </Section>

                <Section title="AI Assistant">
                    <p>Click the "AI Assistant" button in the top bar to open the chat modal. You can ask natural language questions about your **active** student data. The AI can analyze the entire student list to find information for you.</p>
                    <p>Good examples of questions include:</p>
                    <ul>
                        <li><em>"How many students are in Grade 9 at SPS?"</em></li>
                        <li><em>"What is Kunthea Yim's major?"</em></li>
                        <li><em>"List all students whose monthly costs are over $200."</em></li>
                        <li><em>"Who are the guardians of the students with the family name Run?"</em></li>
                    </ul>
                </Section>

            </div>
        </div>
    );
};

export default ManualInstructionsPage;
