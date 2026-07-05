import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogDetailClient } from "./BlogDetailClient";
import { buildMetadata, breadcrumbJsonLd, SITE_URL } from "@/lib/seo";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002";

type BlogPost = {
  title: string;
  slug: string;
  excerpt: string;
  meta_title?: string | null;
  meta_description?: string | null;
  image?: string | null;
};

async function fetchBlogPost(slug: string): Promise<BlogPost | null> {
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
            publisher: { "@type": "Organization", name: "Fine Jewellery Buyers" },
          }),
        }}
      />
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
