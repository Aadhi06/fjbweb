import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogDetailClient } from "./BlogDetailClient";
import { getHighValueBlog, HIGH_VALUE_BLOGS } from "@/lib/high-value-blogs";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd, SITE_URL } from "@/lib/seo";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002";

type BlogPost = {
  title: string;
  slug: string;
  excerpt: string;
  meta_title?: string | null;
  meta_description?: string | null;
  image?: string | null;
  faq?: { question: string; answer: string }[];
};

async function fetchBlogPost(slug: string): Promise<BlogPost | null> {
  const featured = getHighValueBlog(slug);
  if (featured) return featured;

  try {
    const res = await fetch(`${API_URL}/api/blog/${slug}`, { next: { revalidate: 3600 } });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

export function generateStaticParams() {
  return HIGH_VALUE_BLOGS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
  if (!post) return { title: "Post Not Found" };

  const title = post.meta_title || post.title;
  const description = post.meta_description || post.excerpt;
  const ogImage = post.image?.startsWith("http")
    ? post.image
    : post.image?.startsWith("/images/")
      ? `${SITE_URL}${post.image}`
      : post.image
        ? `${API_URL.replace(/\/$/, "")}${post.image}`
        : undefined;

  return buildMetadata({
    title,
    description,
    path: `/blog/${slug}`,
    ogImage,
  });
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
  if (!post) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            url: `${SITE_URL}/blog/${slug}`,
            datePublished: getHighValueBlog(slug)?.published_at,
            dateModified: getHighValueBlog(slug)?.published_at,
            publisher: { "@type": "Organization", name: "Fine Jewellery Buyers", url: SITE_URL },
            mainEntityOfPage: `${SITE_URL}/blog/${slug}`,
          }),
        }}
      />
      {post.faq && post.faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(post.faq)) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Blog", path: "/blog" },
              { name: post.title, path: `/blog/${slug}` },
            ])
          ),
        }}
      />
      <BlogDetailClient slug={slug} />
    </>
  );
}
