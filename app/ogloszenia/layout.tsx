import PasekBoczny from "../components/PasekBoczny";

export default function OgloszeniaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen w-full bg-[#f8f6f6] dark:bg-[#201214] text-slate-900 dark:text-[#ededed] transition-colors">
            <PasekBoczny />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {children}
            </div>
        </div>
    );
}
