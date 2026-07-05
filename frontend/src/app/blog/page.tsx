"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, BookOpen, Loader2 } from "lucide-react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002") + "/api";

type BlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  image?: string | null;
  category?: string;
  published_at?: string | null;
  created_at: string;
};

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch(`${API_URL}/blog`);
        if (res.ok) {
          const data = await res.json();
          if (data.data?.length) setPosts(data.data);
        }
      } catch {}
      setLoading(false);
    }
    fetchPosts();
  }, []);

  function imageUrl(path?: string | null) {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002"}${path}`;
  }

  return (
    <>
      <section className="bg-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">Gold &amp; Jewellery Blog</h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">Expert guides, market analysis, and tips for selling precious items.</p>
        </div>
      </section>
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">No posts yet</h2>
              <p className="text-gray-400">Check back soon for expert insights and guides.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => {
                const img = imageUrl(post.image);
                const displayDate = post.published_at || post.created_at;
                return (
                  <Link key={post.id} href={`/blog/${post.slug}`}>
                    <article className="bg-white rounded-2xl border border-border hover:border-primary/30 overflow-hidden group transition-all duration-200 hover:shadow-xl cursor-pointer h-full flex flex-col">
                      <div className="aspect-video bg-surface flex items-center justify-center overflow-hidden">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <BookOpen className="w-10 h-10 text-border" />
                        )}
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xs font-semibold text-primary px-2 py-1 bg-primary/10 rounded-full">{post.category || "Blog"}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(displayDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <h2 className="text-lg font-serif font-bold text-secondary mb-2 group-hover:text-primary transition-colors duration-200">{post.title}</h2>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">{post.excerpt}</p>
                        <span className="inline-flex items-center text-sm font-semibold text-primary">
                          Read More <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                        </span>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
