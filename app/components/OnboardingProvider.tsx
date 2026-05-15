"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ProfilerUsera, { UserProfile } from "./ProfilerUsera";
import { createClient } from "@/utils/supabase/client";

export default function OnboardingProvider({ children }: { children: React.ReactNode }) {
    const [showProfiler, setShowProfiler] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Don't show on login/logout pages
        if (pathname?.startsWith("/logowanie")) return;

        const checkOnboarding = async () => {
            const onboarded = localStorage.getItem("zloty_onboarded");
            if (onboarded) return; // Already completed

            // Check if user is actually logged in before showing
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            
            // Only show profiler if user is logged in AND hasn't onboarded
            if (session?.user) {
                setShowProfiler(true);
            }
        };

        checkOnboarding();
    }, [pathname]);

    const handleComplete = (profile: UserProfile) => {
        console.log("[ProfilerUsera] Profil zapisany:", profile);
        setShowProfiler(false);
    };

    return (
        <>
            {children}
            {showProfiler && <ProfilerUsera onComplete={handleComplete} />}
        </>
    );
}
