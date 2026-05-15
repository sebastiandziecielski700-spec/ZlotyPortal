"use client";

import { useState, useEffect } from "react";
import { ModalDodajOgloszenie } from "./ogloszenia/page";
import { ModalDodajOlimpiade } from "./olimpiady/page";
import { ModalDodajStypendium } from "./stypendia/page";
import { ModalDodajUzytkownika } from "./uzytkownicy/page";
import { createClient } from "@/utils/supabase/client";

const SZYBKIE_AKCJE = [
    { ikona: "campaign", nazwa: "Nowe ogłoszenie", modalKey: "ogloszenie" },
    { ikona: "emoji_events", nazwa: "Dodaj olimpiadę", modalKey: "olimpiada" },
    { ikona: "person_add", nazwa: "Dodaj ucznia", modalKey: "uczen" },
    { ikona: "workspace_premium", nazwa: "Dodaj stypendium", modalKey: "stypendium" },
];

export default function DashboardAdmin() {
    const [aktywnyModal, setAktywnyModal] = useState<string | null>(null);
    const [toast, setToast] = useState<{ visible: boolean, message: string }>({ visible: false, message: "" });
    const [ladowanie, setLadowanie] = useState(true);
    const supabase = createClient();

    const [STATYSTYKI, setStatystyki] = useState([
        { ikona: "group", etykieta: "Aktywni Użytkownicy", wartosc: "...", zmiana: "...", rosnaca: true, kolorTla: "bg-blue-50 dark:bg-blue-900/20", kolorIkony: "text-blue-600 dark:text-blue-400" },
        { ikona: "how_to_vote", etykieta: "Aktywne Głosowania", wartosc: "...", zmiana: "...", rosnaca: true, kolorTla: "bg-[#c62a3a]/10 dark:bg-[#c62a3a]/10", kolorIkony: "text-[#c62a3a]" },
        { ikona: "emoji_events", etykieta: "Aktywne Olimpiady", wartosc: "...", zmiana: "...", rosnaca: true, kolorTla: "bg-purple-50 dark:bg-purple-900/20", kolorIkony: "text-purple-600 dark:text-purple-400" }
    ]);

    const [OGLOSZENIA, setOgloszenia] = useState<any[]>([]);

    const [wskaznikZaangazowania, setWskaznikZaangazowania] = useState("0.0");

    useEffect(() => {
        const fetchDane = async () => {
            const [
                { count: usersCount },
                { data: glosowania },
                { data: olimpiady },
                { data: ogloszenia },
                { data: votes }
            ] = await Promise.all([
                supabase.from('users').select('*', { count: 'exact', head: true }),
                supabase.from('glosowania').select('id').eq('aktywne', true),
                supabase.from('olimpiady').select('id').in('status', ['rekrutacja', 'w toku']),
                supabase.from('ogloszenia').select('*').order('created_at', { ascending: false }).limit(4),
                supabase.from('glosowania_glosy').select('user_id')
            ]);

            setStatystyki([
                { ikona: "group", etykieta: "Aktywni Użytkownicy", wartosc: (usersCount || 0).toString(), zmiana: "+12%", rosnaca: true, kolorTla: "bg-blue-50 dark:bg-blue-900/20", kolorIkony: "text-blue-600 dark:text-blue-400" },
                { ikona: "how_to_vote", etykieta: "Aktywne Głosowania", wartosc: (glosowania?.length || 0).toString(), zmiana: "+2", rosnaca: true, kolorTla: "bg-[#c62a3a]/10 dark:bg-[#c62a3a]/10", kolorIkony: "text-[#c62a3a]" },
                { ikona: "emoji_events", etykieta: "Aktywne Olimpiady", wartosc: (olimpiady?.length || 0).toString(), zmiana: "W toku", rosnaca: true, kolorTla: "bg-purple-50 dark:bg-purple-900/20", kolorIkony: "text-purple-600 dark:text-purple-400" }
            ]);

            if (ogloszenia) {
                setOgloszenia(ogloszenia.map(ogl => {
                    const kolorTypu = ogl.tag_color === 'red' ? 'bg-red-100 text-red-700' :
                                      ogl.tag_color === 'emerald' ? 'bg-green-100 text-green-700' :
                                      'bg-blue-100 text-blue-700';
                    return {
                        tytul: ogl.tytul,
                        autor: ogl.autor,
                        kiedy: new Date(ogl.created_at).toLocaleDateString('pl-PL'),
                        typ: (ogl.priorytet || "INFO").toUpperCase(),
                        kolorTypu: kolorTypu,
                    };
                }));
            }



            const uniqueVoters = new Set(votes?.map(v => v.user_id)).size;
            const engagementScore = (usersCount || 0) > 0 ? (uniqueVoters / (usersCount || 1)) * 100 : 0;
            setWskaznikZaangazowania(engagementScore.toFixed(1));
            
            setLadowanie(false);
        };
        fetchDane();
    }, []);

    const pokazSukces = (msg: string) => {
        setToast({ visible: true, message: msg });
        setTimeout(() => setToast({ visible: false, message: "" }), 3500);
    };

    const dzisiaj = new Date().toLocaleDateString('pl-PL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const aktualnaData = dzisiaj.charAt(0).toUpperCase() + dzisiaj.slice(1);

    if (ladowanie) {
        return (
            <main className="flex-1 flex flex-col h-full overflow-hidden items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined text-[#c62a3a] animate-spin text-5xl">sync</span>
                    <p className="text-gray-500 font-semibold animate-pulse">Trwa pobieranie statystyk...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Nagłówek */}
            <header className="h-16 flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-[#2d1b1e]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-10 sticky top-0 transition-colors">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Dashboard</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{aktualnaData}</p>
                </div>

            </header>

            {/* Scrollowalna zawartość */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scroll-smooth">
                {/* Powitanie */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Witaj, Administratorze 👋
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Oto przegląd aktywności w Złotym Portalu.
                    </p>
                </div>

                {/* Karty statystyk */}
                <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {STATYSTYKI.map((stat) => (
                        <div
                            key={stat.etykieta}
                            className="bg-white dark:bg-[#2d1b1e] rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between group hover:border-gray-200 dark:hover:border-gray-600 transition-colors"
                        >
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {stat.etykieta}
                                </p>
                                <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                                    {stat.wartosc}
                                </h3>
                                <div className="mt-1">
                                </div>
                            </div>
                            <div
                                className={`size-14 ${stat.kolorTla} rounded-xl flex items-center justify-center ${stat.kolorIkony}`}
                            >
                                <span className="material-symbols-outlined text-3xl">{stat.ikona}</span>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Szybkie akcje */}
                <section>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                        Szybkie akcje
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {SZYBKIE_AKCJE.map((akcja) => (
                            <button
                                key={akcja.nazwa}
                                onClick={() => setAktywnyModal(akcja.modalKey)}
                                className="flex flex-col items-center justify-center p-5 bg-white dark:bg-[#2d1b1e] border border-gray-200 dark:border-gray-700 rounded-xl hover:border-[#c62a3a]/40 dark:hover:border-[#c62a3a]/30 hover:bg-[#c62a3a]/5 transition-all group cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-3xl text-[#c62a3a] mb-2 group-hover:scale-110 transition-transform">
                                    {akcja.ikona}
                                </span>
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-[#c62a3a] transition-colors text-center">
                                    {akcja.nazwa}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Dolna sekcja: Ogłoszenia */}
                <section className="grid grid-cols-1 gap-6">
                    {/* Ostatnie ogłoszenia */}
                    <div className="bg-white dark:bg-[#2d1b1e] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#c62a3a] text-[20px]">history</span>
                                Ostatnie ogłoszenia
                            </h3>
                            <a
                                href="/admin/ogloszenia"
                                className="text-xs font-bold text-[#c62a3a] hover:text-red-700 dark:hover:text-red-400 transition-colors"
                            >
                                Zobacz wszystkie
                            </a>
                        </div>
                        <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                            {OGLOSZENIA.map((ogl) => (
                                <div
                                    key={ogl.tytul}
                                    className="p-4 hover:bg-gray-50 dark:hover:bg-[#201214]/50 transition-colors cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate pr-3">
                                            {ogl.tytul}
                                        </h4>
                                        <span
                                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${ogl.kolorTypu}`}
                                        >
                                            {ogl.typ}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{ogl.autor}</p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 italic">
                                            {ogl.kiedy}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </section>

                {/* Wskaźnik zaangażowania */}
                <section className="grid grid-cols-1 gap-5">
                    <div className="bg-white dark:bg-[#2d1b1e] rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-[#c62a3a]/10 text-[#c62a3a]">
                                <span className="material-symbols-outlined">trending_up</span>
                            </div>
                            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Wskaźnik zaangażowania
                            </h3>
                        </div>
                        <div className="flex items-end justify-between">
                            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{wskaznikZaangazowania}%</span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm font-semibold italic">
                                Zaangażowani użytkownicy
                            </span>
                        </div>
                        <div className="mt-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                            <div
                                className="bg-[#c62a3a] h-2 rounded-full transition-all"
                                style={{ width: `${wskaznikZaangazowania}%` }}
                            />
                        </div>
                    </div>
                </section>

                <div className="pb-6 text-center text-xs text-gray-400">
                    © 2026 Panel Administracyjny Złoty Portal. Wszelkie prawa zastrzeżone.
                </div>
            </div>

            {/* Obsługa Szybkich Modali */}
            {aktywnyModal === "ogloszenie" && <ModalDodajOgloszenie onZamknij={() => setAktywnyModal(null)} onWyslane={() => { setAktywnyModal(null); pokazSukces("Dodano ogłoszenie! (Dane uaktualnią się na podstronach)") }} />}
            {aktywnyModal === "olimpiada" && <ModalDodajOlimpiade onZamknij={() => setAktywnyModal(null)} onWyslane={() => { setAktywnyModal(null); pokazSukces("Dodano olimpiadę! (Dane uaktualnią się na podstronach)") }} />}
            {aktywnyModal === "stypendium" && <ModalDodajStypendium onZamknij={() => setAktywnyModal(null)} onWyslane={() => { setAktywnyModal(null); pokazSukces("Dodano stypendium! (Dane uaktualnią się na podstronach)") }} />}
            {aktywnyModal === "uczen" && <ModalDodajUzytkownika onZamknij={() => setAktywnyModal(null)} onDodano={() => { setAktywnyModal(null); pokazSukces("Dodano użytkownika do bazy!") }} />}

            {/* Powiadomienia (Toast) */}
            {toast.visible && (
                <div className="fixed bottom-6 right-6 z-[100] bg-green-500 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in-up border border-green-400">
                    <span className="material-symbols-outlined text-white">check_circle</span>
                    <span className="text-sm font-bold">{toast.message}</span>
                </div>
            )}
        </main>
    );
}
