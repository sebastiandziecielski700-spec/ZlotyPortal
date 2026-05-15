import React from 'react';

interface ModalPotwierdzeniaProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    tytul: string;
    opis: string;
    isDeleting?: boolean;
}

export function ModalPotwierdzenia({ isOpen, onClose, onConfirm, tytul, opis, isDeleting = false }: ModalPotwierdzeniaProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
            <div 
                className="bg-white dark:bg-[#201214] w-full max-w-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col p-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute top-4 right-4">
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-gray-50 dark:bg-gray-800 p-1.5 rounded-full"
                    >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
                
                <div className="flex flex-col items-center text-center mt-2 mb-6">
                    <div className="size-16 rounded-full bg-red-100 dark:bg-red-900/20 text-[#c62a3a] flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-3xl">warning</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{tytul}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{opis}</p>
                </div>

                <div className="flex gap-3 mt-auto">
                    <button 
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 py-2.5 font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm disabled:opacity-50"
                    >
                        Anuluj
                    </button>
                    <button 
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 py-2.5 font-bold text-white bg-[#c62a3a] hover:bg-red-700 rounded-lg transition-colors shadow-sm text-sm flex justify-center items-center disabled:opacity-50"
                    >
                        {isDeleting ? "Usuwanie..." : "Tak, usuń"}
                    </button>
                </div>
            </div>
        </div>
    );
}
