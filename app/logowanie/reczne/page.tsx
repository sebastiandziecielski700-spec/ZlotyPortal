"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function ManualLoginPage() {
    const router = useRouter();
    const [imieNazwisko, setImieNazwisko] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Symulacja logowania za pomocą wpisanego imienia i nazwiska
        const [imie, ...reszta] = imieNazwisko.trim().split(" ");
        const nazwisko = reszta.join(" ") || "Użytkownik";

        const debugUser = {
            user_id: "fake-user-id-" + Date.now(),
            name: imie || "Jan",
            surname: nazwisko,
            clase: "Uczeń",
            role: "uczen"
        };

        localStorage.setItem("zloty_debug_user", JSON.stringify(debugUser));
        router.push("/");
        router.refresh();
    };

    return (
        <div className="bg-[#f8f6f6] text-[#171212] min-h-screen flex flex-col relative overflow-hidden">
            <header className="flex items-center justify-between px-6 py-4 md:px-10 border-b border-solid border-slate-200 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-10 rounded-lg bg-[#c62a3a]/10 text-[#c62a3a]">
                        <span className="material-symbols-outlined text-2xl">school</span>
                    </div>
                    <h2 className="text-lg font-bold leading-tight tracking-tight">Złoty Portal</h2>
                </div>
                <button
                    type="button"
                    onClick={() => router.push("/logowanie")}
                    className="flex items-center justify-center gap-2 overflow-hidden rounded-lg h-9 px-4 bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-bold shadow-sm"
                >
                    <span className="material-symbols-outlined text-lg">qr_code_scanner</span>
                    <span className="hidden sm:inline">Wróć do skanera</span>
                </button>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#c62a3a]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                </div>

                <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-200 relative z-10">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-extrabold tracking-tight mb-2">Zaloguj się</h1>
                        <p className="text-sm text-slate-500">Wpisz email oraz hasło swojego konta w portalu.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold mb-1.5 text-slate-700">Imię i Nazwisko</label>
                            <input
                                type="text"
                                value={imieNazwisko}
                                onChange={(e) => setImieNazwisko(e.target.value)}
                                className="w-full h-11 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#c62a3a]/50 focus:border-[#c62a3a] outline-none transition-all"
                                placeholder="Jan Kowalski"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-11 bg-[#c62a3a] text-white rounded-lg font-bold hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? "Logowanie..." : "Zaloguj"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
