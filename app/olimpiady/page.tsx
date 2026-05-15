"use client";



import { useState, useEffect, useRef, useMemo } from "react";
import ModalRejestracjiOlimpiady from "../components/ModalRejestracjiOlimpiady";
import ModalEdycjiProfilu from "../components/ModalEdycjiProfilu";
import { createClient } from "@/utils/supabase/client";

type UserData = { user_id: string; name: string; surname: string; clase: string } | null;

export default function StronaOlimpiad() {
    // UI state
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [activeRegistration, setActiveRegistration] = useState<{ title: string; id?: string } | null>(null);
    const [registeredCompetitions, setRegisteredCompetitions] = useState<string[]>([]);
    const [showProfilEditor, setShowProfilEditor] = useState(false);

    const [olimpiadyList, setOlimpiadyList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<UserData>(null);

    const [szukanaFraza, setSzukanaFraza] = useState("");
    const [wybranePrzedmioty, setWybranePrzedmioty] = useState<string[]>(["Fizyka"]);
    const [wybranyPoziom, setWybranyPoziom] = useState<string | null>(null);
    const [sortowanie, setSortowanie] = useState("Sortuj: Trafność");

    const karuzelaRef = useRef<HTMLDivElement>(null);

    const supabase = createClient();

    useEffect(() => {
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

            if (data) setCurrentUser(data);
        };

        async function fetchOlimpiady() {
            setLoading(true);
            await fetchCurrentUser();
            const { data } = await supabase.from('olimpiady').select('*').order('created_at', { ascending: false });
            if (data) setOlimpiadyList(data);
            setLoading(false);
        }
        fetchOlimpiady();
    }, []);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleRegistrationComplete = (title: string) => {
        setRegisteredCompetitions(prev => [...prev, title]);
        showToast(`Zgłoszenie na „${title}" zostało pomyślnie wysłane do koordynatora.`);
    };

    const resetFiltrow = () => {
        setSzukanaFraza("");
        setWybranePrzedmioty([]);
        setWybranyPoziom(null);
        setSortowanie("Sortuj: Trafność");
        showToast("Zresetowano filtry.");
    };

    const togglePrzedmiot = (nazwa: string) => {
        setWybranePrzedmioty(prev => prev.includes(nazwa) ? prev.filter(n => n !== nazwa) : [...prev, nazwa]);
    };

    const scrollCarousel = (dir: 'left' | 'right') => {
        if (karuzelaRef.current) {
            karuzelaRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
        }
    };

    const przefiltrowaneOlimpiady = useMemo(() => {
        let wynik = [...olimpiadyList];

        if (szukanaFraza) {
            wynik = wynik.filter(o =>
                o.tytul?.toLowerCase().includes(szukanaFraza.toLowerCase()) ||
                o.opis?.toLowerCase().includes(szukanaFraza.toLowerCase())
            );
        }

        if (wybranyPoziom) {
            // Dopasowujemy do 'szkolny','regionalny','krajowy' jesli by to się zgadzało w Supabase z poziomem np 'Etap szkolny' itp
            wynik = wynik.filter(o => o.poziom?.toLowerCase().includes(wybranyPoziom.toLowerCase()));
        }

        if (sortowanie === "Data: Najbliższe") {
            wynik.sort((a, b) => {
                const dateA = a.data_zakonczenia ? new Date(a.data_zakonczenia).getTime() : Infinity;
                const dateB = b.data_zakonczenia ? new Date(b.data_zakonczenia).getTime() : Infinity;
                return dateA - dateB;
            });
        } else if (sortowanie === "Trudność: Rosnąco") {
            wynik.sort((a, b) => (a.poziom?.length || 0) - (b.poziom?.length || 0));
        }

        return wynik;
    }, [olimpiadyList, szukanaFraza, wybranePrzedmioty, wybranyPoziom, sortowanie]);

    return (
        <>
            {/* Main */}
            <main className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto">
                {/* Header */}
                <header className="sticky top-0 z-10 bg-[#f8f6f6]/80 dark:bg-[#201214]/80 backdrop-blur-md border-b border-slate-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between transition-colors">
                    <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Wyszukiwarka olimpiad</h2>
                    <div className="flex items-center gap-4">
                        <div className="relative hidden sm:block">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 text-[20px]">search</span>
                            <input
                                className="pl-10 pr-4 py-2 bg-white dark:bg-[#2d1b1e] border border-slate-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:border-[#c62a3a] focus:ring-1 focus:ring-[#c62a3a] transition-all w-64 text-gray-900 dark:text-white placeholder-gray-500"
                                placeholder="Szybkie szukanie..."
                                type="text"
                                value={szukanaFraza}
                                onChange={(e) => setSzukanaFraza(e.target.value)}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => showToast("Brak nowych powiadomień")}
                            className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors text-slate-600 dark:text-gray-400"
                        >
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 size-2 bg-[#c62a3a] rounded-full border-2 border-[#f8f6f6] dark:border-[#201214]"></span>
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full flex flex-col gap-10">
                    {/* Hero banner */}
                    <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-100 to-white dark:from-[#2d1b1e] dark:to-[#201214] border border-slate-200 dark:border-gray-700 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] transition-colors">
                        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[#c62a3a]/5 to-transparent"></div>
                        <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-10 text-[#c62a3a]">
                            <span className="material-symbols-outlined text-[200px]">trophy</span>
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between p-8 gap-6">
                            <div className="max-w-xl">
                                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight">
                                    Odkryj swój potencjał, Michał <span className="text-[#c62a3a]">✨</span>
                                </h1>
                                <p className="text-slate-600 dark:text-gray-400 text-base md:text-lg">
                                    Zauważyliśmy, że świetnie radzisz sobie z fizyki. Zaktualizuj swój profil, aby otrzymywać bardziej precyzyjne rekomendacje na nadchodzący sezon.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowProfilEditor(true)}
                                className="shrink-0 bg-[#c62a3a] hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-[#c62a3a]/30 transition-all flex items-center gap-2"
                            >
                                <span>Edytuj profil</span>
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </button>
                        </div>
                    </section>

                    {/* Recommended carousel */}
                    <section>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                                <span className="material-symbols-outlined text-[#c62a3a]">verified</span>
                                Rekomendowane olimpiady
                            </h3>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => scrollCarousel('left')} className="p-2 rounded-full hover:bg-slate-100 dark:bg-gray-800 text-slate-400 dark:text-gray-500 hover:text-[#c62a3a] transition-colors">
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>
                                <button type="button" onClick={() => scrollCarousel('right')} className="p-2 rounded-full hover:bg-slate-100 dark:bg-gray-800 text-slate-400 dark:text-gray-500 hover:text-[#c62a3a] transition-colors">
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        </div>
                        <div ref={karuzelaRef} className="flex gap-5 overflow-x-auto hide-scrollbar pb-4 snap-x">
                            {loading ? (
                                <div className="flex justify-center w-full py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c62a3a]"></div></div>
                            ) : olimpiadyList.slice(0, 3).map((card) => (
                                <div key={card.id || card.tytul} className="snap-start shrink-0 w-[300px] bg-white dark:bg-[#2d1b1e] border border-slate-100 dark:border-gray-700 rounded-xl shadow-sm group hover:shadow-md transition-all duration-300 flex flex-col p-6 relative overflow-hidden">
                                    <div className={`absolute -right-6 -top-6 size-24 bg-${card.kolor_ikon || 'blue'}-50 dark:bg-${card.kolor_ikon || 'blue'}-900/10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out`} />
                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`size-12 rounded-xl bg-${card.kolor_ikon || 'blue'}-100 dark:bg-${card.kolor_ikon || 'blue'}-900/30 flex items-center justify-center`}>
                                                <span className={`text-${card.kolor_ikon || 'blue'}-600 dark:text-${card.kolor_ikon || 'blue'}-400 font-black text-xl`}>{card.skrot || 'OL'}</span>
                                            </div>
                                            <span className={`bg-${card.kolor_ikon || 'blue'}-50 dark:bg-${card.kolor_ikon || 'blue'}-900/20 text-${card.kolor_ikon || 'blue'}-700 dark:text-${card.kolor_ikon || 'blue'}-400 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-${card.kolor_ikon || 'blue'}-100 dark:border-${card.kolor_ikon || 'blue'}-800`}>{card.status}</span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-2">{card.poziom}</span>
                                        <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white group-hover:text-[#c62a3a] transition-colors leading-tight">{card.tytul}</h4>
                                        <p className="text-sm text-slate-500 dark:text-gray-400 mb-6 line-clamp-3">{card.opis}</p>
                                        <div className="mt-auto flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-gray-400">
                                                <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                                                {card.data_zakonczenia ? new Date(card.data_zakonczenia).toLocaleDateString("pl-PL") : "Brak daty"}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => showToast(`Otwieranie sylabusa dla: ${card.tytul}`)}
                                                className="size-8 rounded-full bg-slate-50 dark:bg-[#201214] border border-slate-100 dark:border-gray-700 flex items-center justify-center text-slate-400 dark:text-gray-500 group-hover:bg-[#c62a3a] group-hover:text-white group-hover:border-[#c62a3a] transition-all"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Filters + listings */}
                    <section className="flex flex-col lg:flex-row gap-8">
                        {/* Filters sidebar */}
                        <aside className="w-full lg:w-1/4 min-w-[240px] shrink-0 space-y-8">
                            <div className="bg-white dark:bg-[#2d1b1e] rounded-xl p-5 border border-slate-200 dark:border-gray-700 sticky top-24 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-base text-gray-900 dark:text-white">Filtry</h3>
                                    <button
                                        type="button"
                                        onClick={resetFiltrow}
                                        className="text-xs text-[#c62a3a] font-medium hover:underline"
                                    >
                                        Resetuj
                                    </button>
                                </div>
                                <div className="space-y-6">
                                    {/* Przedmiot */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Przedmiot</h4>
                                        <div className="space-y-2">
                                            {[
                                                { name: "Matematyka", count: "12", checked: false },
                                                { name: "Fizyka", count: "8", checked: true },
                                                { name: "Informatyka", count: "5", checked: false },
                                                { name: "Chemia", count: "4", checked: false },
                                            ].map((item) => (
                                                <label key={item.name} className="flex items-center gap-3 cursor-pointer group">
                                                    <div className="relative flex items-center">
                                                        <input
                                                            className="peer size-4 appearance-none rounded border border-slate-300 dark:border-gray-600 checked:bg-[#c62a3a] checked:border-[#c62a3a] transition-all bg-white dark:bg-[#201214]"
                                                            type="checkbox"
                                                            onChange={() => togglePrzedmiot(item.name)}
                                                            checked={wybranePrzedmioty.includes(item.name)}
                                                        />
                                                        <span className="absolute text-white opacity-0 peer-checked:opacity-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none material-symbols-outlined text-[14px]">check</span>
                                                    </div>
                                                    <span className="text-sm text-slate-700 dark:text-gray-300 group-hover:text-[#c62a3a] transition-colors">{item.name}</span>
                                                    <span className="text-xs text-slate-400 dark:text-gray-600 ml-auto">{item.count}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <hr className="border-slate-100 dark:border-gray-700" />

                                    {/* Poziom */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Poziom</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {["Szkolny", "Regionalny", "Krajowy"].map(poziom => (
                                                <button
                                                    key={poziom}
                                                    type="button"
                                                    onClick={() => setWybranyPoziom(wybranyPoziom === poziom ? null : poziom)}
                                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${wybranyPoziom === poziom ? "bg-[#c62a3a] text-white shadow-sm ring-1 ring-[#c62a3a]" : "bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-700"}`}
                                                >
                                                    {poziom}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <hr className="border-slate-100 dark:border-gray-700" />

                                    {/* Klasa */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Klasa</h4>
                                        <input className="w-full accent-[#c62a3a] bg-slate-200 dark:bg-gray-700 rounded-lg h-1 appearance-none cursor-pointer" max={12} min={9} step={1} type="range" />
                                        <div className="flex justify-between text-xs text-slate-500 dark:text-gray-400 font-medium">
                                            <span>Kl. 1</span>
                                            <span>Kl. 2</span>
                                            <span>Kl. 3</span>
                                            <span>Kl. 4</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Listings */}
                        <div className="flex-1 space-y-4">
                            <div className="flex gap-4 mb-6">
                                <div className="relative flex-1">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500">search</span>
                                    <input
                                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#2d1b1e] border border-slate-200 dark:border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-[#c62a3a]/20 focus:border-[#c62a3a] transition-all text-gray-900 dark:text-white placeholder-gray-500"
                                        placeholder="Szukaj konkursów, egzaminów..."
                                        type="text"
                                        value={szukanaFraza}
                                        onChange={(e) => setSzukanaFraza(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-sm font-medium text-slate-500 mr-2">Wyniki: {przefiltrowaneOlimpiady.length}</div>
                                    <select
                                        value={sortowanie}
                                        onChange={(e) => setSortowanie(e.target.value)}
                                        className="bg-white dark:bg-[#2d1b1e] border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-8 text-sm focus:ring-[#c62a3a] focus:border-[#c62a3a] appearance-none cursor-pointer font-medium text-gray-900 dark:text-white"
                                    >
                                        <option>Sortuj: Trafność</option>
                                        <option>Data: Najbliższe</option>
                                        <option>Trudność: Rosnąco</option>
                                    </select>
                                </div>
                            </div>

                            {/* Competition listings */}
                            {loading ? (
                                <div className="flex justify-center w-full py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#c62a3a]"></div></div>
                            ) : przefiltrowaneOlimpiady.map((item) => (
                                <div key={item.id} className={`group bg-white dark:bg-[#2d1b1e] rounded-xl p-4 border border-slate-200 dark:border-gray-700 hover:border-[#c62a3a]/30 hover:shadow-md transition-all flex flex-col sm:flex-row gap-5 items-start sm:items-center`}>
                                    <div className={`size-16 rounded-lg bg-${item.kolor_ikon || 'blue'}-50 dark:bg-${item.kolor_ikon || 'blue'}-900/20 shrink-0 flex items-center justify-center p-2 overflow-hidden text-${item.kolor_ikon || 'blue'}-600 dark:text-${item.kolor_ikon || 'blue'}-400 group-hover:scale-110 transition-transform`}>
                                        <span className="font-black text-2xl">{item.skrot || 'OL'}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{item.tytul}</h3>
                                            <span className={`bg-${item.kolor_st || 'gray'}-50 dark:bg-${item.kolor_st || 'gray'}-900/20 text-${item.kolor_st || 'gray'}-600 dark:text-${item.kolor_st || 'gray'}-400 border-${item.kolor_st || 'gray'}-100 dark:border-${item.kolor_st || 'gray'}-900/40 text-[10px] font-bold px-2 py-0.5 rounded border`}>{item.status}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-gray-400 mt-2">
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                                                <span>{item.data_zakonczenia ? new Date(item.data_zakonczenia).toLocaleDateString("pl-PL") : "Brak daty"}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-[16px]">signal_cellular_alt</span>
                                                <span>{item.poziom}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                        <button
                                            type="button"
                                            onClick={() => registeredCompetitions.includes(item.tytul) ? showToast('Już się zarejestrowałeś w tym konkursie.') : setActiveRegistration({ title: item.tytul, id: item.id })}
                                            disabled={registeredCompetitions.includes(item.tytul)}
                                            className={`flex-1 sm:flex-none px-4 py-2 ${registeredCompetitions.includes(item.tytul) ? "bg-green-600 text-white shadow-sm" : "bg-[#c62a3a] text-white hover:bg-red-700 shadow-sm"} text-sm font-bold rounded-lg transition-colors text-center flex justify-center items-center gap-1`}
                                        >
                                            {registeredCompetitions.includes(item.tytul) ? <><span className="material-symbols-outlined text-[16px]">check</span>Zarejestrowano</> : "Zarejestruj się"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => showToast(`Otwieranie sylabusa dla: ${item.tytul}`)}
                                            className="flex-1 sm:flex-none px-4 py-2 bg-white dark:bg-[#2d1b1e] border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 text-sm font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors text-center"
                                        >
                                            Sylabus
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <div className="pt-4 flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => showToast("Ładowanie kolejnych konkursów...")}
                                    className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-gray-400 hover:text-[#c62a3a] transition-colors"
                                >
                                    <span>Pokaż więcej konkursów</span>
                                    <span className="material-symbols-outlined text-[18px]">expand_more</span>
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* Modal rejestracji olimpiady */}
            <ModalRejestracjiOlimpiady
                olimpiada={activeRegistration}
                onClose={() => setActiveRegistration(null)}
                onSuccess={handleRegistrationComplete}
                currentUser={currentUser}
            />

            {toastMessage && (
                <div className="fixed bottom-6 right-6 bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 slide-up-animation">
                    <span className="material-symbols-outlined text-[#c62a3a]">info</span>
                    <p className="font-bold text-sm tracking-wide">{toastMessage}</p>
                </div>
            )}

            <ModalEdycjiProfilu
                isOpen={showProfilEditor}
                onClose={() => setShowProfilEditor(false)}
            />
        </>
    );
}
