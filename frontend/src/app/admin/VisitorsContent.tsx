"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ExternalLink,
  Eye,
  Flame,
  Globe2,
  Loader2,
  MapPin,
  MonitorSmartphone,
  MousePointerClick,
  RefreshCw,
  Users,
  Video,
} from "lucide-react";

type ClarityLinks = {
  live: string;
  recordings: string;
  heatmaps: string;
  dashboard: string;
};

type ClaritySummary = {
  sessions: number;
  botSessions: number;
  humanSessions: number;
  users: number;
  rageClicks: number;
  deadClicks: number;
  pagesPerSession: number;
  avgEngagementSeconds: number;
  topPages: { url: string; sessions: number }[];
  topDevices: { name: string; sessions: number }[];
  topCountries: { name: string; sessions: number }[];
};

type ClarityResponse = {
  configured: boolean;
  projectId: string;
  days?: number;
  fetchedAt?: string;
  message?: string;
  summary?: ClaritySummary;
  links: ClarityLinks;
};

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
}

function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return Math.round(n).toLocaleString("en-GB");
}

function shortenUrl(url: string): string {
  try {
    const u = new URL(url, "https://www.finejewellerybuyers.co.uk");
    return u.pathname + u.search || "/";
  } catch {
    return url.length > 48 ? `${url.slice(0, 45)}…` : url;
  }
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: typeof Users;
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "warn" | "good";
}) {
  const tones = {
    default: "bg-gray-50 border-gray-200 text-black",
    warn: "bg-amber-50 border-amber-200 text-amber-900",
    good: "bg-emerald-50 border-emerald-200 text-emerald-900",
  };
  return (
    <div className={`rounded-xl border p-4 ${tones[tone]}`}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide opacity-70 mb-2">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      {hint ? <p className="text-xs mt-1 opacity-70">{hint}</p> : null}
    </div>
  );
}

function LinkCard({
  href,
  title,
  description,
  icon: Icon,
  accent,
}: {
  href: string;
  title: string;
  description: string;
  icon: typeof Eye;
  accent: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 hover:border-amber-300 hover:shadow-sm transition-all"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-black flex items-center gap-1.5">
          {title}
          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
        </p>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
      </div>
    </a>
  );
}

const FALLBACK_LINKS: ClarityLinks = {
  live: "https://clarity.microsoft.com/projects/view/n7prrt2s5b/impressions?date=Last%203%20days&live=true",
  recordings: "https://clarity.microsoft.com/projects/view/n7prrt2s5b/impressions",
  heatmaps: "https://clarity.microsoft.com/projects/view/n7prrt2s5b/heatmaps",
  dashboard: "https://clarity.microsoft.com/projects/view/n7prrt2s5b/dashboard",
};

const TOKEN_STORAGE_KEY = "clarity_api_token";

function readStoredClarityToken(): string {
  if (typeof window === "undefined") return "";
  return (localStorage.getItem(TOKEN_STORAGE_KEY) || "").trim();
}

