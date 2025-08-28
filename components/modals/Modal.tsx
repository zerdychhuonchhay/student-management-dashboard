
import React, { useRef } from 'react';
import { X } from 'lucide-react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';

interface ModalProps {
    children: React.ReactNode;
    title: string;
    onClose: () => void;
    maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({ children, title, onClose, maxWidth = 'max-w-3xl' }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    useOnClickOutside(modalRef, onClose);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-40 backdrop-blur p-4">
            <div ref={modalRef} className={`bg-white rounded-lg shadow-xl w-full ${maxWidth} max-h-[90vh] flex flex-col`}>
                <header className="p-4 border-b flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl font-bold">{title}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><X /></button>
                </header>
                <main className="p-6 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
};

export default Modal;
