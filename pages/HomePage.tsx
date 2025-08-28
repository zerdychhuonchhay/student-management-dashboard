import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useAppContext } from '../context/AppContext';
import { calculateMonthlyEquivalent, getCategoryForStudent } from '../utils/helpers';
import type { Student, FollowUp } from '../types';
import { Briefcase, Cake, UserPlus, Calendar as CalendarIcon, AlertTriangle, CheckCircle } from 'lucide-react';
import CalendarWidget from '../components/ui/CalendarWidget';

const AtRiskWidget: React.FC = () => {
    const { atRiskStudents, handleSelectStudent } = useAppContext();

    if (atRiskStudents.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-green-700 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6" />
                    No Students Currently At Risk
                </h2>
                <p className="text-gray-600">All students are currently meeting performance and well-being benchmarks. Great job!</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-orange-600 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                Students Requiring Attention ({atRiskStudents.length})
            </h2>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                {atRiskStudents.map(({ student, reasons }) => (
                    <div key={student.StudentID} className="flex items-center gap-4 bg-orange-50 p-3 rounded-lg border border-orange-200">
                        <img src={student.photoUrl || `https://picsum.photos/seed/${student.StudentID}/400/400`} alt={student['Given Name']} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                        <div className="flex-grow min-w-0">
                            <a href="#" onClick={(e) => { e.preventDefault(); handleSelectStudent(student); }} className="font-semibold text-indigo-600 hover:underline">
                                {student['Given Name']} {student['Family Name']}
                            </a>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {reasons.map(reason => (
                                    <span key={reason} className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-medium">
                                        {reason}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AgendaWidget: React.FC<{
    selectedDate: Date;
    events: { type: string; student: Student; followUp?: FollowUp }[];
}> = ({ selectedDate, events }) => {
    const { handleSelectStudent } = useAppContext();
    const EventIcon = ({type}: {type: string}) => {
        switch(type) {
            case 'birthday': return <Cake className="w-5 h-5 text-pink-500" />;
            case 'anniversary': return <Briefcase className="w-5 h-5 text-green-500" />;
            case 'follow-up': return <CalendarIcon className="w-5 h-5 text-blue-500" />;
            case 'joined': return <UserPlus className="w-5 h-5 text-blue-500" />;
            default: return null;
        }
    }
    return (
         <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
                Agenda for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </h2>
            {events.length > 0 ? (
                <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {events.map((event, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1"><EventIcon type={event.type} /></div>
                            <div>
                                <a href="#" onClick={(e) => {e.preventDefault(); handleSelectStudent(event.student);}} className="font-semibold text-indigo-600 hover:underline">
                                    {event.student['Given Name']} {event.student['Family Name']}
                                </a>
                                 <p className="text-xs text-gray-500 capitalize">{event.type === 'joined' ? 'Joined Program' : event.type}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-gray-500 py-4">No events scheduled for this day.</p>
            )}
        </div>
    )
}

const HomePage: React.FC = () => {
    const { studentsWithAge, followUps, events: customEvents } = useAppContext();
    const [selectedDate, setSelectedDate] = useState(new Date());

    const studentStats = useMemo(() => {
        const stats = { total: studentsWithAge.length, university: 0, k12: 0 };
        studentsWithAge.forEach(s => {
            if (getCategoryForStudent(s) === 'university') stats.university++;
            else stats.k12++;
        });
        return stats;
    }, [studentsWithAge]);

    const financialStats = useMemo(() => {
        const stats: { total: number, categories: { [key: string]: number } } = { total: 0, categories: {} };
        studentsWithAge.forEach(s => {
            (s.financials || []).forEach(item => {
                const monthlyCost = calculateMonthlyEquivalent(item.amount, item.frequency);
                stats.total += monthlyCost;
                if (!stats.categories[item.category]) stats.categories[item.category] = 0;
                stats.categories[item.category] += monthlyCost;
            });
        });
        return {
            total: stats.total,
            categoryData: Object.entries(stats.categories).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) })),
        };
    }, [studentsWithAge]);

    const eventDates = useMemo(() => {
        const dates = new Set<string>();
        
        // Add custom events
        customEvents.forEach(e => dates.add(e.date));

        // Add follow-ups
        Object.values(followUps).flat().forEach(fu => {
            if (fu.date) {
                const date = new Date(fu.date);
                const tzoffset = date.getTimezoneOffset() * 60000;
                const localISOTime = new Date(date.getTime() - tzoffset).toISOString().split('T')[0];
                dates.add(localISOTime);
            }
        });
        
        // Add birthdays, enrollments, and anniversaries for the current year
        const currentYear = new Date().getFullYear();
        studentsWithAge.forEach(student => {
            if (student.DOB) {
                const [y, m, d] = student.DOB.split('-');
                dates.add(`${currentYear}-${m}-${d}`);
            }
            if (student.EnrollmentDate) {
                // Add the actual enrollment date to the set of event dates
                dates.add(student.EnrollmentDate);
                
                // Add the anniversary for the current year
                const [enrollYear, m, d] = student.EnrollmentDate.split('-');
                if (currentYear > parseInt(enrollYear, 10)) {
                    dates.add(`${currentYear}-${m}-${d}`);
                }
            }
        });

        return dates;
    }, [studentsWithAge, followUps, customEvents]);

    const dailyEvents = useMemo(() => {
        const selectedMonth = selectedDate.getMonth();
        const selectedDay = selectedDate.getDate();
        const selectedYear = selectedDate.getFullYear();
        
        const tzoffset = selectedDate.getTimezoneOffset() * 60000;
        const selectedDateString = new Date(selectedDate.getTime() - tzoffset).toISOString().split('T')[0];
        
        const events: { type: string; student: Student; followUp?: FollowUp }[] = [];

        studentsWithAge.forEach(student => {
            // Birthday check
            if (student.DOB) {
                const [, m, d] = student.DOB.split('-').map(Number);
                if (m - 1 === selectedMonth && d === selectedDay) events.push({ type: 'birthday', student });
            }
            if (student.EnrollmentDate) {
                // Anniversary check
                const [enrollYear, m, d] = student.EnrollmentDate.split('-').map(Number);
                if (m - 1 === selectedMonth && d === selectedDay && enrollYear < selectedYear) {
                    events.push({ type: 'anniversary', student });
                }
                
                // Joined Program check
                if (student.EnrollmentDate === selectedDateString) {
                    events.push({ type: 'joined', student });
                }
            }
        });

        Object.entries(followUps).forEach(([studentId, studentFollowUps]) => {
            studentFollowUps.forEach(fu => {
                if (fu.date) {
                     const fuDate = new Date(fu.date);
                     const fu_tzoffset = fuDate.getTimezoneOffset() * 60000;
                     const fuDateString = new Date(fuDate.getTime() - fu_tzoffset).toISOString().split('T')[0];
                     if(fuDateString === selectedDateString){
                        const student = studentsWithAge.find(s => s.StudentID === studentId);
                        if (student) events.push({ type: 'follow-up', student, followUp: fu });
                     }
                }
            });
        });
        return events;
    }, [selectedDate, studentsWithAge, followUps]);
    
    const studentLevelData = [{ name: 'University', count: studentStats.university }, { name: 'K-12', count: studentStats.k12 }];
    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

    return (
        <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
            <header className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-600 mt-1">A high-level summary of your student data.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Student Overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-indigo-50 p-4 rounded-lg text-center">
                                <h3 className="text-lg font-medium text-gray-600">Total Students</h3>
                                <p className="text-4xl font-bold text-indigo-600 mt-2">{studentStats.total}</p>
                            </div>
                            <div className="md:col-span-2">
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={studentLevelData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Financial Overview</h2>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-green-50 p-4 rounded-lg text-center">
                                <h3 className="text-lg font-medium text-gray-600">Total Monthly Costs</h3>
                                <p className="text-4xl font-bold text-green-600 mt-2">${financialStats.total.toFixed(2)}</p>
                            </div>
                            <div className="md:col-span-2">
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie data={financialStats.categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                            {financialStats.categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip formatter={(value) => `$${value}`} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                    <AtRiskWidget />
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <CalendarWidget 
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                        eventDates={eventDates}
                    />
                    <AgendaWidget selectedDate={selectedDate} events={dailyEvents} />
                </div>
            </div>
        </div>
    );
};

export default HomePage;
