"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ModalUstawien from "../../components/ModalUstawien";

const POZYCJE_MENU = [
    { ikona: "dashboard", nazwa: "Dashboard", sciezka: "/admin" },
    { ikona: "group", nazwa: "Użytkownicy", sciezka: "/admin/uzytkownicy" },
    { ikona: "book_4", nazwa: "Klasy", sciezka: "/admin/klasy" },
    { ikona: "emoji_events", nazwa: "Olimpiady", sciezka: "/admin/olimpiady" },
    { ikona: "workspace_premium", nazwa: "Stypendia", sciezka: "/admin/stypendia" },
    { ikona: "how_to_vote", nazwa: "Głosowania", sciezka: "/admin/glosowania" },
    { ikona: "campaign", nazwa: "Ogłoszenia", sciezka: "/admin/ogloszenia" },
    { ikona: "bar_chart", nazwa: "Raporty", sciezka: "/admin/raporty" },
];

export default function PasekBocznyAdmin() {
    const pathname = usePathname();
    const [wylogowujeS, setWylogowujeS] = useState(false);
    const [ustawieniaOtwarte, setUstawieniaOtwarte] = useState(false);

    return (
        <>
            <aside className="hidden md:flex flex-col w-64 h-full bg-white dark:bg-[#2d1b1e] border-r border-gray-200 dark:border-gray-700 flex-shrink-0 transition-colors">
                {/* Logo admina */}
                <div className="p-6 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700/50">
                    <div className="size-9 rounded-lg bg-[#c62a3a] flex items-center justify-center text-white shadow-[0_0_15px_rgba(198,42,58,0.25)]">
                        <span className="material-symbols-outlined icon-filled">shield</span>
                    </div>
                    <div>
                        <h1 className="font-bold text-base leading-tight tracking-tight text-gray-900 dark:text-white">
                            Panel Admina
                        </h1>
                        <p className="text-xs text-[#c62a3a] font-medium">Złoty Portal</p>
                    </div>
                </div>

                {/* Nawigacja */}
                <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
                    {POZYCJE_MENU.map((pozycja) => {
                        const czyAktywna =
                            pozycja.sciezka === "/admin"
                                ? pathname === "/admin"
                                : pathname.startsWith(pozycja.sciezka);

                        return (
                            <Link
                                key={pozycja.sciezka}
                                href={pozycja.sciezka}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${czyAktywna
                                    ? "bg-[#c62a3a]/10 text-[#c62a3a]"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                                    }`}
                            >
                                <span
                                    className={`material-symbols-outlined text-[20px] ${czyAktywna
                                        ? "icon-filled"
                                        : "group-hover:scale-110 transition-transform"
                                        }`}
                                >
                                    {pozycja.ikona}
                                </span>
                                <span
                                    className={`text-sm ${czyAktywna ? "font-bold" : "font-medium"
                                        }`}
                                >
                                    {pozycja.nazwa}
                                </span>
                                {czyAktywna && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#c62a3a]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Profil admina na dole */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setUstawieniaOtwarte(true)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors mb-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">settings</span>
                        <span className="text-sm font-medium">Ustawienia</span>
                    </button>
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="size-9 rounded-full bg-[#c62a3a]/10 border-2 border-[#c62a3a]/20 flex items-center justify-center text-[#c62a3a] font-bold text-sm flex-shrink-0">
                            AD
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">Administrator</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">admin@lonpolnoc.pl</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setWylogowujeS(true)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#c62a3a] hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Wyloguj"
                        >
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                        </button>
                    </div>
                </div>
            </aside>
            <ModalUstawien otwarte={ustawieniaOtwarte} zamknij={() => setUstawieniaOtwarte(false)} />
        </>
    );
}
