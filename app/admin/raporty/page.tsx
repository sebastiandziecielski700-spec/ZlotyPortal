"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

const STATYSTYKI_TEMPLATE = [
    { key: "uczniowie", ikona: "group", etykieta: "Uczniowie", wartosc: "0", zmiana: "Baza", kolorTla: "bg-blue-50 dark:bg-blue-900/20", kolorIkony: "text-blue-600 dark:text-blue-400", unit: "" },
    { key: "glosowania", ikona: "how_to_vote", etykieta: "Głosowań (akt.)", wartosc: "0", zmiana: "Baza", kolorTla: "bg-[#c62a3a]/10", kolorIkony: "text-[#c62a3a]", unit: "" },
    { key: "ogloszenia", ikona: "campaign", etykieta: "Ogłoszenia (wsz.)", wartosc: "0", zmiana: "Baza", kolorTla: "bg-orange-50 dark:bg-orange-900/20", kolorIkony: "text-orange-600 dark:text-orange-400", unit: "" },
    { key: "olimpiady", ikona: "emoji_events", etykieta: "Olimpiady (akt.)", wartosc: "0", zmiana: "Baza", kolorTla: "bg-purple-50 dark:bg-purple-900/20", kolorIkony: "text-purple-600 dark:text-purple-400", unit: "" },
    { key: "stypendia", ikona: "workspace_premium", etykieta: "Stypendia (wsz.)", wartosc: "0", zmiana: "Baza", kolorTla: "bg-amber-50 dark:bg-amber-900/20", kolorIkony: "text-amber-600 dark:text-amber-400", unit: "" },
];

