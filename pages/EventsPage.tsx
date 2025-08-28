
import React, { useState, useMemo } from 'react';
import { Briefcase, Cake, UserPlus, UserMinus, Tag, Edit, Trash2, PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { Student, Event } from '../types';
import CalendarWidget from '../components/ui/CalendarWidget';

type AggregatedEvent = {
    date: string;
    type: 'birthday' | 'anniversary' | 'joined' | 'left' | 'custom';
    title: string;
    student?: Student;
    customEvent?: Event;
};

const EventIcon: React.FC<{ type: AggregatedEvent['type'], customType?: Event['type'] }> = ({ type, customType }) => {
    switch(type) {
        case 'birthday': return <Cake className="w-5 h-5 text-pink-500" />;
        case 'anniversary': return <Briefcase className="w-5 h-5 text-green-500" />;
        case 'joined': return <UserPlus className="w-5 h-5 text-blue-500" />;
        case 'left': return <UserMinus className="w-5 h-5 text-red-500" />;
        case 'custom':
            switch(customType) {
                case 'Holiday': return <Tag className="w-5 h-5 text-purple-500" />;
                case 'School Event': return <CalendarIcon className="w-5 h-5 text-orange-500" />;
                default: return <Tag className="w-5 h-5 text-gray-500" />;
            }
        default: return null;
    }
};

const EventsPage: React.FC = () => {
    const { studentsWithAge, archivedStudents, events, handleSelectStudent, openModal, handleDeleteEvent } = useAppContext();
    const [selectedDate, setSelectedDate] = useState(new Date());

    const allEvents = useMemo<AggregatedEvent[]>(() => {
        const aggregated: AggregatedEvent[] = [];

        // Add custom events
        events.forEach(event => {
            aggregated.push({
                date: event.date,
                type: 'custom',
                title: event.title,
                customEvent: event
            });
        });

        // Add student-related events
        [...studentsWithAge, ...archivedStudents].forEach(student => {
            // Birthdays (show for current year)
            if (student.DOB) {
                const [year, month, day] = student.DOB.split('-');
                const birthdayThisYear = new Date(selectedDate.getFullYear(), parseInt(month) - 1, parseInt(day));
                aggregated.push({
                    date: birthdayThisYear.toISOString().split('T')[0],
                    type: 'birthday',
                    title: `${student['Given Name']}'s Birthday`,
                    student: student
                });
            }
            // Anniversaries & Joined Date
            if (student.EnrollmentDate) {
                 aggregated.push({
                    date: student.EnrollmentDate,
                    type: 'joined',
                    title: `Joined Program`,
                    student: student
                });
                const [enrollYearStr, enrollMonth, enrollDay] = student.EnrollmentDate.split('-');
                const enrollYear = parseInt(enrollYearStr);
                if (selectedDate.getFullYear() > enrollYear) {
                    const anniversaryThisYear = new Date(selectedDate.getFullYear(), parseInt(enrollMonth) - 1, parseInt(enrollDay));
                     aggregated.push({
                        date: anniversaryThisYear.toISOString().split('T')[0],
                        type: 'anniversary',
                        title: `Work Anniversary`,
                        student: student
                    });
                }
            }
        });

        // Add archived (left) dates
        archivedStudents.forEach(student => {
            if (student.DateLeft) {
                aggregated.push({
                    date: student.DateLeft,
                    type: 'left',
                    title: `Left Program`,
                    student: student
                });
            }
        });
        
        return aggregated.sort((a,b) => a.title.localeCompare(b.title));

    }, [studentsWithAge, archivedStudents, events, selectedDate]);
    
    const eventDates = useMemo(() => {
        const dates = new Set<string>();
        allEvents.forEach(event => dates.add(event.date));
        return dates;
    }, [allEvents]);

    const dailyEvents = useMemo(() => {
        const dateString = selectedDate.toISOString().split('T')[0];
        return allEvents.filter(event => event.date === dateString);
    }, [selectedDate, allEvents]);

    return (
        <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
            <header className="bg-white shadow-md rounded-lg p-6 mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Events Calendar</h1>
                    <p className="text-gray-600 mt-1">Track holidays, student milestones, and important dates.</p>
                </div>
                 <button onClick={() => openModal('add-event', null)} className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-700 flex items-center gap-2">
                    <PlusCircle size={16} /> Add Event
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <CalendarWidget
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                        eventDates={eventDates}
                    />
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                     <h2 className="text-xl font-semibold mb-4">
                        Agenda for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h2>
                    <div className="h-[60vh] overflow-y-auto pr-2">
                        {dailyEvents.length > 0 ? (
                            <ul className="space-y-4">
                                {dailyEvents.map((event, index) => (
                                    <li key={index} className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-50">
                                        <div className="flex-shrink-0 mt-1">
                                            <EventIcon type={event.type} customType={event.customEvent?.type} />
                                        </div>
                                        <div className="flex-grow">
                                            {event.student ? (
                                                <a href="#" onClick={(e) => { e.preventDefault(); handleSelectStudent(event.student); }} className="font-semibold text-indigo-600 hover:underline">
                                                    {event.student['Given Name']} {event.student['Family Name']}
                                                </a>
                                            ) : (
                                                <p className="font-semibold">{event.title}</p>
                                            )}
                                            <p className="text-xs text-gray-500 capitalize">{event.type === 'custom' ? event.customEvent?.type : event.title}</p>
                                            {event.type === 'custom' && event.customEvent?.description && (
                                                <p className="text-sm mt-1 text-gray-600">{event.customEvent.description}</p>
                                            )}
                                        </div>
                                        {event.type === 'custom' && event.customEvent && (
                                            <div className="flex gap-2 flex-shrink-0">
                                                <button onClick={() => openModal('edit-event', event.customEvent)} className="p-1 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100" title="Edit Event"><Edit size={16}/></button>
                                                <button onClick={() => handleDeleteEvent(event.customEvent!.id)} className="p-1 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100" title="Delete Event"><Trash2 size={16}/></button>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-gray-500 py-8">No events scheduled for this day.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventsPage;
