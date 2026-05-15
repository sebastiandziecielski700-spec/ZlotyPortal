import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface Uczestnik {
    id: string;
    imie: string;
    nazwisko: string;
    klasa: string;
    dataZapisania: string;
}

export function ModalUczestnicy({
    typ,
    itemId,
    tytul,
    onClose
}: {
    typ: "olimpiada" | "stypendium";
    itemId: string;
    tytul: string;
    onClose: () => void;
}) {
    const [uczestnicy, setUczestnicy] = useState<Uczestnik[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchUczestnicy() {
            setLoading(true);
            const tabelaOpcje = typ === "olimpiada" ? "olimpiady_zapisy" : "stypendia_wnioski";
            const idKolumna = typ === "olimpiada" ? "olimpiada_id" : "stypendium_id";

            const { data: zapisy, error } = await supabase
                .from(tabelaOpcje)
                .select("*")
                .eq(idKolumna, itemId);

            if (error || !zapisy || zapisy.length === 0) {
                setUczestnicy([]);
                setLoading(false);
                return;
            }

            const userIds = zapisy.map((z: any) => z.user_id);
            const { data: users } = await supabase
                .from("users")
                .select("user_id, name, surename, clase")
                .in("user_id", userIds);

            if (users) {
                const mapowaniUczestnicy = zapisy.map((zapis: any) => {
                    const user = users.find((u: any) => u.user_id === zapis.user_id);
                    return {
                        id: zapis.id,
                        imie: user?.name || "Nieznany",
                        nazwisko: user?.surename || "Użytkownik",
                        klasa: user?.clase || "-",
                        dataZapisania: new Date(zapis.created_at).toLocaleString("pl-PL")
                    };
                });
                setUczestnicy(mapowaniUczestnicy);
            }
            setLoading(false);
        }

        fetchUczestnicy();
    }, [itemId, typ]);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-[#2d1b1e] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {typ === "olimpiada" ? "Zapisani na olimpiadę" : "Aplikujący na stypendium"}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{tytul}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-gray-500">close</span>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c62a3a]"></div>
                        </div>
                    ) : uczestnicy.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                            <span className="material-symbols-outlined text-5xl mb-3">person_off</span>
                            <p className="font-bold">Brak zapisanych osób</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {uczestnicy.map(u => (
                                <div key={u.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-[#201214]">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-[#c62a3a]/10 text-[#c62a3a] flex items-center justify-center font-bold text-sm">
                                            {u.imie.charAt(0)}{u.nazwisko.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{u.imie} {u.nazwisko}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Klasa {u.klasa}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Data zapisu</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-300">{u.dataZapisania}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
