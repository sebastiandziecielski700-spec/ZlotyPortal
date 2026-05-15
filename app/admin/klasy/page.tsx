"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { ModalPotwierdzenia } from "@/app/components/ModalPotwierdzenia";

interface Klasa {
    id: string; // uuid

    nazwa: string;
    wychowawca: string;
    liczbaUczniow: number;
    profil: string;
    sala: string;
    kolorProfilu: string;
    uczniowie: { imie: string; inicjaly: string; kolor: string }[];
}

// Pobieramy dane z bazy, więc statyczne KLASY usuwamy. Wymagamy jedynie struktury
interface UczeńPodpis {
    imie: string;
    inicjaly: string;
    kolor: string;
}

const PROFIL_IKONA: Record<string, string> = {
    "Matematyczno-Fizyczny": "calculate",
    "Humanistyczny": "menu_book",
    "Biologiczno-Chemiczny": "biotech",
    "Informatyczny": "code",
};

export default function StronaKlas() {
    const supabase = createClient();
    const [klasy, setKlasy] = useState<Klasa[]>([]);
    const [ladowanie, setLadowanie] = useState(true);
    const [wybranaKlasa, setWybranaKlasa] = useState<Klasa | null>(null);
    const [rzeczywistaLiczbaUczniow, setRzeczywistaLiczbaUczniow] = useState<number | null>(null);
    const [modalDodaj, setModalDodaj] = useState(false);

    // Stany formularza nowej klasy
    const [nazwa, setNazwa] = useState("");
    const [wychowawca, setWychowawca] = useState("");
    const [sala, setSala] = useState("");
    const [profil, setProfil] = useState("");
    const [blad, setBlad] = useState<string | null>(null);

    const [doUsuniecia, setDoUsuniecia] = useState<Klasa | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [modalDodajUcznia, setModalDodajUcznia] = useState(false);
    const [wszyscyUzytkownicy, setWszyscyUzytkownicy] = useState<{id: string; imie: string; klasa: string}[]>([]);
    const [szukajUcznia, setSzukajUcznia] = useState("");
    const [dodawanieUcznia, setDodawanieUcznia] = useState(false);
    const [komunikatUcznia, setKomunikatUcznia] = useState<string | null>(null);

    const handleUsun = async () => {
        if (!doUsuniecia) return;
        setIsDeleting(true);
        const { error } = await supabase.from('klasy').delete().eq('id', doUsuniecia.id);
        setIsDeleting(false);
        if (!error) {
            setDoUsuniecia(null);
            if (wybranaKlasa?.id === doUsuniecia.id) setWybranaKlasa(null);
            fetchKlasy();
        } else {
            console.error("Błąd usuwania:", error);
            alert("Błąd. Sprawdź konsolę.");
        }
    };

    const fetchKlasy = async () => {
        setLadowanie(true);
        const { data, error } = await supabase.from("klasy").select("*").order("created_at", { ascending: false });
        if (!error && data) {
            setKlasy(data.map(k => ({
                id: k.id,
                nazwa: k.nazwa,
                wychowawca: k.wychowawca || "Brak",
                liczbaUczniow: k.liczba_uczniow || 0,
                profil: k.profil || "Ogólny",
                sala: k.sala || "Brak",
                kolorProfilu: k.kolor_profilu || "bg-blue-500",
                uczniowie: [] // Pusto dla podglądu, w praktyce z innej tabeli
            })));
        }
        setLadowanie(false);
    };

    useEffect(() => {
        fetchKlasy();
    }, []);

    useEffect(() => {
        if (!wybranaKlasa) {
            setRzeczywistaLiczbaUczniow(null);
            return;
        }
        
        const fetchStudentCount = async () => {
            const { count } = await supabase
                .from('students')
                .select('*', { count: 'exact', head: true })
                .eq('class_id', wybranaKlasa.id);
                
            setRzeczywistaLiczbaUczniow(count ?? 0);
        };
        
        fetchStudentCount();
    }, [wybranaKlasa, supabase]);

    const handleZapiszKlase = async () => {
        setBlad(null);
        if (!nazwa.trim() || !wychowawca.trim() || !sala.trim() || !profil.trim()) {
            setBlad("Wszystkie pola są wymagane.");
            return;
        }
        let kolor = "bg-blue-500";
        if (profil === "Humanistyczny") kolor = "bg-green-600";
        if (profil === "Biologiczno-Chemiczny") kolor = "bg-orange-500";
        if (profil === "Informatyczny") kolor = "bg-violet-500";

        const { error } = await supabase.from("klasy").insert({
            nazwa, wychowawca, profil, sala, kolor_profilu: kolor
        });
        
        if (error) {
            setBlad("Nie udało się zapisać klasy.");
        } else {
            setModalDodaj(false);
            setNazwa(""); setWychowawca(""); setSala(""); setProfil("");
            fetchKlasy();
        }
    };

    const handleOtworzDodajUcznia = async () => {
        setModalDodajUcznia(true);
        setSzukajUcznia("");
        setKomunikatUcznia(null);
        const { data } = await supabase.from("users").select("id, name, surename, clase").order("surename");
        if (data) {
            setWszyscyUzytkownicy(data.map(u => ({ id: u.id, imie: `${u.name} ${u.surename}`, klasa: u.clase || "" })));
        }
    };

    const handlePrzypiszUcznia = async (userId: string) => {
        if (!wybranaKlasa) return;
        setDodawanieUcznia(true);
        setKomunikatUcznia(null);
        const { error } = await supabase.from("users").update({ clase: wybranaKlasa.nazwa }).eq("id", userId);
        setDodawanieUcznia(false);
        if (error) {
            setKomunikatUcznia("❌ Błąd przypisywania");
        } else {
            setKomunikatUcznia("✅ Przypisano!");
            setWszyscyUzytkownicy(prev => prev.map(u => u.id === userId ? { ...u, klasa: wybranaKlasa.nazwa } : u));
            setTimeout(() => setKomunikatUcznia(null), 2000);
        }
    };

    const SUMA_UCZNIOW = klasy.reduce((s, k) => s + k.liczbaUczniow, 0);

    return (
        <>
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="h-16 flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-[#2d1b1e]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-10 sticky top-0 transition-colors">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Klasy</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{klasy.length} klas · {SUMA_UCZNIOW} uczniów łącz. w profilach</p>
                    </div>
                    <button onClick={() => setModalDodaj(true)} className="flex items-center gap-2 px-4 py-2 bg-[#c62a3a] text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm shadow-red-200 dark:shadow-none">
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Dodaj klasę
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    {ladowanie ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin inline-block size-8 border-2 border-[#c62a3a] border-b-transparent rounded-full" />
                        </div>
                    ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {klasy.map(k => (
                            <button
                                key={k.id}
                                onClick={() => setWybranaKlasa(k)}
                                className="bg-white dark:bg-[#2d1b1e] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 transition-all group text-left"
                            >
                                <div className={`h-1.5 w-full ${k.kolorProfilu}`} />
                                <div className="p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`size-12 rounded-xl ${k.kolorProfilu} flex items-center justify-center text-white font-black text-xl`}>
                                                {k.nazwa}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{k.profil}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">door_open</span>
                                                    Sala {k.sala}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{k.liczbaUczniow}</p>
                                            <p className="text-xs text-gray-400">uczniów</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="material-symbols-outlined text-[16px] text-gray-400">person</span>
                                        <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{k.wychowawca}</span>
                                    </div>

                                    {/* Mini awatary */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex -space-x-2">
                                            {k.uczniowie.slice(0, 4).map(u => (
                                                <div key={u.imie} title={u.imie} className={`size-7 rounded-full ${u.kolor} border-2 border-white dark:border-[#2d1b1e] flex items-center justify-center text-white text-[9px] font-black`}>
                                                    {u.inicjaly}
                                                </div>
                                            ))}
                                            {k.liczbaUczniow > 4 && (
                                                <div className="size-7 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-[#2d1b1e] flex items-center justify-center text-gray-600 dark:text-gray-400 text-[9px] font-black">
                                                    +{k.liczbaUczniow - 4}
                                                </div>
                                            )}
                                        </div>
                                        <span className="flex items-center gap-1 text-xs text-[#c62a3a] font-bold group-hover:gap-2 transition-all">
                                            Zobacz uczniów
                                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                        </span>
                                    </div>
                                </div>
                            </button>
                        ))}

                        <button onClick={() => setModalDodaj(true)} className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#2d1b1e]/50 p-8 hover:border-[#c62a3a]/50 hover:bg-gray-50 dark:hover:bg-[#2d1b1e] transition-all group min-h-[180px]">
                            <div className="size-14 rounded-full bg-white dark:bg-[#2d1b1e] shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-3xl text-gray-400 group-hover:text-[#c62a3a]">add</span>
                            </div>
                            <p className="mt-3 font-bold text-gray-500 dark:text-gray-400 group-hover:text-[#c62a3a] transition-colors">Dodaj nową klasę</p>
                        </button>
                    </div>
                    )}
                </div>
            </main>

            {/* Panel szczegółów klasy */}
            {wybranaKlasa && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setWybranaKlasa(null)} />
                    <div className="relative bg-white dark:bg-[#2d1b1e] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md max-h-[85vh] flex flex-col">
                        <div className={`h-2 w-full rounded-t-2xl ${wybranaKlasa.kolorProfilu}`} />
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`size-12 rounded-xl ${wybranaKlasa.kolorProfilu} flex items-center justify-center text-white font-black text-xl`}>
                                    {wybranaKlasa.nazwa}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Klasa {wybranaKlasa.nazwa}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{wybranaKlasa.profil}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setDoUsuniecia(wybranaKlasa)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded-full flex-shrink-0 transition-colors" title="Usuń klasę">
                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                                <button onClick={() => setWybranaKlasa(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full flex-shrink-0">
                                    <span className="material-symbols-outlined text-gray-500 text-[20px]">close</span>
                                </button>
                            </div>
                        </div>

                        <div className="p-4 grid grid-cols-2 gap-3 border-b border-gray-200 dark:border-gray-700">
                            {[
                                { ikona: "person", etykieta: "Wychowawca", wartosc: wybranaKlasa.wychowawca.split(" ").slice(-1)[0] },
                                { ikona: "door_open", etykieta: "Sala", wartosc: wybranaKlasa.sala },
                                { ikona: "school", etykieta: "Liczba uczniów", wartosc: String(wybranaKlasa.liczbaUczniow) },
                                { ikona: "book_4", etykieta: "Profil", wartosc: wybranaKlasa.profil.split("-")[0] },
                            ].map(info => (
                                <div key={info.etykieta} className="bg-gray-50 dark:bg-[#201214] rounded-xl p-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#c62a3a] text-[20px]">{info.ikona}</span>
                                    <div>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">{info.etykieta}</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{info.wartosc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Uczniowie ({wybranaKlasa.liczbaUczniow})
                                </h4>
                                <button
                                    onClick={handleOtworzDodajUcznia}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c62a3a] text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[14px]">person_add</span>
                                    Dodaj ucznia
                                </button>
                            </div>
                            <div className="space-y-2">
                                {wybranaKlasa.uczniowie.map(u => (
                                    <div key={u.imie} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#201214] transition-colors">
                                        <div className={`size-8 rounded-full ${u.kolor} flex items-center justify-center text-white text-xs font-black flex-shrink-0`}>
                                            {u.inicjaly}
                                        </div>
                                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{u.imie}</span>
                                    </div>
                                ))}
                                {rzeczywistaLiczbaUczniow === null ? (
                                    <div className="flex justify-center py-2">
                                        <div className="animate-pulse h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 text-center py-2 italic font-medium">
                                        Uczniów w bazie z tą klasą: {rzeczywistaLiczbaUczniow}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal dodawania ucznia do klasy */}
            {modalDodajUcznia && wybranaKlasa && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalDodajUcznia(false)} />
                    <div className="relative bg-white dark:bg-[#2d1b1e] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md max-h-[80vh] flex flex-col">
                        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">Dodaj ucznia do klasy {wybranaKlasa.nazwa}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Wybierz ucznia z listy</p>
                            </div>
                            <button onClick={() => setModalDodajUcznia(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                                <span className="material-symbols-outlined text-gray-500 text-[20px]">close</span>
                            </button>
                        </div>
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
                                <input
                                    value={szukajUcznia}
                                    onChange={e => setSzukajUcznia(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-gray-100 dark:bg-[#201214] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40"
                                    placeholder="Szukaj po imieniu lub nazwisku..."
                                />
                            </div>
                            {komunikatUcznia && (
                                <p className="text-sm font-bold mt-2 text-center">{komunikatUcznia}</p>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            {wszyscyUzytkownicy
                                .filter(u => szukajUcznia === "" || u.imie.toLowerCase().includes(szukajUcznia.toLowerCase()))
                                .map(u => (
                                    <div key={u.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#201214] transition-colors">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{u.imie}</p>
                                            <p className="text-xs text-gray-500">{u.klasa ? `Klasa: ${u.klasa}` : "Brak klasy"}</p>
                                        </div>
                                        <button
                                            disabled={dodawanieUcznia || u.klasa === wybranaKlasa.nazwa}
                                            onClick={() => handlePrzypiszUcznia(u.id)}
                                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                                                u.klasa === wybranaKlasa.nazwa
                                                    ? "bg-green-100 text-green-700 cursor-default"
                                                    : "bg-[#c62a3a] text-white hover:bg-red-700"
                                            }`}
                                        >
                                            {u.klasa === wybranaKlasa.nazwa ? "W tej klasie" : "Przypisz"}
                                        </button>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal dodawania */}
            {modalDodaj && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalDodaj(false)} />
                    <div className="relative bg-white dark:bg-[#2d1b1e] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div><h3 className="text-lg font-bold text-gray-900 dark:text-white">Nowa klasa</h3><p className="text-sm text-gray-500 dark:text-gray-400">Dodaj klasę do systemu</p></div>
                            <button onClick={() => setModalDodaj(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><span className="material-symbols-outlined text-gray-500">close</span></button>
                        </div>
                        <div className="p-6 space-y-4">
                            {blad && (
                                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 font-medium flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">error</span>
                                    {blad}
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Nazwa klasy</label>
                                <input value={nazwa} onChange={e => setNazwa(e.target.value)} type="text" placeholder="np. 1A" className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Wychowawca</label>
                                <input value={wychowawca} onChange={e => setWychowawca(e.target.value)} type="text" placeholder="np. dr Jan Kowalski" className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Numer sali</label>
                                <input value={sala} onChange={e => setSala(e.target.value)} type="text" placeholder="np. 204" className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Profil</label>
                                <select value={profil} onChange={e => setProfil(e.target.value)} className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40">
                                    <option value="" disabled>Wybierz...</option>
                                    <option value="Matematyczno-Fizyczny">Matematyczno-Fizyczny</option>
                                    <option value="Humanistyczny">Humanistyczny</option>
                                    <option value="Biologiczno-Chemiczny">Biologiczno-Chemiczny</option>
                                    <option value="Informatyczny">Informatyczny</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                            <button onClick={() => setModalDodaj(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Anuluj</button>
                            <button onClick={handleZapiszKlase} className="flex-[2] py-2.5 bg-[#c62a3a] text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors shadow-sm">Dodaj klasę</button>
                        </div>
                    </div>
                </div>
            )}

            <ModalPotwierdzenia
                isOpen={!!doUsuniecia}
                onClose={() => setDoUsuniecia(null)}
                onConfirm={handleUsun}
                tytul="Usuń klasę"
                opis={`Czy na pewno chcesz usunąć klasę "${doUsuniecia?.nazwa}"? Spowoduje to odłączenei wszystkich jej uczniów z bazy. Tej operacji nie można cofnąć.`}
                isDeleting={isDeleting}
            />
        </>
    );
}
