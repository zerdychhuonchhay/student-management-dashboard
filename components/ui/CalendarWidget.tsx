
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarWidgetProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    eventDates: Set<string>;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ selectedDate, onDateSelect, eventDates }) => {
    const [viewDate, setViewDate] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

    const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    
    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newYear = parseInt(e.target.value, 10);
        setViewDate(new Date(newYear, viewDate.getMonth(), 1));
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMonth = parseInt(e.target.value, 10);
        setViewDate(new Date(viewDate.getFullYear(), newMonth, 1));
    };

    const currentMonth = viewDate.getMonth();
    const currentYear = viewDate.getFullYear();

    const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const today = new Date();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`empty-${i}`} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(currentYear, currentMonth, day);
        const isToday = today.toDateString() === currentDate.toDateString();
        const isSelected = selectedDate.toDateString() === currentDate.toDateString();
        
        // Adjust for timezone offset before getting the ISO string
        const tzoffset = currentDate.getTimezoneOffset() * 60000;
        const localISOTime = new Date(currentDate.getTime() - tzoffset).toISOString().split('T')[0];
        const hasEvent = eventDates.has(localISOTime);

        days.push(
            <div key={day} className="relative flex justify-center items-center">
                <button
                    onClick={() => onDateSelect(currentDate)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                        isSelected ? 'bg-indigo-600 text-white font-semibold' :
                        isToday ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'
                    }`}
                    aria-label={`Select date ${day}`}
                    aria-pressed={isSelected}
                >
                    {day}
                </button>
                {hasEvent && !isSelected && <div className="absolute bottom-1 w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>}
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-gray-100" aria-label="Previous month"><ChevronLeft size={20}/></button>
                
                <div className="flex gap-2">
                    <select
                        value={currentMonth}
                        onChange={handleMonthChange}
                        className="text-lg font-semibold bg-gray-50 border border-gray-200 rounded-md p-1 focus:ring-2 focus:ring-indigo-200 cursor-pointer"
                        aria-label="Select month"
                    >
                        {months.map((m, i) => (
                            <option key={i} value={i}>{m}</option>
                        ))}
                    </select>
                    <select
                        value={currentYear}
                        onChange={handleYearChange}
                        className="text-lg font-semibold bg-gray-50 border border-gray-200 rounded-md p-1 focus:ring-2 focus:ring-indigo-200 cursor-pointer"
                        aria-label="Select year"
                    >
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-gray-100" aria-label="Next month"><ChevronRight size={20}/></button>
            </div>
            <div className="grid grid-cols-7 gap-y-2 text-sm text-center text-gray-500 font-medium" aria-hidden="true">
                <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
            </div>
            <div className="grid grid-cols-7 gap-y-2 mt-2">
                {days}
            </div>
        </div>
    );
};

export default CalendarWidget;
