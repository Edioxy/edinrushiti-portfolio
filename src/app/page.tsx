import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Showcase } from "@/components/Showcase";
import { TechnicalArsenal } from "@/components/TechnicalArsenal";
import { UgcEdits } from "@/components/UgcEdits";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Showcase />
        <UgcEdits />
        <TechnicalArsenal />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
