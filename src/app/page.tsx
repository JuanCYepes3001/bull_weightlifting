import { getServerUser } from "@/lib/auth";
import { getCategories } from "@/lib/queries/categories";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { BrandStatement } from "@/components/home/BrandStatement";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FeaturedCTA } from "@/components/home/FeaturedCTA";

export default async function HomePage() {
  const [{ user, profile }, categories] = await Promise.all([
    getServerUser(),
    getCategories().catch(() => []),
  ]);

  return (
    <>
      <Navbar />

      <main>
        <HeroSection
          isAuthenticated={!!user}
          userName={profile?.name ?? user?.email}
        />

        <BrandStatement />

        <CategoriesSection categories={categories} />

        <FeaturedCTA isAuthenticated={!!user} />
      </main>

      <Footer />
    </>
  );
}
