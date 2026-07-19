import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Showcase } from "@/components/Showcase";
import { TechnicalArsenal } from "@/components/TechnicalArsenal";
import { UgcEdits } from "@/components/UgcEdits";
import { getPortfolioVideos } from "@/data/portfolio";

export const revalidate = 30;

export default async function Home() {
  const { portfolioItems, ugcItems, settings } = await getPortfolioVideos();

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Showcase items={portfolioItems} />
        <UgcEdits items={ugcItems} />
        <TechnicalArsenal />
        <Contact settings={settings} />
      </main>
      <Footer />
    </>
  );
}
