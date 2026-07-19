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
  const { portfolioItems, ugcItems, settings, sections } = await getPortfolioVideos();

  return (
    <>
      <Header siteName={sections?.siteName} headerCta={sections?.headerCta} />
      <main>
        <Hero sections={sections} />
        <Showcase items={portfolioItems} sections={sections} />
        <UgcEdits items={ugcItems} sections={sections} />
        <TechnicalArsenal sections={sections} />
        <Contact settings={settings} sections={sections} />
      </main>
      <Footer siteName={sections?.siteName} />
    </>
  );
}
