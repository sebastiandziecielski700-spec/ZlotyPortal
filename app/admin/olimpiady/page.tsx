"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { ModalPotwierdzenia } from "@/app/components/ModalPotwierdzenia";
import { ModalUczestnicy } from "@/app/components/ModalUczestnicy";

type Poziom = "szkolny" | "regionalny" | "krajowy" | "międzynarodowy";
type StatusOlimp = "rekrutacja" | "w toku" | "zakończona";

interface Olimpiada {
    id: string;
    nazwa: string;
    przedmiot: string;
    poziom: Poziom;
    status: StatusOlimp;
    terminRekrutacji: string;
    dataOlimpiady: string;
    zapisanych: number;
    limitMiejsc: number;
    opis: string;
    kolorPrzedmiotu: string;
    ikonaPrzedmiotu: string;
}

const POZIOM_KOLOR: Record<Poziom, string> = {
    szkolny: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
    regionalny: "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
    krajowy: "bg-[#c62a3a]/10 text-[#c62a3a]",
    międzynarodowy: "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400",
};

const STATUS_KOLOR: Record<StatusOlimp, { badge: string; dot: string }> = {
    rekrutacja: { badge: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400", dot: "bg-green-500 animate-pulse" },
    "w toku": { badge: "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400", dot: "bg-orange-500" },
    zakończona: { badge: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400", dot: "bg-gray-400" },
};

type TabFiltr = "wszystkie" | Poziom;

export function ModalDodajOlimpiade({ onZamknij, onWyslane }: { onZamknij: () => void, onWyslane: () => void }) {
    const supabase = createClient();
    
    const [nazwa, setNazwa] = useState("");
    const [przedmiot, setPrzedmiot] = useState("");
    const [poziom, setPoziom] = useState<Poziom | "">("");
    const [terminRekrutacji, setTerminRekrutacji] = useState("");
    const [dataOlimpiady, setDataOlimpiady] = useState("");
    const [limitMiejsc, setLimitMiejsc] = useState("");
    const [opis, setOpis] = useState("");
    const [wysylanie, setWysylanie] = useState(false);
    const [blad, setBlad] = useState<string | null>(null);

    const handleZapisz = async () => {
        setBlad(null);
        if (!nazwa.trim() || !przedmiot.trim() || !poziom || !terminRekrutacji || !dataOlimpiady || !limitMiejsc || !opis.trim()) {
            setBlad("Wszystkie pola są wymagane.");
            return;
        }
        
        setWysylanie(true);

        const { error } = await supabase.from("olimpiady").insert({
            tytul: nazwa,
            skrot: przedmiot.substring(0, 3).toUpperCase(),
            poziom: poziom,
            status: "rekrutacja", // domyslnie od razu rekrutacja
            kolor_ikon: "blue",
            kolor_st: "green",
            data_zakonczenia: dataOlimpiady
        });

        setWysylanie(false);

        if (error) {
            console.error("Błąd zapisu:", error);
            alert("Nie udało się dodać olimpiady.");
        } else {
            onWyslane();
            onZamknij();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onZamknij} />
            <div className="relative bg-white dark:bg-[#2d1b1e] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-[#2d1b1e] z-10">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Nowa olimpiada</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Dodaj konkurs do systemu</p>
                    </div>
                    <button onClick={onZamknij} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><span className="material-symbols-outlined text-gray-500">close</span></button>
                </div>
                <div className="p-6 space-y-4">
                    {blad && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 font-medium flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">error</span>
                            {blad}
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Nazwa olimpiady</label>
                        <input value={nazwa} onChange={e => setNazwa(e.target.value)} type="text" placeholder="np. Olimpiada Matematyczna" className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Przedmiot</label>
                        <input value={przedmiot} onChange={e => setPrzedmiot(e.target.value)} type="text" placeholder="np. Matematyka" className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40" />
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Termin rekrutacji</label>
                         <input value={terminRekrutacji} onChange={e => setTerminRekrutacji(e.target.value)} type="date" className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40" />
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Data olimpiady</label>
                         <input value={dataOlimpiady} onChange={e => setDataOlimpiady(e.target.value)} type="date" className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Poziom</label>
                        <select value={poziom} onChange={e => setPoziom(e.target.value as Poziom | "")} className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40">
                            <option value="" disabled>Wybierz...</option>
                            <option value="szkolny">Szkolny</option>
                            <option value="regionalny">Regionalny</option>
                            <option value="krajowy">Krajowy</option>
                            <option value="międzynarodowy">Międzynarodowy</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Limit miejsc</label>
                        <input value={limitMiejsc} onChange={e => setLimitMiejsc(e.target.value)} type="number" placeholder="25" className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Opis</label>
                        <textarea value={opis} onChange={e => setOpis(e.target.value)} rows={3} className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40 resize-none" placeholder="Krótki opis olimpiady..." />
                    </div>
                </div>
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 sticky bottom-0 bg-white dark:bg-[#2d1b1e]">
                    <button disabled={wysylanie} onClick={onZamknij} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">Anuluj</button>
                    <button disabled={wysylanie} onClick={handleZapisz} className="flex-[2] py-2.5 bg-[#c62a3a] text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50">
                        {wysylanie ? "Zapisywanie..." : "Dodaj olimpiadę"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function StronaOlimpiad() {
    const supabase = createClient();
    const [dane, setDane] = useState<Olimpiada[]>([]);
    const [ladowanie, setLadowanie] = useState(true);

    const [filtr, setFiltr] = useState<TabFiltr>("wszystkie");
    const [szukaj, setSzukaj] = useState("");
    const [modalDodaj, setModalDodaj] = useState(false);
    const [modalZapisani, setModalZapisani] = useState<Olimpiada | null>(null);

    const [doUsuniecia, setDoUsuniecia] = useState<Olimpiada | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleUsun = async () => {
        if (!doUsuniecia) return;
        setIsDeleting(true);
        const { error } = await supabase.from('olimpiady').delete().eq('id', doUsuniecia.id);
        setIsDeleting(false);
        if (!error) {
            setDoUsuniecia(null);
            pobierzOlimpiady();
        } else {
            console.error("Błąd usuwania:", error);
            alert("Błąd. Prawdopodobnie brak dostępu z powodu RLS.");
        }
    };

    const pobierzOlimpiady = async () => {
        setLadowanie(true);
        const { data, error } = await supabase.from("olimpiady").select("*").order("created_at", { ascending: false });
        if (!error && data) {
            setDane(data.map(o => {
                // bezpieczne mapowanie statusu i poziomu
                const isValidPoziom = ["szkolny", "regionalny", "krajowy", "międzynarodowy"].includes((o.poziom || "").toLowerCase());
                const isValidStatus = ["rekrutacja", "w toku", "zakończona"].includes((o.status || "").toLowerCase());

                return {
                    id: o.id,
                    nazwa: o.tytul,
                    przedmiot: o.skrot || "INN",
                    poziom: (isValidPoziom ? o.poziom.toLowerCase() : "szkolny") as Poziom,
                    status: (isValidStatus ? o.status.toLowerCase() : "rekrutacja") as StatusOlimp,
                    terminRekrutacji: new Date(o.created_at).toLocaleDateString("pl-PL"),
                    dataOlimpiady: (() => {
                        if (!o.data_zakonczenia) return "Nie ustalono";
                        const d = new Date(o.data_zakonczenia);
                        return isNaN(d.getTime()) ? "Nie ustalono" : d.toLocaleDateString("pl-PL");
                    })(),
                    zapisanych: 0,
                    limitMiejsc: 30,
                    opis: "Opis ogólny Olimpiady (do wpisowego profilu).",
                    kolorPrzedmiotu: `bg-${o.kolor_ikon || "blue"}-500`,
                    ikonaPrzedmiotu: "emoji_events"
                };
            }));
        }
        setLadowanie(false);
    }

    useEffect(() => {
        pobierzOlimpiady();
    }, []);

    const filtry: { klucz: TabFiltr; etykieta: string }[] = [
        { klucz: "wszystkie", etykieta: `Wszystkie (${dane.length})` },
        { klucz: "szkolny", etykieta: "Szkolne" },
        { klucz: "regionalny", etykieta: "Regionalne" },
        { klucz: "krajowy", etykieta: "Krajowe" },
        { klucz: "międzynarodowy", etykieta: "Między." },
    ];

    const przefiltrowane = useMemo(() =>
        dane.filter(o =>
            (filtr === "wszystkie" || o.poziom === filtr) &&
            (szukaj === "" || o.nazwa.toLowerCase().includes(szukaj.toLowerCase()) || o.przedmiot.toLowerCase().includes(szukaj.toLowerCase()))
        ), [filtr, szukaj, dane]);

    return (
        <>
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="h-16 flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-[#2d1b1e]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-10 sticky top-0 transition-colors">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Olimpiady</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{przefiltrowane.length} konkursów w bazie</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-gray-400 text-[18px]">search</span>
                            </div>
                            <input value={szukaj} onChange={e => setSzukaj(e.target.value)} className="block w-56 pl-9 pr-3 py-2 border-none rounded-lg bg-gray-100 dark:bg-[#201214] text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40 transition-all" placeholder="Szukaj olimpiady..." type="text" />
                        </div>
                        <button onClick={() => setModalDodaj(true)} className="flex items-center gap-2 px-4 py-2 bg-[#c62a3a] text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm shadow-red-200 dark:shadow-none">
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Nowa olimpiada
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                    <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto whitespace-nowrap hide-scrollbar">
                        {filtry.map(f => (
                            <button key={f.klucz} onClick={() => setFiltr(f.klucz)}
                                className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${filtr === f.klucz ? "border-[#c62a3a] text-[#c62a3a]" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                    }`}>
                                {f.etykieta}
                            </button>
                        ))}
                    </div>

                    {ladowanie ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin inline-block size-10 border-4 border-[#c62a3a] border-b-transparent rounded-full" />
                        </div>
                    ) : przefiltrowane.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                             <span className="material-symbols-outlined text-6xl mb-4">emoji_events</span>
                             <p className="font-bold text-lg">Brak olimpiad</p>
                             <button onClick={() => { setSzukaj(""); setFiltr("wszystkie"); }} className="text-[#c62a3a] font-bold mt-2 hover:underline">Wyczyść filtry</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {przefiltrowane.map(o => {
                                const proc = Math.round((o.zapisanych / o.limitMiejsc) * 100);
                                return (
                                    <div key={o.id} className="bg-white dark:bg-[#2d1b1e] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                                        {/* Kolorowy pasek nagłówka */}
                                        <div className={`h-2 w-full ${o.kolorPrzedmiotu.replace('bg-', 'bg-').replace('-500', '-500')}`} />
                                        <div className="p-5 flex-1">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className={`size-11 rounded-xl ${o.kolorPrzedmiotu.replace('bg-', 'bg-').replace('-500', '-500')} bg-opacity-15 flex items-center justify-center text-white`}>
                                                    <span className="material-symbols-outlined text-xl">{o.ikonaPrzedmiotu}</span>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${POZIOM_KOLOR[o.poziom]}`}>
                                                    {o.poziom.toUpperCase()}
                                                </span>
                                            </div>
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">{o.nazwa}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{o.przedmiot}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{o.opis}</p>

                                            {/* Status */}
                                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full mb-4 ${STATUS_KOLOR[o.status].badge}`}>
                                                <span className={`size-1.5 rounded-full ${STATUS_KOLOR[o.status].dot}`} />
                                                {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                                            </span>

                                            {/* Miejsca */}
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-gray-500 dark:text-gray-400">Zapisani</span>
                                                    <span className="font-bold text-gray-700 dark:text-gray-300">{o.zapisanych} / {o.limitMiejsc}</span>
                                                </div>
                                                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                                                    <div className={`${o.kolorPrzedmiotu} h-2 rounded-full`} style={{ width: `${Math.min(proc, 100)}%` }} />
                                                </div>
                                            </div>

                                            {/* Daty */}
                                            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                                                <div className="bg-gray-50 dark:bg-[#201214] rounded-lg p-2">
                                                    <p className="text-gray-400 mb-0.5">Dodano w systemie:</p>
                                                    <p className="font-bold text-gray-700 dark:text-gray-300">{o.terminRekrutacji}</p>
                                                </div>
                                                <div className="bg-gray-50 dark:bg-[#201214] rounded-lg p-2">
                                                    <p className="text-gray-400 mb-0.5">Data olimpiady:</p>
                                                    <p className="font-bold text-gray-700 dark:text-gray-300">{o.dataOlimpiady}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-200 dark:border-gray-700 px-5 py-3 flex items-center justify-between bg-gray-50/50 dark:bg-[#201214]/30 mt-auto">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setModalZapisani(o); }}
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold text-white bg-[#c62a3a] hover:bg-red-700 transition-all"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">group</span>
                                                Uczestnicy
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); setDoUsuniecia(o); }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all" title="Usuń">
                                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            <button onClick={() => setModalDodaj(true)} className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#2d1b1e]/50 p-8 hover:border-[#c62a3a]/50 hover:bg-gray-50 dark:hover:bg-[#2d1b1e] transition-all group min-h-[200px]">
                                <div className="size-14 rounded-full bg-white dark:bg-[#2d1b1e] shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-3xl text-gray-400 group-hover:text-[#c62a3a]">emoji_events</span>
                                </div>
                                <p className="mt-3 font-bold text-gray-500 dark:text-gray-400 group-hover:text-[#c62a3a] transition-colors">Dodaj olimpiadę</p>
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {modalDodaj && <ModalDodajOlimpiade onWyslane={pobierzOlimpiady} onZamknij={() => setModalDodaj(false)} />}
            
            <ModalPotwierdzenia
                isOpen={!!doUsuniecia}
                onClose={() => setDoUsuniecia(null)}
                onConfirm={handleUsun}
                tytul="Usuń olimpiadę"
                opis={`Czy na pewno chcesz usunąć "${doUsuniecia?.nazwa}"? Tej operacji nie można cofnąć.`}
                isDeleting={isDeleting}
            />

            {modalZapisani && (
                <ModalUczestnicy
                    typ="olimpiada"
                    itemId={modalZapisani.id}
                    tytul={modalZapisani.nazwa}
                    onClose={() => setModalZapisani(null)}
                />
            )}
        </>
    );
}