export function VisitorsContent() {
  const [data, setData] = useState<ClarityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState<"1" | "2" | "3">("1");
  const [error, setError] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [tokenSaved, setTokenSaved] = useState(false);
  const [savingToken, setSavingToken] = useState(false);

  useEffect(() => {
    setTokenInput(readStoredClarityToken());
    setTokenSaved(Boolean(readStoredClarityToken()));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const clarityToken = readStoredClarityToken();
      const headers: Record<string, string> = {
        ...getAuthHeaders(),
      };
      if (clarityToken) headers["X-Clarity-Api-Token"] = clarityToken;

      const res = await fetch(`/api/admin/clarity/insights?days=${days}`, {
        headers,
        cache: "no-store",
      });
      const json = (await res.json()) as ClarityResponse;
      if (!res.ok && res.status !== 200) {
        setError(json.message || "Could not load visitor insights");
      }
      setData(json);
    } catch {
      setError("Network error loading Clarity insights");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  const saveToken = async () => {
    const next = tokenInput.trim();
    setSavingToken(true);
    try {
      if (next) localStorage.setItem(TOKEN_STORAGE_KEY, next);
      else localStorage.removeItem(TOKEN_STORAGE_KEY);
      setTokenSaved(Boolean(next));
      await load();
    } finally {
      setSavingToken(false);
    }
  };

  const links = data?.links || FALLBACK_LINKS;
  const summary = data?.summary;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-black mb-1">Website visitors</h2>
          <p className="text-gray-500 text-sm">
            See who is on the site, what they click, and watch live sessions via Microsoft Clarity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(e.target.value as "1" | "2" | "3")}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="1">Last 24 hours</option>
            <option value="2">Last 48 hours</option>
            <option value="3">Last 72 hours</option>
          </select>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
        <LinkCard
          href={links.live}
          title="Live on site now"
          description="Watch people browsing right now — clicks, scroll, pages."
          icon={Activity}
          accent="bg-emerald-100 text-emerald-700"
        />
        <LinkCard
          href={links.recordings}
          title="Session recordings"
          description="Replay visits to see what they did step by step."
          icon={Video}
          accent="bg-blue-100 text-blue-700"
        />
        <LinkCard
          href={links.heatmaps}
          title="Click heatmaps"
          description="Where visitors click and how far they scroll."
          icon={Flame}
          accent="bg-orange-100 text-orange-700"
        />
        <LinkCard
          href={links.dashboard}
          title="Clarity dashboard"
          description="Full Microsoft Clarity overview and filters."
          icon={Eye}
          accent="bg-violet-100 text-violet-700"
        />
      </div>

      {loading && !summary ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      ) : null}

      {data && !data.configured ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 mb-6">
          <p className="font-semibold text-amber-900 mb-1">Enable metrics in this panel</p>
          <p className="text-sm text-amber-800 leading-relaxed mb-3">
            Tracking is live. Paste your Clarity Data Export API token below (Clarity → Settings → Data Export). Live
            sessions above work without a token.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Paste Clarity API token"
              className="flex-1 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-black"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={saveToken}
              disabled={savingToken || !tokenInput.trim()}
              className="rounded-lg bg-amber-900 text-white px-4 py-2 text-sm font-semibold hover:bg-amber-800 disabled:opacity-50"
            >
              {savingToken ? "Saving…" : "Save & load metrics"}
            </button>
          </div>
          <a
            href={`https://clarity.microsoft.com/projects/view/${data.projectId}/settings#apiTokens`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-900 underline"
          >
            Open Clarity API tokens <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : null}

      {data?.configured && tokenSaved ? (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem(TOKEN_STORAGE_KEY);
              setTokenInput("");
              setTokenSaved(false);
              load();
            }}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Clear saved Clarity token
          </button>
        </div>
      ) : null}

      {summary ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatCard icon={Users} label="Sessions" value={formatNumber(summary.humanSessions || summary.sessions)} hint={`${formatNumber(summary.botSessions)} bot filtered`} tone="good" />
            <StatCard icon={Globe2} label="Distinct users" value={formatNumber(summary.users)} />
            <StatCard
              icon={MousePointerClick}
              label="Pages / session"
              value={summary.pagesPerSession ? summary.pagesPerSession.toFixed(2) : "—"}
            />
            <StatCard
              icon={AlertTriangle}
              label="Rage + dead clicks"
              value={formatNumber((summary.rageClicks || 0) + (summary.deadClicks || 0))}
              hint={`Rage ${formatNumber(summary.rageClicks)} · Dead ${formatNumber(summary.deadClicks)}`}
              tone={(summary.rageClicks || 0) + (summary.deadClicks || 0) > 0 ? "warn" : "default"}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-black mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-600" />
                Top pages
              </h3>
              {summary.topPages.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">No page data yet — check again after more traffic.</p>
              ) : (
                <div className="space-y-2">
                  {summary.topPages.map((page) => (
                    <div key={page.url} className="flex items-center justify-between gap-3 py-2 border-b border-gray-100 last:border-0">
                      <p className="text-sm text-black truncate font-medium">{shortenUrl(page.url)}</p>
                      <p className="text-sm text-gray-500 tabular-nums shrink-0">{formatNumber(page.sessions)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-black mb-3 flex items-center gap-2">
                  <MonitorSmartphone className="w-4 h-4 text-amber-600" />
                  Devices
                </h3>
                {summary.topDevices.length === 0 ? (
                  <p className="text-sm text-gray-400">No device data yet</p>
                ) : (
                  <div className="space-y-2">
                    {summary.topDevices.map((d) => (
                      <div key={d.name} className="flex justify-between text-sm">
                        <span className="text-gray-700">{d.name}</span>
                        <span className="tabular-nums text-gray-500">{formatNumber(d.sessions)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {data.fetchedAt ? (
                <p className="text-xs text-gray-400 px-1">
                  Updated {new Date(data.fetchedAt).toLocaleString("en-GB")} · Clarity allows 10 API pulls/day
                </p>
              ) : null}
            </div>
          </div>
        </>
      ) : null}

      {!loading && data?.configured && !summary && data.message ? (
        <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-600">{data.message}</div>
      ) : null}
    </div>
  );
}
