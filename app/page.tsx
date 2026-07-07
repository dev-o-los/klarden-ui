import { Hero } from "@/components/landing/Hero";
import { LogoIcon } from "@/components/landing/logo-icon";
import { Navbar } from "@/components/landing/Navbar";
import { Showcase } from "@/components/landing/Showcase";
import { SITE_CONFIG } from "@/lib/constants";
import { RichButton } from "@/registry/klarden-ui/rich-button";
import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";
import GithubIcon from "@/components/ui/github-icon";
import TwitterXIcon from "@/components/ui/twitter-x-icon";
import BrandThreadsIcon from "@/components/ui/brand-threads-icon";

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

        {/* Footer */}
        <footer className="mt-32 border-t border-border/40 pt-16 pb-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 md:gap-8">
            {/* Column 1: Brand & Socials & Sponsors */}
            <div className="col-span-2 md:col-span-2 space-y-8">
              <div className="space-y-2">
                <div className="flex items-center group cursor-default -ml-2">
                  <LogoIcon className="size-12 -ml-2 text-foreground transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
                  <span className="text-xl font-bold text-foreground tracking-tighter leading-none -ml-2">
                    {SITE_CONFIG.name.split(" ")[0]}
                    <span className="text-muted-foreground font-medium ml-1">
                      {SITE_CONFIG.name.split(" ")[1]}
                    </span>
                  </span>
                </div>
                <p className="text-muted-foreground text-sm font-light leading-relaxed max-w-xs">
                  Refined UI components for modern interfaces.
                </p>
              </div>

              {/* Social Icons (using itshover custom animated components) */}
              <div className="flex items-center gap-4 text-muted-foreground">
                <Link
                  href={SITE_CONFIG.github}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  <GithubIcon size={20} className="text-muted-foreground hover:text-foreground" />
                </Link>
                <Link
                  href={`https://x.com/${SITE_CONFIG.twitter.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  <TwitterXIcon size={20} className="text-muted-foreground hover:text-foreground" />
                </Link>
                <Link
                  href="https://threads.net"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  <BrandThreadsIcon size={20} className="text-muted-foreground hover:text-foreground" />
                </Link>
              </div>

              {/* Sponsors Section */}
              <div className="space-y-2 pt-4">
                <Link
                  href="#"
                  className="group flex items-center gap-1 text-sm font-semibold text-foreground hover:text-primary transition-colors"
                >
                  Sponsors
                  <span className="text-[10px] text-muted-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
                    ↗
                  </span>
                </Link>
                <p className="text-xs text-muted-foreground font-light">
                  <Link href="#" className="hover:underline">
                    Be here
                  </Link>
                </p>
              </div>
            </div>

            {/* Column 2: Product */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground font-light">
                <li>
                  <Link href="/docs/introduction" className="hover:text-foreground transition-colors">
                    Docs
                  </Link>
                </li>
                <li>
                  <Link href="/docs/components/accordion" className="hover:text-foreground transition-colors">
                    Components
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    MCP
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Sponsor
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Social */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Social</h4>
              <ul className="space-y-3 text-sm text-muted-foreground font-light">
                <li>
                  <Link href={SITE_CONFIG.github} target="_blank" className="hover:text-foreground transition-colors">
                    GitHub
                  </Link>
                </li>
                <li>
                  <Link href={`https://x.com/${SITE_CONFIG.twitter.replace("@", "")}`} target="_blank" className="hover:text-foreground transition-colors">
                    X (Twitter)
                  </Link>
                </li>
                <li>
                  <Link href="https://threads.net" target="_blank" className="hover:text-foreground transition-colors">
                    Threads
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Legal */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground font-light">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="mt-20 pt-8 border-t border-border/20 text-xs text-muted-foreground font-light">
            <p>© {new Date().getFullYear()} {SITE_CONFIG.name}</p>
          </div>
        </footer>
        <Analytics />
      </main>
    </div>
  );
}
