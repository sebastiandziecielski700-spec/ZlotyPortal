"use client";

import { useState, useMemo, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { ModalPotwierdzenia } from "@/app/components/ModalPotwierdzenia";

type Rola = "uczeń" | "admin";

interface Uzytkownik {
    id: string; // uuid
    imieNazwisko: string;
    email: string;
    rola: Rola;
    klasa?: string;
    przedmiot?: string;
    dataRejestracji: string;
    aktywny: boolean;
    inicjaly: string;
    kolorAwatara: string;
}


const KOLORY_ROLI: Record<Rola, string> = {
    uczeń: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    admin: "bg-[#c62a3a]/10 text-[#c62a3a]",
};

const IKONY_ROLI: Record<Rola, string> = {
    uczeń: "school",
    admin: "shield",
};

type FiltrRoli = "wszyscy";

interface ModalDodajProps {
    onZamknij: () => void;
    onDodano: () => void;
}

export function ModalDodajUzytkownika({ onZamknij, onDodano }: ModalDodajProps) {
    const supabase = createClient();
    const [imieNazwisko, setImieNazwisko] = useState("");
    const [email, setEmail] = useState("");
    const [rola, setRola] = useState<Rola | "">("");
    const [klasaPrzedmiot, setKlasaPrzedmiot] = useState("");
    const [wysylanie, setWysylanie] = useState(false);
    const [blad, setBlad] = useState<string | null>(null);

    const handleZapisz = async () => {
        setBlad(null);
        if (!imieNazwisko.trim() || !rola || !klasaPrzedmiot.trim()) {
            setBlad("Podstawowe pola (Imię, Rola, Klasa) są wymagane.");
            return;
        }

        setWysylanie(true);
        const inicjaly = imieNazwisko.split(" ").map(w => w[0]).join("").toUpperCase().substring(0, 2);
        
        let kolorAwatara = "bg-blue-500";
        if (rola === "admin") kolorAwatara = "bg-[#c62a3a]";

        const { error } = await supabase.from("users").insert({
            name: imieNazwisko.split(" ")[0] || "Nie",
            surename: imieNazwisko.split(" ").slice(1).join(" ") || "Znane",
            login: email,
            password: "zmienHaslo123",
            clase: klasaPrzedmiot,
            logged: false
        });

        setWysylanie(false);

        if (error) {
            console.error(error);
            setBlad("Błąd zapisu.");
        } else {
            onDodano();
            onZamknij();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onZamknij} />
            <div className="relative bg-white dark:bg-[#2d1b1e] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Dodaj nową osobę</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Wypełnij dane nowego użytkownika</p>
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
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Imię i nazwisko</label>
                        <input value={imieNazwisko} onChange={e => setImieNazwisko(e.target.value)} className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40 transition-all" placeholder="np. Jan Kowalski" type="text" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Adres e-mail (Opcjonalnie)</label>
                        <input value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40 transition-all" placeholder="email@domena.pl" type="email" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Rola</label>
                        <select value={rola} onChange={e => setRola(e.target.value as Rola | "")} className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40 transition-all">
                            <option value="" disabled>Wybierz...</option>
                            <option value="uczeń">uczeń</option>
                            <option value="admin">admin</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Klasa (opcjonalnie)</label>
                        <input value={klasaPrzedmiot} onChange={e => setKlasaPrzedmiot(e.target.value)} className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#201214] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40 transition-all" placeholder="np. 3C" type="text" />
                    </div>
                </div>
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                    <button onClick={onZamknij} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        Anuluj
                    </button>
                    <button onClick={handleZapisz} disabled={wysylanie} className="flex-[2] py-2.5 bg-[#c62a3a] text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors shadow-sm shadow-red-200 dark:shadow-none disabled:opacity-50">
                        {wysylanie ? "Zapisywanie..." : "Dodaj użytkownika"}
                    </button>
                </div>
            </div>
        </div>
    );
}

interface PanelSzczegolyProps {
    uzytkownik: Uzytkownik;
    onZamknij: () => void;
    onPrzejdzDoUsuwania: () => void;
}

function PanelSzczegoly({ uzytkownik, onZamknij, onPrzejdzDoUsuwania }: PanelSzczegolyProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onZamknij} />
            <div className="relative bg-white dark:bg-[#2d1b1e] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm">
                {/* Nagłówek z awatarem */}
                <div className="p-6 flex flex-col items-center text-center gap-3 border-b border-gray-200 dark:border-gray-700">
                    <button onClick={onZamknij} className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-gray-400 text-[20px]">close</span>
                    </button>
                    <div className={`size-16 rounded-2xl ${uzytkownik.kolorAwatara} flex items-center justify-center text-white font-black text-xl`}>
                        {uzytkownik.inicjaly}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{uzytkownik.imieNazwisko}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{uzytkownik.email}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${KOLORY_ROLI[uzytkownik.rola]}`}>
                        <span className="material-symbols-outlined text-[12px] mr-1 align-middle">{IKONY_ROLI[uzytkownik.rola]}</span>
                        {uzytkownik.rola.charAt(0).toUpperCase() + uzytkownik.rola.slice(1)}
                    </span>
                </div>

                {/* Szczegóły */}
                <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Status</span>
                        <span className={`font-bold flex items-center gap-1 ${uzytkownik.aktywny ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>
                            <span className={`size-2 rounded-full ${uzytkownik.aktywny ? "bg-green-500" : "bg-gray-400"}`} />
                            {uzytkownik.aktywny ? "Aktywny" : "Nieaktywny"}
                        </span>
                    </div>
                    {uzytkownik.klasa && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Klasa</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{uzytkownik.klasa}</span>
                        </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Data rejestracji</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{uzytkownik.dataRejestracji}</span>
                    </div>
                </div>

                {/* Akcje */}
                <div className="p-5 border-t border-gray-200 dark:border-gray-700 space-y-3">
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#c62a3a]/10 text-[#c62a3a] rounded-xl text-sm font-bold hover:bg-[#c62a3a] hover:text-white transition-all">
                        <span className="material-symbols-outlined text-[18px]">send</span>
                        Wyślij wiadomość
                    </button>

                    <button
                        onClick={onPrzejdzDoUsuwania}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
                    >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                        Usuń użytkownika
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function StronaUzytkownikow() {
    const supabase = createClient();
    const [uzytkownicy, setUzytkownicy] = useState<Uzytkownik[]>([]);
    const [ladowanie, setLadowanie] = useState(true);

    const [szukaj, setSzukaj] = useState("");
    const [modalDodajOtwarte, setModalDodajOtwarte] = useState(false);

    const [doUsuniecia, setDoUsuniecia] = useState<Uzytkownik | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleUsun = async () => {
        if (!doUsuniecia) return;
        setIsDeleting(true);
        const { error } = await supabase.from('users').delete().eq('user_id', doUsuniecia.id);
        setIsDeleting(false);
        if (!error) {
            setDoUsuniecia(null);
            fetchUzytkownicy();
        } else {
            console.error("Błąd usuwania:", error);
            alert("Błąd. Sprawdź konsolę (RLS).");
        }
    };

    const fetchUzytkownicy = async () => {
        setLadowanie(true);
        const { data, error } = await supabase.from("users").select("*");
        if (!error && data) {
            setUzytkownicy(data.map(u => {
                return {
                    id: u.user_id,
                    imieNazwisko: `${u.name || ""} ${u.surename || ""}`.trim() || "Nieznane",
                    email: u.login || "-",
                    rola: "uczeń" as Rola,
                    klasa: u.clase,
                    dataRejestracji: "-",
                    aktywny: true,
                    inicjaly: ((u.name?.[0] || "") + (u.surename?.[0] || "")).toUpperCase() || "?",
                    kolorAwatara: "bg-blue-500"
                };
            }));
        }
        setLadowanie(false);
    };

    useEffect(() => {
        fetchUzytkownicy();
    }, []);

    const przefiltrowaneLista = useMemo(() => {
        return uzytkownicy.filter((u) => {
            if (u.rola !== "uczeń") return false; // Tylko uczniowie
            
            const pasujeSzukaj =
                szukaj === "" ||
                u.imieNazwisko.toLowerCase().includes(szukaj.toLowerCase()) ||
                (u.klasa ?? "").toLowerCase().includes(szukaj.toLowerCase());

            return pasujeSzukaj;
        });
    }, [szukaj, uzytkownicy]);



    return (
        <>
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Nagłówek */}
                <header className="h-16 flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-[#2d1b1e]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-10 sticky top-0 transition-colors">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Użytkownicy</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {przefiltrowaneLista.length} z {uzytkownicy.length} użytkowników
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Wyszukiwarka */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-gray-400 text-[18px]">search</span>
                            </div>
                            <input
                                value={szukaj}
                                onChange={(e) => setSzukaj(e.target.value)}
                                className="block w-64 pl-9 pr-3 py-2 border-none rounded-lg bg-gray-100 dark:bg-[#201214] text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#c62a3a]/40 text-sm transition-all"
                                placeholder="Szukaj po nazwie, klasie..."
                                type="text"
                            />
                            {szukaj && (
                                <button
                                    onClick={() => setSzukaj("")}
                                    className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setModalDodajOtwarte(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#c62a3a] text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm shadow-red-200 dark:shadow-none"
                        >
                            <span className="material-symbols-outlined text-[18px]">person_add</span>
                            Dodaj osobę
                        </button>
                    </div>
                </header>

                {/* Zawartość */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">



                    {/* Tabela */}
                    <div className="bg-white dark:bg-[#2d1b1e] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-[#201214]/60 border-b border-gray-200 dark:border-gray-700">
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Uczeń</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Klasa</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 hidden md:table-cell">Konto</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">Akcje</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                    {przefiltrowaneLista.map((u) => (
                                        <tr
                                            key={u.id}
                                            className="hover:bg-gray-50 dark:hover:bg-[#201214]/40 transition-colors group"
                                        >
                                            {/* Użytkownik */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`size-10 rounded-xl ${u.kolorAwatara} flex items-center justify-center text-white font-black text-sm flex-shrink-0`}>
                                                        {u.inicjaly}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{u.imieNazwisko}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Klasa */}
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {u.klasa || "Brak"}
                                                </span>
                                            </td>
                                            {/* Wychowawca */}
                                            <td className="px-6 py-4 hidden md:table-cell">
                                                <span className="text-sm text-gray-500 dark:text-gray-400">Aktywne</span>
                                            </td>
                                            {/* Akcje */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setDoUsuniecia(u); }}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                                        title="Usuń"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {przefiltrowaneLista.length === 0 && (
                                <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
                                    <span className="material-symbols-outlined text-5xl">manage_search</span>
                                    <p className="font-semibold">Brak wyników dla podanych filtrów</p>
                                    <button
                                        onClick={() => { setSzukaj(""); }}
                                        className="text-sm font-bold text-[#c62a3a] hover:underline"
                                    >
                                        Wyczyść filtry
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Stopka z paginacją */}
                        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50/50 dark:bg-[#201214]/30">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Wyświetlono <span className="font-bold text-gray-900 dark:text-white">{przefiltrowaneLista.length}</span> z <span className="font-bold text-gray-900 dark:text-white">{uzytkownicy.length}</span> użytkowników
                            </span>
                            <div className="flex items-center gap-1">
                                <button className="flex size-9 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>
                                <button className="flex size-9 items-center justify-center rounded-lg bg-[#c62a3a] text-white font-bold text-sm">1</button>
                                <button className="flex size-9 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal dodawania */}
            {modalDodajOtwarte && (
                <ModalDodajUzytkownika 
                    onDodano={fetchUzytkownicy}
                    onZamknij={() => setModalDodajOtwarte(false)} 
                />
            )}

            <ModalPotwierdzenia
                isOpen={!!doUsuniecia}
                onClose={() => setDoUsuniecia(null)}
                onConfirm={handleUsun}
                tytul="Skasuj użytkownika"
                opis={`Czy na pewno chcesz nieodwracalnie usunąć osobę "${doUsuniecia?.imieNazwisko}"?`}
                isDeleting={isDeleting}
            />
        </>
    );
}
