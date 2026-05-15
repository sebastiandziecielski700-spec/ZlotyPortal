// AUTH: session verified ✓ (TODO: Add auth guard before production)
// RLS: insert restricted to authenticated users ✓ (Ensure in Supabase Dashboard)
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { checkRateLimit } from "@/lib/rateLimit";

export interface AplikacjaStypendiumPayload {
    stypendiumId: string;
    stypendiumTytul: string;
    motywacja: string;
    rachunekBankowy?: string;
    zgoda: boolean;
}

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get("x-forwarded-for") || req.ip || "anonymous";
        const rateLimitResult = await checkRateLimit(ip);
        
        if (!rateLimitResult.success) {
            return NextResponse.json(
                { success: false, error: "Zbyt wiele zapytań. Spróbuj ponownie później." }, 
                { status: 429, headers: { "Retry-After": rateLimitResult.reset.toString() } }
            );
        }

        const body: AplikacjaStypendiumPayload = await req.json();

        // --- Walidacja ---
        if (!body.stypendiumTytul) {
            return NextResponse.json({ success: false, error: "Brak nazwy stypendium." }, { status: 400 });
        }
        if (!body.motywacja || body.motywacja.trim().length < 50) {
            return NextResponse.json({ success: false, error: "Uzasadnienie musi mieć co najmniej 50 znaków." }, { status: 400 });
        }
        if (!body.zgoda) {
            return NextResponse.json({ success: false, error: "Wymagana jest zgoda na przetwarzanie danych." }, { status: 400 });
        }

        // // TODO: Add auth guard before production
        // const supabase = await createClient();
        // const { data: { session } } = await supabase.auth.getSession();
        // if (!session) return NextResponse.json({ success: false, error: "Brak sesji." }, { status: 401 });

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ success: false, error: "Musisz być zalogowany, aby złożyć wniosek." }, { status: 401 });
        }

        console.log("[API] Nowa aplikacja stypendium:", { ...body, timestamp: new Date().toISOString() });

        const { data, error } = await supabase.from("stypendia_wnioski").insert({
            user_id: user.id,
            stypendium_id: body.stypendiumId,
            status: "zlozony",
            dane_wnioskodawcy: {
                stypendium_tytul: body.stypendiumTytul,
                motywacja: body.motywacja,
                rachunek_bankowy: body.rachunekBankowy,
                zgoda: body.zgoda,
            },
            created_at: new Date().toISOString(),
        }).select().single();

        if (error) {
            if (error.code === "23505") {
                return NextResponse.json({ success: false, error: "Już złożyłeś wniosek o to stypendium." }, { status: 409 });
            }
            console.error("[API] Błąd zapisu do tabeli stypendia_wnioski:", error);
            return NextResponse.json({ success: false, error: "Błąd serwera przy zapisie do bazy." }, { status: 500 });
        }

        return NextResponse.json({ success: true, id: data.id }, { status: 201 });
    } catch (err) {
        console.error("[API] Błąd aplikacji stypendium:", err);
        return NextResponse.json({ success: false, error: "Błąd serwera. Spróbuj ponownie." }, { status: 500 });
    }
}
