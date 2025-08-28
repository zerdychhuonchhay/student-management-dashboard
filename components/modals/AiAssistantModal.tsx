
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import Modal from './Modal';

const AiAssistantModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { aiChatHistory, isAiLoading, handleAiQuery } = useAppContext();
    const [input, setInput] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Scroll to the bottom of the chat history when a new message appears
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [aiChatHistory]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isAiLoading) {
            handleAiQuery(input);
            setInput('');
        }
    };

    return (
        <Modal title="AI Assistant" onClose={onClose} maxWidth="max-w-2xl">
            <div className="flex flex-col h-[60vh]">
                <div ref={chatContainerRef} className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-4">
                    {aiChatHistory.map((msg, index) => (
                        <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && (
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-5 h-5 text-purple-600" />
                                </div>
                            )}
                            <div className={`p-3 rounded-lg max-w-md ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                             {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                    <User className="w-5 h-5 text-indigo-600" />
                                </div>
                            )}
                        </div>
                    ))}
                    {isAiLoading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="p-3 rounded-lg bg-gray-100 text-gray-800 flex items-center">
                                <Loader className="w-5 h-5 animate-spin text-purple-600" />
                                <span className="ml-2">Thinking...</span>
                            </div>
                        </div>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="mt-4 flex gap-2 border-t pt-4">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your students..."
                        className="flex-grow p-2 border rounded-md w-full bg-white"
                        disabled={isAiLoading}
                    />
                    <button
                        type="submit"
                        disabled={isAiLoading || !input.trim()}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center"
                    >
                        <Send size={16} />
                    </button>
                </form>
            </div>
        </Modal>
    );
};

export default AiAssistantModal;
