import { Hero } from "@/components/landing/Hero";
import { LogoIcon } from "@/components/landing/logo-icon";
import { Navbar } from "@/components/landing/Navbar";
import { Showcase } from "@/components/landing/Showcase";
import { SITE_CONFIG } from "@/lib/constants";
import { RichButton } from "@/registry/klarden-ui/rich-button";
import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";

export const metadata = {
  title: `${SITE_CONFIG.name} | Refined Components for Design Engineers`,
  description: SITE_CONFIG.description,
};

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground transition-colors duration-500">
      <Navbar />

      <main className="max-w-350 mx-auto px-6 md:px-10 lg:px-12">
        <Hero />
        <Showcase />

        {/* Footer Redesign */}
        <footer className="mt-32 border-t border-border pt-16 pb-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-8">
            <div className="space-y-6">
              <div className="flex items-center group cursor-default -ml-2">
                <LogoIcon className="size-12 text-foreground transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
                <span className="text-xl md:text-2xl font-black text-foreground tracking-tighter leading-none -ml-2">
                  {SITE_CONFIG.name.split(" ")[0]}
                  <span className="text-muted-foreground font-bold ml-1">
                    {SITE_CONFIG.name.split(" ")[1]}
                  </span>
                </span>
              </div>
              <p className="text-muted-foreground text-sm max-w-xs font-medium leading-relaxed">
                {SITE_CONFIG.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 text-sm font-medium">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Library
                </h4>
                <ul className="space-y-3 text-foreground/70">
                  <li>
                    <Link
                      href="/docs/introduction"
                      className="hover:text-primary transition-colors"
                    >
                      Documentation
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/docs/components/accordion"
                      className="hover:text-primary transition-colors"
                    >
                      Components
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-24 pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
              <p className="text-muted-foreground text-[10px] uppercase tracking-widest">
                © {new Date().getFullYear()} {SITE_CONFIG.name}
              </p>
              <div className="flex items-center gap-3 text-[10px] tracking-widest">
                <span className="text-muted-foreground">Built by</span>
                <RichButton
                  size="sm"
                  color="default"
                  asChild
                  className="font-semibold"
                >
                  <Link href="https://twitter.com/utkxrshdev_" target="_blank">
                    @utkxrshdev_
                  </Link>
                </RichButton>
              </div>
            </div>
            <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest text-muted-foreground">
              <Link href="#" className="hover:text-primary transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </footer>
        <Analytics />
      </main>
    </div>
  );
}
