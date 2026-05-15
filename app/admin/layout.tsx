import type { Metadata } from "next";
import PasekBocznyAdmin from "./components/PasekBocznyAdmin";

export const metadata: Metadata = {
    title: "Panel Administracyjny | Złoty Portal",
    description: "Panel administracyjny Złotego Portalu",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen w-full bg-[#f8f6f6] dark:bg-[#201214] text-slate-900 dark:text-[#ededed] transition-colors">
            <PasekBocznyAdmin />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {children}
            </div>
        </div>
    );
}
