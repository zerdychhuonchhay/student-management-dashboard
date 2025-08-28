
import React from 'react';
import { AppProvider } from './context/AppContext';
import AppContent from './components/AppContent';

export default function App() {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
}
