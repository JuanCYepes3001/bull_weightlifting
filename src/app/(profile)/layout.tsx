import { requireAuth } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">{children}</main>
      <Footer />
    </>
  );
}