export default function StronaRaportow() {
    const supabase = createClient();
    const [statystyki, setStatystyki] = useState(STATYSTYKI_TEMPLATE);
    const [aktywnosci, setAktywnosci] = useState<any[]>([]);
    const [zaangazowanie, setZaangazowanie] = useState([
        { etykieta: "Uczestnictwo w głosowaniach", proc: 0, kolor: "bg-[#c62a3a]" },
        { etykieta: "Złożone wnioski stypendialne", proc: 0, kolor: "bg-green-500" }
    ]);
    const [ladowanie, setLadowanie] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            setLadowanie(true);
            const { data: usersData } = await supabase.from("users").select("clase");
            
            let uczenCount = 0;
            if (usersData) {
                uczenCount = usersData.length;
            }

            const totalUsers = uczenCount || 1;

            const resGlos = await supabase.from("glosowania").select('id', { count: 'exact', head: true }).eq('aktywne', true);
            const resOgl = await supabase.from("ogloszenia").select('id', { count: 'exact', head: true });
            const resOli = await supabase.from("olimpiady").select('id', { count: 'exact', head: true }).in('status', ['rekrutacja', 'w toku']);
            const resSty = await supabase.from("stypendia").select('id', { count: 'exact', head: true });

            setStatystyki([
                { ...STATYSTYKI_TEMPLATE[0], wartosc: String(uczenCount) },
                { ...STATYSTYKI_TEMPLATE[1], wartosc: String(resGlos.count || 0) },
                { ...STATYSTYKI_TEMPLATE[2], wartosc: String(resOgl.count || 0) },
                { ...STATYSTYKI_TEMPLATE[3], wartosc: String(resOli.count || 0) },
                { ...STATYSTYKI_TEMPLATE[4], wartosc: String(resSty.count || 0) },
            ]);

            // Wskaźniki zaangażowania
            const { data: glosy } = await supabase.from("glosowania_glosy").select("user_id");
            const { data: wnioski } = await supabase.from("stypendia_wnioski").select("user_id");
            const { data: podpisy } = await supabase.from("petycje_podpisy").select("user_id");
            const { data: ankiety } = await supabase.from("ankiety_wypelnienia").select("user_id");
            
            const uniqueVoters = new Set(glosy?.map(v => v.user_id)).size;
            const uniqueApplicants = new Set(wnioski?.map(w => w.user_id)).size;
            const uniquePetitioners = new Set(podpisy?.map(p => p.user_id)).size;
            const uniqueSurveyors = new Set(ankiety?.map(a => a.user_id)).size;

            setZaangazowanie([
                { etykieta: "Uczestnictwo w głosowaniach", proc: Math.round((uniqueVoters / totalUsers) * 100) || 0, kolor: "bg-[#c62a3a]" },
                { etykieta: "Złożone wnioski stypendialne", proc: Math.round((uniqueApplicants / totalUsers) * 100) || 0, kolor: "bg-green-500" },
                { etykieta: "Aktywność olimpiadowa", proc: 0, kolor: "bg-blue-500" },
                { etykieta: "Podpisane petycje", proc: Math.round((uniquePetitioners / totalUsers) * 100) || 0, kolor: "bg-orange-500" },
                { etykieta: "Wypełnione ankiety", proc: Math.round((uniqueSurveyors / totalUsers) * 100) || 0, kolor: "bg-purple-500" }
            ]);

            // Aktywności (Ogłoszenia i Olimpiady)
            const { data: oglList } = await supabase.from("ogloszenia").select("tytul, created_at").order("created_at", { ascending: false }).limit(4);
            const { data: oliList } = await supabase.from("olimpiady").select("tytul, created_at").order("created_at", { ascending: false }).limit(4);
            const { data: styList } = await supabase.from("stypendia").select("tytul, created_at").order("created_at", { ascending: false }).limit(4);

            const allActs = [];
            if (oglList) oglList.forEach(o => allActs.push({ ikona: "campaign", tresc: `Ogłoszenie: ${o.tytul}`, created_at: o.created_at }));
            if (oliList) oliList.forEach(o => allActs.push({ ikona: "emoji_events", tresc: `Olimpiada: ${o.tytul}`, created_at: o.created_at }));
            if (styList) styList.forEach(s => allActs.push({ ikona: "workspace_premium", tresc: `Stypendium: ${s.tytul}`, created_at: s.created_at }));

            allActs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            
            setAktywnosci(allActs.slice(0, 6).map(act => ({
                ikona: act.ikona,
                tresc: act.tresc,
                kiedy: new Date(act.created_at).toLocaleDateString("pl-PL")
            })));

            setLadowanie(false);
        }
        fetchStats();
    }, []);

    if (ladowanie) {
        return (
            <main className="flex-1 flex flex-col h-full overflow-hidden items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined text-[#c62a3a] animate-spin text-5xl">sync</span>
                    <p className="text-gray-500 font-semibold animate-pulse">Ładowanie raportów...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="flex-1 flex flex-col h-full overflow-hidden">
            <header className="h-16 flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-[#2d1b1e]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-10 sticky top-0 transition-colors">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Raporty</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Przegląd aktywności szkoły</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    Eksportuj PDF
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                {/* Karty statystyk */}
                <section>
                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Przegląd ogólny</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                        {statystyki.map(s => (
                            <div key={s.etykieta} className="bg-white dark:bg-[#2d1b1e] rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-3 opacity-10 transform translate-x-1 -translate-y-1 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-4xl">{s.ikona}</span>
                                </div>
                                <div className={`size-10 ${s.kolorTla} rounded-lg flex items-center justify-center mb-3 ${s.kolorIkony} relative z-10`}>
                                    <span className="material-symbols-outlined text-xl">{s.ikona}</span>
                                </div>
                                <p className="text-2xl font-extrabold text-gray-900 dark:text-white relative z-10">{s.wartosc}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium relative z-10">{s.etykieta}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Wskaźnik zaangażowania */}
                    <section className="bg-white dark:bg-[#2d1b1e] rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-5">Zaangażowanie społeczności szkolnej</h3>
                        <div className="space-y-6 flex-1 justify-center flex flex-col">
                            {zaangazowanie.map(w => (
                                <div key={w.etykieta}>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{w.etykieta}</span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{w.proc}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3">
                                        <div className={`${w.kolor} h-3 rounded-full transition-all duration-1000`} style={{ width: `${w.proc}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Ostatnia aktywność */}
                    <section className="bg-white dark:bg-[#2d1b1e] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-white">Ostatnia aktywność</h3>
                        </div>
                        <div className="divide-y divide-gray-50 dark:divide-gray-700/50 flex-1 overflow-y-auto">
                            {aktywnosci.length > 0 ? aktywnosci.map((a, i) => (
                                <div key={i} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 dark:hover:bg-[#201214]/40 transition-colors">
                                    <div className="size-9 rounded-full bg-[#c62a3a]/10 flex items-center justify-center flex-shrink-0 text-[#c62a3a]">
                                        <span className="material-symbols-outlined text-[18px]">{a.ikona}</span>
                                    </div>
                                    <p className="flex-1 text-sm text-gray-700 dark:text-gray-300">{a.tresc}</p>
                                    <span className="text-xs text-gray-400 whitespace-nowrap">{a.kiedy}</span>
                                </div>
                            )) : (
                                <div className="p-6 text-center text-sm text-gray-500">Brak aktywności</div>
                            )}
                        </div>
                    </section>
                </div>

                <div className="pb-6 text-center text-xs text-gray-400">
                    © 2026 Panel Administracyjny Złoty Portal. Wszelkie prawa zastrzeżone.
                </div>
            </div>
        </main>
    );
}
