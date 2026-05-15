"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ModalUstawien from "./ModalUstawien";
import { createClient } from "@/utils/supabase/client";

const AVATAR_URL =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAyZ2JIEylYH1juXuI5iRIkHOAxCnkIsa30sZ8HlZACom2Pnzd40eNU64X5kxoXK2b2nu-rtz1KJza2M_i3JlBZjEjJduoncO5VlDlGX5v3ZcQHJ8MBPtUWiTPa0V-foXIyGvwRXrpOEN-FPRwA1V14AyBDJykv1YFCmHr0JPgyaVKBDXnfAfPABcJrbtlcWTlbAgAV5BIHF-kuhRb_J4DuR_Z3ufgYEIZ8HS5V2vtsZs_bxHSRBRqdU_bg57DKDdA2J9LNdz_VAqY";

// URL backendu Django (ngrok lub localhost)
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

type UserData = { name: string; surname: string; clase: string; user_id?: string } | null;

interface PozycjaMenu {
    ikona: string;
    nazwa: string;
    sciezka: string;
}

const POZYCJE_MENU: PozycjaMenu[] = [
    { ikona: "dashboard", nazwa: "Panel główny", sciezka: "/" },
    { ikona: "how_to_vote", nazwa: "Głosowania", sciezka: "/glosowania" },
    { ikona: "campaign", nazwa: "Ogłoszenia", sciezka: "/ogloszenia" },
    { ikona: "emoji_events", nazwa: "Olimpiady", sciezka: "/olimpiady" },
    { ikona: "savings", nazwa: "Stypendia", sciezka: "/stypendia" },
];

export default function PasekBoczny() {
    const pathname = usePathname();
    const router = useRouter();
    const [modalOtwarte, setModalOtwarte] = useState(false);
    const [userData, setUserData] = useState<UserData>(null);
    const [loggingOut, setLoggingOut] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const fetchUser = async () => {
            // Obsługa trybu debug (jak w głosowaniach)
            const debugRaw = localStorage.getItem("zloty_debug_user");
            if (debugRaw) {
                const d = JSON.parse(debugRaw);
                setUserData({ name: d.name, surname: d.surname, clase: d.clase, user_id: d.user_id });
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Pobierz imię i nazwisko z bazy na podstawie UUID
            try {
                const res = await fetch(`${BACKEND_URL}/api/user/info/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: user.id }),
                });
                const json = await res.json();
                if (json.success) {
                    setUserData({
                        name: json.name,
                        surname: json.surname,
                        clase: json.clase,
                        user_id: user.id,
                    });
                    return;
                }
            } catch (err) {
                console.warn("Backend niedostępny, fallback na Supabase:", err);
            }

            // Fallback — bezpośrednio z Supabase
            const { data } = await supabase
                .from("users")
                .select("name, surename, clase")
                .eq("user_id", user.id)
                .single();

            if (data) setUserData({ name: data.name, surname: data.surename, clase: data.clase, user_id: user.id });
        };

        fetchUser();
    }, []);

    // ─── Logout ─────────────────────────────────────────────────────────────
    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            const userId = userData?.user_id;

            if (userId) {
                // Wywołaj backend Django — ustawia logged=false w bazie
                await fetch(`${BACKEND_URL}/api/user/logout/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: userId }),
                });
            }

            // Wyczyść debug usera
            localStorage.removeItem("zloty_debug_user");

            // Wyloguj z Supabase Auth
            await supabase.auth.signOut();

            // Przekieruj na stronę logowania
            router.push("/logowanie");
        } catch (err) {
            console.error("Błąd wylogowania:", err);
        } finally {
            setLoggingOut(false);
        }
    };

    // Skrót imienia i pierwsze słowo nazwiska → "Jan K."
    const displayName = userData
        ? `${userData.name} ${userData.surname.charAt(0)}.`
        : "Ładowanie...";

    const displayClass = userData ? `Klasa ${userData.clase}` : "";

    return (
        <>
            <aside className="hidden md:flex flex-col w-64 h-full bg-white dark:bg-[#2d1b1e] border-r border-gray-200 dark:border-gray-700 flex-shrink-0 transition-colors">
                {/* Logo */}
                <div className="p-6 flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-[#c62a3a] flex items-center justify-center text-white shadow-[0_0_15px_rgba(198,42,58,0.15)]">
                        <span className="material-symbols-outlined">school</span>
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight tracking-tight text-gray-900 dark:text-white">
                            Złoty Portal
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Złoty Portal</p>
                    </div>
                </div>

                {/* Nawigacja */}
                <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto py-2">
                    {POZYCJE_MENU.map((pozycja) => {
                        const czyAktywna =
                            pozycja.sciezka === "/"
                                ? pathname === "/"
                                : pathname.startsWith(pozycja.sciezka);

                        return (
                            <Link
                                key={pozycja.sciezka}
                                href={pozycja.sciezka}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${czyAktywna
                                    ? "bg-[#c62a3a]/10 text-[#c62a3a]"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                                    }`}
                            >
                                <span className={`material-symbols-outlined ${czyAktywna ? "icon-filled" : "group-hover:scale-110 transition-transform"}`}>
                                    {pozycja.ikona}
                                </span>
                                <span className={`text-sm ${czyAktywna ? "font-bold" : "font-medium"}`}>
                                    {pozycja.nazwa}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Ustawienia + profil + logout */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={() => setModalOtwarte(true)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined">settings</span>
                        <span className="text-sm font-medium">Ustawienia</span>
                    </button>
                    <div className="mt-4 flex items-center gap-3 px-3">
                        <div
                            className="bg-center bg-no-repeat bg-cover rounded-full size-8 ring-2 ring-gray-100 dark:ring-gray-700 shrink-0"
                            style={{ backgroundImage: `url("${AVATAR_URL}")` }}
                        />
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {displayName}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {displayClass}
                            </span>
                        </div>
                    </div>

                    {/* ─── Przycisk Wyloguj ─── */}
                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/15 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800/40 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loggingOut ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent" />
                        ) : (
                            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">logout</span>
                        )}
                        <span className="text-sm font-bold">
                            {loggingOut ? "Wylogowywanie..." : "Wyloguj się"}
                        </span>
                    </button>
                </div>
            </aside>

            <ModalUstawien otwarte={modalOtwarte} zamknij={() => setModalOtwarte(false)} />
        </>
    );
}