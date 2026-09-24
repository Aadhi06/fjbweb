"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { ExternalLink } from "lucide-react";
import { useSettings } from "@/lib/useSettings";
import {
  DEFAULT_TRUSTINDEX_WIDGET_ID,
  TrustindexWidget,
} from "@/components/reviews/TrustindexWidget";

function TrustpilotIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#00B67A" d="M12 17.5l-3.09 1.82 0.83-3.51L7 13.5l3.6-0.31L12 9.5l1.4 3.69 3.6 0.31-2.74 2.31 0.83 3.51z" />
      <path fill="#005128" d="M12 2L14.9 9.5H22.5L16.3 14.2L18.5 22L12 17.5L5.5 22L7.7 14.2L1.5 9.5H9.1L12 2Z" opacity="0.15" />
    </svg>
  );
}

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

export function GoogleReviews() {
  const settings = useSettings();

  const googleReviewUrl =
    settings.google_review_url ||
    (settings.google_place_id
      ? `https://search.google.com/local/writereview?placeid=${settings.google_place_id}`
      : "");
  const trustpilotUrl = settings.trustpilot_url || "";
  const showReviewButtons = Boolean(googleReviewUrl || trustpilotUrl);
  const widgetId = settings.trustindex_widget_id || DEFAULT_TRUSTINDEX_WIDGET_ID;

  return (
    <section id="reviews" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Customer Reviews"
          title="What Our Customers Say"
          description="Trusted by thousands across the UK with verified Google reviews."
        />

        <div className="min-h-[320px] overflow-hidden">
          <TrustindexWidget widgetId={widgetId} />
        </div>

        {showReviewButtons && (
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            {googleReviewUrl && (
              <a
                href={googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3.5 bg-white border-2 border-border rounded-full font-semibold text-black hover:border-gold-dark hover:shadow-lg transition-all cursor-pointer"
              >
                <GoogleIcon className="w-5 h-5" />
                Review Us on Google
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </a>
            )}
            {trustpilotUrl && (
              <a
                href={trustpilotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#00B67A] text-white rounded-full font-semibold hover:bg-[#009e6a] hover:shadow-lg transition-all cursor-pointer"
              >
                <TrustpilotIcon className="w-5 h-5" />
                Review Us on Trustpilot
                <ExternalLink className="w-4 h-4 text-white/80" />
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
