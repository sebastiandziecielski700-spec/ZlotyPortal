"use client";

import { useState } from "react";

export type UserProfile = {
    subjects: string[];
    ambition: string;
    weeklyTime: string;
    learningStyle: string[];
    hasExperience: boolean;
    completedAt: string;
};

const SUBJECTS = [
    "Matematyka", "Fizyka", "Chemia", "Biologia",
    "Informatyka", "Polski", "Angielski", "Historia",
    "Geografia", "WOS",
];

const LEARNING_STYLES = ["Teoria", "Zadania praktyczne", "Eksperymenty"];

const AMBITION_LEVELS = [
    { value: "Chcę spróbować", icon: "🌱", desc: "Sprawdzam się po raz pierwszy" },
    { value: "Zależy mi na wynikach", icon: "🎯", desc: "Chcę się dostać do finału" },
    { value: "Chcę wygrać", icon: "🏆", desc: "Cel to tytuł laureata" },
];

const WEEKLY_TIME = ["<2h", "2–5h", "5–10h", "10h+"];

type Props = {
    onComplete: (profile: UserProfile) => void;
};

export default function ProfilerUsera({ onComplete }: Props) {
    const [step, setStep] = useState(0);
    const [subjects, setSubjects] = useState<string[]>([]);
    const [ambition, setAmbition] = useState("");
    const [weeklyTime, setWeeklyTime] = useState("");
    const [learningStyle, setLearningStyle] = useState<string[]>([]);
    const [hasExperience, setHasExperience] = useState<boolean | null>(null);

    const toggleChip = <T extends string>(
        list: T[],
        setList: (v: T[]) => void,
        value: T
    ) => {
        setList(list.includes(value)
            ? list.filter((x) => x !== value)
            : [...list, value]);
    };

    const canNext = [
        subjects.length > 0,
        ambition !== "" && learningStyle.length > 0,
        weeklyTime !== "" && hasExperience !== null,
    ];

    const handleFinish = async () => {
        const profile: UserProfile = {
            subjects,
            ambition,
            weeklyTime,
            learningStyle,
            hasExperience: hasExperience!,
            completedAt: new Date().toISOString(),
        };
        
        try {
            await fetch('/api/user-profile', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile) 
            });
        } catch (err) {
            console.error("Failed to sync profile:", err);
        }

        localStorage.setItem("zloty_user_profile", JSON.stringify(profile));
        localStorage.setItem("zloty_onboarded", "true");
        onComplete(profile);
    };

    const ChipBtn = ({
        label, active, onClick,
    }: { label: string; active: boolean; onClick: () => void }) => (
        <button
            type="button"
            onClick={onClick}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                active
                    ? "bg-[#c62a3a] border-[#c62a3a] text-white shadow-sm"
                    : "bg-white dark:bg-[#2d1b1e] border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 hover:border-[#c62a3a] hover:text-[#c62a3a]"
            }`}
        >
            {label}
        </button>
    );

    const steps = [
        /* ── KROK 1: Przedmioty ── */
        <div key="step1" className="flex flex-col gap-6">
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    Jakie przedmioty lubisz najbardziej?
                </h3>
                <p className="text-sm text-slate-500 dark:text-gray-400">
                    Wybierz wszystkie, które Cię interesują — im więcej, tym lepsze rekomendacje.
                </p>
            </div>
            <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((s) => (
                    <ChipBtn
                        key={s}
                        label={s}
                        active={subjects.includes(s)}
                        onClick={() => toggleChip(subjects, setSubjects, s)}
                    />
                ))}
            </div>
        </div>,

        /* ── KROK 2: Styl + Ambicja ── */
        <div key="step2" className="flex flex-col gap-6">
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    Jak lubisz się uczyć?
                </h3>
                <p className="text-sm text-slate-500 dark:text-gray-400">Wybierz swój styl.</p>
                <div className="flex flex-wrap gap-2 mt-3">
                    {LEARNING_STYLES.map((s) => (
                        <ChipBtn
                            key={s}
                            label={s}
                            active={learningStyle.includes(s)}
                            onClick={() => toggleChip(learningStyle, setLearningStyle, s)}
                        />
                    ))}
                </div>
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    Jaki jest Twój cel?
                </h3>
                <p className="text-sm text-slate-500 dark:text-gray-400">Bądź szczery — to pomoże w dopasowaniu olimpiad.</p>
                <div className="flex flex-col gap-3 mt-3">
                    {AMBITION_LEVELS.map((a) => (
                        <button
                            type="button"
                            key={a.value}
                            onClick={() => setAmbition(a.value)}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                                ambition === a.value
                                    ? "border-[#c62a3a] bg-red-50 dark:bg-red-900/10"
                                    : "border-slate-200 dark:border-gray-700 bg-white dark:bg-[#2d1b1e] hover:border-slate-300 dark:hover:border-gray-600"
                            }`}
                        >
                            <span className="text-2xl">{a.icon}</span>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white text-sm">{a.value}</p>
                                <p className="text-xs text-slate-500 dark:text-gray-400">{a.desc}</p>
                            </div>
                            {ambition === a.value && (
                                <span className="material-symbols-outlined ml-auto text-[#c62a3a]">check_circle</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>,

        /* ── KROK 3: Czas + Doświadczenie ── */
        <div key="step3" className="flex flex-col gap-6">
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    Ile czasu możesz poświęcić tygodniowo?
                </h3>
                <p className="text-sm text-slate-500 dark:text-gray-400">Na przygotowania do olimpiady.</p>
                <div className="flex gap-2 flex-wrap mt-3">
                    {WEEKLY_TIME.map((t) => (
                        <button
                            type="button"
                            key={t}
                            onClick={() => setWeeklyTime(t)}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm border-2 transition-all duration-200 ${
                                weeklyTime === t
                                    ? "bg-[#c62a3a] border-[#c62a3a] text-white shadow-md"
                                    : "border-slate-200 dark:border-gray-700 bg-white dark:bg-[#2d1b1e] text-slate-600 dark:text-gray-300 hover:border-[#c62a3a] hover:text-[#c62a3a]"
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    Czy brałeś/aś udział w olimpiadzie wcześniej?
                </h3>
                <div className="flex gap-3 mt-3">
                    {[
                        { label: "Tak, mam doświadczenie", value: true, icon: "🎖️" },
                        { label: "Nie, to mój debiut", value: false, icon: "🚀" },
                    ].map((opt) => (
                        <button
                            type="button"
                            key={String(opt.value)}
                            onClick={() => setHasExperience(opt.value)}
                            className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 font-medium text-sm transition-all duration-200 ${
                                hasExperience === opt.value
                                    ? "border-[#c62a3a] bg-red-50 dark:bg-red-900/10 text-[#c62a3a]"
                                    : "border-slate-200 dark:border-gray-700 bg-white dark:bg-[#2d1b1e] text-slate-600 dark:text-gray-300 hover:border-slate-300"
                            }`}
                        >
                            <span className="text-2xl">{opt.icon}</span>
                            <span>{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>,
    ];

    return (
        /* Backdrop */
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-white dark:bg-[#201214] rounded-2xl shadow-2xl overflow-hidden animate-[fadeSlideUp_0.3s_ease_forwards]">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-[#c62a3a] to-red-700 p-6 text-white">
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20">
                        <span className="material-symbols-outlined text-[80px]">emoji_events</span>
                    </div>
                    <p className="text-red-200 text-xs font-semibold uppercase tracking-wider mb-1">
                        Krok {step + 1} z 3
                    </p>
                    <h2 className="text-xl font-extrabold">Skonfiguruj swój profil</h2>
                    <p className="text-red-100 text-sm mt-1">
                        Kilka pytań, żeby dopasować olimpiady idealne dla Ciebie.
                    </p>
                    {/* Progress bar */}
                    <div className="mt-4 bg-red-900/30 rounded-full h-1.5 w-full">
                        <div
                            className="bg-white h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${((step + 1) / 3) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 min-h-[280px]">
                    {steps[step]}
                </div>

                {/* Footer nav */}
                <div className="px-6 pb-6 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => setStep((s) => s - 1)}
                        disabled={step === 0}
                        className="px-4 py-2.5 text-sm font-medium text-slate-500 dark:text-gray-400 hover:text-[#c62a3a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        ← Wstecz
                    </button>

                    {step < 2 ? (
                        <button
                            type="button"
                            onClick={() => setStep((s) => s + 1)}
                            disabled={!canNext[step]}
                            className="ml-auto px-6 py-2.5 bg-[#c62a3a] hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-[#c62a3a]/20"
                        >
                            Dalej →
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleFinish}
                            disabled={!canNext[2]}
                            className="ml-auto flex items-center gap-2 px-6 py-2.5 bg-[#c62a3a] hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-[#c62a3a]/20"
                        >
                            <span className="material-symbols-outlined text-[18px]">check</span>
                            Gotowe!
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
