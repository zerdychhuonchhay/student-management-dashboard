
import type { Event } from '../types';

export const initialEvents: Event[] = [
    {
        id: '1',
        title: 'Summer Holiday Begins',
        date: '2024-07-20',
        type: 'Holiday',
        description: 'All schools are closed for the summer break.'
    },
    {
        id: '2',
        title: 'New School Year Starts',
        date: '2024-09-02',
        type: 'School Event',
        description: 'First day of the 2024-2025 academic year.'
    },
     {
        id: '3',
        title: 'Teacher Training Day',
        date: '2024-10-10',
        type: 'Staff Meeting',
        description: 'Professional development day for all staff. No classes for students.'
    }
];
