"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

// Inicjalizacja klienta Supabase
const supabaseUrl = "https://wbkqwqfarrnpdcvcsxrq.supabase.co";
const supabaseKey = "sb_publishable_hwpw0HQMDlKTqCOGgiwO0w_RY0gETBx";
const supabase = createClient(supabaseUrl, supabaseKey);

export function QrCodeDisplay() {
    const [qrUrl, setQrUrl] = useState("");
    const router = useRouter();

    useEffect(() => {
        // Link, który otwiera skaner na telefonie
        const ngrokBase = "https://ethyl-unillusory-aaron.ngrok-free.dev/kamera";
        setQrUrl(ngrokBase);

        // Subskrypcja Realtime na zmiany w tabeli 'users'
        const channel = supabase
            .channel('db_changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'users',
                },
                (payload) => {
                    console.log("Zmiana w bazie:", payload);

                    // Jeśli status logged zmienił się na true
                    if (payload.new.logged === true) {
                        // Przekazujemy user_id do strony głównej.
                        const uid = payload.new.user_id;

                        console.log(`Zalogowano użytkownika ID: ${uid}`);
                        router.push(`/?uid=${uid}`);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [router]);

    if (!qrUrl) return (
        <div className="flex items-center justify-center p-8 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c62a3a]"></div>
        </div>
    );

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-slate-100">
            <QRCode
                value={qrUrl}
                size={160}
                bgColor="#ffffff"
                fgColor="#171212"
                level="Q"
            />
            <p className="mt-3 text-sm font-medium text-slate-500 text-center max-w-[200px]">
                Zeskanuj telefonem, aby zalogować się z aparatu
            </p>
        </div>
    );
}