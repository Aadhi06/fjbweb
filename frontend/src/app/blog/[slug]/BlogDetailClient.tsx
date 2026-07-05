"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, ArrowLeft, BookOpen, Loader2, Tag } from "lucide-react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002") + "/api";

type BlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image?: string | null;
  category?: string;
  published_at?: string | null;
  created_at: string;
};

export function BlogDetailClient({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    async function fetchPost() {
      try {
        const res = await fetch(`${API_URL}/blog/${slug}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) throw new Error();
        const data = await res.json();
        setPost(data.data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  function imageUrl(path?: string | null) {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002"}${path}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-surface">
        <section className="bg-black py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">Post Not Found</h1>
            <p className="text-white/70 max-w-2xl mx-auto text-lg">The blog post you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          </div>
        </section>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-6" />
          <Link href="/blog" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const displayDate = post.published_at || post.created_at;
  const img = imageUrl(post.image);

  return (
    <>
      <section className="bg-black py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm font-medium mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold text-black bg-[#D97706] px-3 py-1 rounded-full">
              {post.category || "Blog"}
            </span>
            <span className="text-sm text-white/60 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(displayDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-lg text-white/70 mt-4 max-w-3xl">{post.excerpt}</p>
          )}
        </div>
      </section>

      <article className="bg-surface min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2">
          {img && (
            <div className="rounded-2xl overflow-hidden shadow-lg mb-10 border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={post.title} className="w-full h-auto max-h-[500px] object-cover" />
            </div>
          )}

          <div
            className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-secondary prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-md py-8"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="border-t border-border mt-12 pt-8 pb-16">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="w-4 h-4" />
                <span>{post.category || "General"}</span>
              </div>
              <Link href="/blog" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline text-sm">
                <ArrowLeft className="w-4 h-4" /> All Posts
              </Link>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
