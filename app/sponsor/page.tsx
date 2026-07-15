import { Navbar } from "@/components/landing/Navbar";
import { SponsorContent } from "@/components/landing/SponsorContent";
import { SITE_CONFIG } from "@/lib/constants";
import { Analytics } from "@vercel/analytics/next";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: `Sponsor | ${SITE_CONFIG.name}`,
  description: `Support the development of ${SITE_CONFIG.name} and get your logo displayed on our site.`,
};

export default function SponsorPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground transition-colors duration-500">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-6 md:pt-10">
        <SponsorContent />
      </main>

      <Footer />
      <Analytics />
    </div>
  );
}
