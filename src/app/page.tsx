import { getServerUser } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { BrandStatement } from "@/components/home/BrandStatement";
import { TrusasSection } from "@/components/home/TrusasSection";
import { FeaturedCTA } from "@/components/home/FeaturedCTA";

export default async function HomePage() {
  const { user, profile } = await getServerUser();

  return (
    <>
      <Navbar />

      <main>
        <HeroSection
          isAuthenticated={!!user}
          userName={profile?.name ?? user?.email}
        />

        <BrandStatement />

        <TrusasSection />

        <FeaturedCTA isAuthenticated={!!user} />
      </main>

      <Footer />
    </>
  );
}
