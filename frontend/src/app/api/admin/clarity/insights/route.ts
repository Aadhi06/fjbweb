import { NextRequest, NextResponse } from "next/server";

const CLARITY_URL = "https://www.clarity.ms/export-data/api/v1/project-live-insights";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002";

type ClarityMetric = {
  metricName: string;
  information: Record<string, string | number>[];
};

function sumField(rows: Record<string, string | number>[], key: string): number {
  return rows.reduce((acc, row) => acc + (Number(row[key]) || 0), 0);
}

function summarise(metrics: ClarityMetric[]) {
  const byName = Object.fromEntries(metrics.map((m) => [m.metricName, m.information || []]));

  const traffic = byName.Traffic || [];
  const popular = byName["Popular Pages"] || byName.PopularPages || [];
  const rage = byName["Rage Click Count"] || byName.RageClickCount || [];
  const dead = byName["Dead Click Count"] || byName.DeadClickCount || [];
  const engagement = byName["Engagement Time"] || byName.EngagementTime || [];
  const devices = byName.Device || [];
  const countries = byName["Country/Region"] || byName.Country || [];

  const sessions = sumField(traffic, "totalSessionCount") || sumField(traffic, "sessionsCount");
  const bots = sumField(traffic, "totalBotSessionCount");
  const users = sumField(traffic, "distinctUserCount") || sumField(traffic, "distantUserCount");

  const rowSessions = (row: Record<string, string | number>) =>
    Number(row.totalSessionCount || row.sessionsCount || row.Sessions || row.sessions || row.subTotal || 0);

  const topPages = [...popular]
    .map((row) => ({
      url: String(row.URL || row.Url || row.url || row["Page Title"] || row.PageTitle || "—"),
      sessions: rowSessions(row),
    }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 8);

  const topDevices = [...devices]
    .map((row) => ({
      name: String(row.Device || row.device || "Other"),
      sessions: rowSessions(row),
    }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 5);

  const topCountries = [...countries]
    .map((row) => ({
      name: String(row["Country/Region"] || row.Country || row.country || "Other"),
      sessions: rowSessions(row),
    }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 5);

  const avgEngagement =
    engagement.length > 0
      ? engagement.reduce(
          (acc, row) =>
            acc + (Number(row.averageEngagementTime || row.activeTime || row.totalTime || row.EngagementTime || 0) || 0),
          0
        ) / engagement.length
      : 0;

  return {
    sessions,
    botSessions: bots,
    humanSessions: Math.max(0, sessions - bots),
    users,
    rageClicks: sumField(rage, "sessionsCount") || sumField(rage, "subTotal") || sumField(rage, "totalSessionCount"),
    deadClicks: sumField(dead, "sessionsCount") || sumField(dead, "subTotal") || sumField(dead, "totalSessionCount"),
    pagesPerSession:
      traffic.length > 0
        ? traffic.reduce((acc, row) => acc + (Number(row.pagesPerSessionPercentage || row.PagesPerSessionPercentage) || 0), 0) /
          traffic.length
        : 0,
    avgEngagementSeconds: avgEngagement,
    topPages,
    topDevices,
    topCountries,
  };
}

async function resolveClarityToken(
  authHeader: string | null,
  request: NextRequest
): Promise<string> {
  const headerToken = (request.headers.get("x-clarity-api-token") || "").trim();
  if (headerToken) return headerToken;

  const envToken = (process.env.CLARITY_API_TOKEN || "").trim();
  if (envToken) return envToken;

  if (!authHeader) return "";
  try {
    const res = await fetch(`${API_URL}/api/admin/settings`, {
      headers: { Authorization: authHeader, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return "";
    const json = await res.json();
    const data = json?.data || json?.settings || json;
    return String(data?.clarity_api_token || "").trim();
  } catch {
    return "";
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Confirm caller is a logged-in admin
  try {
    const me = await fetch(`${API_URL}/api/admin/me`, {
      headers: { Authorization: authHeader, Accept: "application/json" },
      cache: "no-store",
    });
    if (!me.ok) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ message: "Auth check failed" }, { status: 502 });
  }

  const token = await resolveClarityToken(authHeader, request);
  const projectId =
    (process.env.NEXT_PUBLIC_CLARITY_ID || "").trim() ||
    request.nextUrl.searchParams.get("projectId") ||
    "n7prrt2s5b";

  if (!token) {
    return NextResponse.json(
      {
        configured: false,
        projectId,
        message:
          "Add CLARITY_API_TOKEN on Vercel (or save clarity_api_token in admin settings after backend deploy). Generate it in Clarity → Settings → Data Export.",
        links: {
          live: `https://clarity.microsoft.com/projects/view/${projectId}/impressions?date=Last%203%20days&live=true`,
          recordings: `https://clarity.microsoft.com/projects/view/${projectId}/impressions`,
          heatmaps: `https://clarity.microsoft.com/projects/view/${projectId}/heatmaps`,
          dashboard: `https://clarity.microsoft.com/projects/view/${projectId}/dashboard`,
        },
      },
      { status: 200 }
    );
  }

  const days = request.nextUrl.searchParams.get("days") || "1";
  const numOfDays = ["1", "2", "3"].includes(days) ? days : "1";

  try {
    // Traffic + friction + pages — keep to a few calls (Clarity allows 10/day)
    const [trafficRes, urlRes, deviceRes] = await Promise.all([
      fetch(`${CLARITY_URL}?numOfDays=${numOfDays}`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        cache: "no-store",
      }),
      fetch(`${CLARITY_URL}?numOfDays=${numOfDays}&dimension1=URL`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        cache: "no-store",
      }),
      fetch(`${CLARITY_URL}?numOfDays=${numOfDays}&dimension1=Device`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        cache: "no-store",
      }),
    ]);

    if (trafficRes.status === 429) {
      return NextResponse.json(
        { configured: true, projectId, message: "Clarity API daily limit reached (10 requests/day). Try again tomorrow, or open Live sessions in Clarity." },
        { status: 429 }
      );
    }

    if (!trafficRes.ok) {
      const errText = await trafficRes.text();
      return NextResponse.json(
        { configured: true, projectId, message: `Clarity API error (${trafficRes.status})`, detail: errText.slice(0, 300) },
        { status: 502 }
      );
    }

    const trafficJson = (await trafficRes.json()) as ClarityMetric[];
    const urlJson = urlRes.ok ? ((await urlRes.json()) as ClarityMetric[]) : [];
    const deviceJson = deviceRes.ok ? ((await deviceRes.json()) as ClarityMetric[]) : [];

    const merged = [...trafficJson, ...urlJson, ...deviceJson];
    const summary = summarise(merged);

    return NextResponse.json({
      configured: true,
      projectId,
      days: Number(numOfDays),
      fetchedAt: new Date().toISOString(),
      summary,
      links: {
        live: `https://clarity.microsoft.com/projects/view/${projectId}/impressions?date=Last%203%20days&live=true`,
        recordings: `https://clarity.microsoft.com/projects/view/${projectId}/impressions`,
        heatmaps: `https://clarity.microsoft.com/projects/view/${projectId}/heatmaps`,
        dashboard: `https://clarity.microsoft.com/projects/view/${projectId}/dashboard`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        configured: true,
        projectId,
        message: err instanceof Error ? err.message : "Failed to fetch Clarity insights",
      },
      { status: 502 }
    );
  }
}
