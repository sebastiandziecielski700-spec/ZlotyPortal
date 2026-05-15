"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { ModalPotwierdzenia } from "@/app/components/ModalPotwierdzenia";

type TypTresci = "głosowanie" | "ankieta" | "petycja";
type StatusTresci = "aktywne" | "zakończone";

interface Glosowanie {
    id: string;
    tytul: string;
    opis: string;
    typ: TypTresci;
    status: StatusTresci;
    autor: string;
    dataKonca: string;
    uczestnicyCel: number;
    uczestnicyAktual: number;
    opcje: { tekst: string; glosy: number }[];
    oryginalneId: number;
}

const TYP_KOLOR: Record<TypTresci, { bg: string; text: string; icon: string }> = {
    głosowanie: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400", icon: "how_to_vote" },
    ankieta: { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-600 dark:text-purple-400", icon: "poll" },
    petycja: { bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-600 dark:text-orange-400", icon: "ink_pen" },
};

const STATUS_KOLOR: Record<StatusTresci, string> = {
    aktywne: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
    zakończone: "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400",
};

type TabFiltr = "wszystkie" | TypTresci;

// Modal z wynikami podgladu
function ModalWyniki({ g, onZamknij }: { g: Glosowanie; onZamknij: () => void }) {
    const lacznie = g.opcje.reduce((s, o) => s + o.glosy, 0) || 1;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onZamknij} />
            <div className="relative bg-white dark:bg-[#2d1b1e] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between">
                    <div>
                        <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full mb-2 ${TYP_KOLOR[g.typ].bg} ${TYP_KOLOR[g.typ].text}`}>
                            <span className="material-symbols-outlined text-[12px]">{TYP_KOLOR[g.typ].icon}</span>
                            {g.typ.charAt(0).toUpperCase() + g.typ.slice(1)}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{g.tytul}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{g.opis}</p>
                    </div>
                    <button onClick={onZamknij} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full flex-shrink-0 ml-3">
                        <span className="material-symbols-outlined text-gray-500">close</span>
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex justify-between text-sm mb-4">
                        <span className="text-gray-500 dark:text-gray-400">Uczestników: <span className="font-bold text-gray-900 dark:text-white">{g.uczestnicyAktual}</span> / {g.uczestnicyCel}</span>
                        <span className="text-gray-500 dark:text-gray-400">Koniec: <span className="font-bold text-gray-900 dark:text-white">{g.dataKonca}</span></span>
                    </div>
                    {g.opcje.map(o => {
                        const proc = Math.round((o.glosy / lacznie) * 100);
                        return (
                            <div key={o.tekst}>
                                <div className="flex justify-between text-sm mb-1.5">
                                    <span className="font-medium text-gray-800 dark:text-gray-200">{o.tekst}</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{proc}% <span className="text-gray-400 font-normal">({o.glosy})</span></span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
                                    <div className="bg-[#c62a3a] h-2.5 rounded-full transition-all" style={{ width: `${proc}%` }} />
                                </div>
                            </div>
                        );
                    })}
                    {g.opcje.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Brak odpowiedzi</p>}
                </div>
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                    <button onClick={onZamknij} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Zamknij</button>
                    {g.status === "aktywne" && (
                        <button onClick={onZamknij} className="flex-1 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                            Zakończ akcję
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function ModalDodaj({ onZamknij, onWyslane }: { onZamknij: () => void, onWyslane: () => void }) {
    const supabase = createClient();
    
    const [typ, setTyp] = useState<TypTresci | "">("");
    const [tytul, setTytul] = useState("");
    const [opis, setOpis] = useState(""); // zostanie przypisany do dodatkowych/wymaganych pól
    const [dataZakonczenia, setDataZakonczenia] = useState("");
    const [wysylanie, setWysylanie] = useState(false);
    const [blad, setBlad] = useState<string | null>(null);
    const [opcjeGlosowania, setOpcjeGlosowania] = useState<string[]>(["Tak", "Nie"]);

    const handleZapis = async () => {
        setBlad(null);
        if (!typ || !tytul.trim() || !opis.trim() || !dataZakonczenia.trim()) {
            setBlad("Wszystkie pola są wymagane.");
            return;
        }

        if (typ === "głosowanie" && opcjeGlosowania.some(o => !o.trim())) {
            setBlad("Wszystkie opcje głosowania muszą być wypełnione.");
            return;
        }

        setWysylanie(true);
        let errorObj = null;

        if (typ === "głosowanie") {
            const finalneOpcje = [...opcjeGlosowania.map(o => o.trim()), "Wstrzymuję się od głosu"];
            const { error } = await supabase.from("glosowania").insert({
                tytul: tytul,
                status_opis: dataZakonczenia ? `Koniec w ${dataZakonczenia}` : opis || "W toku",
                status_kategoria: "Ważne",
                aktywne: true,
                opcje: finalneOpcje
            });
            errorObj = error;
        } else if (typ === "ankieta") {
            const { error } = await supabase.from("ankiety").insert({
                tytul: tytul,
                czas_wypelniania: dataZakonczenia ? `Do: ${dataZakonczenia}` : opis || "~2 min",
                kategoria: "Opinie",
                otwarta: true
            });
            errorObj = error;
        } else if (typ === "petycja") {
            const { error } = await supabase.from("petycje").insert({
                tytul: tytul,
                liczba_podpisow: 0,
                wymagane_podpisy: 200,
                kategoria: opis || "Społeczne"
            });
            errorObj = error;
        }

        setWysylanie(false);

        if (errorObj) {
            console.error("Błąd bazy danych (Supabase):", errorObj);
            setBlad(`Nie dodano formy! Błąd: ${errorObj.message || "Brak szczegółów"}`);
        } else {
            onWyslane();
            onZamknij();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onZamknij} />
            <div className="relative bg-white dark:bg-[#2d1b1e] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Nowe głosowanie / ankieta</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Stwórz nową formę zaangażowania</p>
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
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Typ</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(["głosowanie", "ankieta", "petycja"] as TypTresci[]).map(t => (
                                <button key={t} onClick={() => setTyp(t)} className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 hover:border-[#c62a3a]/50 transition-all ${
                                    typ === t ? `border-[#c62a3a] ${TYP_KOLOR[t].bg} ${TYP_KOLOR[t].text}` : `border-gray-200 dark:border-gray-600`
                                }`}>
                                    <span className="material-symbols-outlined text-2xl">{TYP_KOLOR[t].icon}</span>
                                    <span className="text-xs font-bold capitalize">{t}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tytuł</label>
                        <input value={tytul} onChange={e => setTytul(e.target.value)} className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40 text-gray-900 dark:text-white" placeholder="np. Wybory Przewodniczącego SU" type="text" />
                    </div>
                    {typ === "głosowanie" && (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Opcje głosowania (min. 2)</label>
                            <div className="space-y-2">
                                {opcjeGlosowania.map((opcja, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            value={opcja}
                                            onChange={(e) => {
                                                const noweOpcje = [...opcjeGlosowania];
                                                noweOpcje[index] = e.target.value;
                                                setOpcjeGlosowania(noweOpcje);
                                            }}
                                            className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40 text-gray-900 dark:text-white"
                                            placeholder={`Opcja ${index + 1}`}
                                        />
                                        {opcjeGlosowania.length > 2 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const noweOpcje = opcjeGlosowania.filter((_, i) => i !== index);
                                                    setOpcjeGlosowania(noweOpcje);
                                                }}
                                                className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                                title="Usuń opcję"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">Opcja "Wstrzymuję się od głosu" zostanie dodana automatycznie do każdej ankiety.</div>
                            <button
                                type="button"
                                onClick={() => setOpcjeGlosowania([...opcjeGlosowania, ""])}
                                className="mt-3 flex items-center gap-1 text-sm font-bold text-[#c62a3a] hover:text-red-700 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[16px]">add</span> Dodaj kolejną opcję
                            </button>
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Opis / Dodatkowe Informacje</label>
                        <textarea value={opis} onChange={e => setOpis(e.target.value)} rows={3} className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40 resize-none text-gray-900 dark:text-white" placeholder="Krótki opis..." />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Data zamknięcia / Zakończenia</label>
                        <input value={dataZakonczenia} onChange={e => setDataZakonczenia(e.target.value)} type="date" className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40 text-gray-900 dark:text-white" />
                    </div>
                </div>
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                    <button disabled={wysylanie} onClick={onZamknij} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">Anuluj</button>
                    <button disabled={wysylanie} onClick={handleZapis} className="flex-[2] py-2.5 bg-[#c62a3a] text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50">
                        {wysylanie ? "Wysyłanie..." : "Opublikuj"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function StronaGlosowan() {
    const supabase = createClient();
    const [dane, setDane] = useState<Glosowanie[]>([]);
    const [ladowanie, setLadowanie] = useState(true);

    const [filtr, setFiltr] = useState<TabFiltr>("wszystkie");
    const [szukaj, setSzukaj] = useState("");
    const [podgladId, setPodgladId] = useState<string | null>(null);
    const [modalDodaj, setModalDodaj] = useState(false);

    const [doUsuniecia, setDoUsuniecia] = useState<Glosowanie | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleUsun = async () => {
        if (!doUsuniecia) return;
        setIsDeleting(true);

        let table = "glosowania";
        if (doUsuniecia.typ === "ankieta") table = "ankiety";
        if (doUsuniecia.typ === "petycja") table = "petycje";

        const { error } = await supabase.from(table).delete().eq('id', doUsuniecia.oryginalneId);
        
        setIsDeleting(false);
        if (!error) {
            setDoUsuniecia(null);
            pobierzDane();
        } else {
            console.error("Błąd usuwania:", error);
            alert("Błąd usuwania (RLS).");
        }
    };

    const pobierzDane = async () => {
        setLadowanie(true);

        const [rGlosowania, rAnkiety, rPetycje, rGlosy, rAnkietyWypelnienia] = await Promise.all([
            supabase.from("glosowania").select("*"),
            supabase.from("ankiety").select("*"),
            supabase.from("petycje").select("*"),
            supabase.from("glosowania_glosy").select("*"),
            supabase.from("ankiety_wypelnienia").select("*")
        ]);

        const nowe: Glosowanie[] = [];

        if (rGlosowania.data) {
            rGlosowania.data.forEach(g => {
                const glosy = rGlosy.data?.filter(x => x.glosowanie_id === g.id) || [];
                const counts: Record<string, number> = {};
                let dostepneOpcje = ["Tak", "Nie", "Wstrzymuję się"];
                if (g.opcje) {
                    try { dostepneOpcje = JSON.parse(g.opcje); } catch (e) {}
                }
                dostepneOpcje.forEach(o => counts[o] = 0);
                glosy.forEach(x => {
                    if (counts[x.wybor] !== undefined) counts[x.wybor]++;
                    else counts[x.wybor] = 1;
                });
                const opcjeMapowane = Object.keys(counts).map(k => ({ tekst: k, glosy: counts[k] }));

                nowe.push({
                    id: `g-${g.id}`,
                    oryginalneId: g.id,
                    typ: "głosowanie",
                    tytul: g.tytul,
                    opis: g.status_opis || "Brak opisu",
                    status: g.aktywne ? "aktywne" : "zakończone",
                    autor: "Administrator",
                    dataKonca: g.status_opis,
                    uczestnicyCel: 200,
                    uczestnicyAktual: glosy.length,
                    opcje: opcjeMapowane
                });
            });
        }

        if (rAnkiety.data) {
            rAnkiety.data.forEach(a => {
                const wypelnienia = rAnkietyWypelnienia.data?.filter(x => x.ankieta_id === a.id) || [];
                nowe.push({
                    id: `a-${a.id}`,
                    oryginalneId: a.id,
                    typ: "ankieta",
                    tytul: a.tytul,
                    opis: `Czas trwania: ${a.czas_wypelniania}`,
                    status: a.otwarta ? "aktywne" : "zakończone",
                    autor: "Administrator",
                    dataKonca: "-",
                    uczestnicyCel: 200,
                    uczestnicyAktual: wypelnienia.length,
                    opcje: [{tekst: "Wypełniono", glosy: wypelnienia.length}]
                });
            });
        }

        if (rPetycje.data) {
            rPetycje.data.forEach(p => {
                nowe.push({
                    id: `p-${p.id}`,
                    oryginalneId: p.id,
                    typ: "petycja",
                    tytul: p.tytul,
                    opis: `Kategoria: ${p.kategoria}`,
                    status: "aktywne",
                    autor: "Administrator",
                    dataKonca: "-",
                    uczestnicyCel: p.wymagane_podpisy || 200,
                    uczestnicyAktual: p.liczba_podpisow || 0,
                    opcje: [{tekst: "Podpisali", glosy: p.liczba_podpisow || 0}]
                });
            });
        }

        // Sortowanie po oryginalnym ID ujemnie 
        nowe.sort((a,b) => b.oryginalneId - a.oryginalneId);

        setDane(nowe);
        setLadowanie(false);
    }

    useEffect(() => {
        pobierzDane();
    }, []);

    const przefiltrowane = useMemo(() =>
        dane.filter(g =>
            (filtr === "wszystkie" || g.typ === filtr) &&
            (szukaj === "" || g.tytul.toLowerCase().includes(szukaj.toLowerCase()))
        ), [filtr, szukaj, dane]);

    const wybrane = dane.find(g => g.id === podgladId) ?? null;

    const filtry: { klucz: TabFiltr; etykieta: string; ikona: string }[] = [
        { klucz: "wszystkie", etykieta: "Wszystkie", ikona: "list" },
        { klucz: "głosowanie", etykieta: "Głosowania", ikona: "how_to_vote" },
        { klucz: "ankieta", etykieta: "Ankiety", ikona: "poll" },
        { klucz: "petycja", etykieta: "Petycje", ikona: "ink_pen" },
    ];

    return (
        <>
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="h-16 flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-[#2d1b1e]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-10 sticky top-0 transition-colors">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Głos Ucznia (Admin)</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{przefiltrowane.length} w bazie</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-gray-400 text-[18px]">search</span>
                            </div>
                            <input value={szukaj} onChange={e => setSzukaj(e.target.value)} className="block w-56 pl-9 pr-3 py-2 border-none rounded-lg bg-gray-100 dark:bg-[#201214] text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40 transition-all placeholder-gray-500 text-gray-900 dark:text-white" placeholder="Szukaj..." type="text" />
                        </div>
                        <button onClick={() => setModalDodaj(true)} className="flex items-center gap-2 px-4 py-2 bg-[#c62a3a] text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm shadow-red-200 dark:shadow-none">
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Nowe zgłoszenie
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                    <div className="flex flex-wrap gap-2">
                        {filtry.map(f => (
                            <button key={f.klucz} onClick={() => setFiltr(f.klucz)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filtr === f.klucz
                                        ? "bg-[#c62a3a] text-white shadow-sm"
                                        : "bg-white dark:bg-[#2d1b1e] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#c62a3a]/40"
                                    }`}>
                                <span className="material-symbols-outlined text-[16px]">{f.ikona}</span>
                                {f.etykieta}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {ladowanie ? (
                             <div className="col-span-full flex justify-center py-12">
                                <div className="animate-spin inline-block size-10 border-4 border-[#c62a3a] border-b-transparent rounded-full" />
                            </div>
                        ) : przefiltrowane.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                                 <span className="material-symbols-outlined text-6xl mb-4">how_to_vote</span>
                                 <p className="font-bold text-lg">Brak wyników</p>
                            </div>
                        ) : przefiltrowane.map(g => {
                            const lacznie = g.opcje.reduce((s, o) => s + o.glosy, 0) || 1;
                            const proc = Math.round((g.uczestnicyAktual / (g.uczestnicyCel || 1)) * 100);
                            const wiodacaOpcja = [...g.opcje].sort((a, b) => b.glosy - a.glosy)[0];

                            return (
                                <div key={g.id} className="bg-white dark:bg-[#2d1b1e] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                                    <div className="p-5 flex-1">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className={`size-11 rounded-xl ${TYP_KOLOR[g.typ].bg} flex items-center justify-center ${TYP_KOLOR[g.typ].text}`}>
                                                <span className="material-symbols-outlined text-xl">{TYP_KOLOR[g.typ].icon}</span>
                                            </div>
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_KOLOR[g.status]}`}>
                                                {g.status.charAt(0).toUpperCase() + g.status.slice(1)}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug mb-1">{g.tytul}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{g.opis}</p>

                                        {/* Pasek uczestnictwa */}
                                        <div className="mb-3">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-500 dark:text-gray-400">Uczestnictwo</span>
                                                <span className="font-bold text-gray-700 dark:text-gray-300">{g.uczestnicyAktual} / {g.uczestnicyCel}</span>
                                            </div>
                                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                                                <div className="bg-[#c62a3a] h-2 rounded-full" style={{ width: `${Math.min(proc, 100)}%` }} />
                                            </div>
                                        </div>

                                        {/* Wiodąca opcja */}
                                        {wiodacaOpcja && wiodacaOpcja.glosy > 0 && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px] text-amber-500">emoji_events</span>
                                                Prowadzi: <span className="font-semibold text-gray-700 dark:text-gray-300">{wiodacaOpcja.tekst}</span>
                                                <span className="ml-auto font-bold text-gray-900 dark:text-white">{Math.round((wiodacaOpcja.glosy / lacznie) * 100)}%</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-700 px-5 py-3 flex items-center justify-between bg-gray-50/50 dark:bg-[#201214]/30 mt-auto">
                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                                            {g.dataKonca}
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => setPodgladId(g.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#c62a3a] hover:bg-[#c62a3a]/10 transition-all" title="Podgląd wyników">
                                                <span className="material-symbols-outlined text-[16px]">bar_chart</span>
                                            </button>
                                            <button onClick={() => setDoUsuniecia(g)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all" title="Usuń z bazy">
                                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Karta dodaj */}
                        <button onClick={() => setModalDodaj(true)} className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#2d1b1e]/50 p-8 hover:bg-gray-50 dark:hover:bg-[#2d1b1e] hover:border-[#c62a3a]/50 transition-all group min-h-[200px]">
                            <div className="size-14 rounded-full bg-white dark:bg-[#2d1b1e] shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-3xl text-gray-400 group-hover:text-[#c62a3a]">add</span>
                            </div>
                            <p className="mt-3 font-bold text-gray-500 dark:text-gray-400 group-hover:text-[#c62a3a] transition-colors">Utwórz nowe</p>
                            <p className="text-xs text-gray-400 mt-1 text-center">głosowanie, ankietę lub petycję</p>
                        </button>
                    </div>
                </div>
            </main>

            {wybrane && <ModalWyniki g={wybrane} onZamknij={() => setPodgladId(null)} />}
            {modalDodaj && <ModalDodaj onWyslane={pobierzDane} onZamknij={() => setModalDodaj(false)} />}
            
            <ModalPotwierdzenia
                isOpen={!!doUsuniecia}
                onClose={() => setDoUsuniecia(null)}
                onConfirm={handleUsun}
                tytul={`Usuń ${doUsuniecia?.typ}`}
                opis={`Czy na pewno chcesz zlikwidować "${doUsuniecia?.tytul}" z serwera?`}
                isDeleting={isDeleting}
            />
        </>
    );
}
