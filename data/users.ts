import type { User } from '../types';

export const initialUsers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'password123',
    role: 'Admin',
  },
  {
    id: '2',
    email: 'teacher@example.com',
    password: 'password123',
    role: 'Teacher',
  },
];