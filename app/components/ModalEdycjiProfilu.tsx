"use client";

import { useEffect, useState } from "react";
import { UserProfile } from "./ProfilerUsera";

const SUBJECTS = [
    "Matematyka", "Fizyka", "Chemia", "Biologia",
    "Informatyka", "Polski", "Angielski", "Historia",
    "Geografia", "WOS",
];
const LEARNING_STYLES = ["Teoria", "Zadania praktyczne", "Eksperymenty"];
const AMBITION_LEVELS = [
    { value: "Chcę spróbować", icon: "🌱" },
    { value: "Zależy mi na wynikach", icon: "🎯" },
    { value: "Chcę wygrać", icon: "🏆" },
];
const WEEKLY_TIME = ["<2h", "2–5h", "5–10h", "10h+"];

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

export default function ModalEdycjiProfilu({ isOpen, onClose }: Props) {
    const [subjects, setSubjects] = useState<string[]>([]);
    const [ambition, setAmbition] = useState("");
    const [weeklyTime, setWeeklyTime] = useState("");
    const [learningStyle, setLearningStyle] = useState<string[]>([]);
    const [hasExperience, setHasExperience] = useState<boolean | null>(null);
    const [saved, setSaved] = useState(false);

    // Load existing profile from DB or fallback to localStorage when modal opens
    useEffect(() => {
        if (!isOpen) return;
        setSaved(false);
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/user-profile');
                if (res.ok) {
                    const data = await res.json();
                    if (data.profile) {
                        const p = data.profile;
                        setSubjects(p.subjects ?? []);
                        setAmbition(p.ambition ?? "");
                        setWeeklyTime(p.weeklyTime ?? "");
                        setLearningStyle(p.learningStyle ?? []);
                        setHasExperience(p.hasExperience ?? null);
                        // Update cache
                        localStorage.setItem("zloty_user_profile", JSON.stringify(p));
                        return;
                    }
                }
            } catch (err) {
                console.error("DB fetch failed, using local cache", err);
            }

            try {
                const raw = localStorage.getItem("zloty_user_profile");
                if (raw) {
                    const p: UserProfile = JSON.parse(raw);
                    setSubjects(p.subjects ?? []);
                    setAmbition(p.ambition ?? "");
                    setWeeklyTime(p.weeklyTime ?? "");
                    setLearningStyle(p.learningStyle ?? []);
                    setHasExperience(p.hasExperience ?? null);
                }
            } catch { /* ignore */ }
        };
        fetchProfile();
    }, [isOpen]);

    const toggle = (list: string[], setList: (v: string[]) => void, val: string) =>
        setList(list.includes(val) ? list.filter(x => x !== val) : [...list, val]);

    const handleSave = async () => {
        const profile: UserProfile = {
            subjects, ambition, weeklyTime, learningStyle,
            hasExperience: hasExperience ?? false,
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
        setSaved(true);
        setTimeout(() => onClose(), 900);
    };

    if (!isOpen) return null;

    const Chip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
        <button
            type="button"
            onClick={onClick}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
                active
                    ? "bg-[#c62a3a] border-[#c62a3a] text-white"
                    : "bg-transparent border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-[#c62a3a] hover:text-[#c62a3a]"
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-xl bg-white dark:bg-[#1a0f11] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">

                {/* ── Header ── */}
                <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#201214]">
                    {/* Avatar */}
                    <div className="size-12 rounded-full bg-gradient-to-br from-[#c62a3a] to-red-800 flex items-center justify-center text-white font-black text-lg shrink-0">
                        A
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-extrabold text-gray-900 dark:text-white leading-tight">
                            Profil naukowy
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-gray-400">
                            Twoje preferencje wpływają na rekomendacje olimpiad
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* ── Body ── */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                    {/* Przedmioty */}
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-[#c62a3a] text-[18px]">menu_book</span>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Ulubione przedmioty</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {SUBJECTS.map(s => (
                                <Chip key={s} label={s} active={subjects.includes(s)}
                                    onClick={() => toggle(subjects, setSubjects, s)} />
                            ))}
                        </div>
                    </section>

                    <hr className="border-gray-200 dark:border-gray-800" />

                    {/* Ambicja */}
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-[#c62a3a] text-[18px]">emoji_events</span>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Twój cel</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {AMBITION_LEVELS.map(a => (
                                <button
                                    key={a.value}
                                    type="button"
                                    onClick={() => setAmbition(a.value)}
                                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-center transition-all duration-150 ${
                                        ambition === a.value
                                            ? "border-[#c62a3a] bg-red-50 dark:bg-red-900/15"
                                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-[#2d1b1e]"
                                    }`}
                                >
                                    <span className="text-xl">{a.icon}</span>
                                    <span className={`text-[11px] font-semibold leading-tight ${ambition === a.value ? "text-[#c62a3a]" : "text-gray-600 dark:text-gray-300"}`}>
                                        {a.value}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <hr className="border-gray-200 dark:border-gray-800" />

                    {/* Styl + czas w jednym rzędzie */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Styl nauki */}
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-[#c62a3a] text-[18px]">psychology</span>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Styl nauki</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {LEARNING_STYLES.map(s => (
                                    <Chip key={s} label={s} active={learningStyle.includes(s)}
                                        onClick={() => toggle(learningStyle, setLearningStyle, s)} />
                                ))}
                            </div>
                        </section>

                        {/* Czas */}
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-[#c62a3a] text-[18px]">schedule</span>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Czas / tydzień</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {WEEKLY_TIME.map(t => (
                                    <Chip key={t} label={t} active={weeklyTime === t}
                                        onClick={() => setWeeklyTime(t)} />
                                ))}
                            </div>
                        </section>
                    </div>

                    <hr className="border-gray-200 dark:border-gray-800" />

                    {/* Doświadczenie */}
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-[#c62a3a] text-[18px]">military_tech</span>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Doświadczenie</h3>
                        </div>
                        <div className="flex gap-3">
                            {[
                                { label: "🎖️ Brałem/am udział", value: true },
                                { label: "🚀 Jestem debiutantem", value: false },
                            ].map(opt => (
                                <button
                                    key={String(opt.value)}
                                    type="button"
                                    onClick={() => setHasExperience(opt.value)}
                                    className={`flex-1 py-2.5 px-3 rounded-xl border-2 text-xs font-semibold transition-all duration-150 ${
                                        hasExperience === opt.value
                                            ? "border-[#c62a3a] bg-red-50 dark:bg-red-900/15 text-[#c62a3a]"
                                            : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 bg-white dark:bg-[#2d1b1e]"
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                {/* ── Footer ── */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-[#201214]/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                        Anuluj
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all shadow-md ${
                            saved
                                ? "bg-green-600 text-white shadow-green-200"
                                : "bg-[#c62a3a] hover:bg-red-700 text-white shadow-[#c62a3a]/20"
                        }`}
                    >
                        <span className="material-symbols-outlined text-[16px]">
                            {saved ? "check" : "save"}
                        </span>
                        {saved ? "Zapisano!" : "Zapisz zmiany"}
                    </button>
                </div>
            </div>
        </div>
    );
}
