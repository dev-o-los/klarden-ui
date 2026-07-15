"use client";

import { motion } from "framer-motion";
import { Heart, Users, Link2, LayoutGrid, Clock, Crown } from "lucide-react";

function getMailtoLink(planName: string, price: string) {
  const email = "utkarshh2705@gmail.com";
  const subject = `Sponsorship Request: ${planName} Plan`;
  const body = `Hi Utkarsh,\n\nI would like to sponsor Klarden UI under the ${planName} (${price}/month) plan. Please let me know the payment details and next steps.\n\nBest regards,\n[Sponsor Name]`;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function SponsorContent() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5, 
        ease: [0.23, 1, 0.32, 1] as const
      } 
    }
  };

  return (
    <div className="space-y-16 max-w-5xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="flex flex-col items-center text-center space-y-4 pt-4 pb-4 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="inline-flex items-center gap-1.5 bg-zinc-100/5 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]"
        >
          ✨ Support Klarden
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="text-4xl sm:text-5xl font-medium tracking-tight leading-[1.15] text-foreground"
        >
          Sponsor <span className="font-serif italic text-muted-foreground">Klarden UI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="text-muted-foreground text-sm md:text-base font-light leading-relaxed max-w-xl"
        >
          Thank you for supporting Klarden UI. Your contribution directly funds the development of fluid-motion, tactile components and maintains this open-source registry.
        </motion.p>
      </div>

      {/* Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch"
      >
        {/* Card 1: Thread */}
        <motion.div
          variants={itemVariants}
          className="relative flex flex-col justify-between p-8 rounded-2xl border border-zinc-900 bg-zinc-950/90 text-white transition-all duration-300 hover:border-zinc-800 hover:shadow-2xl"
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight">Thread</h3>
                <span className="px-2 py-0.5 rounded-full border border-zinc-800 bg-zinc-900 text-[10px] font-semibold text-zinc-300 uppercase tracking-wider">
                  🤝 Best Value
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-3xl md:text-4xl font-bold tracking-tight">$2</div>
                <div className="text-xs text-zinc-500 font-light">Per month (+tax)</div>
              </div>
            </div>

            <hr className="border-zinc-900" />

            {/* Perks List */}
            <ul className="space-y-5 text-sm font-light text-zinc-300">
              <li className="flex items-start gap-3">
                <Heart className="size-4.5 text-zinc-400 shrink-0 mt-0.5" />
                <span>Support Klarden UI</span>
              </li>
              <li className="flex items-start gap-3">
                <Users className="size-4.5 text-zinc-400 shrink-0 mt-0.5" />
                <span>Name listed in the Sponsors Page</span>
              </li>
              <li className="space-y-2">
                <div className="flex items-start gap-3">
                  <Link2 className="size-4.5 text-zinc-400 shrink-0 mt-0.5" />
                  <span className="font-medium text-zinc-200">Medium logo & link:</span>
                </div>
                <ul className="list-disc pl-9 text-xs text-zinc-400 space-y-1.5 leading-relaxed">
                  <li>Sponsor section</li>
                  <li>GitHub README</li>
                  <li>Site Footer</li>
                </ul>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <a
              href={getMailtoLink("Thread", "$2")}
              className="block w-full"
            >
              <button className="h-11 rounded-xl w-full flex items-center justify-center text-xs font-semibold tracking-wide bg-transparent border border-zinc-800 hover:border-zinc-700 text-white transition-all cursor-pointer hover:shadow-[0_0_15px_rgba(255,255,255,0.03)] active:scale-[0.98]">
                Start sponsorship
              </button>
            </a>
          </div>
        </motion.div>

        {/* Card 2: Weave */}
        <motion.div
          variants={itemVariants}
          className="relative flex flex-col justify-between p-8 rounded-2xl border border-zinc-900 bg-zinc-950/90 text-white transition-all duration-300 hover:border-zinc-800 hover:shadow-2xl"
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight">Weave</h3>
              </div>
              <div className="space-y-1">
                <div className="text-3xl md:text-4xl font-bold tracking-tight">$5</div>
                <div className="text-xs text-zinc-500 font-light">Per month (+tax)</div>
              </div>
            </div>

            <hr className="border-zinc-900" />

            {/* Perks List */}
            <ul className="space-y-5 text-sm font-light text-zinc-300">
              <li className="text-zinc-500 text-xs italic">
                All Thread features, plus:
              </li>
              <li className="flex items-start gap-3">
                <Users className="size-4.5 text-zinc-400 shrink-0 mt-0.5" />
                <span>Priority feedback on GitHub issues/requests</span>
              </li>
              <li className="space-y-2">
                <div className="flex items-start gap-3">
                  <LayoutGrid className="size-4.5 text-zinc-400 shrink-0 mt-0.5" />
                  <span className="font-medium text-zinc-200">Large logo & link:</span>
                </div>
                <ul className="list-disc pl-9 text-xs text-zinc-400 space-y-1.5 leading-relaxed">
                  <li>Sponsor section</li>
                  <li>GitHub README</li>
                  <li>Site Footer</li>
                  <li>Homepage mention</li>
                </ul>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <a
              href={getMailtoLink("Weave", "$5")}
              className="block w-full"
            >
              <button className="h-11 rounded-xl w-full flex items-center justify-center text-xs font-bold tracking-wide bg-zinc-100 hover:bg-zinc-200 text-black transition-all cursor-pointer active:scale-[0.98]">
                Start sponsorship
              </button>
            </a>
          </div>
        </motion.div>

        {/* Card 3: Helix */}
        <motion.div
          variants={itemVariants}
          className="relative flex flex-col justify-between p-8 rounded-2xl border border-zinc-900 bg-zinc-950/90 text-white transition-all duration-300 hover:border-zinc-800 hover:shadow-2xl"
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight">Helix</h3>
                <span className="px-2 py-0.5 rounded-full border border-zinc-800 bg-zinc-900 text-[10px] font-semibold text-zinc-300 uppercase tracking-wider">
                  💎 Top Tier
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-3xl md:text-4xl font-bold tracking-tight">$15</div>
                <div className="text-xs text-zinc-500 font-light">Per month (+tax)</div>
              </div>
            </div>

            <hr className="border-zinc-900" />

            {/* Perks List */}
            <ul className="space-y-5 text-sm font-light text-zinc-300">
              <li className="text-zinc-500 text-xs italic">
                All Weave features, plus:
              </li>
              <li className="flex items-start gap-3">
                <Clock className="size-4.5 text-zinc-400 shrink-0 mt-0.5" />
                <span>Early access to upcoming components</span>
              </li>
              <li className="flex items-start gap-3">
                <Crown className="size-4.5 text-zinc-400 shrink-0 mt-0.5" />
                <span>1 custom component request queue slot per month</span>
              </li>
              <li className="space-y-2">
                <div className="flex items-start gap-3">
                  <Crown className="size-4.5 text-zinc-400 shrink-0 mt-0.5" />
                  <span className="font-medium text-zinc-200">Featured logo & link:</span>
                </div>
                <ul className="list-disc pl-9 text-xs text-zinc-400 space-y-1.5 leading-relaxed">
                  <li>Sponsor section</li>
                  <li>GitHub README</li>
                  <li>Site Footer</li>
                  <li>Homepage feature</li>
                </ul>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <a
              href={getMailtoLink("Helix", "$15")}
              className="block w-full"
            >
              <button className="h-11 rounded-xl w-full flex items-center justify-center text-xs font-bold tracking-wide bg-amber-400 hover:bg-amber-500 text-black transition-all cursor-pointer active:scale-[0.98]">
                Start sponsorship
              </button>
            </a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
