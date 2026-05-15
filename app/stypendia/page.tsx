"use client";




import { useState, useEffect, useRef, useMemo } from "react";
import PasekBoczny from "../components/PasekBoczny";
import ModalAplikacjiStypendium from "../components/ModalAplikacjiStypendium";
import { createClient } from "@/utils/supabase/client";

type UserData = { user_id: string; name: string; surname: string; clase: string } | null;

export default function StronaStypendiow() {
    // UI state
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [activeApplication, setActiveApplication] = useState<{ title: string; id?: string; amount?: string; org?: string } | null>(null);
    const [appliedScholarships, setAppliedScholarships] = useState<string[]>([]);
    const [savedBookmarks, setSavedBookmarks] = useState<string[]>([]);

    const [stypendiaList, setStypendiaList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<UserData>(null);

    // Filters and search state
    const [szukanaFraza, setSzukanaFraza] = useState("");
    const [wybranaKlasa, setWybranaKlasa] = useState("");
    const [wybraneZainteresowania, setWybraneZainteresowania] = useState<string[]>([]);
    const [wybranyZasieg, setWybranyZasieg] = useState("Wszystkie");
    const [wybranyDochod, setWybranyDochod] = useState("Dowolny poziom dochodów");
    const [wiek, setWiek] = useState(16);
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

        async function fetchStypendia() {
            setLoading(true);
            await fetchCurrentUser();
            const { data } = await supabase.from('stypendia').select('*').order('created_at', { ascending: false });
            if (data) setStypendiaList(data);
            setLoading(false);
        }
        fetchStypendia();
    }, []);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleApplicationComplete = (title: string) => {
        setAppliedScholarships(prev => [...prev, title]);
        showToast(`Wniosek o stypendium „${title}" został przekazany do rozpatrzenia.`);
    };

    const toggleBookmark = (title: string) => {
        setSavedBookmarks(prev => {
            if (prev.includes(title)) {
                return prev.filter(t => t !== title);
            } else {
                return [...prev, title];
            }
        });
    };

    const toggleZainteresowanie = (nazwa: string) => {
        setWybraneZainteresowania(prev => 
            prev.includes(nazwa) ? prev.filter(n => n !== nazwa) : [...prev, nazwa]
        );
    };

    const resetFiltrow = () => {
        setSzukanaFraza("");
        setWybranaKlasa("");
        setWybraneZainteresowania([]);
        setWybranyZasieg("Wszystkie");
        setWybranyDochod("Dowolny poziom dochodów");
        setWiek(16);
        showToast("Zresetowano wszystkie filtry wyszukiwania.");
    };

    const scrollCarousel = (dir: 'left' | 'right') => {
        if (karuzelaRef.current) {
            karuzelaRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
        }
    };

    const przefiltrowaneStypendia = useMemo(() => {
        let wynik = [...stypendiaList];
        
        if (szukanaFraza) {
            wynik = wynik.filter(s => 
                s.tytul?.toLowerCase().includes(szukanaFraza.toLowerCase()) ||
                s.organizator?.toLowerCase().includes(szukanaFraza.toLowerCase()) ||
                s.wymagania?.toLowerCase().includes(szukanaFraza.toLowerCase())
            );
        }

        if (wybranaKlasa) {
            wynik = wynik.filter(s => {
                const text = `${s.wymagania} ${s.tytul} ${s.organizator}`.toLowerCase();
                // Filtr odrzucający oferty wyłącznie dla studentów wyższych uczelni
                if (text.includes("student") && !text.includes("szkoła") && !text.includes("uczeń")) return false;
                return true;
            });
        }

        if (wybraneZainteresowania.length > 0) {
            wynik = wynik.filter(s => {
                const text = `${s.wymagania} ${s.tytul} ${s.organizator}`.toLowerCase();
                return wybraneZainteresowania.some(z => {
                    const kluczowe = z.toLowerCase().substring(0, 4); // np. "nauk", "spor", "sztu"
                    return text.includes(kluczowe);
                });
            });
        }

        if (wybranyZasieg === "Tylko Lokalne") {
            wynik = wynik.filter(s => {
                const text = `${s.wymagania} ${s.tytul} ${s.organizator}`.toLowerCase();
                return text.includes("gmin") || text.includes("miast") || text.includes("powiat") || text.includes("lokal") || text.includes("wojewódz");
            });
        } else if (wybranyZasieg === "Ogólnokrajowe") {
            wynik = wynik.filter(s => {
                const text = `${s.wymagania} ${s.tytul} ${s.organizator}`.toLowerCase();
                return text.includes("polsk") || text.includes("kraj") || text.includes("narod") || text.includes("ogólnopol");
            });
        }

        if (wiek < 18) {
            wynik = wynik.filter(s => {
                const text = `${s.wymagania} ${s.tytul}`.toLowerCase();
                if (text.includes("pełnoletni") || text.includes("18 lat") || text.includes("18+")) return false;
                return true;
            });
        }
        
        if (sortowanie === "Kwota: Malejąco") {
            wynik.sort((a,b) => (b.kwota?.length || 0) - (a.kwota?.length || 0));
        } else if (sortowanie === "Kwota: Rosnąco") {
             wynik.sort((a,b) => (a.kwota?.length || 0) - (b.kwota?.length || 0));
        } else if (sortowanie === "Termin: Najbliższy") {
            wynik.sort((a,b) => (a.termin?.localeCompare(b.termin || "") || 0));
        }
        
        return wynik;
    }, [stypendiaList, szukanaFraza, sortowanie, wybranaKlasa, wybraneZainteresowania, wybranyZasieg, wiek]);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f8f6f6] dark:bg-[#201214] text-[#171212] dark:text-[#ededed] transition-colors">
            <PasekBoczny />

            {/* Main */}
            <main className="flex-1 flex flex-col h-full relative overflow-hidden">
                {/* Header */}
                <header className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-[#2d1b1e]/80 backdrop-blur-md flex items-center justify-between px-6 lg:px-8 flex-shrink-0 z-10 transition-colors">
                    <div className="flex items-center gap-4 md:hidden">
                        <button type="button" className="p-2 -ml-2 text-gray-600 dark:text-gray-400">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <h2 className="font-bold text-lg text-gray-900 dark:text-white">Stypendia</h2>
                    </div>
                    <div className="hidden md:flex flex-1 max-w-lg">
                        <div className="relative w-full group">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[20px]">search</span>
                            <input
                                className="w-full h-10 bg-gray-100 dark:bg-[#201214] border-none rounded-lg pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#c62a3a]/20 placeholder:text-gray-400 text-gray-900 dark:text-white transition-colors"
                                placeholder="Szukaj stypendiów, grantów..."
                                type="text"
                                value={szukanaFraza}
                                onChange={(e) => setSzukanaFraza(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => showToast("Brak nowych powiadomień")}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-[#c62a3a] transition-colors relative"
                        >
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 size-2 bg-[#c62a3a] rounded-full border-2 border-white dark:border-[#2d1b1e]"></span>
                        </button>
                    </div>
                </header>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto scroll-smooth">
                    <div className="flex max-w-7xl mx-auto w-full">
                        {/* Filters sidebar */}
                        <aside className="hidden lg:flex w-72 flex-col gap-8 p-6 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2d1b1e] h-fit sticky top-0 transition-colors">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Filtry</h3>
                                <button
                                    type="button"
                                    onClick={resetFiltrow}
                                    className="text-xs font-semibold text-[#c62a3a] hover:underline"
                                >
                                    Resetuj wszystko
                                </button>
                            </div>

                            {/* Przedział wiekowy */}
                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Przedział wiekowy</label>
                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    <span>14</span>
                                    <span className="font-bold text-[#c62a3a]">{wiek} lat</span>
                                    <span>25+</span>
                                </div>
                                <input className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#c62a3a]" max={25} min={14} type="range" value={wiek} onChange={(e) => setWiek(parseInt(e.target.value))} />
                            </div>

                            {/* Obecna klasa */}
                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Obecna klasa</label>
                                <div className="space-y-2">
                                    {["Klasa 1", "Klasa 2", "Klasa 3", "Klasa 4"].map((klasa, i) => (
                                        <label key={klasa} className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative flex items-center">
                                                <input
                                                    className="peer size-4 appearance-none rounded border border-gray-300 dark:border-gray-600 checked:bg-[#c62a3a] checked:border-[#c62a3a] transition-all bg-white dark:bg-[#201214]"
                                                    type="checkbox"
                                                    onChange={(e) => {
                                                        if (e.target.checked) setWybranaKlasa(klasa);
                                                        else if (wybranaKlasa === klasa) setWybranaKlasa("");
                                                    }}
                                                    checked={wybranaKlasa === klasa}
                                                />
                                                <span className="absolute text-white opacity-0 peer-checked:opacity-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none material-symbols-outlined text-[14px]">check</span>
                                            </div>
                                            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-[#c62a3a] transition-colors">{klasa}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <hr className="border-gray-200 dark:border-gray-700" />

                            {/* Osiągnięcia i zainteresowania */}
                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Zainteresowania</label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        "Nauki ścisłe",
                                        "Sport",
                                        "Sztuka",
                                        "Debaty",
                                        "Społeczność",
                                    ].map((tag) => (
                                        <button
                                            type="button"
                                            key={tag}
                                            onClick={() => toggleZainteresowanie(tag)}
                                            className={`px-3 py-1.5 rounded-md text-xs font-medium ${wybraneZainteresowania.includes(tag) ? "bg-[#c62a3a] text-white shadow-sm ring-1 ring-[#c62a3a]" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"} transition-colors`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <hr className="border-gray-200 dark:border-gray-700" />

                            {/* Zasięg */}
                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Zasięg</label>
                                <div className="space-y-2">
                                    {[
                                        { name: "Wszystkie", checked: true },
                                        { name: "Tylko Lokalne", checked: false },
                                        { name: "Ogólnokrajowe", checked: false },
                                    ].map((opt) => (
                                        <label key={opt.name} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                className="size-4 accent-[#c62a3a] bg-gray-100 dark:bg-[#201214] border-gray-300 dark:border-gray-600"
                                                name="scope"
                                                type="radio"
                                                onChange={() => setWybranyZasieg(opt.name)}
                                                checked={wybranyZasieg === opt.name}
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-[#c62a3a] transition-colors">{opt.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <hr className="border-gray-200 dark:border-gray-700" />

                            {/* Dochód */}
                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Dochód gosp. domowego</label>
                                <select
                                    value={wybranyDochod}
                                    onChange={(e) => setWybranyDochod(e.target.value)}
                                    className="w-full p-2.5 bg-gray-100 dark:bg-[#201214] border-none rounded-lg text-sm text-gray-600 dark:text-gray-300 focus:ring-1 focus:ring-[#c62a3a] cursor-pointer"
                                >
                                    <option>Dowolny poziom dochodów</option>
                                    <option>Poniżej 30 000 zł</option>
                                    <option>30 000 zł - 60 000 zł</option>
                                    <option>60 000 zł - 100 000 zł</option>
                                    <option>Powyżej 100 000 zł</option>
                                </select>
                            </div>
                        </aside>

                        {/* Content area */}
                        <div className="flex-1 p-6 lg:p-10 flex flex-col gap-10 min-w-0">
                            {/* Title */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <span>Stypendia</span>
                                    <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                                    <span className="text-[#c62a3a]">Przegląd</span>
                                </div>
                                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#171212] dark:text-white">Znajdź swoje stypendium</h1>
                                <p className="text-gray-500 dark:text-gray-400 max-w-2xl">Na podstawie Twojego profilu akademickiego, zainteresowań i lokalizacji.</p>
                            </div>

                            {/* Search + sort */}
                            <div className="flex gap-4">
                                <div className="relative flex-1">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                                    <input
                                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#2d1b1e] border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-[#c62a3a]/20 focus:border-[#c62a3a] transition-all text-gray-900 dark:text-white placeholder-gray-500"
                                        placeholder="Szukaj po nazwie, fundatorze lub słowie kluczowym..."
                                        type="text"
                                        value={szukanaFraza}
                                        onChange={(e) => setSzukanaFraza(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={sortowanie}
                                        onChange={(e) => setSortowanie(e.target.value)}
                                        className="bg-white dark:bg-[#2d1b1e] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-8 text-sm focus:ring-[#c62a3a] focus:border-[#c62a3a] appearance-none cursor-pointer font-medium text-gray-900 dark:text-white"
                                    >
                                        <option>Sortuj: Trafność</option>
                                        <option>Termin: Najbliższy</option>
                                        <option>Kwota: Malejąco</option>
                                        <option>Kwota: Rosnąco</option>
                                    </select>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => showToast("Otwieranie bocznego panelu filtrów na urządzeniu mobilnym")}
                                    className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#2d1b1e] border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-[#171212] dark:text-white"
                                >
                                    <span className="material-symbols-outlined text-lg">filter_list</span> Filtry
                                </button>
                            </div>

                            {/* Polecane */}
                            <section>
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                                        <span className="material-symbols-outlined text-[#c62a3a]">verified</span>
                                        Polecane dla Ciebie
                                    </h3>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => scrollCarousel('left')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-[#c62a3a] transition-colors">
                                            <span className="material-symbols-outlined">chevron_left</span>
                                        </button>
                                        <button type="button" onClick={() => scrollCarousel('right')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-[#c62a3a] transition-colors">
                                            <span className="material-symbols-outlined">chevron_right</span>
                                        </button>
                                    </div>
                                </div>
                                <div ref={karuzelaRef} className="flex gap-5 overflow-x-auto hide-scrollbar pb-4 snap-x">
                                    {loading ? (
                                        <div className="flex justify-center w-full py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c62a3a]"></div></div>
                                    ) : stypendiaList.slice(0, 3).map((card) => (
                                <div key={card.id || card.tytul} className="snap-start shrink-0 w-[300px] bg-white dark:bg-[#2d1b1e] border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm group hover:shadow-md transition-all duration-300 flex flex-col p-6 relative overflow-hidden">
                                    <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-green-50 to-transparent dark:from-green-900/10 rounded-bl-full opacity-50 group-hover:scale-110 transition-transform duration-500 ease-out" />
                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="size-12 rounded-xl bg-gray-50 dark:bg-[#201214] border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-400 group-hover:text-[#c62a3a] transition-colors">
                                                <span className="material-symbols-outlined text-[24px]">{card.ikona || 'workspace_premium'}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => toggleBookmark(card.tytul)}
                                                className={`text-gray-400 hover:text-[#c62a3a] transition-colors ${savedBookmarks.includes(card.tytul) && "text-[#c62a3a]"}`}
                                            >
                                                <span className="material-symbols-outlined text-[20px] transition-transform active:scale-75">{savedBookmarks.includes(card.tytul) ? "bookmark" : "bookmark_border"}</span>
                                            </button>
                                        </div>
                                        <div className="inline-block self-start bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800/40 text-[11px] font-black uppercase tracking-wider px-2 py-1 rounded mb-3">
                                            {card.kwota}
                                        </div>
                                        <h4 className="font-bold text-lg mb-1 text-gray-900 dark:text-white group-hover:text-[#c62a3a] transition-colors leading-tight line-clamp-2">{card.tytul}</h4>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6">{card.organizator}</p>
                                        <div className="mt-auto flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                                <span className="material-symbols-outlined text-[16px]">schedule</span>
                                                {card.termin}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => appliedScholarships.includes(card.tytul) ? showToast('Już aplikowałeś na to stypendium.') : setActiveApplication({ title: card.tytul, amount: card.kwota, org: card.organizator })}
                                                disabled={appliedScholarships.includes(card.tytul)}
                                                className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm focus:outline-none ${appliedScholarships.includes(card.tytul) ? "bg-green-600 text-white" : "bg-[#c62a3a] hover:bg-red-700 text-white"}`}
                                            >
                                                {appliedScholarships.includes(card.tytul) ? "Aplikowano" : "Aplikuj"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                                </div>
                            </section>

                            {/* Wszystkie stypendia */}
                            <section className="space-y-4">
                                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Wszystkie stypendia</h2>
                                    <span className="text-sm font-medium text-gray-400">Znaleziono {przefiltrowaneStypendia.length} wyniki</span>
                                </div>

                                <div className="space-y-4">
                                    {loading ? (
                                        <div className="flex justify-center w-full py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#c62a3a]"></div></div>
                                    ) : przefiltrowaneStypendia.map((item) => (
                                        <div key={item.id} className="group bg-white dark:bg-[#2d1b1e] rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-[#c62a3a]/30 hover:shadow-md transition-all flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                                            <div className="size-16 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0 flex items-center justify-center p-2 text-gray-400 group-hover:text-[#c62a3a] transition-colors">
                                                <span className="material-symbols-outlined text-[32px]">{item.ikona || 'description'}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{item.tytul}</h3>
                                                    <span className={`bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 text-[10px] font-bold px-2 py-0.5 rounded`}>Otwarta</span>
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{item.organizator}</p>
                                                <p className="text-sm text-gray-400 dark:text-gray-500 line-clamp-1">{item.wymagania}</p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">{item.termin}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0 items-center sm:items-end">
                                                <p className="text-xl font-black text-gray-900 dark:text-white">{item.kwota}</p>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleBookmark(item.tytul)}
                                                        className={`p-2 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors ${savedBookmarks.includes(item.tytul) ? "bg-red-50 dark:bg-red-900/20 text-[#c62a3a] border-[#c62a3a]/30" : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400"}`}
                                                    >
                                                        <span className="material-symbols-outlined text-[20px] transition-transform active:scale-75">{savedBookmarks.includes(item.tytul) ? "bookmark" : "bookmark_border"}</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => appliedScholarships.includes(item.tytul) ? showToast('Już aplikowałeś na to stypendium.') : setActiveApplication({ title: item.tytul, id: item.id, amount: item.kwota, org: item.organizator })}
                                                        disabled={appliedScholarships.includes(item.tytul)}
                                                        className={`px-4 py-2 flex items-center gap-1 ${appliedScholarships.includes(item.tytul) ? "bg-green-600 text-white shadow-sm" : "bg-[#c62a3a] hover:bg-red-700 text-white shadow-sm"} text-sm font-bold rounded-lg transition-colors`}
                                                    >
                                                        {appliedScholarships.includes(item.tytul) ? <><span className="material-symbols-outlined text-[16px]">check</span>Aplikowano</> : 'Aplikuj'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 flex justify-center">
                                    <button
                                        type="button"
                                        onClick={() => showToast("Ładowanie kolejnych stypendiów z bazy...")}
                                        className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-[#c62a3a] transition-colors"
                                    >
                                        <span>Załaduj więcej stypendiów</span>
                                        <span className="material-symbols-outlined text-[18px]">expand_more</span>
                                    </button>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>
            {/* Modal aplikacji stypendium */}
            <ModalAplikacjiStypendium
                stypendium={activeApplication}
                onClose={() => setActiveApplication(null)}
                onSuccess={handleApplicationComplete}
                currentUser={currentUser}
            />

            {toastMessage && (
                <div className="fixed bottom-6 right-6 bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 slide-up-animation">
                    <span className="material-symbols-outlined text-[#c62a3a]">info</span>
                    <p className="font-bold text-sm tracking-wide">{toastMessage}</p>
                </div>
            )}
        </div>
    );
}
