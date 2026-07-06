"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002") + "/api";

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

type MetalRateRow = {
  id: number;
  metal: string;
  purity: string;
  label: string;
  market_price_per_gram: number;
  buying_percentage: number;
  buying_price_per_gram: number;
};

export function MetalBuyingRates({
  showToast,
}: {
  showToast: (msg: string, type: "success" | "error") => void;
}) {
  const [rates, setRates] = useState<MetalRateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchRates = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/admin/metal-rates`, { headers: getAuthHeaders() });
      const json = await res.json();
      setRates(json.data || []);
    } catch {
      showToast("Failed to load metal rates", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  function updatePct(id: number, value: string) {
    const pct = parseFloat(value);
    if (Number.isNaN(pct)) return;
    setRates((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              buying_percentage: pct,
              buying_price_per_gram: Math.round(r.market_price_per_gram * (pct / 100) * 100) / 100,
            }
          : r
      )
    );
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/admin/metal-rates/buying-percentages`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          rates: rates.map((r) => ({ id: r.id, buying_percentage: r.buying_percentage })),
        }),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setRates(json.data || []);
      showToast("Buying percentages saved", "success");
    } catch {
      showToast("Failed to save buying percentages", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="mt-4">
      <p className="text-sm text-gray-600 mb-3">
        Set a separate buying percentage for each metal. We Pay = market price × percentage.
      </p>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm min-w-[520px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Metal</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Market / g</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Buying %</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">We Pay / g</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((rate) => (
              <tr key={rate.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 font-medium text-black">{rate.label}</td>
                <td className="px-4 py-3 text-gray-600">£{rate.market_price_per_gram.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={rate.buying_percentage}
                      onChange={(e) => updatePct(rate.id, e.target.value)}
                      className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                    />
                    <span className="text-gray-400 text-xs">%</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold text-[#D97706]">
                  £{rate.buying_price_per_gram.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-black/80 disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Buying Percentages
      </button>
    </div>
  );
}
