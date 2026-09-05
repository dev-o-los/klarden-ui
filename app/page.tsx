import { Hero } from "@/components/landing/Hero";
import { Navbar } from "@/components/landing/Navbar";
import { Showcase } from "@/components/landing/Showcase";
import { SITE_CONFIG } from "@/lib/constants";
import { Analytics } from "@vercel/analytics/next";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: `${SITE_CONFIG.name} | Refined Components for Design Engineers`,
  description: SITE_CONFIG.description,
};

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground transition-colors duration-500">
      <Navbar />

      <main className="max-w-350 mx-auto">
        <Hero />
        <div className="px-6 md:px-10 lg:px-12">
          <Showcase />
        </div>
      </main>

      <Footer />
      <Analytics />
    </div>
  );
}
