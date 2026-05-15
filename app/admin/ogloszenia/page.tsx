"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { ModalPotwierdzenia } from "@/app/components/ModalPotwierdzenia";

type Priorytet = "normalne" | "ważne" | "pilne";
type StatusOgl = "aktywne" | "zaplanowane" | "zakończone";

interface Ogloszenie {
    id: string;
    tytul: string;
    tresc: string;
    priorytet: Priorytet;
    status: StatusOgl;
    odbiorca: string;
    autor: string;
    dataPublikacji: string;
    przypięte: boolean;
}

const PRIORYTETY_STYLE: Record<Priorytet, { badge: string; dot: string; label: string }> = {
    pilne: { badge: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800", dot: "bg-red-500", label: "Pilne" },
    ważne: { badge: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800", dot: "bg-amber-500", label: "Ważne" },
    normalne: { badge: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800", dot: "bg-blue-400", label: "Normalne" },
};

const STATUS_STYLE: Record<StatusOgl, string> = {
    aktywne: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
    zaplanowane: "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
    zakończone: "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400",
};

const STATUS_LABEL: Record<StatusOgl, string> = {
    aktywne: "Aktywne", zaplanowane: "Zaplanowane", zakończone: "Zakończone",
};

type TabFiltr = "wszystkie" | StatusOgl;

// ── Modal dodawania ──────────────────────────────────────────────────────────
export function ModalDodajOgloszenie({ onZamknij, onWyslane }: { onZamknij: () => void, onWyslane: () => void }) {
    const supabase = createClient();
    const [tytul, setTytul] = useState("");
    const [tresc, setTresc] = useState("");
    const [priorytet, setPriorytet] = useState<Priorytet | "">("");
    const [odbiorca, setOdbiorca] = useState("");
    const [przypiete, setPrzypiete] = useState(false);
    const [wysylanie, setWysylanie] = useState(false);
    const [blad, setBlad] = useState<string | null>(null);

    const handleZapisz = async () => {
        setBlad(null);
        if (!tytul.trim() || !tresc.trim() || !priorytet || !odbiorca) {
            setBlad("Wszystkie pola są wymagane.");
            return;
        }

        setWysylanie(true);

        // Ustalenie koloru taga na pulpicie docelowo
        let tagKolor = "blue";
        if (priorytet === "pilne") tagKolor = "red";
        else if (priorytet === "ważne") tagKolor = "emerald";

        const { error } = await supabase.from("ogloszenia").insert({
            tytul,
            tresc,
            priorytet,
            autor: "Administrator", // Hardcoded autor
            przypiete,
            tag_color: tagKolor
        });

        setWysylanie(false);

        if (error) {
            console.error("Błąd zapisu ogłoszenia:", error);
            setBlad("Nie udało się zapisać ogłoszenia.");
        } else {
            onWyslane();
            onZamknij();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onZamknij} />
            <div className="relative bg-white dark:bg-[#2d1b1e] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-[#2d1b1e] z-10">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Nowe ogłoszenie</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Wypełnij dane ogłoszenia</p>
                    </div>
                    <button onClick={onZamknij} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-gray-500">close</span>
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    {blad && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 font-medium flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">error</span>
                            {blad}
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tytuł</label>
                        <input value={tytul} onChange={e => setTytul(e.target.value)} className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40 transition-all" placeholder="Temat ogłoszenia..." type="text" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Treść</label>
                        <textarea value={tresc} onChange={e => setTresc(e.target.value)} rows={4} className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40 transition-all resize-none" placeholder="Wpisz treść ogłoszenia..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Priorytet</label>
                            <select value={priorytet} onChange={e => setPriorytet(e.target.value as Priorytet | "")} className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40 transition-all">
                                <option value="" disabled>Wybierz...</option>
                                <option value="normalne">Normalne</option>
                                <option value="ważne">Ważne</option>
                                <option value="pilne">Pilne</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Odbiorcy</label>
                            <select value={odbiorca} onChange={e => setOdbiorca(e.target.value)} className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40 transition-all">
                                <option value="" disabled>Wybierz...</option>
                                <option value="Cała szkoła">Cała szkoła</option>
                                <option value="Uczniowie">Uczniowie</option>
                                <option value="Klasy 9-12">Klasy 9-12</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#201214]">
                        <input checked={przypiete} onChange={e => setPrzypiete(e.target.checked)} type="checkbox" id="przypnij" className="rounded border-gray-300 text-[#c62a3a] focus:ring-[#c62a3a] h-4 w-4 cursor-pointer" />
                        <label htmlFor="przypnij" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                            Przypiąć do tablicy (wyświetlaj na górze)
                        </label>
                    </div>
                </div>
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 sticky bottom-0 bg-white dark:bg-[#2d1b1e]">
                    <button disabled={wysylanie} onClick={onZamknij} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
                        Anuluj
                    </button>
                    <button disabled={wysylanie} onClick={() => handleZapisz()} className="flex-[2] py-2.5 bg-[#c62a3a] text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors shadow-sm shadow-red-200 dark:shadow-none disabled:opacity-50">
                        {wysylanie ? "Zapisywanie..." : "Opublikuj teraz"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Główny komponent ──────────────────────────────────────────────────────────
export default function StronaOgloszen() {
    const supabase = createClient();
    const [dane, setDane] = useState<Ogloszenie[]>([]);
    const [ladowanie, setLadowanie] = useState(true);

    const [szukaj, setSzukaj] = useState("");
    const [aktywnaZakladka, setAktywnaZakladka] = useState<TabFiltr>("wszystkie");
    const [modalOtwarte, setModalOtwarte] = useState(false);
    const [rozwinietaId, setRozwinietaId] = useState<string | null>(null);

    const [doUsuniecia, setDoUsuniecia] = useState<Ogloszenie | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleUsun = async () => {
        if (!doUsuniecia) return;
        setIsDeleting(true);
        const { error } = await supabase.from('ogloszenia').delete().eq('id', doUsuniecia.id);
        setIsDeleting(false);
        if (!error) {
            setDoUsuniecia(null);
            pobierzOgłoszenia();
        } else {
            console.error("Błąd usuwania:", error);
            alert("Błąd. Prawdopodobnie brak dostępu do bazy (RLS).");
        }
    };

    const pobierzOgłoszenia = async () => {
        setLadowanie(true);
        const { data, error } = await supabase.from("ogloszenia").select("*").order("created_at", { ascending: false });
        if (!error && data) {
            setDane(data.map(o => ({
                id: o.id,
                tytul: o.tytul,
                tresc: o.tresc,
                priorytet: o.priorytet as Priorytet || "normalne",
                status: "aktywne", // Domyślnie z bazy ładujemy jako aktywne dla uproszczenia
                odbiorca: "Cała szkoła",
                autor: o.autor || "Administrator",
                dataPublikacji: new Date(o.created_at).toLocaleDateString("pl-PL", { year: 'numeric', month: 'short', day: 'numeric' }),
                przypięte: o.przypiete || false
            })));
        }
        setLadowanie(false);
    };

    useEffect(() => {
        pobierzOgłoszenia();
    }, []);

    const zakładki: { klucz: TabFiltr; etykieta: string }[] = [
        { klucz: "wszystkie", etykieta: `Wszystkie (${dane.length})` },
        { klucz: "aktywne", etykieta: `Aktywne (${dane.filter(o => o.status === "aktywne").length})` },
        { klucz: "zaplanowane", etykieta: `Zaplanowane (${dane.filter(o => o.status === "zaplanowane").length})` },
    ];

    const przefiltrowane = useMemo(() =>
        dane.filter(o => {
            const pasujeSzukaj = szukaj === "" ||
                o.tytul.toLowerCase().includes(szukaj.toLowerCase()) ||
                o.autor.toLowerCase().includes(szukaj.toLowerCase());
            const pasujeTab = aktywnaZakladka === "wszystkie" || o.status === aktywnaZakladka;
            return pasujeSzukaj && pasujeTab;
        }).sort((a, b) => Number(b.przypięte) - Number(a.przypięte)),
        [szukaj, aktywnaZakladka, dane]
    );

    return (
        <>
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Nagłówek */}
                <header className="h-16 flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-[#2d1b1e]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-10 sticky top-0 transition-colors">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Ogłoszenia</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{przefiltrowane.length} ogłoszeń w bazie</p>
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
                        <button onClick={() => setModalOtwarte(true)} className="flex items-center gap-2 px-4 py-2 bg-[#c62a3a] text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm shadow-red-200 dark:shadow-none">
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Nowe ogłoszenie
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-5">
                    {/* Zakładki */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto whitespace-nowrap hide-scrollbar">
                        {zakładki.map(z => (
                            <button
                                key={z.klucz}
                                onClick={() => setAktywnaZakladka(z.klucz)}
                                className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${aktywnaZakladka === z.klucz
                                    ? "border-[#c62a3a] text-[#c62a3a]"
                                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                    }`}
                            >
                                {z.etykieta}
                            </button>
                        ))}
                    </div>

                    {/* Lista ogłoszeń */}
                    <div className="bg-white dark:bg-[#2d1b1e] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-[#201214]/60 border-b border-gray-200 dark:border-gray-700">
                                        <th className="w-8 px-4 py-4 text-center"><span className="material-symbols-outlined text-gray-400 text-[18px]">push_pin</span></th>
                                        <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Tytuł ogłoszenia</th>
                                        <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 hidden sm:table-cell">Odbiorcy</th>
                                        <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Priorytet</th>
                                        <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 hidden lg:table-cell">Data</th>
                                        <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">Akcje</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                    {ladowanie ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-10">
                                                <div className="animate-spin inline-block size-6 border-2 border-[#c62a3a] border-b-transparent rounded-full" />
                                            </td>
                                        </tr>
                                    ) : przefiltrowane.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-16">
                                                <div className="flex flex-col items-center text-gray-400">
                                                    <span className="material-symbols-outlined text-5xl mb-3">campaign</span>
                                                    <p className="font-semibold">Brak ogłoszeń</p>
                                                    <button onClick={() => { setSzukaj(""); setAktywnaZakladka("wszystkie"); }} className="text-sm font-bold text-[#c62a3a] hover:underline mt-2">Wyczyść filtry</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : przefiltrowane.map(o => (
                                        <React.Fragment key={o.id}>
                                            <tr
                                                key={o.id}
                                                onClick={() => setRozwinietaId(rozwinietaId === o.id ? null : o.id)}
                                                className={`hover:bg-gray-50 dark:hover:bg-[#201214]/40 transition-colors group cursor-pointer ${rozwinietaId === o.id ? "bg-gray-50 dark:bg-[#201214]/40" : ""}`}
                                            >
                                                {/* Pin */}
                                                <td className="px-4 py-4 text-center">
                                                    <span className={`material-symbols-outlined text-[18px] ${o.przypięte ? "text-[#c62a3a] icon-filled" : "text-gray-300 dark:text-gray-600"}`}>push_pin</span>
                                                </td>
                                                {/* Tytuł */}
                                                <td className="px-4 py-4">
                                                    <p className={`text-sm font-bold text-gray-900 dark:text-white`}>{o.tytul}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Autor: {o.autor}</p>
                                                </td>
                                                {/* Odbiorcy */}
                                                <td className="px-4 py-4 hidden sm:table-cell">
                                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{o.odbiorca}</span>
                                                </td>
                                                {/* Priorytet */}
                                                <td className="px-4 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${PRIORYTETY_STYLE[o.priorytet].badge}`}>
                                                        <span className={`size-1.5 rounded-full ${PRIORYTETY_STYLE[o.priorytet].dot}`} />
                                                        {PRIORYTETY_STYLE[o.priorytet].label}
                                                    </span>
                                                </td>
                                                {/* Data */}
                                                <td className="px-4 py-4 hidden lg:table-cell">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">{o.dataPublikacji}</span>
                                                </td>
                                                {/* Akcje */}
                                                <td className="px-4 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={(e) => { e.stopPropagation(); setDoUsuniecia(o); }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all" title="Usuń">
                                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                                        </button>
                                                        <span className="material-symbols-outlined text-gray-400 text-[18px] ml-1">
                                                            {rozwinietaId === o.id ? "expand_less" : "expand_more"}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            {/* Rozwinięty podgląd treści */}
                                            {rozwinietaId === o.id && (
                                                <tr key={`${o.id}-tresc`} className="bg-gray-50 dark:bg-[#201214]/40">
                                                    <td />
                                                    <td colSpan={5} className="px-4 py-4">
                                                        <div className={`border-l-2 pl-4 ${o.priorytet === "pilne" ? "border-red-500" : o.priorytet === "ważne" ? "border-amber-500" : "border-blue-400"}`}>
                                                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{o.tresc}</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50/50 dark:bg-[#201214]/30">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Wyświetlono <span className="font-bold text-gray-900 dark:text-white">{przefiltrowane.length}</span> z <span className="font-bold text-gray-900 dark:text-white">{dane.length}</span> ogłoszeń
                            </span>
                        </div>
                    </div>
                </div>
            </main>

            {modalOtwarte && <ModalDodajOgloszenie onWyslane={pobierzOgłoszenia} onZamknij={() => setModalOtwarte(false)} />}
            
            <ModalPotwierdzenia
                isOpen={!!doUsuniecia}
                onClose={() => setDoUsuniecia(null)}
                onConfirm={handleUsun}
                tytul="Usuń ogłoszenie"
                opis={`Czy na pewno chcesz trwale usunąć ogłoszenie "${doUsuniecia?.tytul}"? Tej operacji nie można cofnąć.`}
                isDeleting={isDeleting}
            />
        </>
    );
}
