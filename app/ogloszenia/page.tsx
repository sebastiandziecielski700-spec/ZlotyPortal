"use client";

import React, { useState, useMemo, useEffect } from "react";
import ModalOgloszenia, { OgloszenieSzczegoly } from "../components/ModalOgloszenia";
import { createClient } from "@/utils/supabase/client";

type Priorytet = "normalne" | "ważne" | "pilne";

interface OgloszenieItem extends OgloszenieSzczegoly {
    przypiete: boolean;
    priorytet: Priorytet;
}

const PRIORYTETY_STYLE: Record<Priorytet, { badge: string; dot: string; label: string }> = {
    pilne: { badge: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800", dot: "bg-red-500", label: "Pilne" },
    ważne: { badge: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800", dot: "bg-amber-500", label: "Ważne" },
    normalne: { badge: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800", dot: "bg-blue-400", label: "Normalne" },
};

export default function StronaOgloszen() {
    const [szukaj, setSzukaj] = useState("");
    const [aktywneOgloszenie, setAktywneOgloszenie] = useState<OgloszenieItem | null>(null);
    const [ogloszeniaList, setOgloszeniaList] = useState<OgloszenieItem[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        async function fetchOgloszenia() {
            setLoading(true);
            const { data } = await supabase.from('ogloszenia').select('*').order('created_at', { ascending: false });
            if (data) {
                setOgloszeniaList(data.map(o => ({
                    id: o.id,
                    tytul: o.tytul,
                    tresc: o.tresc,
                    priorytet: o.priorytet as Priorytet || 'normalne',
                    autor: o.autor,
                    tagColor: o.tag_color,
                    dataPublikacji: new Date(o.created_at).toLocaleDateString('pl-PL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                    przypiete: o.przypiete
                })));
            }
            setLoading(false);
        }
        fetchOgloszenia();
    }, []);

    const przefiltrowane = useMemo(() =>
        ogloszeniaList.filter(o => {
            return szukaj === "" || o.tytul.toLowerCase().includes(szukaj.toLowerCase()) || o.autor.toLowerCase().includes(szukaj.toLowerCase());
        }).sort((a, b) => Number(b.przypiete) - Number(a.przypiete)),
        [szukaj, ogloszeniaList]
    );

    return (
        <main className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Nagłówek */}
            <header className="h-16 flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-[#2d1b1e]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-10 sticky top-0 transition-colors">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Ogłoszenia Szkolne</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{przefiltrowane.length} ogłoszeń</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-gray-400 text-[18px]">search</span>
                        </div>
                        <input
                            value={szukaj} onChange={e => setSzukaj(e.target.value)}
                            className="block w-56 pl-9 pr-3 py-2 border-none rounded-lg bg-gray-100 dark:bg-[#201214] text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40 text-sm transition-all"
                            placeholder="Szukaj ogłoszeń..." type="text"
                        />
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-5">
                {/* Lista ogłoszeń */}
                <div className="bg-white dark:bg-[#2d1b1e] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-[#201214]/60 border-b border-gray-200 dark:border-gray-700">
                                    <th className="w-8 px-4 py-4 text-center"><span className="material-symbols-outlined text-gray-400 text-[18px]">push_pin</span></th>
                                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Tytuł ogłoszenia</th>
                                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Priorytet</th>
                                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 hidden lg:table-cell">Data</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                {loading ? (
                                    <tr><td colSpan={4} className="text-center py-16"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#c62a3a]"></div></td></tr>
                                ) : przefiltrowane.map(o => (
                                    <React.Fragment key={o.id}>
                                        <tr
                                            key={o.id}
                                            onClick={() => setAktywneOgloszenie(o)}
                                            className="hover:bg-gray-50 dark:hover:bg-[#201214]/40 transition-colors group cursor-pointer"
                                        >
                                            <td className="px-4 py-4 text-center">
                                                <span className={`material-symbols-outlined text-[18px] ${o.przypiete ? "text-[#c62a3a] icon-filled" : "text-gray-300 dark:text-gray-600"}`}>push_pin</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#c62a3a] transition-colors">{o.tytul}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Od: {o.autor}</p>
                                                    </div>
                                                    <span className="material-symbols-outlined text-gray-400 text-[18px] ml-1 opacity-50 block md:hidden group-hover:text-[#c62a3a] transition-colors">
                                                        open_in_new
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${PRIORYTETY_STYLE[o.priorytet].badge}`}>
                                                    <span className={`size-1.5 rounded-full ${PRIORYTETY_STYLE[o.priorytet].dot}`} />
                                                    {PRIORYTETY_STYLE[o.priorytet].label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 hidden lg:table-cell">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">{o.dataPublikacji}</span>
                                                    <span className="material-symbols-outlined text-gray-400 text-[18px] ml-1 opacity-0 group-hover:opacity-100 group-hover:text-[#c62a3a] transition-all">
                                                        arrow_forward
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>

                        {!loading && przefiltrowane.length === 0 && (
                            <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
                                <span className="material-symbols-outlined text-5xl">campaign</span>
                                <p className="font-semibold">Brak ogłoszeń dla podanego wyszukiwania</p>
                                <button onClick={() => setSzukaj("")} className="text-sm font-bold text-[#c62a3a] hover:underline">Wyczyść lupę</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ModalOgloszenia 
                ogloszenie={aktywneOgloszenie} 
                onClose={() => setAktywneOgloszenie(null)} 
            />
        </main>
    );
}
