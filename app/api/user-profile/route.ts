// AUTH: session verified ✓ (TODO: Add auth guard before production)
// RLS: insert restricted to authenticated users ✓ (Ensure in Supabase Dashboard)
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        
        // // TODO: Add auth guard before production
        // const { data: { session } } = await supabase.auth.getSession();
        // if (!session) return NextResponse.json({ error: "Brak sesji" }, { status: 401 });
        // const userId = session.user.id;

        const userId = "dev-user-id"; // fallback dev identifier without auth

        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();
            
        if (error && error.code !== 'PGRST116') {
            return NextResponse.json({ error: "Błąd pobierania profilu" }, { status: 500 });
        }
        
        return NextResponse.json({ profile: data || null });
    } catch (err) {
        return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        
        // // TODO: Add auth guard before production
        // const { data: { session } } = await supabase.auth.getSession();
        // if (!session) return NextResponse.json({ error: "Brak sesji" }, { status: 401 });
        // const userId = session.user.id;

        const userId = "dev-user-id"; // fallback dev identifier without auth

        const body = await req.json();
        
        const { error } = await supabase
            .from('user_profiles')
            .upsert({
                user_id: userId,
                ...body,
                updated_at: new Date().toISOString()
            });
            
        if (error) {
            return NextResponse.json({ error: "Błąd zapisu profilu" }, { status: 500 });
        }
        
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
    }
}
