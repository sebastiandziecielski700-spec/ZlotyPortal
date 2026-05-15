import React, { ReactNode } from 'react';

interface ActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export function ActionModal({ isOpen, onClose, title, children }: ActionModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
            <div
                className="bg-white dark:bg-[#201214] w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-400 hover:text-[#c62a3a] dark:hover:text-red-400 transition-colors rounded-full hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
