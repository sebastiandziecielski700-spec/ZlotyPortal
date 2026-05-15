"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface StypendiumInfo {
    title: string;
    id?: string;
    amount?: string;
    org?: string;
}

type UserData = { user_id: string; name: string; surname: string; clase: string } | null;

interface Props {
    stypendium: StypendiumInfo | null;
    onClose: () => void;
    onSuccess: (title: string, id?: string) => void;
    currentUser: UserData;
}

type Status = "idle" | "submitting" | "success" | "error";

export default function ModalAplikacjiStypendium({ stypendium, onClose, onSuccess, currentUser }: Props) {
    const supabase = createClient();
    const [step, setStep] = useState<1 | 2>(1);
    const [motywacja, setMotywacja] = useState("");
    const [rachunek, setRachunek] = useState("");
    const [zgoda, setZgoda] = useState(false);
    const [status, setStatus] = useState<Status>("idle");
    const [errorMsg, setErrorMsg] = useState("");

    if (!stypendium) return null;

    const charCount = motywacja.trim().length;
    const MIN_CHARS = 50;

    const resetAndClose = () => {
        setStep(1);
        setMotywacja("");
        setRachunek("");
        setZgoda(false);
        setStatus("idle");
        setErrorMsg("");
        onClose();
    };

    const validateStep1 = () => {
        if (charCount < MIN_CHARS) {
            setErrorMsg(`Uzasadnienie musi mieć co najmniej ${MIN_CHARS} znaków (masz ${charCount}).`);
            return false;
        }
        setErrorMsg("");
        return true;
    };

    const handleSubmit = async () => {
        if (!zgoda) { setErrorMsg("Zaznacz zgodę na przetwarzanie danych."); return; }
        if (!currentUser) { setErrorMsg("Musisz być zalogowany, aby złożyć wniosek."); return; }
        setStatus("submitting");
        setErrorMsg("");

        try {
            const { error } = await supabase.from("stypendia_wnioski").insert({
                user_id: currentUser.user_id,
                stypendium_id: stypendium.id ?? stypendium.title,
                status: "zlozony",
                dane_wnioskodawcy: {
                    stypendium_tytul: stypendium.title,
                    motywacja: motywacja.trim(),
                    rachunek_bankowy: rachunek || undefined,
                    zgoda: true,
                },
                created_at: new Date().toISOString(),
            });

            if (error) {
                if (error.code === "23505") {
                    setErrorMsg("Już złożyłeś wniosek o to stypendium.");
                } else if (error.code === "23503") {
                    setErrorMsg("Błąd klucza obcego: Użytkownik testowy (debug) nie istnieje w auth.users! Zaloguj się normalnie.");
                } else {
                    console.error("Błąd zapisu stypendium:", error);
                    setErrorMsg(`Wystąpił błąd: ${error.message || "Spróbuj ponownie"}`);
                }
                setStatus("error");
                return;
            }

            setStatus("success");
            setTimeout(() => {
                onSuccess(stypendium.title, stypendium.id);
                resetAndClose();
            }, 1500);
        } catch {
            setErrorMsg("Brak połączenia z serwerem.");
            setStatus("error");
        }
    };

    const isSubmitting = status === "submitting";
    const isSuccess = status === "success";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div
                className="bg-white dark:bg-[#1a0f11] w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#201214] shrink-0">
                    <div className="size-11 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-white text-[20px]">school</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight truncate">
                            {stypendium.title}
                        </h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            {stypendium.amount && (
                                <span className="text-xs font-bold text-green-600 dark:text-green-400">{stypendium.amount}</span>
                            )}
                            {stypendium.org && (
                                <span className="text-xs text-gray-400 dark:text-gray-500">{stypendium.org}</span>
                            )}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={resetAndClose}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Step indicator */}
                <div className="flex px-6 pt-4 gap-2 shrink-0">
                    {[1, 2].map((s) => (
                        <div
                            key={s}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                step >= s ? "bg-[#c62a3a]" : "bg-gray-200 dark:bg-gray-700"
                            }`}
                        />
                    ))}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                    {step === 1 && (
                        <>
                            {/* Info banner */}
                            <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-xl">
                                <div className="flex items-start gap-2">
                                    <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[18px] mt-0.5 shrink-0">check_circle</span>
                                    <p className="text-sm text-green-700 dark:text-green-300">
                                        {currentUser
                                            ? <>Składasz wniosek jako: <span className="font-bold">{currentUser.name} {currentUser.surname}</span> ({currentUser.clase})</>
                                            : "Musisz być zalogowany, aby złożyć wniosek."
                                        }
                                    </p>
                                </div>
                            </div>

                            {/* Motywacja */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-semibold text-gray-900 dark:text-white">
                                        Uzasadnienie wniosku <span className="text-[#c62a3a]">*</span>
                                    </label>
                                    <span className={`text-xs font-medium tabular-nums ${charCount >= MIN_CHARS ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>
                                        {charCount}/{MIN_CHARS} min
                                    </span>
                                </div>
                                <textarea
                                    value={motywacja}
                                    onChange={(e) => { setMotywacja(e.target.value); if (errorMsg) setErrorMsg(""); }}
                                    rows={5}
                                    placeholder="Opisz, dlaczego ubiegasz się o to stypendium, jak zamierzasz wykorzystać środki i jakie są Twoje dotychczasowe osiągnięcia..."
                                    className="w-full p-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#201214] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#c62a3a]/20 focus:border-[#c62a3a] outline-none transition-all resize-none text-sm leading-relaxed"
                                />
                                {/* Progress bar */}
                                <div className="mt-1.5 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-300 ${charCount >= MIN_CHARS ? "bg-green-500" : "bg-[#c62a3a]"}`}
                                        style={{ width: `${Math.min((charCount / MIN_CHARS) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Rachunek bankowy */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                    Numer rachunku bankowego
                                    <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">(opcjonalnie)</span>
                                </label>
                                <input
                                    type="text"
                                    value={rachunek}
                                    onChange={(e) => setRachunek(e.target.value)}
                                    placeholder="PL00 0000 0000 0000 0000 0000 0000"
                                    className="w-full p-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#201214] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#c62a3a]/20 focus:border-[#c62a3a] outline-none transition-all text-sm font-mono"
                                />
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            {/* Podgląd */}
                            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="bg-gray-50 dark:bg-[#201214] px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Podgląd wniosku</h4>
                                </div>
                                <div className="px-4 py-3 space-y-3">
                                    <div className="flex justify-between items-start text-sm">
                                        <span className="text-gray-500 dark:text-gray-400 font-medium shrink-0">Stypendium</span>
                                        <span className="text-gray-900 dark:text-white font-semibold text-right ml-3 leading-tight">{stypendium.title}</span>
                                    </div>
                                    {stypendium.amount && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 dark:text-gray-400 font-medium">Kwota</span>
                                            <span className="text-green-600 dark:text-green-400 font-bold">{stypendium.amount}</span>
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-1 text-sm">
                                        <span className="text-gray-500 dark:text-gray-400 font-medium">Uzasadnienie</span>
                                        <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed bg-gray-50 dark:bg-[#1a0f11] rounded-lg p-2.5 line-clamp-4 border border-gray-200 dark:border-gray-800">
                                            {motywacja}
                                        </p>
                                    </div>
                                    {rachunek && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 dark:text-gray-400 font-medium">Rachunek</span>
                                            <span className="text-gray-700 dark:text-gray-300 font-mono text-xs">{rachunek}</span>
                                        </div>
                                    )}
                                    {currentUser && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 dark:text-gray-400 font-medium">Wnioskodawca</span>
                                            <span className="text-gray-900 dark:text-white font-semibold">{currentUser.name} {currentUser.surname}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* RODO */}
                            <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#201214] cursor-pointer group hover:border-[#c62a3a]/40 transition-colors">
                                <div className="relative flex items-center mt-0.5 shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={zgoda}
                                        onChange={(e) => setZgoda(e.target.checked)}
                                        className="peer size-4 appearance-none rounded border border-gray-300 dark:border-gray-600 checked:bg-[#c62a3a] checked:border-[#c62a3a] transition-all bg-white dark:bg-[#2d1b1e]"
                                    />
                                    <span className="absolute text-white opacity-0 peer-checked:opacity-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none material-symbols-outlined text-[12px]">check</span>
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors leading-relaxed">
                                    Oświadczam, że podane przeze mnie dane są zgodne z prawdą, a informacje o dochodach w profilu są aktualne na dzień złożenia wniosku.
                                </span>
                            </label>

                            {/* Success state */}
                            {isSuccess && (
                                <div className="flex flex-col items-center gap-3 py-4">
                                    <div className="size-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-bounce">
                                        <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[32px]">check_circle</span>
                                    </div>
                                    <p className="text-green-700 dark:text-green-400 font-bold text-base">Wniosek złożony!</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Twój wniosek został zapisany w bazie danych.</p>
                                </div>
                            )}
                        </>
                    )}

                    {/* Error */}
                    {errorMsg && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-xl text-sm text-red-700 dark:text-red-400">
                            <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
                            {errorMsg}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!isSuccess && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-between gap-3 bg-gray-50/50 dark:bg-[#201214]/50 shrink-0">
                        <button
                            type="button"
                            onClick={step === 1 ? resetAndClose : () => { setStep(1); setErrorMsg(""); }}
                            className="px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                            {step === 1 ? "Anuluj" : "Wstecz"}
                        </button>
                        {step === 1 ? (
                            <button
                                type="button"
                                onClick={() => { if (validateStep1()) setStep(2); }}
                                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-[#c62a3a] hover:bg-red-700 text-white rounded-xl transition-all shadow-md shadow-[#c62a3a]/20"
                            >
                                <span>Dalej</span>
                                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all shadow-md ${
                                    isSubmitting
                                        ? "bg-gray-400 text-white cursor-not-allowed"
                                        : "bg-[#c62a3a] hover:bg-red-700 text-white shadow-[#c62a3a]/20"
                                }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Wysyłanie...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[16px]">send</span>
                                        Złóż Wniosek
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
