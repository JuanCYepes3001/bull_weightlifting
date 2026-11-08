import { getServerUser } from "@/lib/auth";
import { getCategories } from "@/lib/queries/categories";
import { getAthleteImageUrls } from "@/lib/queries/athletes";
import { getBestSellingProducts } from "@/lib/queries/products";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { BrandMarquee } from "@/components/home/BrandMarquee";
import { BestSellers } from "@/components/home/BestSellers";
import { BrandStatementCarousel } from "@/components/home/BrandStatementCarousel";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FeaturedCTA } from "@/components/home/FeaturedCTA";

export default async function HomePage() {
  const [{ user, profile }, categories, athleteImages, bestSellers] = await Promise.all([
    getServerUser(),
    getCategories().catch(() => []),
    getAthleteImageUrls().catch(() => []),
    getBestSellingProducts(4).catch(() => ({ products: [], fromSales: false })),
  ]);

  return (
    <>
      <Navbar />

      <main>
        <HeroSection
          isAuthenticated={!!user}
          userName={profile?.name ?? user?.email}
          athleteImages={athleteImages}
        />

        <BrandMarquee />

        <BestSellers products={bestSellers.products} fromSales={bestSellers.fromSales} />

        <BrandStatementCarousel imageUrls={athleteImages} />

        <CategoriesSection categories={categories} />

        <FeaturedCTA isAuthenticated={!!user} />
      </main>

      <Footer />
    </>
  );
}
