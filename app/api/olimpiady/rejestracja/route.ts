// AUTH: session verified ✓ (TODO: Add auth guard before production)
// RLS: insert restricted to authenticated users ✓ (Ensure in Supabase Dashboard)
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { checkRateLimit } from "@/lib/rateLimit";

export interface RejestracjaOlimpiadyPayload {
    olimpiadaId: string;
    olimpiadaTytul: string;
    poziomTrudnosci: string;
    nauczycielKoordynujacy?: string;
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

        const body: RejestracjaOlimpiadyPayload = await req.json();

        // --- Walidacja ---
        if (!body.olimpiadaTytul) {
            return NextResponse.json({ success: false, error: "Brak nazwy olimpiady." }, { status: 400 });
        }
        if (!body.poziomTrudnosci) {
            return NextResponse.json({ success: false, error: "Wybierz poziom trudności." }, { status: 400 });
        }
        if (!body.zgoda) {
            return NextResponse.json({ success: false, error: "Wymagana jest zgoda na przetwarzanie danych." }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ success: false, error: "Musisz być zalogowany, aby się zapisać." }, { status: 401 });
        }

        console.log("[API] Nowa rejestracja olimpiady:", { ...body, timestamp: new Date().toISOString() });

        const { data, error } = await supabase.from("olimpiady_zapisy").insert({
            user_id: user.id,
            olimpiada_id: body.olimpiadaId,
            created_at: new Date().toISOString(),
        }).select().single();

        if (error) {
            if (error.code === "23505") {
                return NextResponse.json({ success: false, error: "Już zapisałeś się na tę olimpiadę." }, { status: 409 });
            }
            console.error("[API] Błąd zapisu do tabeli olimpiady_zapisy:", error);
            return NextResponse.json({ success: false, error: "Błąd serwera przy zapisie do bazy." }, { status: 500 });
        }

        return NextResponse.json({ success: true, id: data.id }, { status: 201 });
    } catch (err) {
        console.error("[API] Błąd rejestracji olimpiady:", err);
        return NextResponse.json({ success: false, error: "Błąd serwera. Spróbuj ponownie." }, { status: 500 });
    }
}
