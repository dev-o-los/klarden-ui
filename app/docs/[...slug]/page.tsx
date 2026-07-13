import { mdxComponents } from "@/components/docs/mdx-components";
import { getAdjacentDocs, getDocBySlug, getDocSlugs } from "@/lib/docs";
import { SITE_CONFIG } from "@/lib/constants";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OpenInChatGPTButton } from "@/components/docs/open-in-chatgpt-button";

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  if (!doc) {
    return {};
  }

  const url = `${SITE_CONFIG.url}/docs/${doc.slug}`;

  return {
    title: doc.title,
    description: doc.description,
    openGraph: {
      title: doc.title,
      description: doc.description,
      type: "article",
      url,
      images: [
        {
          url: SITE_CONFIG.defaultOgImage,
          width: 1200,
          height: 630,
          alt: doc.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: doc.title,
      description: doc.description,
      images: [SITE_CONFIG.defaultOgImage],
    },
    alternates: {
      canonical: url,
    },
  };
}

export async function generateStaticParams() {
  const slugs = getDocSlugs();
  return slugs.map((slug) => ({
    slug: slug.split("/"),
  }));
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  const { prev, next } = getAdjacentDocs(doc.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: doc.title,
    description: doc.description,
    author: {
      "@type": "Person",
      name: SITE_CONFIG.author,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_CONFIG.url}/favicon.ico`,
      },
    },
  };

  return (
    <div className="space-y-6 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumbs - Premium UI/UX Style */}
      <nav className="flex items-center gap-2 text-xs font-medium text-zinc-400 dark:text-zinc-500">
        <Link
          href="/docs/introduction"
          className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-200"
        >
          Docs
        </Link>
        <ChevronRight size={12} className="text-zinc-400 dark:text-zinc-300 shrink-0" />
        <span className="truncate">{doc.category}</span>
        <ChevronRight size={12} className="text-zinc-400 dark:text-zinc-300 shrink-0" />
        <span className="text-zinc-900 dark:text-zinc-100 font-semibold truncate">{doc.title}</span>
      </nav>

      {/* Page Header - Tighter layout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-50">
            {doc.title}
          </h1>
          {doc.description && (
            <p className="text-base text-zinc-500 dark:text-zinc-400 font-medium tracking-tight max-w-xl leading-relaxed">
              {doc.description}
            </p>
          )}
        </div>

        {/* Page Actions - Compact & Single Line */}
        <div className="flex items-center gap-2 shrink-0">
          <OpenInChatGPTButton title={doc.title} description={doc.description} url={`${SITE_CONFIG.url}/docs/${doc.slug}`} />

          <div className="flex items-center gap-1">
            {prev ? (
              <Link
                href={`/docs/${prev.slug}`}
                className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20 text-muted-foreground/80 hover:text-foreground hover:bg-zinc-100/50 dark:hover:bg-zinc-950/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 active:scale-95 shadow-xs cursor-pointer"
                title={`Prev: ${prev.title}`}
              >
                <ChevronLeft size={14} />
              </Link>
            ) : (
              <div className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20 opacity-30 text-muted-foreground/40 cursor-not-allowed">
                <ChevronLeft size={14} />
              </div>
            )}

            {next ? (
              <Link
                href={`/docs/${next.slug}`}
                className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20 text-muted-foreground/80 hover:text-foreground hover:bg-zinc-100/50 dark:hover:bg-zinc-950/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 active:scale-95 shadow-xs cursor-pointer"
                title={`Next: ${next.title}`}
              >
                <ChevronRight size={14} />
              </Link>
            ) : (
              <div className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20 opacity-30 text-muted-foreground/40 cursor-not-allowed">
                <ChevronRight size={14} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-linear-to-r from-zinc-200 dark:from-zinc-800 to-transparent" />

      <article className="prose prose-zinc dark:prose-invert max-w-none prose-sm sm:prose-base">
        <MDXRemote source={doc.content} components={mdxComponents} />
      </article>
    </div>
  );
}
