"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Star } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useSettings } from "@/lib/useSettings";
import { API_SETTINGS_URL } from "@/lib/settings";
import type { GoogleReview, GoogleReviewsData } from "@/lib/types";
import {
  DEFAULT_TRUSTINDEX_WIDGET_ID,
  TrustindexWidget,
} from "@/components/reviews/TrustindexWidget";

const REVIEWS_URL = API_SETTINGS_URL.replace(/\/settings$/, "/google-reviews");

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? "text-[#F4B400] fill-[#F4B400]" : "text-gray-200 fill-gray-200"}`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: GoogleReview }) {
  return (
    <article className="h-full rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        {review.profile_photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={review.profile_photo_url} alt="" className="w-11 h-11 rounded-full object-cover bg-gray-100" />
        ) : (
          <div className="w-11 h-11 rounded-full bg-black text-white font-bold flex items-center justify-center">
            {(review.author_name || "G").charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-black truncate">{review.author_name}</p>
          <p className="text-xs text-muted-foreground">{review.relative_time_description}</p>
        </div>
      </div>
      <Stars rating={review.rating} />
      <p className="mt-3 text-sm text-black/80 leading-relaxed line-clamp-6">{review.text}</p>
    </article>
  );
}

export function GoogleReviews({
  compact = false,
}: {
  compact?: boolean;
} = {}) {
  const settings = useSettings();
  const [data, setData] = useState<GoogleReviewsData | null>(null);
  const [trustindexOk, setTrustindexOk] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(REVIEWS_URL)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json?.data) setData(json.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const googleReviewUrl =
    settings.google_review_url ||
    (settings.google_place_id
      ? `https://search.google.com/local/writereview?placeid=${settings.google_place_id}`
      : "");
  const reviews = (data?.reviews || []).filter((r) => (r.rating || 0) >= 5).slice(0, 6);
  const rating = data?.rating || settings.google_rating || 4.8;
  const total = data?.total_reviews || settings.total_reviews || 0;

  return (
    <section id="reviews" className={compact ? "py-10 bg-white rounded-2xl border border-border" : "py-20 bg-white"}>
      <div className={compact ? "px-4 sm:px-6" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"}>
        <SectionHeading
          label="Google reviews"
          title={compact ? "Check our Google reviews" : "What Our Customers Say"}
          description="Verified Google reviews from customers who sold gold and jewellery to Fine Jewellery Buyers."
        />

        <div className="mb-4">
          <TrustindexWidget
            widgetId={DEFAULT_TRUSTINDEX_WIDGET_ID}
            onStatus={(ok) => setTrustindexOk(ok)}
          />
        </div>

        {trustindexOk !== true && (
          <>
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8 text-sm text-black">
              <GoogleIcon className="w-5 h-5" />
              <span className="font-semibold">{Number(rating).toFixed(1)}</span>
              <Stars rating={Math.round(Number(rating))} />
              {total > 0 && <span className="text-muted-foreground">from {total} Google reviews</span>}
            </div>
            {reviews.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {reviews.map((review, index) => (
                  <ReviewCard key={`${review.author_name}-${index}`} review={review} />
                ))}
              </div>
            )}
          </>
        )}

        {googleReviewUrl && (
          <div className="mt-12 flex justify-center">
            <a
              href={googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3.5 bg-white border-2 border-border rounded-full font-semibold text-black hover:border-gold-dark hover:shadow-lg transition-all"
            >
              <GoogleIcon className="w-5 h-5" />
              Review Us on Google
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
