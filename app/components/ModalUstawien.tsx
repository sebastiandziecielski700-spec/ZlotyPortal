"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface PropsModalUstawien {
    otwarte: boolean;
    zamknij: () => void;
}

export default function ModalUstawien({ otwarte, zamknij }: PropsModalUstawien) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const motyw = mounted ? theme : "light";
    const przelaczMotyw = () => setTheme(theme === "dark" ? "light" : "dark");

    const [debugUser, setDebugUser] = useState<any>(null);

    useEffect(() => {
        if (mounted) {
            const raw = localStorage.getItem("zloty_debug_user");
            if (raw) setDebugUser(JSON.parse(raw));
        }
    }, [mounted]);

    const zalogujJako = async (user_id: string, name: string, surname: string, clase: string) => {
        const testUser = { user_id, name, surname, clase };
        localStorage.setItem("zloty_debug_user", JSON.stringify(testUser));
        setDebugUser(testUser);

        const supabase = createClient();
        await supabase.from("users").upsert({
            user_id: testUser.user_id,
            name: testUser.name,
            surename: testUser.surname,
            clase: testUser.clase
        }, { onConflict: "user_id" });
    };

    const wyczyscDebugUsera = () => {
        localStorage.removeItem("zloty_debug_user");
        setDebugUser(null);
    };

    if (!otwarte) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
                onClick={zamknij}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="bg-white dark:bg-[#2d1b1e] rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto border border-gray-200 dark:border-gray-700 animate-[modalIn_0.2s_ease-out]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-[#c62a3a]/10 flex items-center justify-center text-[#c62a3a]">
                                <span className="material-symbols-outlined">settings</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Ustawienia</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Dostosuj portal do swoich preferencji</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={zamknij}
                            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Wygląd */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px] text-gray-500 dark:text-gray-400">palette</span>
                                <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Wygląd</h3>
                            </div>

                            {/* Dark mode toggle */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#201214] rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-gray-600 dark:text-yellow-400">
                                            {motyw === "dark" ? "dark_mode" : "light_mode"}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Tryb ciemny</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {motyw === "dark" ? "Aktywny" : "Nieaktywny"}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={przelaczMotyw}
                                    className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${motyw === "dark"
                                            ? "bg-[#c62a3a]"
                                            : "bg-gray-300"
                                        }`}
                                >
                                    <span
                                        className={`absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center ${motyw === "dark" ? "translate-x-5" : "translate-x-0"
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-[14px] text-gray-600">
                                            {motyw === "dark" ? "dark_mode" : "light_mode"}
                                        </span>
                                    </span>
                                </button>
                            </div>

                            {/* Theme preview */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => { if (motyw === "dark") przelaczMotyw(); }}
                                    className={`relative p-3 rounded-xl border-2 transition-all ${motyw === "light"
                                            ? "border-[#c62a3a] bg-white shadow-md"
                                            : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] hover:border-gray-300 dark:hover:border-gray-500"
                                        }`}
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-full h-12 rounded-lg bg-white border border-gray-200 flex items-center p-2 gap-1.5">
                                            <div className="w-1.5 h-8 rounded-sm bg-gray-200"></div>
                                            <div className="flex-1 space-y-1">
                                                <div className="h-1.5 w-full bg-gray-100 rounded"></div>
                                                <div className="h-1.5 w-3/4 bg-gray-100 rounded"></div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Jasny</span>
                                    </div>
                                    {motyw === "light" && (
                                        <div className="absolute -top-1.5 -right-1.5 size-5 bg-[#c62a3a] rounded-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-white text-[14px]">check</span>
                                        </div>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => { if (motyw === "light") przelaczMotyw(); }}
                                    className={`relative p-3 rounded-xl border-2 transition-all ${motyw === "dark"
                                            ? "border-[#c62a3a] bg-[#201214] shadow-md"
                                            : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] hover:border-gray-300 dark:hover:border-gray-500"
                                        }`}
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-full h-12 rounded-lg bg-[#201214] border border-gray-700 flex items-center p-2 gap-1.5">
                                            <div className="w-1.5 h-8 rounded-sm bg-gray-700"></div>
                                            <div className="flex-1 space-y-1">
                                                <div className="h-1.5 w-full bg-gray-700 rounded"></div>
                                                <div className="h-1.5 w-3/4 bg-gray-700 rounded"></div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Ciemny</span>
                                    </div>
                                    {motyw === "dark" && (
                                        <div className="absolute -top-1.5 -right-1.5 size-5 bg-[#c62a3a] rounded-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-white text-[14px]">check</span>
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>


                        {/* Język */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px] text-gray-500 dark:text-gray-400">language</span>
                                <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Język</h3>
                            </div>
                            <select className="w-full p-3 bg-gray-50 dark:bg-[#201214] border-none rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-[#c62a3a]/20">
                                <option>🇵🇱 Polski</option>
                                <option>🇬🇧 English</option>
                            </select>
                        </div>
                        {/* DEBUG — do usunięcia */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px] text-orange-500">bug_report</span>
                                <h3 className="text-sm font-bold text-orange-500 uppercase tracking-wider">Debug (tymczasowe)</h3>
                            </div>
                            <div className="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/40 rounded-xl space-y-3">
                                {debugUser ? (
                                    <>
                                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                            <span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span>
                                            <span>Zalogowany jako: <strong>{debugUser.name} {debugUser.surname}</strong> ({debugUser.clase})</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={wyczyscDebugUsera}
                                            className="w-full py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            Wyloguj debug usera
                                        </button>
                                    </>
                                ) : (
                                    <div className="space-y-2">
                                        <button
                                            type="button"
                                            onClick={() => zalogujJako("746456b3-63b8-4639-8f49-7d5d0c18f161", "Sebastian", "Dzięcielski", "3B")}
                                            className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">login</span>
                                            Zaloguj jako Sebastian (3B)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => zalogujJako("abbd4cc8-ac97-4b21-87a9-6cfab3f2452c", "Michał", "Czarnek", "3B")}
                                            className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">login</span>
                                            Zaloguj jako Michał (3B)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => zalogujJako("d39fd0f8-285e-42f4-bcab-5f3b09c0a87e", "alan", "kow", "3A")}
                                            className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">login</span>
                                            Zaloguj jako Alan (3A)
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <p className="text-xs text-gray-400 dark:text-gray-500">Złoty Portal v1.0</p>
                        <button
                            type="button"
                            onClick={zamknij}
                            className="px-5 py-2.5 bg-[#c62a3a] hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
                        >
                            Gotowe
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
