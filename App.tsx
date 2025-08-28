import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import AppContent from './components/AppContent';
import LoginPage from './pages/LoginPage';

const AppShell: React.FC = () => {
    const { currentUser } = useAppContext();
    return currentUser ? <AppContent /> : <LoginPage />;
}

export default function App() {
    return (
        <AppProvider>
            <AppShell />
        </AppProvider>
    );
}