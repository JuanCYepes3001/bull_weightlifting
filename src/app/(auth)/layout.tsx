import { BullLogo } from "@/components/ui/BullLogo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header minimal */}
      <header className="h-16 flex items-center px-6 border-b border-white/5">
        <BullLogo size="md" layout="horizontal" withSubtitle withMark />
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer minimal */}
      <footer className="h-14 flex items-center justify-center border-t border-white/5">
        <p className="text-xs text-white/20 font-body tracking-widest uppercase">
          Bull Weightlifting — El que para, pierde
        </p>
      </footer>
    </div>
  );
}
