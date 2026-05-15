"use client";

import { useState, useEffect } from "react";
import PasekBoczny from "../components/PasekBoczny";
import { ActionModal } from "../components/ActionModal";
import { createClient } from "@/utils/supabase/client";

type Glosowanie = { id: number; tytul: string; status_opis: string; status_kategoria: string; aktywne: boolean; opcje?: string; created_at: string };
type Ankieta = { id: number; tytul: string; czas_wypelniania: string; kategoria: string; otwarta: boolean; pytania?: string; created_at: string };
type Petycja = { id: number; tytul: string; liczba_podpisow: number; wymagane_podpisy: number; kategoria: string; opis?: string; created_at: string };

type ActiveAction =
    | { type: "glosowanie"; item: Glosowanie }
    | { type: "ankieta"; item: Ankieta }
    | { type: "petycja"; item: Petycja }
    | null;

type UserData = { user_id: string; name: string; surname: string; clase: string } | null;

export default function StronaGlosowan() {
    const supabase = createClient();
    const [glosowania, setGlosowania] = useState<Glosowanie[]>([]);
    const [ankiety, setAnkiety] = useState<Ankieta[]>([]);
    const [petycje, setPetycje] = useState<Petycja[]>([]);
    const [loading, setLoading] = useState(true);

    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [activeAction, setActiveAction] = useState<ActiveAction>(null);
    const [szukanaFraza, setSzukanaFraza] = useState("");
    const [kategoria, setKategoria] = useState("Wszystkie");

    // Current user
    const [currentUser, setCurrentUser] = useState<UserData>(null);

    // Track what user already voted/signed (by id)
    const [votedGlosowania, setVotedGlosowania] = useState<Set<number>>(new Set());
    const [votedAnkiety, setVotedAnkiety] = useState<Set<number>>(new Set());
    const [signedPetycje, setSignedPetycje] = useState<Set<number>>(new Set());

    // Voting form state
    const [selectedOption, setSelectedOption] = useState("");
    const [submitting, setSubmitting] = useState(false);
    // Ankieta form state
    const [ankietaOdpowiedz, setAnkietaOdpowiedz] = useState("");

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Fetch current user from Supabase Auth + users table
    const fetchCurrentUser = async () => {
        const debugRaw = localStorage.getItem("zloty_debug_user");
        if (debugRaw) {
            const debugUser = JSON.parse(debugRaw);
            setCurrentUser(debugUser);
            return debugUser;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data } = await supabase
            .from("users")
            .select("user_id, name, surname, clase")
            .eq("user_id", user.id)
            .single();

        if (data) {
            setCurrentUser(data);
            return data;
        }
        return null;
    };

    // Fetch already-voted/signed items from DB for current user
    const fetchUserInteractions = async (userId: string) => {
        const [rGlosy, rPodpisy, rAnkiety] = await Promise.all([
            supabase.from("glosowania_glosy").select("glosowanie_id").eq("user_id", userId),
            supabase.from("petycje_podpisy").select("petycja_id").eq("user_id", userId),
            supabase.from("ankiety_wypelnienia").select("ankieta_id").eq("user_id", userId),
        ]);

        if (rGlosy.data) setVotedGlosowania(new Set(rGlosy.data.map(r => r.glosowanie_id)));
        if (rPodpisy.data) setSignedPetycje(new Set(rPodpisy.data.map(r => r.petycja_id)));
        if (rAnkiety.data) setVotedAnkiety(new Set(rAnkiety.data.map(r => r.ankieta_id)));
    };

    const fetchData = async () => {
        setLoading(true);
        const [rG, rA, rP] = await Promise.all([
            supabase.from("glosowania").select("*").order("created_at", { ascending: false }),
            supabase.from("ankiety").select("*").order("created_at", { ascending: false }),
            supabase.from("petycje").select("*").order("created_at", { ascending: false }),
        ]);
        if (rG.data) setGlosowania(rG.data);
        if (rA.data) setAnkiety(rA.data);
        if (rP.data) setPetycje(rP.data);
        setLoading(false);
    };

    useEffect(() => {
        const init = async () => {
            await fetchData();
            const user = await fetchCurrentUser();
            if (user) await fetchUserInteractions(user.user_id);
        };
        init();
    }, []);

    const matchesSearch = (tytul: string) =>
        !szukanaFraza || tytul.toLowerCase().includes(szukanaFraza.toLowerCase());

    const handleVoteGlosowanie = async (item: Glosowanie) => {
        if (!selectedOption) { showToast("Wybierz opcję!"); return; }
        if (!currentUser) { showToast("Musisz być zalogowany, aby głosować."); return; }
        setSubmitting(true);

        const { error } = await supabase.from("glosowania_glosy").insert({
            glosowanie_id: item.id,
            user_id: currentUser.user_id,
            wybor: selectedOption,
        });

        if (error) {
            console.error("Błąd głosowania:", error);
            if (error.code === '23505') {
                showToast("Już oddałeś głos w tym głosowaniu.");
            } else {
                showToast("Wystąpił błąd. Spróbuj ponownie.");
            }
        } else {
            setVotedGlosowania(prev => new Set(prev).add(item.id));
            showToast(`Dziękujemy, ${currentUser.name}! Twój głos został zapisany.`);
        }
        setSubmitting(false);
        setActiveAction(null);
        setSelectedOption("");
    };

    const handleVoteAnkieta = async (item: Ankieta) => {
        if (!currentUser) { showToast("Musisz być zalogowany, aby wypełnić ankietę."); return; }
        setSubmitting(true);

        const { error } = await supabase.from("ankiety_wypelnienia").insert({
            ankieta_id: item.id,
            user_id: currentUser.user_id,
            odpowiedzi: { odpowiedz: ankietaOdpowiedz },
        });

        if (error) {
            console.error("Błąd ankiety:", error);
            if (error.code === '23505') {
                showToast("Już wypełniłeś tę ankietę.");
            } else {
                showToast("Wystąpił błąd. Spróbuj ponownie.");
            }
        } else {
            setVotedAnkiety(prev => new Set(prev).add(item.id));
            showToast(`Twoja ankieta została wysłana. Dziękujemy, ${currentUser.name}!`);
        }
        setSubmitting(false);
        setActiveAction(null);
        setAnkietaOdpowiedz("");
    };

    const handleSignPetycja = async (item: Petycja) => {
        if (!currentUser) { showToast("Musisz być zalogowany, aby podpisać petycję."); return; }
        setSubmitting(true);

        // Insert signature into petycje_podpisy
        const { error: signError } = await supabase.from("petycje_podpisy").insert({
            petycja_id: item.id,
            user_id: currentUser.user_id,
        });

        if (signError) {
            console.error("Błąd podpisywania:", signError);
            if (signError.code === '23505') {
                showToast("Już podpisałeś tę petycję.");
            } else {
                showToast("Wystąpił błąd. Spróbuj ponownie.");
            }
        } else {
            // Also increment the counter on the petycje table
            await supabase
                .from("petycje")
                .update({ liczba_podpisow: item.liczba_podpisow + 1 })
                .eq("id", item.id);

            setSignedPetycje(prev => new Set(prev).add(item.id));
            setPetycje(prev => prev.map(p => p.id === item.id ? { ...p, liczba_podpisow: p.liczba_podpisow + 1 } : p));
            showToast(`Twój podpis został oficjalnie zarejestrowany! Dziękujemy, ${currentUser.name} ${currentUser.surname}.`);
        }
        setSubmitting(false);
        setActiveAction(null);
    };

    const getOpcje = (item: Glosowanie): string[] => {
        if (item.opcje) {
            try { return JSON.parse(item.opcje); } catch { /* fall through */ }
        }
        return ["Tak", "Nie", "Wstrzymuję się"];
    };

    const showGlosowania = kategoria === "Wszystkie" || kategoria === "Głosowania";
    const showAnkiety = kategoria === "Wszystkie" || kategoria === "Ankiety";
    const showPetycje = kategoria === "Wszystkie" || kategoria === "Petycje";

    return (
        <>
            <div className="flex h-screen w-full overflow-hidden bg-[#f8f6f6] dark:bg-[#201214] text-[#171212] dark:text-[#ededed] transition-colors">
                <PasekBoczny />
                <main className="flex-1 flex flex-col h-full relative overflow-hidden">
                    {/* Header */}
                    <header className="h-16 border-b border-[#f4f1f1] dark:border-gray-700 bg-white dark:bg-[#2d1b1e] flex items-center justify-between px-6 lg:px-8 flex-shrink-0 z-10 transition-colors">
                        <div className="flex items-center gap-4 lg:hidden">
                            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Głos Ucznia</h2>
                        </div>
                        <div className="hidden lg:flex flex-1 max-w-lg">
                            <div className="relative w-full">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[20px]">search</span>
                                <input
                                    className="w-full h-10 bg-gray-100 dark:bg-[#201214] border-none rounded-lg pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#c62a3a]/20 placeholder:text-gray-400 text-gray-900 dark:text-white transition-colors"
                                    placeholder="Szukaj głosowań, petycji, ankiet..."
                                    type="text"
                                    value={szukanaFraza}
                                    onChange={(e) => setSzukanaFraza(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button type="button" onClick={() => showToast("Brak nowych powiadomień")} className="p-2 text-gray-500 dark:text-gray-400 hover:text-[#c62a3a] transition-colors relative">
                                <span className="material-symbols-outlined">notifications</span>
                            </button>
                        </div>
                    </header>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 scroll-smooth">
                        <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-10">
                            <div className="flex flex-col gap-2">
                                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#171212] dark:text-white">Centrum Aktywności</h1>
                                <p className="text-gray-500 dark:text-gray-400 max-w-2xl">Bierz udział w decyzjach szkolnych. Twój głos ma znaczenie.</p>
                            </div>

                            {/* Filter tabs */}
                            <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
                                {["Wszystkie", "Głosowania", "Ankiety", "Petycje"].map((tab) => (
                                    <button key={tab} type="button" onClick={() => setKategoria(tab)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shadow-sm transition-all ${kategoria === tab ? "bg-[#171212] dark:bg-white text-white dark:text-[#171212]" : "bg-white dark:bg-[#2d1b1e] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#c62a3a]"></div></div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Głosowania */}
                                    {showGlosowania && glosowania.filter(g => matchesSearch(g.tytul)).map(g => {
                                        const voted = votedGlosowania.has(g.id);
                                        return (
                                            <div key={`g-${g.id}`} className="bg-white dark:bg-[#2d1b1e] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group">
                                                <div className="p-5 flex flex-col flex-1">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="bg-[#c62a3a]/10 dark:bg-[#c62a3a]/20 text-[#c62a3a] px-2.5 py-1 rounded-md text-xs font-bold uppercase">Głosowanie</span>
                                                        {g.aktywne ? <span className="flex size-2 rounded-full bg-green-500 mt-2 ring-4 ring-green-500/20"></span> : <span className="text-xs text-gray-400">Zakończone</span>}
                                                    </div>
                                                    <h3 className="text-lg font-bold text-[#171212] dark:text-white leading-tight mb-2">{g.tytul}</h3>
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{g.status_opis}</p>
                                                    {g.status_kategoria && <span className="inline-block bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded text-xs font-medium mb-4 w-fit">{g.status_kategoria}</span>}
                                                    <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                            <span className="material-symbols-outlined text-[16px]">visibility_off</span>
                                                            <span>Anonimowe</span>
                                                        </div>
                                                        <button type="button" disabled={voted || !g.aktywne}
                                                            onClick={() => { setSelectedOption(""); setActiveAction({ type: "glosowanie", item: g }); }}
                                                            className={`${voted ? 'bg-green-600 text-white' : !g.aktywne ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#c62a3a] hover:bg-red-700 text-white'} px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1`}>
                                                            {voted ? <><span className="material-symbols-outlined text-[16px]">check</span> Zagłosowano</> : "Zagłosuj"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Ankiety */}
                                    {showAnkiety && ankiety.filter(a => matchesSearch(a.tytul)).map(a => {
                                        const voted = votedAnkiety.has(a.id);
                                        return (
                                            <div key={`a-${a.id}`} className="bg-white dark:bg-[#2d1b1e] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group">
                                                <div className="p-5 flex flex-col flex-1">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-md text-xs font-bold uppercase">Ankieta</span>
                                                        {a.otwarta ? <span className="flex size-2 rounded-full bg-green-500 mt-2 ring-4 ring-green-500/20"></span> : <span className="text-xs text-gray-400">Zamknięta</span>}
                                                    </div>
                                                    <h3 className="text-lg font-bold text-[#171212] dark:text-white leading-tight mb-2">{a.tytul}</h3>
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{a.czas_wypelniania}</p>
                                                    {a.kategoria && <span className="inline-block bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded text-xs font-medium mb-4 w-fit">{a.kategoria}</span>}
                                                    <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                            <span className="material-symbols-outlined text-[16px]">lock</span>
                                                            <span>Zaszyfrowane</span>
                                                        </div>
                                                        <button type="button" disabled={voted || !a.otwarta}
                                                            onClick={() => setActiveAction({ type: "ankieta", item: a })}
                                                            className={`${voted ? 'text-gray-400 cursor-not-allowed' : 'text-[#c62a3a] hover:text-red-700'} text-sm font-bold flex items-center gap-1 transition-colors`}>
                                                            {voted ? "Wypełniono" : "Wypełnij"}
                                                            {!voted && <span className="material-symbols-outlined text-[16px]">open_in_new</span>}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Petycje */}
                                    {showPetycje && petycje.filter(p => matchesSearch(p.tytul)).map(p => {
                                        const signed = signedPetycje.has(p.id);
                                        const progress = Math.min((p.liczba_podpisow / (p.wymagane_podpisy || 200)) * 100, 100);
                                        return (
                                            <div key={`p-${p.id}`} className="bg-white dark:bg-[#2d1b1e] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group">
                                                <div className="p-5 flex flex-col flex-1">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-md text-xs font-bold uppercase">Petycja</span>
                                                        <span className="flex size-2 rounded-full bg-green-500 mt-2 ring-4 ring-green-500/20"></span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-[#171212] dark:text-white leading-tight mb-2">{p.tytul}</h3>
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{p.opis || p.kategoria}</p>
                                                    <div className="mb-4">
                                                        <div className="flex justify-between text-xs font-semibold mb-1.5">
                                                            <span className="text-[#c62a3a]">{p.liczba_podpisow} podpisów</span>
                                                            <span className="text-gray-400">Cel: {p.wymagane_podpisy}</span>
                                                        </div>
                                                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                                                            <div className="bg-[#c62a3a] h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                                        <div className="text-xs text-gray-400">{p.kategoria}</div>
                                                        <button type="button" disabled={signed}
                                                            onClick={() => setActiveAction({ type: "petycja", item: p })}
                                                            className={`${signed ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed' : 'bg-[#c62a3a]/10 hover:bg-[#c62a3a]/20 text-[#c62a3a]'} px-3 py-1.5 rounded-lg text-sm font-bold transition-colors`}>
                                                            {signed ? "Podpisano ✓" : "Podpisz Petycję"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Empty state */}
                                    {!loading && glosowania.length === 0 && ankiety.length === 0 && petycje.length === 0 && (
                                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                                            <span className="material-symbols-outlined text-6xl mb-4">how_to_vote</span>
                                            <p className="font-bold text-lg">Brak aktywnych głosowań</p>
                                            <p className="text-sm mt-1">Sprawdź ponownie później</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Modal: Głosowanie */}
            {activeAction?.type === "glosowanie" && (
                <ActionModal isOpen={true} onClose={() => setActiveAction(null)} title={`Głosowanie: ${activeAction.item.tytul}`}>
                    <div className="space-y-4">
                        <p className="text-gray-600 dark:text-gray-300 mb-4">Wybierz jedną opcję. Twój głos jest anonimowy.</p>
                        <div className="space-y-2">
                            {getOpcje(activeAction.item).map((opcja) => (
                                <label key={opcja} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <input type="radio" name="vote_option" value={opcja} checked={selectedOption === opcja} onChange={() => setSelectedOption(opcja)} className="size-4 text-[#c62a3a] focus:ring-[#c62a3a]" />
                                    <span className="text-gray-900 dark:text-white font-medium">{opcja}</span>
                                </label>
                            ))}
                        </div>
                        <div className="pt-6 flex justify-end gap-3">
                            <button onClick={() => setActiveAction(null)} className="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">Anuluj</button>
                            <button disabled={submitting} onClick={() => handleVoteGlosowanie(activeAction.item)}
                                className="px-4 py-2 bg-[#c62a3a] hover:bg-red-700 text-white font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50">
                                {submitting ? "Wysyłanie..." : "Oddaj Głos"}
                            </button>
                        </div>
                    </div>
                </ActionModal>
            )}

            {/* Modal: Ankieta */}
            {activeAction?.type === "ankieta" && (
                <ActionModal isOpen={true} onClose={() => setActiveAction(null)} title={`Ankieta: ${activeAction.item.tytul}`}>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 rounded-lg text-sm mb-4">
                            <span className="material-symbols-outlined text-[18px]">gpp_good</span>
                            <span>Formularz anonimowy — nie zbiera danych identyfikacyjnych.</span>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Twoja opinia:</label>
                            <textarea value={ankietaOdpowiedz} onChange={(e) => setAnkietaOdpowiedz(e.target.value)} className="w-full h-24 p-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#201214] rounded-xl focus:ring-2 focus:ring-[#c62a3a]/20 resize-none text-gray-900 dark:text-white" placeholder="Napisz co myślisz..."></textarea>
                        </div>
                        <div className="pt-4 flex justify-end gap-3">
                            <button onClick={() => setActiveAction(null)} className="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">Anuluj</button>
                            <button disabled={submitting} onClick={() => handleVoteAnkieta(activeAction.item)}
                                className="px-4 py-2 bg-[#c62a3a] hover:bg-red-700 text-white font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50">
                                {submitting ? "Wysyłanie..." : "Wyślij Ankietę"}
                            </button>
                        </div>
                    </div>
                </ActionModal>
            )}

            {/* Modal: Petycja */}
            {activeAction?.type === "petycja" && (
                <ActionModal isOpen={true} onClose={() => setActiveAction(null)} title={`Petycja: ${activeAction.item.tytul}`}>
                    <div className="space-y-4">
                        <div className="p-4 bg-[#c62a3a]/5 border border-[#c62a3a]/20 rounded-xl mb-4">
                            <h4 className="font-bold text-[#c62a3a] mb-2">Cel Petycji</h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{activeAction.item.opis || activeAction.item.kategoria}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-2">Aktualnie: <span className="font-bold text-[#c62a3a]">{activeAction.item.liczba_podpisow}</span> / {activeAction.item.wymagane_podpisy} podpisów</p>
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-6">
                                <div className="bg-[#c62a3a] h-2 rounded-full" style={{ width: `${Math.min((activeAction.item.liczba_podpisow / (activeAction.item.wymagane_podpisy || 200)) * 100, 100)}%` }}></div>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 text-center mb-4">
                            {currentUser ? <span>Podpisujesz jako: <span className="font-bold text-gray-700 dark:text-gray-200">{currentUser.name} {currentUser.surname}</span> ({currentUser.clase})</span> : 'Twój podpis będzie widoczny dla administracji.'}
                        </p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => setActiveAction(null)} className="px-6 py-3 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">Jednak nie</button>
                            <button disabled={submitting} onClick={() => handleSignPetycja(activeAction.item)}
                                className="px-6 py-3 bg-[#c62a3a] hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-[#c62a3a]/20 disabled:opacity-50">
                                {submitting ? "Podpisywanie..." : "Popieram, Podpisz"}
                            </button>
                        </div>
                    </div>
                </ActionModal>
            )}

            {toastMessage && (
                <div className="fixed bottom-6 right-6 bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 slide-up-animation">
                    <span className="material-symbols-outlined text-[#c62a3a]">info</span>
                    <p className="font-bold text-sm tracking-wide">{toastMessage}</p>
                </div>
            )}
        </>
    );
}
