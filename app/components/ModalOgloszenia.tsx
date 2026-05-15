"use client";

import React, { useEffect } from "react";

export interface OgloszenieSzczegoly {
    id: number | string;
    tytul: string;
    tresc: string;
    priorytet?: string;
    tagColor?: string;
    autor: string;
    dataPublikacji: string;
}

interface Props {
    ogloszenie: OgloszenieSzczegoly | null;
    onClose: () => void;
}

export default function ModalOgloszenia({ ogloszenie, onClose }: Props) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    if (!ogloszenie) return null;

    const getBadgeStyling = () => {
        const p = ogloszenie.priorytet?.toLowerCase() || "";
        const c = ogloszenie.tagColor || "blue";

        if (p === "pilne" || c === "red") return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800";
        if (p === "ważne" || c === "amber") return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800";
        if (c === "emerald") return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800";
        if (c === "indigo") return "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800";
        if (c === "purple") return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800";
        
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800";
    };

    const getDotStyling = () => {
        const p = ogloszenie.priorytet?.toLowerCase() || "";
        const c = ogloszenie.tagColor || "blue";

        if (p === "pilne" || c === "red") return "bg-red-500";
        if (p === "ważne" || c === "amber") return "bg-amber-500";
        if (c === "emerald") return "bg-emerald-500";
        if (c === "indigo") return "bg-indigo-500";
        if (c === "purple") return "bg-purple-500";

        return "bg-blue-400";
    };

    const hasPriority = !!ogloszenie.priorytet || !!ogloszenie.tagColor;
    const label = ogloszenie.priorytet 
        ? ogloszenie.priorytet.charAt(0).toUpperCase() + ogloszenie.priorytet.slice(1) 
        : (ogloszenie.tagColor ? "Ogłoszenie" : "Informacja");

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-[#1a0f11] w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Actions */}
                <div className="flex justify-end p-4 pb-0 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors focus:outline-none"
                        aria-label="Zamknij"
                    >
                        <span className="material-symbols-outlined text-[24px]">close</span>
                    </button>
                </div>

                {/* Content Header */}
                <div className="px-6 sm:px-10 pb-6 shrink-0 border-b border-gray-200 dark:border-gray-800">
                    {hasPriority && (
                        <div className="mb-4 flex">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${getBadgeStyling()}`}>
                                <span className={`size-1.5 rounded-full ${getDotStyling()}`} />
                                {label}
                            </span>
                        </div>
                    )}
                    
                    <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
                        {ogloszenie.tytul}
                    </h2>
                    
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                            <div className="size-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[16px] text-gray-600 dark:text-gray-300">person</span>
                            </div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{ogloszenie.autor}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                            <span>{ogloszenie.dataPublikacji}</span>
                        </div>
                    </div>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-10 hide-scrollbar">
                    <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {ogloszenie.tresc}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 sm:px-10 py-5 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#201214]/50 shrink-0 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold rounded-xl hover:opacity-90 transition-opacity shadow-sm outline-none"
                    >
                        Zamknij
                    </button>
                </div>
            </div>
        </div>
    );
}
