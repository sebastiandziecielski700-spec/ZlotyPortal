"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { ModalPotwierdzenia } from "@/app/components/ModalPotwierdzenia";
import { ModalUczestnicy } from "@/app/components/ModalUczestnicy";

type ZasiegStyp = "lokalne" | "krajowe" | "europejskie";
type StatusStyp = "aktywne" | "wkrótce" | "zakończone";

interface Stypendium {
    id: string;
    nazwa: string;
    organizator: string;
    kwota: string;
    terminZgloszen: string;
    zasieg: ZasiegStyp;
    status: StatusStyp;
    klasy: string;
    wymagania: string;
    dziedzina: string;
    kolorDziedziny: string;
    ikona: string;
}

const STATUS_KOLOR: Record<StatusStyp, { badge: string; dot: string }> = {
    aktywne: { badge: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400", dot: "bg-green-500 animate-pulse" },
    wkrótce: { badge: "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
    zakończone: { badge: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400", dot: "bg-gray-400" },
};

const ZASIEG_KOLOR: Record<ZasiegStyp, string> = {
    lokalne: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
    krajowe: "bg-[#c62a3a]/10 text-[#c62a3a]",
    europejskie: "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400",
};



export function ModalDodajStypendium({ onZamknij, onWyslane }: { onZamknij: () => void, onWyslane: () => void }) {
    const supabase = createClient();
    
    const [tytul, setTytul] = useState("");
    const [organizator, setOrganizator] = useState("");
    const [kwota, setKwota] = useState("");
    const [termin, setTermin] = useState("");
    const [wymagania, setWymagania] = useState("");
    const [zasiegForm, setZasiegForm] = useState("Lokalne");
    const [ktoForm, setKtoForm] = useState("");
    const [dziedzinaForm, setDziedzinaForm] = useState("");
    const [wysylanie, setWysylanie] = useState(false);
    const [blad, setBlad] = useState<string | null>(null);

    const handleZapisz = async () => {
        setBlad(null);
        if (!tytul.trim() || !organizator.trim() || !kwota.trim() || !termin || !wymagania.trim() || !ktoForm.trim() || !dziedzinaForm.trim()) {
            setBlad("Wszystkie pola są wymagane.");
            return;
        }
        setWysylanie(true);

        const pelneWymagania = `${wymagania.trim()}\n\n[Tagi: Zasięg: ${zasiegForm}, Grupa docelowa: ${ktoForm}, Dziedzina: ${dziedzinaForm}]`;

        const { error } = await supabase.from("stypendia").insert({
            tytul,
            organizator,
            kwota,
            termin: termin,
            wymagania: pelneWymagania,
            ikona: "workspace_premium"
        });

        setWysylanie(false);

        if (error) {
            console.error("Błąd zapisu:", error);
            setBlad("Nie udało się dodać stypendium");
        } else {
            onWyslane();
            onZamknij();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onZamknij} />
            <div className="relative bg-white dark:bg-[#2d1b1e] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-[#2d1b1e]">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Nowe stypendium</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Dodaj ofertę stypendialną</p>
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
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Nazwa stypendium</label>
                        <input value={tytul} onChange={e => setTytul(e.target.value)} type="text" placeholder="np. Stypendium Starosty" className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Organizator</label>
                        <input value={organizator} onChange={e => setOrganizator(e.target.value)} type="text" placeholder="np. Starostwo Powiatowe" className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Kwota</label>
                        <input value={kwota} onChange={e => setKwota(e.target.value)} type="text" placeholder="np. 1500 zł/rok" className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Termin zgłoszeń</label>
                        <input value={termin} onChange={e => setTermin(e.target.value)} type="date" className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Wymagania podstawowe</label>
                        <textarea value={wymagania} onChange={e => setWymagania(e.target.value)} rows={3} className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40 resize-none" placeholder="np. Średnia ≥ 4.8, aktywność społeczna..." />
                    </div>
                    <hr className="border-gray-200 dark:border-gray-700" />
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Zasięg</label>
                        <select value={zasiegForm} onChange={e => setZasiegForm(e.target.value)} className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40">
                            <option>Lokalne</option>
                            <option>Ogólnokrajowe</option>
                            <option>Europejskie</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Grupa docelowa (wiek, klasa)</label>
                        <input value={ktoForm} onChange={e => setKtoForm(e.target.value)} type="text" placeholder="np. uczeń, 18+" className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Zainteresowania / Dziedzina</label>
                        <input value={dziedzinaForm} onChange={e => setDziedzinaForm(e.target.value)} type="text" placeholder="np. Sport, Nauki ścisłe, Sztuka" className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40" />
                    </div>
                </div>
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 sticky bottom-0 bg-white dark:bg-[#2d1b1e]">
                    <button disabled={wysylanie} onClick={onZamknij} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">Anuluj</button>
                    <button disabled={wysylanie} onClick={handleZapisz} className="flex-[2] py-2.5 bg-[#c62a3a] text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50">
                        {wysylanie ? "Zapisywanie..." : "Dodaj stypendium"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function StronaStypendiow() {
    const supabase = createClient();
    const [dane, setDane] = useState<Stypendium[]>([]);
    const [ladowanie, setLadowanie] = useState(true);

    const [szukaj, setSzukaj] = useState("");
    const [modalDodaj, setModalDodaj] = useState(false);
    const [rozwinietaId, setRozwinietaId] = useState<string | null>(null);
    const [modalAplikanci, setModalAplikanci] = useState<Stypendium | null>(null);

    const [doUsuniecia, setDoUsuniecia] = useState<Stypendium | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleUsun = async () => {
        if (!doUsuniecia) return;
        setIsDeleting(true);
        const { error } = await supabase.from('stypendia').delete().eq('id', doUsuniecia.id);
        setIsDeleting(false);
        if (!error) {
            setDoUsuniecia(null);
            pobierzStypendia();
        } else {
            console.error("Błąd usuwania:", error);
            alert("Błąd. Sprawdź konsolę.");
        }
    };

    const pobierzStypendia = async () => {
        setLadowanie(true);
        const { data, error } = await supabase.from("stypendia").select("*").order("created_at", { ascending: false });
        if (!error && data) {
            setDane(data.map(s => ({
                id: s.id,
                nazwa: s.tytul,
                organizator: s.organizator || "Nieznany",
                kwota: s.kwota || "Brak danych",
                terminZgloszen: s.termin || "Bezterminowo",
                zasieg: "krajowe", // domyslnie mapujemy
                status: "aktywne",
                klasy: "Wszystkie",
                wymagania: s.wymagania || "Brak szczególnych wymagań",
                dziedzina: "Ogólne",
                kolorDziedziny: "bg-blue-600",
                ikona: s.ikona || "science"
            })));
        }
        setLadowanie(false);
    }

    useEffect(() => {
        pobierzStypendia();
    }, []);

    const przefiltrowane = useMemo(() =>
        dane.filter(s =>
            szukaj === "" || s.nazwa.toLowerCase().includes(szukaj.toLowerCase()) || s.organizator.toLowerCase().includes(szukaj.toLowerCase())
        ), [szukaj, dane]);

    return (
        <>
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="h-16 flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-[#2d1b1e]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-10 sticky top-0 transition-colors">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Stypendia</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{przefiltrowane.length} ofert</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-gray-400 text-[18px]">search</span>
                            </div>
                            <input value={szukaj} onChange={e => setSzukaj(e.target.value)} className="block w-56 pl-9 pr-3 py-2 border-none rounded-lg bg-gray-100 dark:bg-[#201214] text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40 transition-all" placeholder="Szukaj stypendium..." type="text" />
                        </div>
                        <button onClick={() => setModalDodaj(true)} className="flex items-center gap-2 px-4 py-2 bg-[#c62a3a] text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm shadow-red-200 dark:shadow-none">
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Nowe stypendium
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-5">


                    {ladowanie ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin inline-block size-10 border-4 border-[#c62a3a] border-b-transparent rounded-full" />
                        </div>
                    ) : przefiltrowane.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                             <span className="material-symbols-outlined text-6xl mb-4">workspace_premium</span>
                             <p className="font-bold text-lg">Brak stypendiów</p>
                             <button onClick={() => setSzukaj("")} className="text-[#c62a3a] font-bold mt-2 hover:underline">Wyczyść szukaj</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {przefiltrowane.map(s => (
                                <div key={s.id} className="bg-white dark:bg-[#2d1b1e] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                                    {/* Kolorowy pasek nagłówka */}
                                    <div className={`h-2 w-full ${s.kolorDziedziny.replace('bg-', 'bg-').replace('-600', '-500')}`} />
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className={`size-11 rounded-xl ${s.kolorDziedziny.replace('bg-', 'bg-').replace('-600', '-500')} bg-opacity-15 flex items-center justify-center text-white`}>
                                                <span className="material-symbols-outlined text-xl">{s.ikona}</span>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${ZASIEG_KOLOR[s.zasieg]}`}>
                                                {s.zasieg.toUpperCase()}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">{s.nazwa}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{s.organizator}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-3">{s.wymagania}</p>

                                        {/* Status */}
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full mb-4 w-fit ${STATUS_KOLOR[s.status].badge}`}>
                                            <span className={`size-1.5 rounded-full ${STATUS_KOLOR[s.status].dot}`} />
                                            {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                                        </span>

                                        {/* Kwota i Data */}
                                        <div className="mt-auto grid grid-cols-2 gap-2 text-xs">
                                            <div className="bg-gray-50 dark:bg-[#201214] rounded-lg p-2">
                                                <p className="text-gray-400 mb-0.5">Kwota:</p>
                                                <p className="font-bold text-gray-700 dark:text-gray-300">{s.kwota}</p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-[#201214] rounded-lg p-2">
                                                <p className="text-gray-400 mb-0.5">Zgłoszenia do:</p>
                                                <p className="font-bold text-gray-700 dark:text-gray-300">
                                                    {(() => {
                                                        if (!s.terminZgloszen || s.terminZgloszen === "Bezterminowo") return "Bezterminowo";
                                                        const d = new Date(s.terminZgloszen);
                                                        return isNaN(d.getTime()) ? s.terminZgloszen : d.toLocaleDateString("pl-PL", { day: 'numeric', month: 'long', year: 'numeric' });
                                                    })()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-700 px-5 py-3 flex items-center justify-between bg-gray-50/50 dark:bg-[#201214]/30 mt-auto">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setModalAplikanci(s); }}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold text-white bg-[#c62a3a] hover:bg-red-700 transition-all"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">group</span>
                                            Aplikanci
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); setDoUsuniecia(s); }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all" title="Usuń">
                                            <span className="material-symbols-outlined text-[16px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button onClick={() => setModalDodaj(true)} className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#2d1b1e]/50 p-8 hover:border-[#c62a3a]/50 hover:bg-gray-50 dark:hover:bg-[#2d1b1e] transition-all group min-h-[200px]">
                                <div className="size-14 rounded-full bg-white dark:bg-[#2d1b1e] shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-3xl text-gray-400 group-hover:text-[#c62a3a]">workspace_premium</span>
                                </div>
                                <p className="mt-3 font-bold text-gray-500 dark:text-gray-400 group-hover:text-[#c62a3a] transition-colors">Dodaj stypendium</p>
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {modalDodaj && <ModalDodajStypendium onWyslane={pobierzStypendia} onZamknij={() => setModalDodaj(false)} />}
            
            <ModalPotwierdzenia
                isOpen={!!doUsuniecia}
                onClose={() => setDoUsuniecia(null)}
                onConfirm={handleUsun}
                tytul="Usuń stypendium"
                opis={`Czy na pewno chcesz trwale usunąć ofertę "${doUsuniecia?.nazwa}"? Tej operacji nie można cofnąć.`}
                isDeleting={isDeleting}
            />

            {modalAplikanci && (
                <ModalUczestnicy
                    typ="stypendium"
                    itemId={modalAplikanci.id}
                    tytul={modalAplikanci.nazwa}
                    onClose={() => setModalAplikanci(null)}
                />
            )}
        </>
    );
}
