"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface OlimpiadaInfo {
    title: string;
    id?: string;
}

type UserData = { user_id: string; name: string; surname: string; clase: string } | null;

interface Props {
    olimpiada: OlimpiadaInfo | null;
    onClose: () => void;
    onSuccess: (title: string, id?: string) => void;
    currentUser: UserData;
}

type Status = "idle" | "submitting" | "success" | "error";

export default function ModalRejestracjiOlimpiady({ olimpiada, onClose, onSuccess, currentUser }: Props) {
    const supabase = createClient();
    const [zgoda, setZgoda] = useState(false);
    const [status, setStatus] = useState<Status>("idle");
    const [errorMsg, setErrorMsg] = useState("");

    if (!olimpiada) return null;

    const resetAndClose = () => {
        setZgoda(false);
        setStatus("idle");
        setErrorMsg("");
        onClose();
    };

    const handleSubmit = async () => {
        if (!zgoda) { setErrorMsg("Zaznacz zgodę na przetwarzanie danych."); return; }
        if (!currentUser) { setErrorMsg("Musisz być zalogowany, aby się zapisać."); return; }
        setStatus("submitting");
        setErrorMsg("");

        try {
            const { error } = await supabase.from("olimpiady_zapisy").insert({
                user_id: currentUser.user_id,
                olimpiada_id: olimpiada.id ?? olimpiada.title,
                created_at: new Date().toISOString(),
            });

            if (error) {
                if (error.code === "23505") {
                    setErrorMsg("Już zapisałeś się na tę olimpiadę.");
                } else if (error.code === "23503") {
                    setErrorMsg("Błąd klucza obcego: Użytkownik testowy (debug) nie istnieje w auth.users! Zaloguj się normalnie.");
                } else {
                    console.error("Błąd zapisu olimpiady:", error);
                    setErrorMsg(`Wystąpił błąd: ${error.message || "Spróbuj ponownie"}`);
                }
                setStatus("error");
                return;
            }

            setStatus("success");
            setTimeout(() => {
                onSuccess(olimpiada.title, olimpiada.id);
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
                    <div className="size-11 rounded-full bg-gradient-to-br from-[#c62a3a] to-red-800 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-white text-[20px]">emoji_events</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight truncate">
                            {olimpiada.title}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                            Potwierdzenie rejestracji
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={resetAndClose}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                    {/* Podgląd */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="bg-gray-50 dark:bg-[#201214] px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Podgląd zgłoszenia</h4>
                        </div>
                        <div className="px-4 py-3 space-y-3">
                            <div className="flex justify-between items-start text-sm">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Olimpiada</span>
                                <span className="text-gray-900 dark:text-white font-semibold text-right max-w-[60%] leading-tight">{olimpiada.title}</span>
                            </div>
                            {currentUser ? (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 dark:text-gray-400 font-medium">Uczestnik</span>
                                    <span className="text-gray-900 dark:text-white font-semibold">{currentUser.name} {currentUser.surname}</span>
                                </div>
                            ) : (
                                <div className="text-red-600 dark:text-red-400 text-sm font-bold mt-2">
                                    Brak zalogowanego użytkownika! Zaloguj się.
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
                            Oświadczam, że zapoznałem/am się z regulaminem olimpiady i wyrażam zgodę na przetwarzanie moich danych przez organizatora.
                        </span>
                    </label>

                    {/* Success state */}
                    {isSuccess && (
                        <div className="flex flex-col items-center gap-3 py-4">
                            <div className="size-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-bounce">
                                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[32px]">check_circle</span>
                            </div>
                            <p className="text-green-700 dark:text-green-400 font-bold text-base">Zgłoszenie wysłane!</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Twoje zgłoszenie zostało zapisane w bazie danych.</p>
                        </div>
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
                            onClick={resetAndClose}
                            className="px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                            Anuluj
                        </button>
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
                                    Zatwierdź i Wyślij
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
