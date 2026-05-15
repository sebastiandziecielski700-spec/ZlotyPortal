"use client";

import { QrCodeDisplay } from "./QrCodeDisplay";
import { useRouter } from "next/navigation";

export default function StronaLogowania() {
    const router = useRouter();

    return (
        <div className="bg-[#f8f6f6] text-[#171212] min-h-screen flex flex-col relative overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 md:px-10 border-b border-solid border-slate-200 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-10 rounded-lg bg-[#c62a3a]/10 text-[#c62a3a]">
                        <span className="material-symbols-outlined text-2xl">school</span>
                    </div>
                    <h2 className="text-lg font-bold leading-tight tracking-tight">Złoty Portal</h2>
                </div>
                <button
                    type="button"
                    onClick={() => router.push("/logowanie/reczne")}
                    className="flex items-center justify-center gap-2 overflow-hidden rounded-lg h-9 px-4 bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-bold shadow-sm"
                >
                    <span className="material-symbols-outlined text-lg">help</span>
                    <span className="hidden sm:inline">Potrzebujesz pomocy?</span>
                </button>
            </header>

            {/* Main content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
                {/* Background blurs */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#c62a3a]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#c62a3a]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
                </div>

                <div className="w-full max-w-md relative z-10 flex flex-col items-center">
                    {/* ID Card Scanner Preview */}
                    <div className="mb-8 relative group cursor-default">
                        <div className="relative w-80 h-56 bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col items-center justify-center overflow-hidden">
                            <div
                                className="absolute inset-0 opacity-10"
                                style={{
                                    backgroundImage: "radial-gradient(#171212 1px, transparent 1px)",
                                    backgroundSize: "16px 16px",
                                }}
                            ></div>

                            {/* Fake ID card visual */}
                            <div className="relative w-48 h-32 bg-slate-50 rounded-lg shadow-md border border-slate-200 flex flex-col p-3 transform rotate-[-2deg] transition-transform duration-500 group-hover:rotate-0">
                                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                                    <div className="w-3 h-3 rounded-full bg-[#c62a3a]"></div>
                                    <div className="w-20 h-1.5 bg-slate-200 rounded-full"></div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-12 h-14 bg-slate-200 rounded-md"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="w-full h-2 bg-slate-200 rounded-full"></div>
                                        <div className="w-2/3 h-2 bg-slate-200 rounded-full"></div>
                                        <div className="w-3/4 h-2 bg-slate-200 rounded-full mt-2"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Scanning line animation */}
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#c62a3a] shadow-[0_0_20px_rgba(198,42,58,0.8)] z-20 animate-pulse"></div>

                            <div className="absolute inset-0 bg-gradient-to-b from-[#c62a3a]/5 via-transparent to-transparent pointer-events-none"></div>

                            {/* Decorative corner marks */}
                            <div className="absolute top-4 left-4 w-4 h-4 border-l-2 border-t-2 border-[#c62a3a]/40 rounded-tl-sm"></div>
                            <div className="absolute top-4 right-4 w-4 h-4 border-r-2 border-t-2 border-[#c62a3a]/40 rounded-tr-sm"></div>
                            <div className="absolute bottom-4 left-4 w-4 h-4 border-l-2 border-b-2 border-[#c62a3a]/40 rounded-bl-sm"></div>
                            <div className="absolute bottom-4 right-4 w-4 h-4 border-r-2 border-b-2 border-[#c62a3a]/40 rounded-br-sm"></div>
                        </div>

                        {/* Real QR Code Component */}
                        <div className="absolute -right-16 -bottom-10 md:-right-24 md:-bottom-12 z-30 transform scale-75 md:scale-100 rotate-2 hover:rotate-0 transition-transform duration-300">
                            <QrCodeDisplay />
                        </div>
                    </div>

                    {/* Text content */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#c62a3a]/5 border border-[#c62a3a]/10 mt-8">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c62a3a] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#c62a3a]"></span>
                            </span>
                            <p className="text-[#c62a3a] text-xs font-bold uppercase tracking-wider">Oczekiwanie na skan...</p>
                        </div>

                        <h1 className="text-[#171212] text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">
                            Zeskanuj legitymację szkolną<br />aby się zalogować
                        </h1>
                        <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed max-w-sm mx-auto">
                            Przytrzymaj legitymację nieruchomo przed skanerem lub użyj kodu QR.
                        </p>
                    </div>

                    {/* Manual login footer */}
                    <div className="mt-8">
                        <button
                            type="button"
                            onClick={() => router.push("/logowanie/reczne")}
                            className="group flex items-center gap-2 text-sm font-semibold text-[#c62a3a] hover:text-red-700 transition-colors"
                        >
                            <span className="border-b border-[#c62a3a]/30 group-hover:border-[#c62a3a] pb-0.5">
                                Problemy ze skanowaniem? Wpisz dane logowania
                            </span>
                            <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </main>

            {/* Security Footer */}
            <footer className="p-6">
                <div className="max-w-[960px] mx-auto">
                    <div className="border border-slate-200 bg-white rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center gap-4 shadow-sm">
                        <div className="shrink-0 text-slate-400">
                            <span className="material-symbols-outlined">lock</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs md:text-sm font-medium text-slate-800">
                                Dostęp zastrzeżony dla zarejestrowanych użytkowników.
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Połączenie jest szyfrowane i zabezpieczone biometrycznie.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}