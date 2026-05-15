"use client";

import { useState, useEffect } from "react";
import PasekBoczny from "./components/PasekBoczny";
import ModalOgloszenia, { OgloszenieSzczegoly } from "./components/ModalOgloszenia";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

type UserData = { name: string; surname: string; clase: string } | null;

export default function StronaDashboard() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const router = useRouter();

  const [aktywneOgloszenie, setAktywneOgloszenie] = useState<OgloszenieSzczegoly | null>(null);

  const [ogloszenia, setOgloszenia] = useState<OgloszenieSzczegoly[]>([]);
  const [stypendia, setStypendia] = useState<any[]>([]);
  const [olimpiady, setOlimpiady] = useState<any[]>([]);
  const [glosowania, setGlosowania] = useState<any[]>([]);
  const [ankiety, setAnkiety] = useState<any[]>([]);
  const [petycje, setPetycje] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState<UserData>(null);

  const supabase = createClient();

  // ─── Fetch user (ta sama logika co wszędzie) ──────────────────────────────
  const fetchCurrentUser = async () => {
    const debugRaw = localStorage.getItem("zloty_debug_user");
    if (debugRaw) {
      const d = JSON.parse(debugRaw);
      setCurrentUser({ name: d.name, surname: d.surname, clase: d.clase });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("users")
      .select("name, surname, clase")
      .eq("user_id", user.id)
      .single();

    if (data) setCurrentUser(data);
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      await fetchCurrentUser();

      const { data: oglData } = await supabase.from("ogloszenia").select("*").order("created_at", { ascending: false }).limit(5);
      const { data: stypData } = await supabase.from("stypendia").select("*").order("created_at", { ascending: false }).limit(3);
      const { data: olimData } = await supabase.from("olimpiady").select("*").order("created_at", { ascending: false }).limit(3);
      const { data: glosData } = await supabase.from("glosowania").select("*").order("created_at", { ascending: false }).limit(1);
      const { data: ankData } = await supabase.from("ankiety").select("*").order("created_at", { ascending: false }).limit(1);
      const { data: petData } = await supabase.from("petycje").select("*").order("liczba_podpisow", { ascending: false }).limit(1);

      if (oglData) {
        setOgloszenia(oglData.map(o => ({
          id: o.id,
          tytul: o.tytul,
          tresc: o.tresc,
          priorytet: o.priorytet,
          autor: o.autor,
          tagColor: o.tag_color,
          dataPublikacji: new Date(o.created_at).toLocaleDateString("pl-PL")
        })));
      }
      if (stypData) setStypendia(stypData);
      if (olimData) setOlimpiady(olimData);
      if (glosData) setGlosowania(glosData);
      if (ankData) setAnkiety(ankData);
      if (petData) setPetycje(petData);

      setLoading(false);
    }

    fetchData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="flex h-screen w-full bg-[#f8f6f6] dark:bg-[#201214] text-slate-900 dark:text-[#ededed] transition-colors">
      <PasekBoczny />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-[#2d1b1e]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-10 sticky top-0 transition-colors">
          <button type="button" className="md:hidden p-2 text-gray-600 dark:text-gray-400">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex-1 max-w-md ml-4 md:ml-0">
          </div>
          <div className="flex items-center gap-4">
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="flex flex-col xl:flex-row gap-8 items-start">
            <div className="flex-1 space-y-8 min-w-0">

              {/* ─── Welcome ─── */}
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Witaj ponownie, {currentUser ? currentUser.name : "…"}! 👋
                </h2>
                <p className="text-gray-500 dark:text-gray-400">Oto co dzieje się dzisiaj w Złotym Portalu.</p>
              </div>

              {/* Głos Ucznia */}
              <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-[#c62a3a]">
                      <span className="material-symbols-outlined">how_to_vote</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Głos Ucznia</h3>
                  </div>
                  <a className="text-sm font-semibold text-[#c62a3a] hover:text-red-700 dark:hover:text-red-400 flex items-center" href="/glosowania">
                    Zobacz całą historię
                    <span className="material-symbols-outlined text-lg ml-1">arrow_forward</span>
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Głosowania */}
                  <div className="bg-white dark:bg-[#2d1b1e] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between group hover:border-[#c62a3a]/30 transition-colors relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <span className="material-symbols-outlined text-8xl text-[#c62a3a] transform rotate-12">ballot</span>
                    </div>
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aktywne Głosowania</p>
                          <h4 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{glosowania.length} <span className="text-lg font-medium text-gray-400 dark:text-gray-500">Aktywne</span></h4>
                        </div>
                        {glosowania[0] && <span className="inline-flex items-center rounded-md bg-red-50 dark:bg-red-900/20 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/10 dark:ring-red-500/20">{glosowania[0].status_kategoria}</span>}
                      </div>
                      <div className="space-y-3 mb-6 relative z-10 w-full min-h-[60px]">
                        {loading ? (
                          <div className="flex justify-center w-full py-2"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#c62a3a]"></div></div>
                        ) : glosowania[0] ? (
                          <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#201214] border border-gray-200 dark:border-gray-800">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-200 line-clamp-1">{glosowania[0].tytul}</p>
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">timer</span> {glosowania[0].status_opis}
                            </p>
                          </div>
                        ) : (
                          <div className="p-3"><p className="text-sm font-semibold text-gray-500">Brak aktywnych głosowań.</p></div>
                        )}
                      </div>
                    </div>
                    <button type="button" onClick={() => router.push("/glosowania")}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#c62a3a] py-2.5 px-3 text-sm font-bold text-white shadow-sm hover:bg-red-700 transition-colors relative z-10">
                      <span className="material-symbols-outlined text-[18px]">how_to_vote</span>
                      Zagłosuj
                    </button>
                  </div>

                  {/* Ankiety */}
                  <div className="bg-white dark:bg-[#2d1b1e] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between group hover:border-blue-500/30 transition-colors relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <span className="material-symbols-outlined text-8xl text-blue-600 transform -rotate-12">assignment</span>
                    </div>
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Otwarte Ankiety</p>
                          <h4 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{ankiety.length || 0} <span className="text-lg font-medium text-gray-400 dark:text-gray-500">Nowe</span></h4>
                        </div>
                        {ankiety[0] && <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/20 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-500/20">{ankiety[0].kategoria}</span>}
                      </div>
                      <div className="space-y-3 mb-6 relative z-10 min-h-[60px]">
                        {loading ? (
                          <div className="flex justify-center w-full py-2"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#c62a3a]"></div></div>
                        ) : ankiety[0] ? (
                          <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#201214] border border-gray-200 dark:border-gray-800">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-200 line-clamp-1">{ankiety[0].tytul}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{ankiety[0].czas_wypelniania}</p>
                          </div>
                        ) : (
                          <div className="p-3"><p className="text-sm font-semibold text-gray-500">Brak ankiet na ten moment.</p></div>
                        )}
                      </div>
                    </div>
                    <button type="button" onClick={() => router.push("/glosowania")}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-white dark:bg-[#201214] border border-gray-200 dark:border-gray-700 py-2.5 px-3 text-sm font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors relative z-10">
                      <span className="material-symbols-outlined text-[18px]">poll</span>
                      Rozpocznij ankietę
                    </button>
                  </div>

                  {/* Petycje */}
                  <div className="bg-white dark:bg-[#2d1b1e] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between group hover:border-orange-500/30 transition-colors relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <span className="material-symbols-outlined text-8xl text-orange-600 transform rotate-6">edit_document</span>
                    </div>
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Petycje</p>
                          <h4 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{petycje[0]?.liczba_podpisow || 0} <span className="text-lg font-medium text-gray-400 dark:text-gray-500">/ {petycje[0]?.wymagane_podpisy || 200}</span></h4>
                        </div>
                        {petycje[0] && <span className="inline-flex items-center rounded-md bg-orange-50 dark:bg-orange-900/20 px-2 py-1 text-xs font-medium text-orange-700 dark:text-orange-400 ring-1 ring-inset ring-orange-600/10 dark:ring-orange-500/20">{petycje[0].kategoria}</span>}
                      </div>
                      <div className="space-y-3 mb-6 relative z-10 min-h-[60px]">
                        {loading ? (
                          <div className="flex justify-center w-full py-2"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#c62a3a]"></div></div>
                        ) : petycje[0] ? (
                          <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#201214] border border-gray-200 dark:border-gray-800">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-200 line-clamp-1">{petycje[0].tytul}</p>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                              <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${Math.min((petycje[0].liczba_podpisow / petycje[0].wymagane_podpisy) * 100, 100)}%` }}></div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3"><p className="text-sm font-semibold text-gray-500">Brak aktywnych petycji.</p></div>
                        )}
                      </div>
                    </div>
                    <button type="button" onClick={() => router.push("/glosowania")}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-white dark:bg-[#201214] border border-gray-200 dark:border-gray-700 py-2.5 px-3 text-sm font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors relative z-10">
                      <span className="material-symbols-outlined text-[18px]">ink_pen</span>
                      Podpisz petycję
                    </button>
                  </div>
                </div>
              </section>

              {/* Stypendia + Olimpiady */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="flex flex-col bg-white dark:bg-[#2d1b1e] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden h-full">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-[#201214]/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-400">
                        <span className="material-symbols-outlined">school</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Wyszukiwarka stypendiów</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Dopasowane do Twojego profilu</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => router.push("/stypendia")} className="text-gray-400 hover:text-[#c62a3a] transition-colors">
                      <span className="material-symbols-outlined">tune</span>
                    </button>
                  </div>
                  <div className="p-4 flex-1 flex flex-col gap-3">
                    {loading ? (
                      <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c62a3a]"></div></div>
                    ) : stypendia.map((item) => (
                      <div key={item.id} className="group flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#201214] transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                        <div className="size-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">{item.ikona || "science"}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate group-hover:text-[#c62a3a] transition-colors">{item.tytul}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.wymagania}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="block font-bold text-green-600 dark:text-green-400 text-sm">{item.kwota}</span>
                          <span className="block text-xs text-gray-400 dark:text-gray-500">{item.termin}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
                    <a href="/stypendia" className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2.5 px-3 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <span className="material-symbols-outlined text-[18px]">search</span>
                      Przeszukaj bazę danych
                    </a>
                  </div>
                </section>

                <section className="flex flex-col bg-white dark:bg-[#2d1b1e] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden h-full">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-[#201214]/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg text-purple-700 dark:text-purple-400">
                        <span className="material-symbols-outlined">emoji_events</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Wyszukiwarka olimpiad</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Nadchodzące konkursy</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => router.push("/olimpiady")} className="text-gray-400 hover:text-[#c62a3a] transition-colors">
                      <span className="material-symbols-outlined">filter_list</span>
                    </button>
                  </div>
                  <div className="p-4 flex-1 flex flex-col gap-3">
                    {loading ? (
                      <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c62a3a]"></div></div>
                    ) : olimpiady.map((item) => (
                      <div key={item.id} className="group flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#201214] transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                        <div className="size-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400 font-black text-lg">
                          {item.skrot}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate group-hover:text-[#c62a3a] transition-colors">{item.tytul}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">{item.poziom}</span>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-gray-400 group-hover:text-[#c62a3a]">chevron_right</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
                    <a href="/olimpiady" className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2.5 px-3 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      Zobacz pełny kalendarz
                    </a>
                  </div>
                </section>
              </div>

              <div className="pb-8 text-center text-xs text-gray-400">
                © 2026 Złoty Portal. Wszelkie prawa zastrzeżone.
              </div>
            </div>

            {/* Ogłoszenia sidebar */}
            <aside className="w-full xl:w-[320px] shrink-0 flex flex-col gap-6">
              <div className="bg-white dark:bg-[#2d1b1e] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col xl:sticky xl:top-0 transition-colors overflow-hidden">
                <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-[#201214]/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <span className="material-symbols-outlined text-[20px]">campaign</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white leading-tight">Ogłoszenia</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Tablica aktualności</p>
                    </div>
                  </div>
                  <span className="size-2 bg-[#c62a3a] rounded-full animate-pulse"></span>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[500px] xl:max-h-[calc(100vh-16rem)] p-4 space-y-4 hide-scrollbar">
                  {loading ? (
                    <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div></div>
                  ) : ogloszenia.map((ogl) => (
                    <div key={ogl.id} className="group relative pl-4 pb-4 border-l-2 border-gray-200 dark:border-gray-800 last:border-transparent last:pb-0">
                      <div className={`absolute top-0 -left-[9px] size-4 rounded-full border-4 border-white dark:border-[#2d1b1e] bg-${ogl.tagColor || "blue"}-500 dark:bg-${ogl.tagColor || "blue"}-400 group-hover:scale-125 transition-transform`}></div>
                      <div
                        onClick={() => setAktywneOgloszenie(ogl)}
                        className="bg-gray-50 dark:bg-[#201214] border border-gray-200 dark:border-gray-700/50 rounded-xl p-3 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer group-hover:bg-white dark:group-hover:bg-[#2d1b1e]"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider text-${ogl.tagColor || "blue"}-600 dark:text-${ogl.tagColor || "blue"}-400`}>{ogl.priorytet}</span>
                          <span className="text-[10px] font-medium text-gray-400">{ogl.dataPublikacji}</span>
                        </div>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1 group-hover:text-[#c62a3a] transition-colors line-clamp-1">{ogl.tytul}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{ogl.tresc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#201214]/50 z-10 shrink-0">
                  <a href="/ogloszenia" className="w-full py-2.5 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-1">
                    Archiwum ogłoszeń
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 slide-up-animation">
          <span className="material-symbols-outlined text-[#c62a3a]">info</span>
          <p className="font-bold text-sm tracking-wide">{toastMessage}</p>
        </div>
      )}

      <ModalOgloszenia ogloszenie={aktywneOgloszenie} onClose={() => setAktywneOgloszenie(null)} />
    </div>
  );
}